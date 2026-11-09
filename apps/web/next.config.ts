import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@easyrender/core',
    '@easyrender/db',
    '@easyrender/harness',
    '@easyrender/mcp',
  ],
  serverExternalPackages: ['sharp', 'pg'],
};

export default nextConfig;
