import * as Sentry from '@sentry/nextjs';
import posthog from 'posthog-js';
import { beforeSend } from '@/lib/analytics/browser';

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

if (posthogKey && posthogHost) {
  posthog.init(posthogKey, {
    api_host: posthogHost,
    defaults: '2026-08-30',
    cookieless_mode: 'always',
    persistence: 'memory',
    autocapture: false,
    disable_session_recording: true,
    capture_pageview: 'history_change',
    capture_pageleave: false,
    request_batching: false,
    person_profiles: 'identified_only',
    advanced_disable_feature_flags: true,
    disable_surveys: true,
    enable_heatmaps: false,
    capture_exceptions: true,
    before_send: (event) => (event ? beforeSend(event) : null),
    debug: process.env.NODE_ENV === 'development',
  });
  posthog.opt_out_capturing();
} else if (process.env.NODE_ENV === 'development') {
  const missingVariable = posthogKey ? 'NEXT_PUBLIC_POSTHOG_HOST' : 'NEXT_PUBLIC_POSTHOG_KEY';
  throw new Error(
    `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`,
  );
}

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
