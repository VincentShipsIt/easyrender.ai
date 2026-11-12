import { createHash } from 'node:crypto';
import { PRICING_FLAG, pricingFor } from '@easyrender/harness';
import Stripe from 'stripe';
import { afterEach, expect, it, vi } from 'vitest';
import { handleStripeWebhook } from './billing';
import { assignedPricing } from './pricing-experiment';
import { PRICING_VISIT_LIMIT } from './pricing-visits';

type Purchase = {
  id: string;
  userId: string;
  stripeSessionId: string;
  packId: string;
  credits: number;
  amountCents: number;
  status: string;
};
const state = vi.hoisted(() => ({
  purchases: new Map<string, Purchase>(),
  balance: 0,
  ledger: new Set<string>(),
  counter: '[]',
}));
vi.mock('./analytics', () => ({ deferAnalytics: () => {}, captureServer: () => {} }));
vi.mock('./credits', () => ({
  grantCredits: async ({ amount, key }: { amount: number; key: string }) => {
    if (state.ledger.has(key)) return false;
    state.ledger.add(key);
    state.balance += amount;
    return true;
  },
}));
vi.mock('@easyrender/db', () => ({
  db: () => ({
    verification: { findUnique: async () => ({ value: state.counter }) },
    purchase: {
      findUnique: async ({ where }: { where: { stripeSessionId: string } }) =>
        state.purchases.get(where.stripeSessionId),
      upsert: async ({ create }: { create: Omit<Purchase, 'id' | 'status'> }) => {
        if (!state.purchases.has(create.stripeSessionId))
          state.purchases.set(create.stripeSessionId, {
            ...create,
            id: create.stripeSessionId,
            status: 'pending',
          });
        return state.purchases.get(create.stripeSessionId);
      },
      updateMany: async ({ where }: { where: { id: string } }) => {
        const purchase = [...state.purchases.values()].find((p) => p.id === where.id);
        if (!purchase || purchase.status === 'paid') return { count: 0 };
        purchase.status = 'paid';
        return { count: 1 };
      },
    },
  }),
}));
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
it('keeps test PAYG and invoice-price renewal allocations after the live cap, including replay', async () => {
  state.counter = JSON.stringify(
    Array.from({ length: PRICING_VISIT_LIMIT }, (_, i) =>
      createHash('sha256').update(`${PRICING_FLAG}:visitor-${i}`).digest('hex'),
    ),
  );
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
  state.purchases.set('cs_test', {
    id: 'paid-test',
    userId: 'user',
    stripeSessionId: 'cs_test',
    packId: 'payg:test',
    credits: 500,
    amountCents: 1000,
    status: 'pending',
  });
  const events = [
    {
      type: 'checkout.session.completed',
      object: { id: 'cs_test', mode: 'payment', payment_status: 'paid', currency: 'usd' },
    },
    {
      type: 'invoice.paid',
      object: {
        id: 'in_test',
        amount_paid: pricingFor('test').plans.pro.priceCents,
        currency: 'usd',
        parent: {
          subscription_details: {
            metadata: { userId: 'user', plan: 'pro', pricing_variant: 'control' },
          },
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
    await handleStripeWebhook(payload, signature);
    await handleStripeWebhook(payload, signature);
  }
  expect(state.balance).toBe(500 + pricingFor('test').plans.pro.monthlyCredits);
  expect(state.ledger.size).toBe(2);
  expect(state.purchases.get('cs_test')).toMatchObject({
    packId: 'payg:test',
    credits: 500,
    amountCents: 1000,
    status: 'paid',
  });
  expect(state.purchases.get('in_test')).toMatchObject({
    packId: 'pro:test',
    credits: pricingFor('test').plans.pro.monthlyCredits,
    amountCents: pricingFor('test').plans.pro.priceCents,
    status: 'paid',
  });
});
