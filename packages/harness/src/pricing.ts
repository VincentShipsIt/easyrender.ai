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

// Monthly plans: each adds its credits on every paid invoice. Credits never expire. Per credit:
// Creator $0.0119, Pro $0.0098, Scale $0.0093 (pay as you go is $0.01). The two bigger plans trade
// a few points of the 70% margin for volume: about 69% on Pro and 68% on Scale.
export const SUBSCRIPTION_PLANS = {
  creator: { label: 'Creator', priceCents: 1900, monthlyCredits: 1600 },
  pro: { label: 'Pro', priceCents: 4900, monthlyCredits: 5000 },
  scale: { label: 'Scale', priceCents: 14900, monthlyCredits: 16_000 },
} as const;

export type PlanId = keyof typeof SUBSCRIPTION_PLANS;
export const PLAN_IDS = Object.keys(SUBSCRIPTION_PLANS) as PlanId[];
export const isPlanId = (value: unknown): value is PlanId =>
  typeof value === 'string' && Object.hasOwn(SUBSCRIPTION_PLANS, value);

export const PRO_PLAN = SUBSCRIPTION_PLANS.pro;

// Enterprise has no Stripe product: it books a call.
export const ENTERPRISE_BOOKING_URL = 'https://calendar.app.google/nXsPoPWMDeNfKte29';

export const isValidPaygCredits = (credits: number) =>
  Number.isInteger(credits) && credits >= PAYG.min && credits <= PAYG.max;

export const paygPriceCents = (credits: number) => Math.round(credits * CREDIT_USD * 100);

export const rendersFor = (credits: number) => Math.floor(credits / RENDER_CREDITS);
