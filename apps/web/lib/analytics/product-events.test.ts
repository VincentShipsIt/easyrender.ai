import { afterEach, expect, it, vi } from 'vitest';

const sdk = vi.hoisted(() => ({ init: vi.fn(), capture: vi.fn(), identify: vi.fn() }));
vi.mock('posthog-js', () => ({ default: sdk }));
afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

const PRODUCT_EVENTS = [
  ['sign_up_completed', { method: 'email' }],
  ['sign_in_completed', { method: 'email' }],
  ['render_preview_created', { source: 'home', has_prompt: true }],
  ['render_generation_started', { source: 'render_detail', credits: 64 }],
  ['render_sheet_generation_started', { source: 'library', credits: 16 }],
  ['render_visibility_changed', { is_public: true }],
  ['material_edits_saved', { material_count: 2 }],
  ['material_edits_reset', { material_count: 0 }],
  ['api_key_created', {}],
  ['api_key_revoked', {}],
  ['shopify_generation_started', { item_count: 5, credits: 320 }],
  ['shopify_account_linked', {}],
] as const;

it('product events reach PostHog only after consent, through the consent-gated SDK, with no identity', async () => {
  vi.resetModules();
  vi.stubEnv('NEXT_PUBLIC_POSTHOG_KEY', 'phc_localtest');
  const location = new URL('https://easyrender.ai/library');
  vi.stubGlobal('location', location);
  vi.stubGlobal('window', { location });
  vi.stubGlobal('document', { cookie: '', referrer: '', querySelector: () => null });
  const api = await import('./browser');

  await api.setBrowserTools(false, false);
  for (const [event, properties] of PRODUCT_EVENTS) api.captureBrowser(event, properties);
  expect(sdk.capture).not.toHaveBeenCalled();

  await api.setBrowserTools(true, false);
  for (const [event, properties] of PRODUCT_EVENTS) api.captureBrowser(event, properties);
  const sent = sdk.capture.mock.calls.filter(([event]) => event !== 'landing_view');
  expect(sent.map(([event]) => event)).toEqual(PRODUCT_EVENTS.map(([e]) => e));
  expect(sent[0][1]).toMatchObject({
    method: 'email',
    pricing_variant: 'control',
  });
  expect(sdk.identify).not.toHaveBeenCalled();
  expect(sdk.init.mock.calls[0][1]).toMatchObject({
    person_profiles: 'never',
    capture_exceptions: false,
    cookieless_mode: 'always',
  });

  const calls = sdk.capture.mock.calls.length;
  await api.setBrowserTools(false, false, true);
  api.captureBrowser('api_key_created');
  expect(sdk.capture).toHaveBeenCalledTimes(calls);
});
