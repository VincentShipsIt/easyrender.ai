import { withSentryConfig } from '@sentry/nextjs/config';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  transpilePackages: [
    '@easyrender/core',
    '@easyrender/db',
    '@easyrender/harness',
    '@easyrender/mcp',
  ],
  serverExternalPackages: ['sharp', 'pg'],
};

// Source maps upload only when SENTRY_AUTH_TOKEN is set (Vercel build); otherwise this is a no-op.
export default withSentryConfig(withNextIntl(nextConfig), {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
});
