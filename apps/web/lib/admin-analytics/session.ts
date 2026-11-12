import { getSessionCookie } from 'better-auth/cookies';

/** Shared by the proxy and server guards. Auth outages must never expose admin data. */
export async function adminSession(headers: Headers) {
  // No auth client or database is needed to reject an anonymous request.
  if (!getSessionCookie(headers)) return null;
  try {
    const { auth } = await import('@/lib/auth');
    return await auth().api.getSession({ headers });
  } catch {
    return null;
  }
}
