import { type NextRequest, NextResponse } from 'next/server';
import { isRoutableLocale, LOCALE_HEADER, PATH_HEADER } from './i18n/config';
import { LEGACY_HOSTS, SITE_HOST } from './lib/seo/site';

const ANON_COOKIE = 'er_anon';

// Only production has a canonical host. Preview deployments keep answering on their own
// *.vercel.app URL, which is what makes a Vercel preview reviewable at all.
const CANONICAL_HOST_ENFORCED = process.env.VERCEL_ENV === 'production';

/**
 * Sends www, easyrenderai.vercel.app and any other alias of the production deployment to
 * https://easyrender.ai, keeping the path and the query. Only GET and HEAD: a 301 would turn a
 * webhook POST into a GET and lose its body, and /api is excluded for the same reason.
 */
function canonicalHostRedirect(request: NextRequest): NextResponse | null {
  if (!CANONICAL_HOST_ENFORCED) return null;
  if (request.method !== 'GET' && request.method !== 'HEAD') return null;
  if (request.nextUrl.pathname.startsWith('/api/')) return null;

  const host = request.headers.get('host')?.split(':')[0]?.toLowerCase();
  if (!host || host === SITE_HOST) return null;

  const target = new URL(request.nextUrl.toString());
  target.protocol = 'https:';
  target.host = SITE_HOST;
  target.port = '';
  // A retired landing goes to the page that replaced it, not to the same path on the new host.
  const replacement = LEGACY_HOSTS[host];
  if (replacement && request.nextUrl.pathname === '/') target.pathname = replacement;

  return NextResponse.redirect(target, 301);
}

/** The locale the URL asks for: /es/... is Spanish, everything else is the English root. */
function localeOf(pathname: string): string {
  const first = pathname.split('/')[1];
  return isRoutableLocale(first) ? first : 'en';
}

// Canonical host first, then an anonymous id for every visitor so a free preview can be tied to
// them before sign up, then the locale of the URL for the layout and next-intl to read.
export function proxy(request: NextRequest) {
  const redirect = canonicalHostRedirect(request);
  if (redirect) return redirect;

  const headers = new Headers(request.headers);
  headers.set(LOCALE_HEADER, localeOf(request.nextUrl.pathname));
  headers.set(PATH_HEADER, request.nextUrl.pathname);

  const anon = request.cookies.get(ANON_COOKIE)?.value;
  if (anon) return NextResponse.next({ request: { headers } });

  const id = crypto.randomUUID();
  const cookie = request.headers.get('cookie');
  headers.set('cookie', `${cookie ? `${cookie}; ` : ''}${ANON_COOKIE}=${id}`);

  const response = NextResponse.next({ request: { headers } });
  response.cookies.set(ANON_COOKIE, id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: request.nextUrl.protocol === 'https:',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}

export const config = {
  // robots.txt, the sitemaps and llms.txt are served by route handlers that need neither the
  // anonymous cookie nor a locale, so they stay out of the proxy entirely.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots\\.txt|sitemap.*\\.xml|llms\\.txt|api/webhooks|api/mcp|api/oauth|\\.well-known).*)',
  ],
};
