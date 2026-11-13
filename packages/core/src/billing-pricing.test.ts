import { type PricingVariant, pricingFor, unitAmountCents } from '@easyrender/harness';
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
  customer: vi.fn(),
  customerId: null as string | null,
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
        stripeCustomerId: state.customerId,
        subscriptionStatus: null,
      }),
    },
    purchase: { create: state.purchase },
  }),
}));
vi.mock('stripe', () => ({
  default: class {
    prices = { retrieve: state.price };
    customers = { retrieve: state.customer };
    checkout = { sessions: { create: state.session } };
  },
}));
const price = (plan: 'payg' | 'creator', variant: PricingVariant = 'test') =>
  ({
    id: `price_${plan}_${variant}`,
    active: true,
    currency: 'usd',
    currency_options: { eur: { unit_amount: unitAmountCents(plan, variant, 'eur') } },
    billing_scheme: 'per_unit',
    transform_quantity: null,
    unit_amount:
      plan === 'payg'
        ? pricingFor(variant).creditUsd * 100
        : pricingFor(variant).plans[plan].priceCents,
    recurring:
      plan === 'payg' ? null : { interval: 'month', interval_count: 1, usage_type: 'licensed' },
  }) as unknown as Stripe.Price;
beforeEach(() => {
  vi.clearAllMocks();
  state.variant = 'test';
  state.customerId = null;
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

it('charges a euro-area buyer the fixed EUR price once EUR checkout is on', async () => {
  vi.stubEnv('EUR_CHECKOUT_ENABLED', '1');
  await createCheckout('user', { plan: 'payg', credits: 500 }, { country: 'ES' });
  expect(state.session.mock.calls[0][0]).toMatchObject({
    currency: 'eur',
    adaptive_pricing: { enabled: false },
    line_items: [{ price: 'price_payg_test', quantity: 500 }],
  });
  expect(state.purchase.mock.calls[0][0].data).toMatchObject({
    credits: 500,
    amountCents: 1000,
    currency: 'eur',
  });
});
it('keeps USD for other countries, and for everyone while EUR checkout is off', async () => {
  vi.stubEnv('EUR_CHECKOUT_ENABLED', '1');
  await createCheckout('user', { plan: 'payg', credits: 500 }, { country: 'US' });
  vi.stubEnv('EUR_CHECKOUT_ENABLED', '0');
  await createCheckout('user', { plan: 'payg', credits: 500 }, { country: 'ES' });
  for (const [call] of state.session.mock.calls) expect(call).toMatchObject({ currency: 'usd' });
  for (const [call] of state.purchase.mock.calls) expect(call.data.currency).toBe('usd');
});
it('refuses EUR when the Stripe price carries a different EUR amount', async () => {
  vi.stubEnv('EUR_CHECKOUT_ENABLED', '1');
  state.price.mockResolvedValue({
    ...price('payg'),
    currency_options: { eur: { unit_amount: 3 } },
  });
  await expect(
    createCheckout('user', { plan: 'payg', credits: 500 }, { country: 'DE' }),
  ).rejects.toMatchObject({ code: 'price_mismatch' });
  state.price.mockResolvedValue({ ...price('payg'), currency_options: undefined });
  await expect(
    createCheckout('user', { plan: 'payg', credits: 500 }, { country: 'DE' }),
  ).rejects.toMatchObject({ code: 'price_mismatch' });
  expect(state.session).not.toHaveBeenCalled();
});
it('keeps a returning customer in the currency Stripe already locked them to', async () => {
  vi.stubEnv('EUR_CHECKOUT_ENABLED', '1');
  state.customerId = 'cus_1';
  state.customer.mockResolvedValue({ id: 'cus_1', currency: 'usd' });
  await createCheckout('user', { plan: 'payg', credits: 500 }, { country: 'FR' });
  expect(state.session.mock.calls[0][0]).toMatchObject({ currency: 'usd' });
  state.customer.mockResolvedValue({ id: 'cus_1', currency: 'eur' });
  await createCheckout('user', { plan: 'payg', credits: 500 }, { country: 'US' });
  expect(state.session.mock.calls[1][0]).toMatchObject({ currency: 'eur' });
});
it('returns the server-selected checkout amount and currency for analytics', async () => {
  const { createCheckoutDetails } = await import('./billing');
  vi.stubEnv('EUR_CHECKOUT_ENABLED', '1');
  expect(
    await createCheckoutDetails('user', { plan: 'payg', credits: 500 }, { country: 'ES' }),
  ).toMatchObject({
    url: 'https://checkout.stripe.com/local',
    sessionId: 'cs_local',
    analytics: {
      currency: 'EUR',
      value: 10,
      pricing_variant: 'test',
      items: [{ item_id: 'payg', quantity: 500 }],
    },
  });
});
