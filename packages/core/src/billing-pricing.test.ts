import { type PricingVariant, pricingFor } from '@easyrender/harness';
import type Stripe from 'stripe';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import {
  createCheckout,
  parseCheckout,
  planFromInvoice,
  validateCheckoutPrice,
  variantFromInvoice,
} from './billing';

const state = vi.hoisted(() => ({
  variant: 'test' as PricingVariant,
  session: vi.fn(),
  price: vi.fn(),
  purchase: vi.fn(),
}));
vi.mock('./pricing-experiment', async (original) => ({
  ...(await original<typeof import('./pricing-experiment')>()),
  assignedPricing: async () => state.variant,
}));
vi.mock('@easyrender/db', () => ({
  db: () => ({
    user: {
      findUnique: async () => ({
        email: 'qa@example.invalid',
        stripeCustomerId: null,
        subscriptionStatus: null,
      }),
    },
    purchase: { create: state.purchase },
  }),
}));
vi.mock('stripe', () => ({
  default: class {
    prices = { retrieve: state.price };
    checkout = { sessions: { create: state.session } };
  },
}));
const price = (plan: 'payg' | 'creator', variant: PricingVariant = 'test') =>
  ({
    id: `price_${plan}_${variant}`,
    active: true,
    currency: 'usd',
    billing_scheme: 'per_unit',
    transform_quantity: null,
    unit_amount:
      plan === 'payg'
        ? pricingFor(variant).creditUsd * 100
        : pricingFor(variant).plans[plan].priceCents,
    recurring:
      plan === 'payg' ? null : { interval: 'month', interval_count: 1, usage_type: 'licensed' },
  }) as Stripe.Price;
beforeEach(() => {
  vi.clearAllMocks();
  state.variant = 'test';
  vi.stubEnv('STRIPE_SECRET_KEY', 'local-only');
  vi.stubEnv('STRIPE_PRICE_PAYG_TEST', 'price_payg_test');
  vi.stubEnv('STRIPE_PRICE_CREATOR_TEST', 'price_creator_test');
  vi.stubEnv('STRIPE_PRICE_CREATOR', 'price_creator_control');
  state.session.mockResolvedValue({ id: 'cs_local', url: 'https://checkout.stripe.com/local' });
  state.price.mockResolvedValue(price('payg'));
});
afterEach(() => vi.unstubAllEnvs());
it('ignores forged prices and variants, charges the assigned price and snapshots the credits', async () => {
  const body = {
    plan: 'payg',
    credits: 500,
    price: 1,
    amountCents: 1,
    pricing_variant: 'control',
    monthlyCredits: 999999,
  };
  expect(await createCheckout('user', body)).toBe('https://checkout.stripe.com/local');
  expect(state.session.mock.calls[0][0]).toMatchObject({
    line_items: [{ price: 'price_payg_test', quantity: 500 }],
    metadata: { pricing_variant: 'test', pricing_flag: 'pricing-test-2026-11' },
  });
  expect(state.purchase.mock.calls[0][0].data).toMatchObject({
    packId: 'payg:test',
    credits: 500,
    amountCents: 1000,
  });
});
it('rejects stale displayed prices instead of silently charging a different amount', async () => {
  await expect(
    createCheckout('user', { plan: 'payg', credits: 500 }, { expectedVariant: 'control' }),
  ).rejects.toMatchObject({ code: 'pricing_changed' });
  expect(state.session).not.toHaveBeenCalled();
});
it('validates quantity again at the authoritative checkout entry point', async () => {
  for (const credits of [499, 100001, 500.5, NaN, Infinity, undefined]) {
    await expect(createCheckout('user', { plan: 'payg', credits })).rejects.toMatchObject({
      code: 'bad_amount',
    });
  }
  expect(state.session).not.toHaveBeenCalled();
  expect(parseCheckout({ plan: 'creator', credits: 999999 }, 'test')).toEqual({ plan: 'creator' });
});
it('snapshots subscription metadata and validates the Stripe monthly price', async () => {
  state.price.mockResolvedValue(price('creator'));
  await createCheckout('user', { plan: 'creator' });
  expect(state.session.mock.calls[0][0]).toMatchObject({
    mode: 'subscription',
    line_items: [{ price: 'price_creator_test', quantity: 1 }],
    metadata: { plan: 'creator', pricing_variant: 'test' },
    subscription_data: { metadata: { plan: 'creator', pricing_variant: 'test' } },
  });
});
it('fails closed for a misconfigured Stripe amount, currency, billing scheme or interval', async () => {
  for (const patch of [
    { unit_amount: 1 },
    { currency: 'eur' },
    { active: false },
    { billing_scheme: 'tiered' },
    { transform_quantity: { divide_by: 2 } },
  ]) {
    state.price.mockResolvedValue({ ...price('payg'), ...patch });
    await expect(createCheckout('user', { plan: 'payg', credits: 500 })).rejects.toMatchObject({
      code: 'price_mismatch',
    });
  }
  expect(() =>
    validateCheckoutPrice(
      { ...price('creator'), recurring: { interval: 'year' } } as Stripe.Price,
      'creator',
      'test',
    ),
  ).toThrow();
  expect(state.session).not.toHaveBeenCalled();
});
it('uses the actual invoice price after portal changes, even when the flag is off', () => {
  state.variant = 'control';
  const invoice = (id: string) =>
    ({
      parent: { subscription_details: { metadata: { plan: 'creator', pricing_variant: 'test' } } },
      lines: {
        data: [
          {
            parent: { subscription_item_details: { proration: false } },
            pricing: { price_details: { price: id } },
          },
        ],
      },
    }) as unknown as Stripe.Invoice;
  expect(variantFromInvoice(invoice('price_creator_test'))).toBe('test');
  expect(variantFromInvoice(invoice('price_creator_control'))).toBe('control');
  expect(planFromInvoice(invoice('price_creator_test'))).toBe('creator');
});
