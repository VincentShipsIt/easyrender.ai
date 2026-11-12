import { db } from '@easyrender/db';
import { RENDER_CREDITS } from '@easyrender/harness';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

// Runs against a real Postgres: set TEST_DATABASE_URL (a scratch database with the schema pushed).
// Replicate, storage and the photo download are faked; the queue, credits and states are real.
const url = process.env.TEST_DATABASE_URL;
if (url) process.env.DATABASE_URL = url;

const fake = vi.hoisted(() => ({
  start: vi.fn(),
  upload: vi.fn(),
  image: vi.fn(),
}));

vi.mock('@easyrender/harness', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@easyrender/harness')>()),
  checkPhoto: async () => ({ ok: true, warnings: [] }),
  cutCells: async () => Array.from({ length: 9 }, () => new Uint8Array([1])),
  createReplicate: () => ({
    upload: fake.upload,
    start: fake.start,
    // Everything Replicate is asked about is still running.
    get: async () => ({ status: 'processing' }),
  }),
}));
vi.mock('./storage', () => ({
  getFile: async () => new Uint8Array([1, 2, 3]),
  putFile: async (path: string) => `fake:${path}`,
}));
vi.mock('./remote-image', () => ({
  fetchRemoteImage: (...args: unknown[]) => fake.image(...args),
}));

const run = describe.skipIf(!url);

run('catalogue runs (real database)', () => {
  const load = async () => import('./catalog');
  const newUser = async (credits: number) => {
    const id = `u_${Math.random().toString(36).slice(2)}`;
    await db().user.create({ data: { id, name: 'T', email: `${id}@example.com`, credits } });
    return id;
  };
  const balance = async (id: string) =>
    (await db().user.findUniqueOrThrow({ where: { id } })).credits;
  const product = (n: number) => ({
    externalId: `p${n}`,
    title: `Chair ${n}`,
    imageUrl: `https://cdn.shop.test/p${n}.jpg`,
  });
  const scopeFor = (userId: string) => ({
    userId,
    platform: 'woocommerce' as const,
    store: 'shop.test',
  });
  const itemState = async (userId: string, externalId: string) =>
    db().catalogItem.findFirstOrThrow({ where: { userId, externalId } });

  beforeEach(() => {
    fake.upload.mockReset().mockResolvedValue('https://replicate.test/file');
    fake.start.mockReset().mockImplementation(async () => ({ id: `pred_${Math.random()}` }));
    fake.image
      .mockReset()
      .mockResolvedValue({ bytes: new Uint8Array([1, 2, 3]), contentType: 'image/jpeg' });
    process.env.REPLICATE_API_TOKEN = 'test';
  });

  afterAll(async () => {
    await db().$disconnect();
  });

  // The sheet came back: the render is ready for its 3D build.
  const finishSheet = (renderId: string | null) =>
    db().render.update({
      where: { id: renderId ?? '' },
      data: { status: 'preview_ready', sheetKey: 'fake:sheet.png' },
    });

  it('refuses a run that costs more than the owner approved', async () => {
    const catalog = await load();
    const userId = await newUser(RENDER_CREDITS * 5);
    await expect(
      catalog.submitCatalog(scopeFor(userId), [product(1), product(2)], RENDER_CREDITS),
    ).rejects.toMatchObject({ status: 409, code: 'quote_changed' });
    expect(await db().catalogItem.count({ where: { userId } })).toBe(0);
  });

  it('starts only the products the balance can build, and the rest wait in the queue', async () => {
    const catalog = await load();
    const userId = await newUser(RENDER_CREDITS * 2);
    const items = [product(1), product(2), product(3)];
    const result = await catalog.submitCatalog(scopeFor(userId), items, RENDER_CREDITS * 3);
    expect(result).toMatchObject({ queued: 3, skipped: 0 });
    const { summary } = await catalog.listCatalog(scopeFor(userId));
    expect(summary).toMatchObject({ drafting: 2, queued: 1, total: 3 });
    // Previews are free; nothing is spent until a model is built.
    expect(await balance(userId)).toBe(RENDER_CREDITS * 2);
  });

  it('builds drafts that finished, spends credits once, and returns the AR link when ready', async () => {
    const catalog = await load();
    const userId = await newUser(RENDER_CREDITS);
    await catalog.submitCatalog(scopeFor(userId), [product(1)], RENDER_CREDITS);
    const drafted = await itemState(userId, 'p1');
    expect(drafted.state).toBe('drafting');
    await finishSheet(drafted.renderId);

    await catalog.tickCatalog(scopeFor(userId));
    await catalog.tickCatalog(scopeFor(userId));
    expect((await itemState(userId, 'p1')).state).toBe('building');
    expect(await balance(userId)).toBe(0);
    expect(await db().creditLedger.count({ where: { userId, reason: 'render' } })).toBe(1);

    await db().render.update({
      where: { id: drafted.renderId ?? '' },
      data: { status: 'ready', glbKey: 'fake:model.glb' },
    });
    const { items } = await catalog.listCatalog(scopeFor(userId));
    expect(items[0]).toMatchObject({ state: 'ready', externalId: 'p1' });
    expect(items[0]?.arUrl).toMatch(new RegExp(`/ar/${drafted.renderId}$`));
    expect(items[0]?.qrUrl).toMatch(/\/qr$/);

    // The shopper has no account: the model is viewable by link, and not in the gallery.
    const { canView, isListed } = await import('./renders');
    const render = await db().render.findUniqueOrThrow({ where: { id: drafted.renderId ?? '' } });
    expect(render.isLinkShared).toBe(true);
    expect(canView(render, {})).toBe(true);
    expect(isListed(render)).toBe(false);
  });

  it('starts waiting products once the owner adds credits', async () => {
    const catalog = await load();
    const userId = await newUser(RENDER_CREDITS);
    await catalog.submitCatalog(scopeFor(userId), [product(1), product(2)], RENDER_CREDITS * 2);
    expect((await itemState(userId, 'p2')).state).toBe('queued');
    await db().user.update({
      where: { id: userId },
      data: { credits: { increment: RENDER_CREDITS } },
    });
    await catalog.tickCatalog(scopeFor(userId));
    expect((await itemState(userId, 'p2')).state).toBe('drafting');
  });

  it('shows a product with an unusable photo as needing info, not failed', async () => {
    const catalog = await load();
    const { AppError } = await import('./errors');
    fake.image.mockRejectedValueOnce(new AppError('Image URL is not public', 400, 'bad_url'));
    const userId = await newUser(RENDER_CREDITS * 2);
    await catalog.submitCatalog(scopeFor(userId), [product(1), product(2)], RENDER_CREDITS * 2);
    expect(await itemState(userId, 'p1')).toMatchObject({
      state: 'needs_info',
      error: 'Image URL is not public',
    });
    expect((await itemState(userId, 'p2')).state).toBe('drafting');
  });

  it('does not queue ready products again, but retries ones that failed', async () => {
    const catalog = await load();
    const userId = await newUser(RENDER_CREDITS * 4);
    await catalog.submitCatalog(scopeFor(userId), [product(1), product(2)], RENDER_CREDITS * 2);
    await db().catalogItem.updateMany({
      where: { userId, externalId: 'p1' },
      data: { state: 'ready' },
    });
    await db().catalogItem.updateMany({
      where: { userId, externalId: 'p2' },
      data: { state: 'failed' },
    });
    const again = await catalog.submitCatalog(
      scopeFor(userId),
      [product(1), product(2)],
      RENDER_CREDITS,
    );
    expect(again).toMatchObject({ queued: 1, skipped: 1 });
    expect((await itemState(userId, 'p1')).state).toBe('ready');
    expect((await itemState(userId, 'p2')).state).toBe('drafting');
  });

  it("keeps one account's stores and products apart", async () => {
    const catalog = await load();
    const a = await newUser(RENDER_CREDITS);
    const b = await newUser(RENDER_CREDITS);
    await catalog.submitCatalog(scopeFor(a), [product(1)], RENDER_CREDITS);
    expect((await catalog.listCatalog(scopeFor(b))).items).toHaveLength(0);
  });
});
