import 'server-only';
import { createHash } from 'node:crypto';
import { type Actor, bearerToken, verifyApiKey } from '@easyrender/core';
import { headers as nextHeaders } from 'next/headers';
import { auth } from './auth';

export const ANON_COOKIE = 'er_anon';

function readCookie(headers: Headers, name: string): string | null {
  const match = headers.get('cookie')?.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function ipHash(headers: Headers): string | null {
  const ip = headers.get('x-forwarded-for')?.split(',')[0]?.trim() || headers.get('x-real-ip');
  if (!ip) return null;
  return createHash('sha256')
    .update(`${ip}:${process.env.BETTER_AUTH_SECRET ?? ''}`)
    .digest('hex')
    .slice(0, 32);
}

// A request is made by an API key holder, a signed-in user, an anonymous visitor, or a mix.
export async function resolveActor(headers?: Headers): Promise<Actor> {
  const h = headers ?? (await nextHeaders());
  const base = { anonId: readCookie(h, ANON_COOKIE), ipHash: ipHash(h) };
  const token = bearerToken(h);
  if (token) return { ...base, userId: await verifyApiKey(token) };
  const session = await auth().api.getSession({ headers: h });
  return { ...base, userId: session?.user.id ?? null };
}

export async function currentUser() {
  const session = await auth().api.getSession({ headers: await nextHeaders() });
  return session?.user ?? null;
}
