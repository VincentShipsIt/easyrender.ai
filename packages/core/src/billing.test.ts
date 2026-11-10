import { describe, expect, it } from 'vitest';
import { isActiveSubscription, parseCheckout } from './billing';

describe('parseCheckout', () => {
  it('accepts Pro', () => {
    expect(parseCheckout({ plan: 'pro' })).toEqual({ plan: 'pro' });
  });

  it('accepts pay as you go within bounds, including numeric strings', () => {
    expect(parseCheckout({ plan: 'payg', credits: 2500 })).toEqual({ plan: 'payg', credits: 2500 });
    expect(parseCheckout({ plan: 'payg', credits: '1000' })).toEqual({
      plan: 'payg',
      credits: 1000,
    });
  });

  it('rejects amounts outside the range or fractional', () => {
    for (const credits of [0, 499, 100_001, 1000.5, 'abc', undefined]) {
      expect(() => parseCheckout({ plan: 'payg', credits })).toThrow(/Buy between/);
    }
  });

  it('rejects unknown plans', () => {
    expect(() => parseCheckout({ plan: 'enterprise' })).toThrow(/Unknown plan/);
    expect(() => parseCheckout({})).toThrow(/Unknown plan/);
  });
});

describe('isActiveSubscription', () => {
  it('treats active, trialing and past_due as Pro', () => {
    expect(['active', 'trialing', 'past_due'].map(isActiveSubscription)).toEqual([
      true,
      true,
      true,
    ]);
    expect(['canceled', 'incomplete', 'unpaid', null].map(isActiveSubscription)).toEqual([
      false,
      false,
      false,
      false,
    ]);
  });
});
