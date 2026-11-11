import * as Sentry from '@sentry/nextjs';

// Without NEXT_PUBLIC_SENTRY_DSN the SDK stays off, so local dev and previews send nothing.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
