import 'server-only';
import { adminDecision } from '@easyrender/core/admin-analytics/helpers';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export async function requireAdmin() {
  const h = await headers();
  const session = await auth().api.getSession({ headers: h });
  // Email/password sign-up does not verify addresses, so anyone could register an allowlisted
  // address that has no account yet. Only verified emails (Google sign-in) get in.
  const decision = adminDecision(session?.user ?? null, process.env.ADMIN_EMAILS ?? '', true);
  if (decision === 'signin') {
    const path = h.get('x-admin-return') ?? '/admin/analytics';
    redirect(
      `/sign-in?next=${encodeURIComponent(path.startsWith('/admin/') ? path : '/admin/analytics')}`,
    );
  }
  if (decision !== 'allow') notFound();
  return session?.user;
}
