import { describe, expect, it } from 'vitest';
import {
  CREDIT_USD,
  isValidPaygCredits,
  PLAN_IDS,
  paygPriceCents,
  pricingFor,
  RENDER_CREDITS,
  rendersFor,
} from './pricing';

describe('pricing experiment catalogue', () => {
  it('preserves control and the purchasing power of every existing credit', () => {
    expect(RENDER_CREDITS).toBe(64);
    expect(CREDIT_USD).toBe(0.01);
    expect(pricingFor().creditUsd).toBe(0.01);
    expect(paygPriceCents(500)).toBe(500);
    expect(PLAN_IDS.map((id) => pricingFor().plans[id].priceCents)).toEqual([1900, 4900, 14900]);
    expect(PLAN_IDS.map((id) => pricingFor().plans[id].monthlyCredits)).toEqual([
      2000, 5500, 18000,
    ]);
    expect(rendersFor(640)).toBe(10);
  });
  it('charges $1.28 per model and at least $10 for newly bought test credits', () => {
    expect(paygPriceCents(RENDER_CREDITS, 'test')).toBe(128);
    expect(paygPriceCents(pricingFor('test').payg.min, 'test')).toBe(1000);
    expect(isValidPaygCredits(499, 'test')).toBe(false);
    expect(isValidPaygCredits(500, 'test')).toBe(true);
    expect(isValidPaygCredits(100_000, 'test')).toBe(true);
    expect(isValidPaygCredits(100_001, 'test')).toBe(false);
    expect(PLAN_IDS.map((id) => pricingFor('test').plans[id].priceCents)).toEqual([
      2900, 7900, 19900,
    ]);
    expect(PLAN_IDS.map((id) => pricingFor('test').plans[id].monthlyCredits)).toEqual([
      1600, 4500, 12000,
    ]);
    const rates = PLAN_IDS.map((id) => {
      const plan = pricingFor('test').plans[id];
      return (plan.priceCents / 100 / plan.monthlyCredits) * RENDER_CREDITS;
    });
    expect(rates[0]).toBeCloseTo(1.16);
    expect(rates[1]).toBeCloseTo(1.12356);
    expect(rates[2]).toBeCloseTo(1.06133);
  });
});
