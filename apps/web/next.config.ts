import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { NOINDEX_HEADER_PATHS } from './lib/seo/noindex';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  transpilePackages: [
    '@easyrender/core',
    '@easyrender/db',
    '@easyrender/harness',
    '@easyrender/mcp',
  ],
  serverExternalPackages: ['sharp', 'pg'],
  // Guides are content files read at request time, so they have to travel with the deployment.
  outputFileTracingIncludes: { '/**': ['./content/**/*'] },
  // noindex as a response header as well as a meta tag: the header covers a route before anyone
  // adds a generateMetadata to it, which matters most for the ad landings.
  async headers() {
    return NOINDEX_HEADER_PATHS.map((source) => ({
      source,
      headers: [{ key: 'x-robots-tag', value: 'noindex, follow' }],
    }));
  },
};

export default withNextIntl(nextConfig);
