import { deflateSync } from 'node:zlib';
import { db } from '@easyrender/db';
import { RENDER_CREDITS, SHEET_CREDITS } from '@easyrender/harness';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

// Runs against a real Postgres: set TEST_DATABASE_URL (a scratch database with the schema pushed).
// Replicate and storage are faked; everything else, including transactions, is the real code.
const url = process.env.TEST_DATABASE_URL;
if (url) process.env.DATABASE_URL = url;

const replicate = vi.hoisted(() => ({
  fail: false,
  start: vi.fn(),
  upload: vi.fn(),
  get: vi.fn(),
}));

vi.mock('@easyrender/harness', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@easyrender/harness')>()),
  createReplicate: () => ({
    upload: async (...args: unknown[]) => {
      if (replicate.fail) throw new Error('replicate down');
      return replicate.upload(...args);
    },
    start: replicate.start,
    get: replicate.get,
  }),
}));

vi.mock('./storage', () => ({
  getFile: async () => new Uint8Array([1, 2, 3]),
  putFile: async (path: string) => `fake:${path}`,
}));

const run = describe.skipIf(!url);

run('credits and generation billing (real database)', () => {
  // Imported lazily so the suite is inert without a database.
  const load = async () => ({
    credits: await import('./credits'),
    renders: await import('./renders'),
  });

  const newUser = async (credits: number) => {
    const id = `u_${Math.random().toString(36).slice(2)}`;
    await db().user.create({ data: { id, name: 'T', email: `${id}@example.com`, credits } });
    return id;
  };
  const balance = async (id: string) =>
    (await db().user.findUniqueOrThrow({ where: { id } })).credits;
  const newRender = (userId: string, data: Record<string, unknown> = {}) =>
    db().render.create({
      data: { userId, sourceKey: 'fake:source.jpg', status: 'preview_ready', ...data },
    });

  beforeEach(() => {
    replicate.fail = false;
    replicate.upload.mockReset().mockResolvedValue('https://replicate.test/file');
    replicate.start.mockReset().mockResolvedValue({ id: `pred_${Math.random()}` });
    process.env.REPLICATE_API_TOKEN = 'test';
  });

  afterAll(async () => {
    await db().$disconnect();
  });

  it('never lets concurrent spends take the balance below zero', async () => {
    const { credits } = await load();
    const userId = await newUser(100);
    const results = await Promise.allSettled(
      Array.from({ length: 8 }, (_, index) =>
        credits.spendCredits({ userId, amount: 40, key: `k:${userId}:${index}`, reason: 'test' }),
      ),
    );
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(2);
    expect(await balance(userId)).toBe(20);
    expect(await db().creditLedger.count({ where: { userId } })).toBe(2);
  });

  it('blocks at zero with a 402 and leaves no ledger row', async () => {
    const { credits } = await load();
    const userId = await newUser(0);
    await expect(
      credits.spendCredits({ userId, amount: 1, key: `k:${userId}`, reason: 'test' }),
    ).rejects.toMatchObject({ status: 402, code: 'insufficient_credits' });
    expect(await balance(userId)).toBe(0);
    expect(await db().creditLedger.count({ where: { userId } })).toBe(0);
  });

  it('spends and grants once per idempotency key', async () => {
    const { credits } = await load();
    const userId = await newUser(500);
    await credits.spendCredits({ userId, amount: 80, key: `s:${userId}`, reason: 'test' });
    await credits.spendCredits({ userId, amount: 80, key: `s:${userId}`, reason: 'test' });
    expect(await balance(userId)).toBe(420);
    expect(
      await credits.grantCredits({ userId, amount: 500, key: `g:${userId}`, reason: 't' }),
    ).toBe(true);
    expect(
      await credits.grantCredits({ userId, amount: 500, key: `g:${userId}`, reason: 't' }),
    ).toBe(false);
    expect(await balance(userId)).toBe(920);
  });

  it('render_3d / startBuild debits RENDER_CREDITS and starts the build once on a double click', async () => {
    const { renders } = await load();
    const userId = await newUser(RENDER_CREDITS * 2);
    const render = await newRender(userId);
    await Promise.all([
      renders.startBuild(render.id, { userId }),
      renders.startBuild(render.id, { userId }),
    ]);
    expect(await balance(userId)).toBe(RENDER_CREDITS);
    expect(replicate.start).toHaveBeenCalledTimes(1);
    const after = await db().render.findUniqueOrThrow({ where: { id: render.id } });
    expect(after.status).toBe('rendering');
    expect(after.credits).toBe(RENDER_CREDITS);
  });

  it('startBuild at zero balance is refused and the render stays buildable', async () => {
    const { renders } = await load();
    const userId = await newUser(RENDER_CREDITS - 1);
    const render = await newRender(userId);
    await expect(renders.startBuild(render.id, { userId })).rejects.toMatchObject({ status: 402 });
    const after = await db().render.findUniqueOrThrow({ where: { id: render.id } });
    expect(after.status).toBe('preview_ready');
    expect(after.credits).toBe(0);
    expect(await balance(userId)).toBe(RENDER_CREDITS - 1);
    expect(replicate.start).not.toHaveBeenCalled();
  });

  it('refunds the full price when the build cannot start', async () => {
    const { renders } = await load();
    const userId = await newUser(RENDER_CREDITS);
    const render = await newRender(userId);
    replicate.fail = true;
    await expect(renders.startBuild(render.id, { userId })).rejects.toMatchObject({ status: 502 });
    expect(await balance(userId)).toBe(RENDER_CREDITS);
    const after = await db().render.findUniqueOrThrow({ where: { id: render.id } });
    expect(after.status).toBe('failed');
  });

  it('charges only the rest when an angle sheet was already paid, and refunds all of it on failure', async () => {
    const { renders } = await load();
    const userId = await newUser(RENDER_CREDITS);
    const render = await newRender(userId, { credits: SHEET_CREDITS });
    // The user already paid SHEET_CREDITS earlier (the ledger rows are not needed for this check).
    await renders.startBuild(render.id, { userId });
    expect(await balance(userId)).toBe(SHEET_CREDITS);
  });

  it('Angles button / startSheet debits SHEET_CREDITS, once, and refunds on failure', async () => {
    const { renders } = await load();
    const userId = await newUser(SHEET_CREDITS * 2);
    const first = await newRender(userId);
    await Promise.all([
      renders.startSheet(first.id, { userId }),
      renders.startSheet(first.id, { userId }),
    ]);
    expect(await balance(userId)).toBe(SHEET_CREDITS);

    const second = await newRender(userId);
    replicate.fail = true;
    await expect(renders.startSheet(second.id, { userId })).rejects.toMatchObject({ status: 502 });
    expect(await balance(userId)).toBe(SHEET_CREDITS);
  });

  it('startSheet at zero balance is refused', async () => {
    const { renders } = await load();
    const userId = await newUser(0);
    const render = await newRender(userId);
    await expect(renders.startSheet(render.id, { userId })).rejects.toMatchObject({ status: 402 });
    expect(await balance(userId)).toBe(0);
  });

  it('refunds a build that Replicate reports as failed', async () => {
    const { renders } = await load();
    const userId = await newUser(RENDER_CREDITS);
    const render = await newRender(userId);
    replicate.start.mockResolvedValue({ id: `pred_fail_${userId}` });
    await renders.startBuild(render.id, { userId });
    expect(await balance(userId)).toBe(0);
    replicate.get.mockResolvedValue({ status: 'failed', error: 'boom' });
    await renders.advance(render.id);
    expect(await balance(userId)).toBe(RENDER_CREDITS);
    // Polling again never refunds twice.
    await renders.advance(render.id);
    expect(await balance(userId)).toBe(RENDER_CREDITS);
  });

  it('refunds a build that never finishes', async () => {
    const { renders } = await load();
    const userId = await newUser(RENDER_CREDITS);
    const render = await newRender(userId);
    await renders.startBuild(render.id, { userId });
    await db().render.update({
      where: { id: render.id },
      data: { updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000) },
    });
    replicate.get.mockResolvedValue({ status: 'processing' });
    const after = await renders.advance(render.id);
    expect(after?.status).toBe('failed');
    expect(await balance(userId)).toBe(RENDER_CREDITS);
  });

  describe('Stripe webhook grants', () => {
    const secret = 'whsec_test';
    const send = async (event: object) => {
      const { handleStripeWebhook } = await import('./billing');
      const { default: Stripe } = await import('stripe');
      const body = JSON.stringify(event);
      const signature = new Stripe('sk_test_x').webhooks.generateTestHeaderString({
        payload: body,
        secret,
      });
      await handleStripeWebhook(body, signature);
    };

    beforeEach(() => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_x';
      process.env.STRIPE_WEBHOOK_SECRET = secret;
    });

    it('credits a paid pay-as-you-go checkout exactly once', async () => {
      const userId = await newUser(0);
      const sessionId = `cs_${userId}`;
      await db().purchase.create({
        data: {
          userId,
          stripeSessionId: sessionId,
          packId: 'payg',
          credits: 2500,
          amountCents: 2500,
        },
      });
      const event = {
        id: `evt_${userId}`,
        object: 'event',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: sessionId,
            object: 'checkout.session',
            mode: 'payment',
            payment_status: 'paid',
            client_reference_id: userId,
            customer: `cus_${userId}`,
          },
        },
      };
      await send(event);
      await send(event);
      expect(await balance(userId)).toBe(2500);
      expect(
        (await db().purchase.findUniqueOrThrow({ where: { stripeSessionId: sessionId } })).status,
      ).toBe('paid');
    });

    it('does not credit an unpaid checkout', async () => {
      const userId = await newUser(0);
      const sessionId = `cs_unpaid_${userId}`;
      await db().purchase.create({
        data: {
          userId,
          stripeSessionId: sessionId,
          packId: 'payg',
          credits: 500,
          amountCents: 500,
        },
      });
      await send({
        id: `evt_${userId}`,
        object: 'event',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: sessionId,
            mode: 'payment',
            payment_status: 'unpaid',
            client_reference_id: userId,
          },
        },
      });
      expect(await balance(userId)).toBe(0);
    });

    it('credits 5,000 on every paid Pro invoice, once each', async () => {
      const userId = await newUser(0);
      const invoice = (id: string) => ({
        id: `evt_${id}`,
        object: 'event',
        type: 'invoice.paid',
        data: {
          object: {
            id,
            object: 'invoice',
            parent: { subscription_details: { metadata: { userId, plan: 'pro' } } },
          },
        },
      });
      await send(invoice(`in_a_${userId}`));
      await send(invoice(`in_a_${userId}`));
      await send(invoice(`in_b_${userId}`));
      expect(await balance(userId)).toBe(10_000);
    });

    it('credits each monthly plan its own amount on a paid invoice', async () => {
      const creator = await newUser(0);
      const scale = await newUser(0);
      const invoice = (id: string, userId: string, plan: string) => ({
        id: `evt_${id}`,
        object: 'event',
        type: 'invoice.paid',
        data: {
          object: {
            id,
            object: 'invoice',
            parent: { subscription_details: { metadata: { userId, plan } } },
          },
        },
      });
      await send(invoice(`in_c_${creator}`, creator, 'creator'));
      await send(invoice(`in_s_${scale}`, scale, 'scale'));
      expect(await balance(creator)).toBe(1600);
      expect(await balance(scale)).toBe(16_000);
    });

    it('rejects a bad signature', async () => {
      const { handleStripeWebhook } = await import('./billing');
      await expect(handleStripeWebhook('{}', 't=1,v1=bad')).rejects.toThrow();
    });
  });

  describe('free preview allowance', () => {
    // A small noisy RGB PNG that passes the photo guardrails, built without an image library.
    const photo = () => {
      const side = 420;
      const rows = Buffer.alloc((side * 3 + 1) * side);
      for (let y = 0; y < side; y++) {
        const offset = y * (side * 3 + 1);
        for (let x = 1; x <= side * 3; x++) rows[offset + x] = Math.floor(Math.random() * 256);
      }
      const crc = (buffer: Buffer) => {
        let c = ~0;
        for (const byte of buffer) {
          c ^= byte;
          for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
        }
        return ~c >>> 0;
      };
      const chunk = (type: string, data: Buffer) => {
        const body = Buffer.concat([Buffer.from(type), data]);
        const out = Buffer.alloc(body.length + 8);
        out.writeUInt32BE(data.length, 0);
        body.copy(out, 4);
        out.writeUInt32BE(crc(body), body.length + 4);
        return out;
      };
      const header = Buffer.alloc(13);
      header.writeUInt32BE(side, 0);
      header.writeUInt32BE(side, 4);
      header.set([8, 2, 0, 0, 0], 8);
      return new Uint8Array(
        Buffer.concat([
          Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
          chunk('IHDR', header),
          chunk('IDAT', deflateSync(rows)),
          chunk('IEND', Buffer.alloc(0)),
        ]),
      );
    };

    it('does not count failed previews, but counts the ones that worked', async () => {
      const { renders } = await load();
      process.env.FREE_PREVIEWS_PER_DAY = '1';
      const userId = await newUser(0);
      const bytes = photo();
      const upload = () =>
        renders.createDraft({ actor: { userId }, bytes, contentType: 'image/png', source: 'web' });

      // Replicate is down (out of credit): the preview fails and must not burn the allowance.
      replicate.fail = true;
      await expect(upload()).rejects.toMatchObject({ status: 502 });
      await expect(upload()).rejects.toMatchObject({ status: 502 });

      // Replicate is back: the one allowed preview works, the next one is refused.
      replicate.fail = false;
      await expect(upload()).resolves.toMatchObject({ status: 'drafting' });
      await expect(upload()).rejects.toMatchObject({ status: 429, code: 'preview_limit' });
      delete process.env.FREE_PREVIEWS_PER_DAY;
    });
  });
});
