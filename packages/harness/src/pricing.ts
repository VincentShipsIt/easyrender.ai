// Credits are sold at a 70% margin over what Replicate charges. 1 credit = $0.01.

export const MARGIN = 0.7;
export const CREDIT_USD = 0.01;

export function creditsFor(costUsd: number): number {
  return Math.ceil(Number((costUsd / (1 - MARGIN) / CREDIT_USD).toFixed(6)));
}

// The draft angle sheet (one 1K image). The free preview makes one at our cost; this is what
// generating one later, from the library, costs. It counts toward the 3D render's price.
export const SHEET_COST_USD = 0.034;
export const SHEET_CREDITS = creditsFor(SHEET_COST_USD);

// A paid build redraws the sheet at 2K with the final model, then builds from it. That 2K sheet
// plus a typical TRELLIS run (~60s on an A100, which is a ceiling: Replicate lists about $0.047
// and 34s for a typical run) is what one full render costs us.
export const FINAL_SHEET_COST_USD = 0.101;
export const BUILD_COST_USD = 0.09;
export const RENDER_COST_USD = FINAL_SHEET_COST_USD + BUILD_COST_USD;
export const RENDER_CREDITS = creditsFor(RENDER_COST_USD);

// Pay as you go: buy any number of credits at CREDIT_USD each, through one Stripe price of $0.01.
export const PAYG = { min: 500, max: 100_000, presets: [1000, 2500, 5000, 10_000] };

// Monthly plans: each adds its credits on every paid invoice. Credits never expire. A plan always
// has a cheaper credit than pay as you go ($0.01), and a bigger plan a cheaper one still. Per
// credit: Creator $0.0095 (5% off), Pro $0.0089 (11% off), Scale $0.0083 (17% off), which leaves a
// margin over provider cost of about 68%, 66% and 64%.
export const SUBSCRIPTION_PLANS = {
  creator: { label: 'Creator', priceCents: 1900, monthlyCredits: 2000 },
  pro: { label: 'Pro', priceCents: 4900, monthlyCredits: 5500 },
  scale: { label: 'Scale', priceCents: 14900, monthlyCredits: 18_000 },
} as const;

export type PlanId = keyof typeof SUBSCRIPTION_PLANS;
export const PLAN_IDS = Object.keys(SUBSCRIPTION_PLANS) as PlanId[];
export const isPlanId = (value: unknown): value is PlanId =>
  typeof value === 'string' && Object.hasOwn(SUBSCRIPTION_PLANS, value);

export const PRO_PLAN = SUBSCRIPTION_PLANS.pro;

// Enterprise has no Stripe product: it books a call.
export const ENTERPRISE_BOOKING_URL = 'https://calendar.app.google/nXsPoPWMDeNfKte29';

export const PRICING_FLAG = 'pricing-test-2026-11';
export type PricingVariant = 'control' | 'test';
export const pricingFor = (variant: PricingVariant = 'control') => ({
  variant,
  creditUsd: variant === 'test' ? 0.02 : CREDIT_USD,
  payg: PAYG,
  plans:
    variant === 'test'
      ? {
          creator: { label: 'Creator', priceCents: 2900, monthlyCredits: 1600 },
          pro: { label: 'Pro', priceCents: 7900, monthlyCredits: 4500 },
          scale: { label: 'Scale', priceCents: 19900, monthlyCredits: 12_000 },
        }
      : SUBSCRIPTION_PLANS,
});

// Fixed per-currency prices (Stripe `currency_options` on the same price IDs). USD stays the base
// currency. Buyers in euro-area countries are charged these EUR amounts; Adaptive Pricing stays off.
export type ChargeCurrency = 'usd' | 'eur';
export const EURO_AREA_COUNTRIES: ReadonlySet<string> = new Set([
  'AT',
  'BE',
  'BG',
  'CY',
  'DE',
  'EE',
  'ES',
  'FI',
  'FR',
  'GR',
  'HR',
  'IE',
  'IT',
  'LT',
  'LU',
  'LV',
  'MT',
  'NL',
  'PT',
  'SI',
  'SK',
]);
export const currencyForCountry = (country: string | null | undefined): ChargeCurrency =>
  country && EURO_AREA_COUNTRIES.has(country.toUpperCase()) ? 'eur' : 'usd';

export const EUR_PRICING = {
  control: { creditCents: 1, plans: { creator: 1800, pro: 4600, scale: 13_900 } },
  test: { creditCents: 2, plans: { creator: 2700, pro: 7400, scale: 18_500 } },
} as const;

/** The unit amount (in cents) the Stripe price must carry for a plan or one pay-as-you-go credit. */
export const unitAmountCents = (
  plan: 'payg' | PlanId,
  variant: PricingVariant = 'control',
  currency: ChargeCurrency = 'usd',
) => {
  if (currency === 'eur')
    return plan === 'payg' ? EUR_PRICING[variant].creditCents : EUR_PRICING[variant].plans[plan];
  return plan === 'payg' ? paygPriceCents(1, variant) : pricingFor(variant).plans[plan].priceCents;
};

export const isValidPaygCredits = (credits: number, variant: PricingVariant = 'control') => {
  const { payg } = pricingFor(variant);
  return Number.isInteger(credits) && credits >= payg.min && credits <= payg.max;
};

export const paygPriceCents = (credits: number, variant: PricingVariant = 'control') =>
  Math.round(credits * pricingFor(variant).creditUsd * 100);

export const rendersFor = (credits: number) => Math.floor(credits / RENDER_CREDITS);
