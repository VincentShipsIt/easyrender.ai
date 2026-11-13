import { beforeEach, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
  receipts: new Map<string, { id: string; value: string; expiresAt: Date }>(),
}));
vi.mock('@easyrender/db', () => ({
  db: () => ({
    verification: {
      findUnique: async ({ where }: { where: { id: string } }) =>
        state.receipts.get(where.id) ?? null,
      deleteMany: async ({ where }: { where: { id: string } }) => ({
        count: Number(state.receipts.delete(where.id)),
      }),
    },
  }),
}));

import { claimSignupReceipt } from './signup-receipt';

beforeEach(() => state.receipts.clear());
it('returns a real signup once and scopes its receipt to the authenticated user', async () => {
  state.receipts.set('analytics-signup:new-user', {
    id: 'analytics-signup:new-user',
    value: 'google',
    expiresAt: new Date(Date.now() + 60000),
  });
  expect(await claimSignupReceipt('other-user')).toBeNull();
  expect(await claimSignupReceipt('new-user')).toEqual({ method: 'google' });
  expect(await claimSignupReceipt('new-user')).toBeNull();
});
it('does not turn expired receipts or an existing login into a new signup', async () => {
  state.receipts.set('analytics-signup:old', {
    id: 'analytics-signup:old',
    value: 'google',
    expiresAt: new Date(0),
  });
  expect(await claimSignupReceipt('old')).toBeNull();
  expect(await claimSignupReceipt('existing')).toBeNull();
});
it('only one concurrent claimant wins', async () => {
  state.receipts.set('analytics-signup:new', {
    id: 'analytics-signup:new',
    value: 'email',
    expiresAt: new Date(Date.now() + 60000),
  });
  const claims = await Promise.all([claimSignupReceipt('new'), claimSignupReceipt('new')]);
  expect(claims.filter(Boolean)).toHaveLength(1);
});
