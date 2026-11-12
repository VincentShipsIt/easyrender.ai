import { arePrivacyOverridesAllowed, privacyRegion } from '@/lib/analytics/privacy-region';
export const dynamic = 'force-dynamic';
export function GET(request: Request) {
  const headers = { 'Cache-Control': 'private, no-store' };
  if (
    arePrivacyOverridesAllowed() &&
    new URL(request.url).searchParams.get('__privacy_fail') === '1'
  )
    return Response.json({ error: 'test failure' }, { status: 503, headers });
  return Response.json(privacyRegion(request.headers, request.url), { headers });
}
