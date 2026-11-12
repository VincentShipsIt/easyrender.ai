import { PRICING_FLAG } from '@easyrender/harness';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { evaluatePricingFlag, type PricingFlag } from './pricing-experiment';

const flag = (rollout = 100): PricingFlag => ({
  key: PRICING_FLAG,
  active: true,
  filters: {
    groups: [{ properties: [], rollout_percentage: rollout }],
    multivariate: {
      variants: [
        { key: 'control', rollout_percentage: 50 },
        { key: 'test', rollout_percentage: 50 },
      ],
    },
  },
});
const visits = vi.hoisted(() => ({ check: vi.fn(async () => true) }));
vi.mock('./pricing-visits', () => ({ hasPricingVisit: visits.check }));
const records = new Map<string, string>();
vi.mock('@easyrender/db', () => ({
  db: () => ({
    verification: {
      upsert: async ({ create }: { create: { id: string; value: string } }) => {
        if (!records.has(create.id)) records.set(create.id, create.value);
        return { value: records.get(create.id) };
      },
    },
  }),
}));
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
beforeEach(() => {
  records.clear();
  visits.check.mockReset().mockResolvedValue(true);
  vi.resetModules();
});

describe('deterministic local assignment', () => {
  it('uses stable PostHog hash vectors and rollout independently of consent', () => {
    // Golden variants from the installed @posthog/core 1.67.1 getFeatureFlagHash.
    const ids = ['visitor-0', 'visitor-1', 'visitor-2', 'visitor-3', 'visitor-4'];
    expect(ids.map((id) => evaluatePricingFlag(flag(), id))).toEqual([
      'test',
      'test',
      'control',
      'test',
      'control',
    ]);
    expect(ids.map((id) => evaluatePricingFlag(flag(50), id))).toEqual([
      'control',
      'control',
      'control',
      'test',
      'control',
    ]);
    const result = Array.from({ length: 1000 }, (_, i) =>
      evaluatePricingFlag(flag(), `visitor-${i}`),
    );
    expect(result.filter((v) => v === 'test').length).toBeGreaterThan(400);
    expect(result.filter((v) => v === 'test').length).toBeLessThan(600);
    expect(
      Array.from({ length: 100 }, (_, i) => evaluatePricingFlag(flag(0), `${i}`)),
    ).not.toContain('test');
  });
  it('fails closed for missing, disabled, deleted, malformed and unsupported flags', () => {
    expect(evaluatePricingFlag(null, 'id')).toBe('control');
    expect(evaluatePricingFlag(flag(), null)).toBe('control');
    for (const changes of [{ active: false }, { deleted: true }, { key: 'other' }])
      expect(evaluatePricingFlag({ ...flag(), ...changes }, 'id')).toBe('control');
    const invalid = flag();
    invalid.filters.groups[0].properties = [{ key: 'country', value: 'US' }];
    expect(evaluatePricingFlag(invalid, 'id')).toBe('control');
    invalid.filters.groups[0].properties = [];
    invalid.filters.multivariate.variants[1].key = 'unknown';
    expect(evaluatePricingFlag(invalid, 'id')).toBe('control');
  });
  it('preserves the first visitor identity on signup and on another device', async () => {
    const { pricingIdentity } = await import('./pricing-experiment');
    expect(await pricingIdentity(null, 'visitor-1')).toBe('visitor-1');
    expect(await pricingIdentity('account', 'visitor-1')).toBe('visitor-1');
    expect(await pricingIdentity('account', 'another-device')).toBe('visitor-1');
    expect(await pricingIdentity('account', null)).toBe('visitor-1');
  });
  it('defaults off, requires all configuration, and never sends visitor IDs to PostHog', async () => {
    const fetcher = vi.fn(async () => Response.json({ results: [flag()] }));
    vi.stubGlobal('fetch', fetcher);
    const { assignedPricing } = await import('./pricing-experiment');
    expect(await assignedPricing(null, 'private-visitor')).toBe('control');
    expect(fetcher).not.toHaveBeenCalled();
    vi.stubEnv('PRICING_AB_ENABLED', '1');
    vi.stubEnv('NEXT_PUBLIC_POSTHOG_KEY', 'public-local');
    vi.stubEnv('POSTHOG_PERSONAL_API_KEY', 'local-read-only');
    vi.stubEnv('POSTHOG_PROJECT_ID', '347125');
    await assignedPricing(null, 'private-visitor');
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(fetcher.mock.calls)).not.toContain('private-visitor');
    vi.stubEnv('NEXT_PUBLIC_POSTHOG_KEY', '');
    expect(await assignedPricing(null, 'private-visitor')).toBe('control');
  });
  it('honors flag shutdown within 30 seconds and drops expired config on failure', async () => {
    vi.useFakeTimers();
    vi.stubEnv('PRICING_AB_ENABLED', '1');
    vi.stubEnv('NEXT_PUBLIC_POSTHOG_KEY', 'public-local');
    vi.stubEnv('POSTHOG_PERSONAL_API_KEY', 'local-read-only');
    vi.stubEnv('POSTHOG_PROJECT_ID', '347125');
    const enabled = flag();
    enabled.filters.multivariate.variants = [
      { key: 'control', rollout_percentage: 0 },
      { key: 'test', rollout_percentage: 100 },
    ];
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ results: [enabled] }))
      .mockResolvedValueOnce(Response.json({ results: [{ ...enabled, active: false }] }))
      .mockRejectedValueOnce(new Error('offline'));
    vi.stubGlobal('fetch', fetcher);
    const { assignedPricing } = await import('./pricing-experiment');
    expect(await assignedPricing(null, 'visitor')).toBe('test');
    vi.advanceTimersByTime(30_001);
    expect(await assignedPricing(null, 'visitor')).toBe('control');
    vi.advanceTimersByTime(30_001);
    expect(await assignedPricing(null, 'visitor')).toBe('control');
  });
});

it('fails closed for a reached cap, a failed read or a failed enrolment, including previous test visitors', async () => {
  vi.stubEnv('PRICING_AB_ENABLED', '1');
  vi.stubEnv('NEXT_PUBLIC_POSTHOG_KEY', 'public-local');
  vi.stubEnv('POSTHOG_PERSONAL_API_KEY', 'local-read-only');
  vi.stubEnv('POSTHOG_PROJECT_ID', '347125');
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => Response.json({ results: [flag()] })),
  );
  const { assignedPricing, pricingDecision } = await import('./pricing-experiment');
  expect(await assignedPricing(null, 'visitor-0')).toBe('test');
  visits.check.mockResolvedValue(false);
  expect(await pricingDecision(null, 'visitor-0')).toEqual({
    variant: 'control',
    isExperimentActive: false,
  });
  visits.check.mockRejectedValue(new Error('counter unavailable'));
  expect(await assignedPricing(null, 'visitor-0')).toBe('control');
  expect(await pricingDecision(null, 'new-visitor', true)).toEqual({
    variant: 'control',
    isExperimentActive: false,
  });
});
it('does not enrol or measure when the flag is disabled or malformed', async () => {
  vi.stubEnv('PRICING_AB_ENABLED', '1');
  vi.stubEnv('NEXT_PUBLIC_POSTHOG_KEY', 'public-local');
  vi.stubEnv('POSTHOG_PERSONAL_API_KEY', 'local-read-only');
  vi.stubEnv('POSTHOG_PROJECT_ID', '347125');
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => Response.json({ results: [{ ...flag(), active: false }] })),
  );
  const { pricingDecision } = await import('./pricing-experiment');
  expect(await pricingDecision(null, 'visitor', true)).toEqual({
    variant: 'control',
    isExperimentActive: false,
  });
  expect(visits.check).not.toHaveBeenCalled();
});
