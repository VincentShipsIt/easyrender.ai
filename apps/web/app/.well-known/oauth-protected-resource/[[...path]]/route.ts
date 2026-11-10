import { protectedResourceMetadata } from '@easyrender/core';
import { json, preflight } from '@/lib/oauth-http';

// RFC 9728. Also answers the path-suffixed form (/.well-known/oauth-protected-resource/api/mcp).
export const GET = () =>
  json(protectedResourceMetadata(), { headers: { 'cache-control': 'public, max-age=300' } });
export const OPTIONS = preflight;
