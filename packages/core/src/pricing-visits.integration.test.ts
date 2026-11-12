import { createHash } from 'node:crypto';
import { db } from '@easyrender/db';
import { PRICING_FLAG, pricingFor } from '@easyrender/harness';
import Stripe from 'stripe';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { handleStripeWebhook } from './billing';
import { assignedPricing, pricingDecision, pricingIdentity } from './pricing-experiment';
import { hasPricingVisit, PRICING_VISIT_LIMIT, PRICING_VISITS_KEY } from './pricing-visits';

// Settlement storage and Stripe signature verification are real; analytics never leaves the test.
vi.mock('./analytics', () => ({ deferAnalytics: () => {}, captureServer: () => {} }));

const url = process.env.TEST_DATABASE_URL;
if (url) {
  if (!['localhost', '127.0.0.1'].includes(new URL(url).hostname))
    throw new Error('Pricing cap tests require a local disposable database');
  process.env.DATABASE_URL = url;
}
const seed = (i: number) =>
  createHash('sha256').update(`${PRICING_FLAG}:visitor-${i}`).digest('hex');
const userId = `pricing-cap-${crypto.randomUUID()}`;
async function storeVisits(count: number) {
  await db().verification.create({
    data: {
      id: PRICING_VISITS_KEY,
      identifier: PRICING_VISITS_KEY,
      value: JSON.stringify(Array.from({ length: count }, (_, i) => seed(i))),
      expiresAt: new Date('9999-12-31'),
    },
  });
}
describe.skipIf(!url)('pricing cap with real Postgres row locks and paid settlement', () => {
  beforeEach(async () => {
    await db().verification.deleteMany({ where: { id: PRICING_VISITS_KEY } });
  });
  afterEach(async () => {
    await db().verification.deleteMany({
      where: { id: { in: [PRICING_VISITS_KEY, `${PRICING_FLAG}:identity:${userId}`] } },
    });
    await db().user.deleteMany({ where: { id: userId } });
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });
  it('serializes concurrent initialization and near-limit admission, with no duplicate or lost slots', async () => {
    await Promise.all(Array.from({ length: 20 }, () => hasPricingVisit('same', true)));
    let row = await db().verification.findUniqueOrThrow({ where: { id: PRICING_VISITS_KEY } });
    expect(JSON.parse(row.value)).toHaveLength(1);
    await db().verification.delete({ where: { id: PRICING_VISITS_KEY } });
    await storeVisits(PRICING_VISIT_LIMIT - 5);
    const admitted = await Promise.all(
      Array.from({ length: 30 }, (_, i) => hasPricingVisit(`concurrent-${i}`, true)),
    );
    expect(admitted.filter(Boolean)).toHaveLength(4);
    row = await db().verification.findUniqueOrThrow({ where: { id: PRICING_VISITS_KEY } });
    expect(JSON.parse(row.value)).toHaveLength(PRICING_VISIT_LIMIT);
    expect(new Set(JSON.parse(row.value)).size).toBe(PRICING_VISIT_LIMIT);
    expect(await hasPricingVisit('visitor-0')).toBe(false);
  });
  it('keeps anonymous, signup and subsequent devices in one counted slot', async () => {
    await hasPricingVisit('original-browser', true);
    const identity = await pricingIdentity(userId, 'original-browser');
    expect(identity).toBe('original-browser');
    expect(await pricingIdentity(userId, 'new-browser')).toBe(identity);
    expect(await hasPricingVisit(identity ?? '', true)).toBe(true);
    const row = await db().verification.findUniqueOrThrow({ where: { id: PRICING_VISITS_KEY } });
    expect(JSON.parse(row.value)).toHaveLength(1);
  });
  it('settles a paid test PAYG session and test renewal after the cap, once on replay', async () => {
    await storeVisits(PRICING_VISIT_LIMIT);
    vi.stubEnv('PRICING_AB_ENABLED', '1');
    vi.stubEnv('NEXT_PUBLIC_POSTHOG_KEY', 'local');
    vi.stubEnv('POSTHOG_PERSONAL_API_KEY', 'local');
    vi.stubEnv('POSTHOG_PROJECT_ID', 'local');
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_local');
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_local');
    vi.stubEnv('STRIPE_PRICE_PRO_TEST', 'price_pro_test');
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json({
          results: [
            {
              key: PRICING_FLAG,
              active: true,
              filters: {
                groups: [{ properties: [], rollout_percentage: 100 }],
                multivariate: {
                  variants: [
                    { key: 'control', rollout_percentage: 0 },
                    { key: 'test', rollout_percentage: 100 },
                  ],
                },
              },
            },
          ],
        }),
      ),
    );
    expect(await assignedPricing(null, 'visitor-0')).toBe('control');
    expect(await pricingDecision(null, 'new', true)).toEqual({
      variant: 'control',
      isExperimentActive: false,
    });
    await db().user.create({
      data: { id: userId, name: 'Cap QA', email: `${userId}@example.invalid` },
    });
    const sessionId = `cs_${userId}`;
    const invoiceId = `in_${userId}`;
    await db().purchase.create({
      data: {
        userId,
        stripeSessionId: sessionId,
        packId: 'payg:test',
        credits: 500,
        amountCents: 1000,
      },
    });
    const events = [
      {
        type: 'checkout.session.completed',
        object: { id: sessionId, mode: 'payment', payment_status: 'paid', currency: 'usd' },
      },
      {
        type: 'invoice.paid',
        object: {
          id: invoiceId,
          amount_paid: pricingFor('test').plans.pro.priceCents,
          currency: 'usd',
          parent: {
            subscription_details: { metadata: { userId, plan: 'pro', pricing_variant: 'control' } },
          },
          lines: {
            data: [
              {
                parent: { subscription_item_details: { proration: false } },
                pricing: { price_details: { price: 'price_pro_test' } },
              },
            ],
          },
        },
      },
    ];
    for (const event of events) {
      const payload = JSON.stringify({
        id: `evt_${event.object.id}`,
        type: event.type,
        data: { object: event.object },
      });
      const signature = new Stripe('sk_test_local').webhooks.generateTestHeaderString({
        payload,
        secret: 'whsec_local',
      });
      await Promise.all([
        handleStripeWebhook(payload, signature),
        handleStripeWebhook(payload, signature),
      ]);
    }
    expect((await db().user.findUniqueOrThrow({ where: { id: userId } })).credits).toBe(
      500 + pricingFor('test').plans.pro.monthlyCredits,
    );
    expect(await db().creditLedger.count({ where: { userId } })).toBe(2);
    const purchases = await db().purchase.findMany({
      where: { userId },
      orderBy: { amountCents: 'asc' },
    });
    expect(purchases).toMatchObject([
      { packId: 'payg:test', credits: 500, amountCents: 1000, status: 'paid' },
      {
        packId: 'pro:test',
        credits: pricingFor('test').plans.pro.monthlyCredits,
        amountCents: pricingFor('test').plans.pro.priceCents,
        status: 'paid',
      },
    ]);
  });
});
