import { type NextRequest, NextResponse } from 'next/server';

const ANON_COOKIE = 'er_anon';

// Gives every visitor an anonymous id so a free preview can be tied to them before sign up.
export function proxy(request: NextRequest) {
  if (request.cookies.has(ANON_COOKIE)) return NextResponse.next();

  const id = crypto.randomUUID();
  const headers = new Headers(request.headers);
  const cookie = headers.get('cookie');
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
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/webhooks|api/mcp).*)'],
};
