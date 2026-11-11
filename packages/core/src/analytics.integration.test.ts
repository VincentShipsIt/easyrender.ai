import { writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { gunzipSync } from 'node:zlib';
import { db } from '@easyrender/db';
import { RENDER_CREDITS } from '@easyrender/harness';
import Stripe from 'stripe';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { setAnalyticsScheduler } from './analytics';
import { classifyCountry, normalizeAttribution } from './attribution';
import { confirmedPurchase, handleStripeWebhook } from './billing';
import { advance, createDraft, startBuild } from './renders';
import { signupAttribution } from './signup-attribution';

const url = process.env.TEST_DATABASE_URL;
if (url) {
  if (!['localhost', '127.0.0.1'].includes(new URL(url).hostname))
    throw new Error('Analytics integration tests require a local throwaway database');
  process.env.DATABASE_URL = url;
}
const provider = vi.hoisted(() => ({ hasFailure: false, get: vi.fn(), sequence: 0 }));
vi.mock('@easyrender/harness', async (original) => ({
  ...(await original<typeof import('@easyrender/harness')>()),
  checkPhoto: async () => ({ ok: true, warnings: [] }),
  checkSheet: async () => ({ ok: true, warnings: [] }),
  checkGlb: () => ({ ok: true, warnings: [] }),
  download: async () => new Uint8Array([1, 2, 3]),
  cutCells: async () => [new Uint8Array([1])],
  createReplicate: () => ({
    upload: async () => {
      if (provider.hasFailure) throw new Error('forced provider failure');
      return 'https://provider.invalid/photo';
    },
    start: async () => ({ id: `qa_prediction_${crypto.randomUUID()}` }),
    get: provider.get,
  }),
}));
vi.mock('./storage', () => ({
  putFile: async (path: string) => `local-mock:${path}`,
  getFile: async () => new Uint8Array([1]),
}));

type Captured = {
  event: string;
  uuid: string;
  properties: Record<string, unknown>;
  distinct_id: string;
};
const events: Captured[] = [];
const pending: (() => Promise<void>)[] = [];
const server = createServer(async (request, response) => {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  const raw = Buffer.concat(chunks);
  const body = JSON.parse(
    (request.headers['content-encoding'] === 'gzip' ? gunzipSync(raw) : raw).toString(),
  );
  events.push(...(body.batch ?? [body]));
  response.writeHead(200, { 'content-type': 'application/json' });
  response.end('{}');
});
const drain = async () => {
  while (pending.length) await pending.shift()?.();
};
const ft = () =>
  normalizeAttribution(
    {
      utm_source: 'TEST',
      utm_medium: 'QA',
      utm_campaign: 'req02-t1',
      landing_path: '/?gclid=abc',
      referrer: 'https://referrer.test/path?token=secret',
      gclid: 'abc',
    },
    'http://localhost:3100',
    classifyCountry('DE'),
  );
const newUser = async () => {
  const id = `analytics_${crypto.randomUUID()}`;
  await db().user.create({
    data: { id, name: 'Local QA', email: `${id}@example.invalid`, credits: RENDER_CREDITS * 3 },
  });
  return id;
};
const selected = (id: string, prefix: string) =>
  events
    .filter((e) => e.properties?.preview_id === id && e.event.startsWith(prefix))
    .map((e) => e.event)
    .sort();

describe.skipIf(!url)('analytics through real server functions and local Postgres', () => {
  beforeAll(async () => {
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('missing mock port');
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'phc_localtest';
    process.env.POSTHOG_HOST = `http://127.0.0.1:${address.port}`;
    process.env.SHEET_ENABLED = 'true';
    process.env.REPLICATE_API_TOKEN = 'test';
    process.env.STRIPE_SECRET_KEY = 'sk_test_local';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_local';
    delete process.env.HARNESS_GITHUB_TOKEN;
    setAnalyticsScheduler((work) => pending.push(work));
  });
  afterAll(async () => {
    await drain();
    if (process.env.EVIDENCE_DIR)
      await writeFile(
        `${process.env.EVIDENCE_DIR}/server-integration-events.json`,
        JSON.stringify(events, null, 2),
      );
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await db().$disconnect();
  });
  it('stores preview first touch, copies it at signup, does not overwrite and closes each stage once', async () => {
    provider.hasFailure = false;
    const anonId = crypto.randomUUID();
    const preview = await createDraft({
      actor: { anonId },
      bytes: new Uint8Array([1]),
      contentType: 'image/png',
      attribution: ft(),
    });
    expect(preview).toMatchObject({
      utm_source: 'test',
      utm_campaign: 'req02-t1',
      landing_path: '/',
      geo_country: 'DE',
      consent_region_at_create: 'strict',
      referrer: 'https://referrer.test/path',
    });
    provider.get.mockResolvedValue({
      status: 'succeeded',
      output: 'https://provider.invalid/sheet.png',
    });
    await Promise.all([advance(preview.id), advance(preview.id)]);
    const userId = await newUser();
    await signupAttribution({
      userId,
      anonId,
      attribution: normalizeAttribution({ utm_campaign: 'second' }, 'http://localhost'),
      method: 'email',
    });
    await signupAttribution({
      userId,
      anonId,
      attribution: normalizeAttribution({ utm_campaign: 'third' }, 'http://localhost'),
      method: 'email',
    });
    expect(await db().user.findUniqueOrThrow({ where: { id: userId } })).toMatchObject({
      utm_campaign: 'req02-t1',
      geo_country: 'DE',
    });
    await startBuild(preview.id, { userId });
    await advance(preview.id); // final sheet -> 3D
    provider.get.mockResolvedValue({
      status: 'succeeded',
      output: 'https://provider.invalid/model.glb',
    });
    await Promise.all([advance(preview.id), advance(preview.id)]);
    await drain();
    expect(selected(preview.id, 'preview_')).toEqual(['preview_ready', 'preview_start']);
    expect(selected(preview.id, 'render_')).toEqual(['render_ready', 'render_start']);
    const signup = events.filter((e) => e.event === 'signup' && e.properties.user_id === userId);
    expect(signup).toHaveLength(1);
    expect(signup[0]).toMatchObject({
      distinct_id: userId,
      properties: {
        had_preview_before: true,
        preview_id_before: preview.id,
        ft_utm_campaign: 'req02-t1',
      },
    });
    expect(
      events.some((e) => e.event === '$create_alias' && e.properties.alias === `pv_${preview.id}`),
    ).toBe(true);
  });
  it('forced preview and model provider failures each emit exactly one failure and refund the model', async () => {
    const userId = await newUser();
    const anonId = crypto.randomUUID();
    provider.hasFailure = true;
    await expect(
      createDraft({
        actor: { anonId },
        bytes: new Uint8Array([1]),
        contentType: 'image/png',
        attribution: ft(),
      }),
    ).rejects.toMatchObject({ code: 'upstream' });
    const preview = await db().render.findFirstOrThrow({ where: { anonId } });
    await advance(preview.id);
    provider.hasFailure = false;
    const model = await createDraft({
      actor: { userId },
      bytes: new Uint8Array([1]),
      contentType: 'image/png',
      attribution: ft(),
    });
    provider.get.mockResolvedValue({
      status: 'succeeded',
      output: 'https://provider.invalid/sheet.png',
    });
    await advance(model.id);
    provider.hasFailure = true;
    const before = (await db().user.findUniqueOrThrow({ where: { id: userId } })).credits;
    await expect(startBuild(model.id, { userId })).rejects.toMatchObject({ code: 'upstream' });
    await advance(model.id);
    expect((await db().user.findUniqueOrThrow({ where: { id: userId } })).credits).toBe(before);
    await drain();
    expect(selected(preview.id, 'preview_')).toEqual(['preview_failed', 'preview_start']);
    expect(selected(model.id, 'render_')).toEqual(['render_failed', 'render_start']);
  });
  it('accepts a signed confirmed webhook once, rejects unpaid and bad signatures, scopes the GA return value', async () => {
    const userId = await newUser();
    await signupAttribution({ userId, anonId: null, attribution: ft(), method: 'email' });
    const sessionId = `cs_local_${crypto.randomUUID()}`;
    const purchase = await db().purchase.create({
      data: { userId, stripeSessionId: sessionId, packId: 'payg', credits: 500, amountCents: 500 },
    });
    const send = async (status: string) => {
      const body = JSON.stringify({
        id: `evt_${sessionId}`,
        type: 'checkout.session.completed',
        data: {
          object: {
            id: sessionId,
            mode: 'payment',
            payment_status: status,
            currency: 'usd',
            client_reference_id: userId,
          },
        },
      });
      const signature = new Stripe('sk_test_local').webhooks.generateTestHeaderString({
        payload: body,
        secret: 'whsec_local',
      });
      return handleStripeWebhook(body, signature);
    };
    await send('unpaid');
    await drain();
    expect(
      events.filter((e) => e.event === 'purchase' && e.properties.order_id === purchase.id),
    ).toHaveLength(0);
    await send('paid');
    await send('paid');
    await drain();
    const captures = events.filter(
      (e) => e.event === 'purchase' && e.properties.order_id === purchase.id,
    );
    expect(captures).toHaveLength(1);
    expect(captures[0].properties).toMatchObject({
      amount: 5,
      currency: 'USD',
      pack_id: 'payg',
      credits: 500,
      is_first_purchase: true,
      ft_utm_campaign: 'req02-t1',
    });
    expect(await confirmedPurchase(userId, sessionId)).toMatchObject({
      transaction_id: purchase.id,
      value: 5,
      currency: 'USD',
      items: [{ item_id: 'payg' }],
    });
    expect(await confirmedPurchase('other-user', sessionId)).toBeNull();
    await expect(handleStripeWebhook('{}', 'bad')).rejects.toThrow();
  });
  it('stores truncated garbage values without rejecting signup and never overwrites direct first touch', async () => {
    const userId = await newUser();
    const attribution = normalizeAttribution(
      {
        utm_source: '',
        utm_campaign: 'Ä!'.repeat(150),
        landing_path: '/signup?ttclid=hidden',
        referrer: 'https://external.test/path?token=hidden',
        msclkid: 'hidden',
      },
      'http://localhost',
      classifyCountry('US'),
    );
    await signupAttribution({ userId, anonId: null, attribution, method: 'email' });
    await signupAttribution({ userId, anonId: null, attribution: ft(), method: 'email' });
    const row = await db().user.findUniqueOrThrow({ where: { id: userId } });
    expect(row.utm_campaign).toBe('ä!'.repeat(50));
    expect(row.utm_source).toBeNull();
    expect(row.referrer).toBe('https://external.test/path');
    expect(row.landing_path).toBe('/signup');
    expect(row.geo_country).toBe('US');
    await drain();
  });
  it('50 server events never include PII, click IDs, IPs or free text fields', async () => {
    for (let i = 0; i < 50; i++) {
      const userId = await newUser();
      await signupAttribution({ userId, anonId: null, attribution: ft(), method: 'email' });
    }
    await drain();
    const sample = events.filter((e) => e.event === 'signup').slice(-50);
    expect(sample).toHaveLength(50);
    for (const event of sample) {
      for (const key of ['email', 'name', '$ip', 'photo', 'token', 'prompt'])
        expect(event.properties).not.toHaveProperty(key);
      expect(JSON.stringify(event)).not.toMatch(
        /example.invalid|gclid|fbclid|token=|secret|Local QA/,
      );
    }
  });
});
