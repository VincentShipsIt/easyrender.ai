import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

const session = vi.hoisted(() => ({
  user: null as { email: string; emailVerified?: boolean } | null,
}));
vi.mock('../auth', () => ({
  auth: () => ({ api: { getSession: async () => (session.user ? { user: session.user } : null) } }),
}));

import { proxy } from '@/proxy';

afterEach(() => {
  session.user = null;
  vi.unstubAllEnvs();
});
describe('admin HTTP access before streaming', () => {
  it('returns an actual 404 to signed-in non-admins', async () => {
    vi.stubEnv('ADMIN_EMAILS', 'admin@example.test');
    session.user = { email: 'reader@example.test' };
    const response = await proxy(new NextRequest('http://localhost:3207/admin/analytics'));
    expect(response.status).toBe(404);
    expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });
  it('redirects anonymous requests with the requested range', async () => {
    const response = await proxy(
      new NextRequest('http://localhost:3207/admin/analytics?period=90d'),
    );
    expect(response.status).toBe(307);
    expect(new URL(response.headers.get('location') as string).searchParams.get('next')).toBe(
      '/admin/analytics?period=90d',
    );
  });
  it('allows only normalized allowlisted accounts without localization', async () => {
    vi.stubEnv('ADMIN_EMAILS', ' ADMIN@example.test ');
    session.user = { email: 'admin@example.test', emailVerified: true };
    const response = await proxy(new NextRequest('http://localhost:3207/admin/analytics/revenue'));
    expect(response.status).toBe(200);
    expect(response.headers.has('x-middleware-rewrite')).toBe(false);
    expect(response.headers.get('x-middleware-request-x-admin-return')).toBe(
      '/admin/analytics/revenue',
    );
  });
  it('returns 404 to an allowlisted address that is not verified', async () => {
    vi.stubEnv('ADMIN_EMAILS', 'admin@example.test');
    session.user = { email: 'admin@example.test', emailVerified: false };
    const response = await proxy(new NextRequest('http://localhost:3207/admin/analytics'));
    expect(response.status).toBe(404);
  });
});
