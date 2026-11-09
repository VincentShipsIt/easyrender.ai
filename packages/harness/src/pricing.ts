// Credits are sold at a 70% margin over what Replicate charges. 1 credit = $0.01.

export const MARGIN = 0.7;
export const CREDIT_USD = 0.01;

// What one full render costs us: the sheet plus a typical TRELLIS run (~60s on an A100).
export const RENDER_COST_USD = 0.24;

export function creditsFor(costUsd: number): number {
  return Math.ceil(Number((costUsd / (1 - MARGIN) / CREDIT_USD).toFixed(6)));
}

export const RENDER_CREDITS = creditsFor(RENDER_COST_USD);

export type CreditPack = { id: string; credits: number; priceCents: number; label: string };

export const CREDIT_PACKS: CreditPack[] = [
  { id: 'starter', credits: 1000, priceCents: 1000, label: 'Starter' },
  { id: 'pro', credits: 5000, priceCents: 5000, label: 'Pro' },
];

export const findPack = (id: string) => CREDIT_PACKS.find((pack) => pack.id === id);

export const rendersInPack = (pack: CreditPack) => Math.floor(pack.credits / RENDER_CREDITS);
