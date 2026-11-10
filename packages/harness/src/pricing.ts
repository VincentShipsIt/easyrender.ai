// Credits are sold at a 70% margin over what Replicate charges. 1 credit = $0.01.

export const MARGIN = 0.7;
export const CREDIT_USD = 0.01;

// What one full render costs us: the sheet plus a typical TRELLIS run (~60s on an A100).
export const RENDER_COST_USD = 0.24;

export function creditsFor(costUsd: number): number {
  return Math.ceil(Number((costUsd / (1 - MARGIN) / CREDIT_USD).toFixed(6)));
}

export const RENDER_CREDITS = creditsFor(RENDER_COST_USD);

// The angle sheet alone (one 2K image). Normally it comes free with the preview; this is what
// generating one later, from the library, costs. It counts toward the 3D render's price.
export const SHEET_COST_USD = 0.15;
export const SHEET_CREDITS = creditsFor(SHEET_COST_USD);

// Pay as you go: buy any number of credits at CREDIT_USD each, through one Stripe price of $0.01.
export const PAYG = { min: 500, max: 100_000, presets: [1000, 2500, 5000, 10_000] };

// Pro: a monthly subscription that adds credits on every paid invoice. Credits never expire.
export const PRO_PLAN = { label: 'Pro', priceCents: 4900, monthlyCredits: 5000 };

// Enterprise has no Stripe product: it books a call.
export const ENTERPRISE_BOOKING_URL = 'https://calendar.app.google/nXsPoPWMDeNfKte29';

export const isValidPaygCredits = (credits: number) =>
  Number.isInteger(credits) && credits >= PAYG.min && credits <= PAYG.max;

export const paygPriceCents = (credits: number) => Math.round(credits * CREDIT_USD * 100);

export const rendersFor = (credits: number) => Math.floor(credits / RENDER_CREDITS);
