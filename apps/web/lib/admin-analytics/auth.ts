import 'server-only';
import { adminDecision } from '@easyrender/core/admin-analytics/helpers';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export async function requireAdmin() {
  const h = await headers();
  const session = await auth().api.getSession({ headers: h });
  // Better Auth currently enables passwords without requireEmailVerification.
  const decision = adminDecision(session?.user ?? null, process.env.ADMIN_EMAILS ?? '', false);
  if (decision === 'signin') {
    const path = h.get('x-admin-return') ?? '/admin/analytics';
    redirect(
      `/sign-in?next=${encodeURIComponent(path.startsWith('/admin/') ? path : '/admin/analytics')}`,
    );
  }
  if (decision !== 'allow') notFound();
  return session?.user;
}
