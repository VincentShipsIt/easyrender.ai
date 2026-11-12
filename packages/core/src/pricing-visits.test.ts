import { createHash } from 'node:crypto';
import { PRICING_FLAG } from '@easyrender/harness';
import { beforeEach, expect, it, vi } from 'vitest';
import { hasPricingVisit, PRICING_VISIT_LIMIT } from './pricing-visits';

// Transactional store double. The real row-lock test lives in pricing-visits.integration.test.ts.
const state = vi.hoisted(() => ({ value: null as string | null, queue: Promise.resolve() }));
vi.mock('@easyrender/db', () => ({
  Prisma: { TransactionIsolationLevel: { ReadCommitted: 'ReadCommitted' } },
  db: () => ({
    verification: {
      findUnique: async () => (state.value === null ? null : { value: state.value }),
    },
    $transaction: async (work: (tx: unknown) => Promise<boolean>) => {
      const result = state.queue.then(() =>
        work({
          $executeRaw: async () => {
            state.value ??= '[]';
          },
          $queryRaw: async () => [{ value: state.value }],
          verification: {
            update: async ({ data }: { data: { value: string } }) => {
              state.value = data.value;
            },
          },
        }),
      );
      state.queue = result.then(
        () => {},
        () => {},
      );
      return result;
    },
  }),
}));
beforeEach(() => {
  state.value = null;
  state.queue = Promise.resolve();
});
const count = () => (JSON.parse(state.value ?? '[]') as string[]).length;

it('counts the first 1,000 unique visitors, closes on visitor 1,000, and never reopens for earlier test visitors', async () => {
  for (let i = 1; i <= PRICING_VISIT_LIMIT; i++) {
    expect(await hasPricingVisit(`visitor-${i}`, true)).toBe(i < PRICING_VISIT_LIMIT);
    expect(count()).toBe(i);
  }
  expect(await hasPricingVisit('visitor-1')).toBe(false);
  expect(await hasPricingVisit('visitor-1', true)).toBe(false);
  expect(await hasPricingVisit('visitor-1001', true)).toBe(false);
  expect(count()).toBe(PRICING_VISIT_LIMIT);
});
it('deduplicates repeat page loads and only enrols pricing page visitors', async () => {
  expect(await hasPricingVisit('visitor')).toBe(false);
  expect(state.value).toBeNull();
  expect(await hasPricingVisit('visitor', true)).toBe(true);
  expect(await hasPricingVisit('visitor', true)).toBe(true);
  expect(await hasPricingVisit('visitor')).toBe(true);
  expect(await hasPricingVisit('checkout-only')).toBe(false);
  expect(count()).toBe(1);
  expect(state.value).not.toContain('visitor');
});
it('bounds concurrent new visitors and deduplicates simultaneous repeats', async () => {
  await Promise.all(Array.from({ length: 100 }, () => hasPricingVisit('same', true)));
  expect(count()).toBe(1);
  const results = await Promise.all(
    Array.from({ length: 1100 }, (_, i) => hasPricingVisit(`new-${i}`, true)),
  );
  expect(count()).toBe(PRICING_VISIT_LIMIT);
  expect(results.filter(Boolean)).toHaveLength(PRICING_VISIT_LIMIT - 2);
  expect(await hasPricingVisit('same')).toBe(false);
});
it('rejects malformed counter data instead of resetting it', async () => {
  const subject = createHash('sha256').update(`${PRICING_FLAG}:visitor`).digest('hex');
  for (const invalid of [
    'garbage',
    '{}',
    '[123]',
    '["unhashed"]',
    JSON.stringify([subject, subject]),
  ]) {
    state.value = invalid;
    await expect(hasPricingVisit('visitor')).rejects.toThrow();
    await expect(hasPricingVisit('visitor', true)).rejects.toThrow();
    expect(state.value).toBe(invalid);
  }
});
