import { authorizationServerMetadata } from '@easyrender/core';
import { json, preflight } from '@/lib/oauth-http';

// RFC 8414.
export const GET = () =>
  json(authorizationServerMetadata(), { headers: { 'cache-control': 'public, max-age=300' } });
export const OPTIONS = preflight;
