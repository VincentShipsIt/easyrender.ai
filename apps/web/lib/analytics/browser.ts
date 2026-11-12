'use client';
import {
  type Attribution,
  analyticsUrl,
  normalizeAttribution,
  sanitizeProperties,
  UTM_KEYS,
} from '@easyrender/core/attribution';
import { PRICING_FLAG, type PricingVariant } from '@easyrender/harness/pricing';
import type { PostHog } from 'posthog-js';

declare global {
  interface Window {
    __erGoogleTagLoaded?: boolean;
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}
let firstTouch: Attribution | null = null;
let landingUrl = '';
let testCountry: string | null = null;
let hasLanding = false;
let posthog: PostHog | null = null;
let isPosthogAllowed = false;
let isGaAllowed = false;
let gaId = '';
let hasGaConfigured = false;
let lastGaPage = '';
const conversions = new Set<string>();
export function attribution() {
  if (!firstTouch && typeof window !== 'undefined') {
    const url = new URL(window.location.href);
    testCountry = url.searchParams.get('__geo');
    landingUrl = analyticsUrl(window.location.href);
    firstTouch = normalizeAttribution(
      {
        ...Object.fromEntries(UTM_KEYS.map((key) => [key, url.searchParams.get(key)])),
        referrer: document.referrer,
        landing_path: url.pathname,
      },
      url.origin,
    );
  }
  return firstTouch;
}
export function attributionHeaders(): Record<string, string> {
  attribution();
  return testCountry !== null ? { 'x-test-country': testCountry } : {};
}
export function beforeSend<T extends { properties: Record<string, unknown> }>(event: T): T {
  const properties = sanitizeProperties({
    pricing_subject: browserPricingSubject(),
    pricing_variant: browserPricingVariant(),
    [`$feature/${PRICING_FLAG}`]: browserPricingVariant(),
    ...event.properties,
  });
  // PostHog requires its PUBLIC project write key in this SDK field. It is not a URL/auth token.
  if (event.properties.token === process.env.NEXT_PUBLIC_POSTHOG_KEY)
    properties.token = event.properties.token;
  return { ...event, properties };
}
export function initializeGa(id: string) {
  // The beforeInteractive bootstrap owns consent defaults, the queue and the only loader.
  // Keep its exact production hostname guard; previews and localhost never start Google tags.
  if (
    !id ||
    window.location.hostname !== 'easyrender.ai' ||
    !window.__erGoogleTagLoaded ||
    !window.gtag
  )
    return;
  gaId = id;
}
function googleUrl(value: string) {
  try {
    const url = new URL(value);
    return url.origin + url.pathname;
  } catch {
    return '';
  }
}
export function gaPageview() {
  if (!isGaAllowed || !gaId || !window.gtag) return;
  const url = googleUrl(window.location.href);
  if (lastGaPage === url) return;
  lastGaPage = url;
  if (!hasGaConfigured) {
    hasGaConfigured = true;
    window.gtag('config', gaId, {
      send_page_view: false,
      page_location: url,
      page_referrer: googleUrl(document.referrer),
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });
  }
  window.gtag('event', 'page_view', {
    send_to: gaId,
    page_location: url,
    page_referrer: googleUrl(document.referrer),
  });
}
export function gaEvent(
  event: 'sign_up' | 'preview_ready' | 'render_ready' | 'purchase' | 'begin_checkout',
  properties: Record<string, unknown> = {},
  identity?: string,
) {
  if (!isGaAllowed || !gaId || !window.gtag) return;
  const key = identity ? `${event}:${identity}` : null;
  if (key && conversions.has(key)) return;
  if (key) conversions.add(key);
  window.gtag('event', event, {
    pricing_variant: browserPricingVariant(),
    ...properties,
    send_to: gaId,
    page_location: googleUrl(window.location.href),
    page_referrer: googleUrl(document.referrer),
  });
}
export function observeRender(render: { id: string; status: string; hasSheet: boolean }) {
  if (render.hasSheet && ['preview_ready', 'rendering', 'ready'].includes(render.status))
    gaEvent('preview_ready', {}, render.id);
  if (render.status === 'ready') gaEvent('render_ready', {}, render.id);
}
export async function setBrowserTools(
  allowPosthog: boolean,
  allowGa: boolean,
  hasWithdrawal = false,
) {
  isPosthogAllowed = allowPosthog;
  isGaAllowed = allowGa && Boolean(gaId);
  if (window.__erGoogleTagLoaded && window.location.hostname === 'easyrender.ai') {
    // Set the GA kill switch before updating consent; advertising always stays denied.
    if (gaId) Object.assign(window, { [`ga-disable-${gaId}`]: !isGaAllowed });
    window.gtag?.('consent', 'update', {
      analytics_storage: isGaAllowed ? 'granted' : 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
  }
  if (!allowGa && gaId) {
    lastGaPage = '';
    for (const cookie of hasWithdrawal ? document.cookie.split(';') : []) {
      const name = cookie.trim().split('=')[0];
      if (!/^_ga(?:_|$)/.test(name)) continue;
      const domains = ['', window.location.hostname, `.${window.location.hostname}`];
      const labels = window.location.hostname.split('.');
      for (let i = 1; i < labels.length - 1; i++) domains.push(`.${labels.slice(i).join('.')}`);
      for (const domain of domains)
        document.cookie = `${name}=; Max-Age=0; Path=/${domain ? `; Domain=${domain}` : ''}`;
    }
  }
  if (allowGa && gaId) {
    gaPageview();
    if (new URLSearchParams(location.search).get('__signup') === 'google')
      gaEvent('sign_up', { method: 'google' }, 'oauth-return');
  }
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!allowPosthog || !key) return;
  if (!posthog) {
    const { default: sdk } = await import('posthog-js');
    // Concurrent consent effects can await the same module import. Initialize only once.
    if (!isPosthogAllowed || posthog) return;
    posthog = sdk;
    sdk.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com',
      cookieless_mode: 'always',
      persistence: 'memory',
      autocapture: false,
      disable_session_recording: true,
      capture_pageview: 'history_change',
      capture_pageleave: false,
      // Only explicit page/landing events: avoid retaining a batch after consent is withdrawn.
      request_batching: false,
      person_profiles: 'never',
      advanced_disable_feature_flags: true,
      disable_surveys: true,
      enable_heatmaps: false,
      capture_exceptions: false,
      before_send: (event) => (event && isPosthogAllowed ? beforeSend(event) : null),
    });
  }
  void capturePricingView();
  if (!hasLanding) {
    hasLanding = true;
    const a = attribution();
    const url = new URL(landingUrl);
    let referrerHost = '';
    try {
      referrerHost = new URL(document.referrer).hostname;
    } catch {
      /* direct visit */
    }
    if (referrerHost !== url.hostname || UTM_KEYS.some((key) => url.searchParams.has(key))) {
      const path = url.pathname.replace(/^\/(es|de|fr|it|pt)(?=\/|$)/, '') || '/';
      const landingType =
        path === '/'
          ? 'home'
          : path.startsWith('/r/')
            ? 'model_page'
            : path === '/explore'
              ? 'explore'
              : path === '/credits'
                ? 'credits'
                : path.includes('services')
                  ? 'services'
                  : 'other';
      posthog.capture('landing_view', {
        landing_type: landingType,
        ...Object.fromEntries(UTM_KEYS.map((key) => [key, a?.[key] ?? null])),
        referrer_host: referrerHost,
      });
    }
  }
}

export function browserPricingVariant(): PricingVariant {
  if (typeof document === 'undefined') return 'control';
  const value =
    document
      .querySelector?.('[data-pricing-variant]:not(html)')
      ?.getAttribute('data-pricing-variant') ?? document.documentElement?.dataset.pricingVariant;
  return value === 'test' ? 'test' : 'control';
}
export function captureBrowser(event: string, properties: Record<string, unknown> = {}) {
  if (!isPosthogAllowed || !posthog) return;
  posthog.capture(event, {
    pricing_subject: browserPricingSubject(),
    pricing_variant: browserPricingVariant(),
    [`$feature/${PRICING_FLAG}`]: browserPricingVariant(),
    ...properties,
  });
}
let visiblePricing: PricingVariant | null = null;
const pricingViews = new Set<string>();
export function observePricing(variant: PricingVariant) {
  visiblePricing = variant;
  void capturePricingView();
}
export function stopObservingPricing() {
  visiblePricing = null;
}
const pendingPricingViews = new Set<string>();
async function capturePricingView() {
  if (!isPosthogAllowed || !posthog || !visiblePricing) return;
  const variant = visiblePricing;
  const key = `${location.pathname}:${variant}`;
  if (pricingViews.has(key) || pendingPricingViews.has(key)) return;
  pendingPricingViews.add(key);
  try {
    // Recheck at emission, including consent granted on a page opened before the cap.
    // No client flag evaluation and no analytics call for declined consent.
    const response = await fetch('/api/pricing', {
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    });
    const current = response.ok ? await response.json() : null;
    if (
      !current?.isExperimentActive ||
      current.variant !== variant ||
      !isPosthogAllowed ||
      visiblePricing !== variant ||
      key !== `${location.pathname}:${visiblePricing}`
    )
      return;
    pricingViews.add(key);
    captureBrowser('pricing_viewed', {
      pricing_variant: variant,
      [`$feature/${PRICING_FLAG}`]: variant,
    });
  } catch {
    // A failed live cutoff check must never measure another exposure.
  } finally {
    pendingPricingViews.delete(key);
  }
}

function browserPricingSubject(): string | null {
  if (typeof document === 'undefined') return null;
  return (
    document
      .querySelector?.('[data-pricing-subject]:not(html)')
      ?.getAttribute('data-pricing-subject') ??
    document.documentElement?.dataset.pricingSubject ??
    null
  );
}
