import { db } from '@easyrender/db';

/** A short-lived, owner-scoped receipt created only by the actual signup hook. */
export async function claimSignupReceipt(userId: string) {
  const id = `analytics-signup:${userId}`;
  const receipt = await db().verification.findUnique({ where: { id } });
  if (!receipt) return null;
  const { count } = await db().verification.deleteMany({ where: { id } });
  if (!count || receipt.expiresAt <= new Date() || !['google', 'email'].includes(receipt.value))
    return null;
  return { method: receipt.value };
}
