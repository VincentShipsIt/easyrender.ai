import { afterEach, beforeEach, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
  isConfigured: true,
  path: '/credits',
  decision: vi.fn(),
  actor: vi.fn(),
}));
vi.mock('server-only', () => ({}));
vi.mock('@easyrender/core', () => ({
  isPricingExperimentConfigured: () => state.isConfigured,
  pricingDecision: state.decision,
  pricingSubject: async () => 'hashed-subject',
}));
vi.mock('@/lib/actor', () => ({ resolveActor: state.actor }));
vi.mock('next/headers', () => ({
  headers: async () => new Headers({ 'x-easyrender-path': state.path }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  state.isConfigured = true;
  state.actor.mockResolvedValue({ userId: null, anonId: 'functional-visitor' });
  state.decision.mockResolvedValue({ variant: 'test', isExperimentActive: true });
});
afterEach(() => vi.unstubAllGlobals());
it.each(['/', '/es', '/credits', '/es/precios'])(
  'enrols on %s without analytics consent input',
  async (path) => {
    state.path = path;
    const { currentPricing } = await import('./pricing');
    expect(await currentPricing()).toMatchObject({ variant: 'test', isExperimentActive: true });
    expect(state.decision).toHaveBeenCalledWith(null, 'functional-visitor', true);
  },
);
it.each(['/sign-up', '/dashboard', '/models'])('does not consume a slot on %s', async (path) => {
  state.path = path;
  const { currentPricing } = await import('./pricing');
  await currentPricing();
  expect(state.decision).toHaveBeenCalledWith(null, 'functional-visitor', false);
});
it('serves control and disables exposure after the server closes the experiment', async () => {
  state.decision.mockResolvedValue({ variant: 'control', isExperimentActive: false });
  const { currentPricing } = await import('./pricing');
  expect(await currentPricing()).toMatchObject({ variant: 'control', isExperimentActive: false });
});
it('defaults off without resolving an identity or accessing the experiment store', async () => {
  state.isConfigured = false;
  const { currentPricing } = await import('./pricing');
  expect(await currentPricing()).toMatchObject({ variant: 'control', isExperimentActive: false });
  expect(state.actor).not.toHaveBeenCalled();
  expect(state.decision).not.toHaveBeenCalled();
});
