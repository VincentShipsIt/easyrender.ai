import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
    await import('./lib/analytics/server');
    await import('./lib/analytics/posthog-logs');
  }
  if (process.env.NEXT_RUNTIME === 'edge') await import('./sentry.edge.config');
}

// Server Components, route handlers and the proxy report their uncaught errors here.
export const onRequestError = Sentry.captureRequestError;
