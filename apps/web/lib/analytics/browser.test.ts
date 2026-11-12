import { runInNewContext } from 'node:vm';
import { classifyCountry, isToolAllowed } from '@easyrender/core/attribution';
import { afterEach, expect, it, vi } from 'vitest';
import { GOOGLE_TAG_BOOTSTRAP } from '../google-tag';
import { beforeSend } from './browser';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
it('before_send retains the public SDK project key required for ingestion and strips all non-UTM URL data', () => {
  vi.stubEnv('NEXT_PUBLIC_POSTHOG_KEY', 'phc_localtest');
  const event = beforeSend({
    properties: {
      token: 'phc_localtest',
      $current_url: 'https://example.test/?utm_source=test&foo=1&gclid=abc',
      $referrer: 'https://ref.test/?private=1',
      title: 'private account name',
      fbclid: 'abc',
      referrer_host: 'external.test',
    },
  });
  expect(event.properties).toEqual({
    pricing_subject: null,
    pricing_variant: 'control',
    '$feature/pricing-test-2026-11': 'control',
    token: 'phc_localtest',
    $current_url: 'https://example.test/?utm_source=test',
    $referrer: 'https://ref.test/',
    referrer_host: 'external.test',
  });
});

async function googleBrowser(hostname = 'easyrender.ai') {
  vi.resetModules();
  const scripts: Array<{ src?: string }> = [];
  const dataLayer: unknown[] = [{ event: 'existing-event' }];
  const location = new URL(`https://${hostname}/credits?utm_source=test&email=private#secret`);
  const window = { location, dataLayer };
  const document = {
    referrer: 'https://external.test/path?token=private#secret',
    cookie: '',
    createElement: () => ({}),
    head: { appendChild: (script: { src?: string }) => scripts.push(script) },
  };
  const bootstrap = () => runInNewContext(GOOGLE_TAG_BOOTSTRAP, { window, document, URL });
  bootstrap();
  vi.stubGlobal('window', window);
  vi.stubGlobal('document', document);
  vi.stubGlobal('location', location);
  const api = await import('./browser');
  const commands = () => dataLayer.slice(1).map((entry) => Array.from(entry as ArrayLike<unknown>));
  return { api, bootstrap, window, dataLayer, scripts, commands };
}
it('reuses the bootstrap queue and sole loader, sanitizes GA URLs and routes conversions only to GA', async () => {
  const page = await googleBrowser();
  page.api.initializeGa('G-TEST000000');
  page.api.initializeGa('G-TEST000000');
  await page.api.setBrowserTools(false, true);
  page.api.gaEvent('purchase', { transaction_id: 'invoice-1' }, 'invoice-1');
  page.api.gaEvent('purchase', { transaction_id: 'invoice-1' }, 'invoice-1');
  page.window.location.pathname = '/dashboard';
  page.api.gaPageview();
  page.api.gaPageview();
  page.bootstrap();
  expect(page.window.dataLayer).toBe(page.dataLayer);
  expect(page.dataLayer[0]).toEqual({ event: 'existing-event' });
  expect(page.scripts).toEqual([
    { async: true, src: 'https://www.googletagmanager.com/gtm.js?id=AW-18570382360' },
  ]);
  expect(page.commands().filter(([c, type]) => c === 'consent' && type === 'default')).toHaveLength(
    1,
  );
  expect(page.commands().filter(([c]) => c === 'js')).toHaveLength(1);
  expect(page.commands().filter(([c]) => c === 'config')).toHaveLength(1);
  expect(page.commands().filter(([c, type]) => c === 'event' && type === 'page_view')).toHaveLength(
    2,
  );
  expect(page.commands().filter(([c, type]) => c === 'event' && type === 'purchase')).toEqual([
    [
      'event',
      'purchase',
      {
        pricing_variant: 'control',
        transaction_id: 'invoice-1',
        send_to: 'G-TEST000000',
        page_location: 'https://easyrender.ai/credits',
        page_referrer: 'https://external.test/path',
      },
    ],
  ]);
  expect(page.commands()).toContainEqual([
    'config',
    'G-TEST000000',
    {
      send_page_view: false,
      page_location: 'https://easyrender.ai/credits',
      page_referrer: 'https://external.test/path',
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    },
  ]);
  expect(JSON.stringify(page.commands())).not.toMatch(/private|secret|utm_source/);
  expect(page.commands()).toContainEqual(['set', 'ads_data_redaction', true]);
});
it.each([
  ['DE', false, 'denied'],
  ['GB', false, 'denied'],
  ['CH', false, 'denied'],
  [null, false, 'denied'],
  ['US', false, 'granted'],
  ['US', true, 'denied'],
] as const)(
  'updates bootstrap consent for %s, GPC=%s without granting advertising',
  async (country, hasGpc, consent) => {
    const page = await googleBrowser();
    page.api.initializeGa('G-TEST000000');
    const region = classifyCountry(country);
    await page.api.setBrowserTools(
      false,
      isToolAllowed('ga4', region.consent_region, null, hasGpc),
    );
    expect(page.commands()).toContainEqual([
      'consent',
      'update',
      {
        analytics_storage: consent,
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      },
    ]);
    expect(page.commands().filter(([c]) => c === 'config')).toHaveLength(
      consent === 'granted' ? 1 : 0,
    );
  },
);
it('withdrawal disables GA events and accepting again reuses the same loader', async () => {
  const page = await googleBrowser();
  page.api.initializeGa('G-TEST000000');
  await page.api.setBrowserTools(false, true);
  await page.api.setBrowserTools(false, false, true);
  const before = page.commands().length;
  page.api.gaEvent('sign_up');
  page.api.gaPageview();
  expect(page.commands()).toHaveLength(before);
  expect(page.window).toHaveProperty('ga-disable-G-TEST000000', true);
  await page.api.setBrowserTools(false, true);
  expect(page.window).toHaveProperty('ga-disable-G-TEST000000', false);
  expect(page.scripts).toHaveLength(1);
  expect(page.commands().filter(([c]) => c === 'config')).toHaveLength(1);
});
it('unset GA ID leaves only the denied Ads bootstrap', async () => {
  const page = await googleBrowser();
  page.api.initializeGa('');
  await page.api.setBrowserTools(false, true);
  page.api.gaEvent('purchase');
  expect(page.commands().filter(([c]) => ['config', 'event'].includes(String(c)))).toEqual([]);
  expect(page.scripts).toHaveLength(1);
});
it.each(['localhost', 'preview.vercel.app', 'easyrender.ai.example.com'])(
  'does not initialize Google analytics on %s even with GA configured',
  async (hostname) => {
    const page = await googleBrowser(hostname);
    page.api.initializeGa('G-TEST000000');
    await page.api.setBrowserTools(false, true);
    page.api.gaEvent('purchase');
    expect(page.scripts).toEqual([]);
    expect(page.commands()).toEqual([]);
  },
);
