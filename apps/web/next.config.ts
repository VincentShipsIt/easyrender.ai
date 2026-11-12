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
  experimental: {
    // The stylesheets are small (about 19 kB compressed) and most visits to the marketing pages
    // are first visits: shipping them inside the HTML saves the render-blocking round trip.
    inlineCss: true,
  },
  // Models, photos and the interior clip are static but not fingerprinted: let browsers keep them
  // for a day and refresh in the background, instead of revalidating each one on every visit.
  async headers() {
    const value = 'public, max-age=86400, stale-while-revalidate=604800';
    return ['/studio/:path*', '/showcase/:path*'].map((source) => ({
      source,
      headers: [{ key: 'Cache-Control', value }],
    }));
  },
};

export default withNextIntl(nextConfig);
