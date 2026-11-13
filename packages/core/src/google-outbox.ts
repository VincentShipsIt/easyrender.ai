import { db } from '@easyrender/db';
import { isGoogleMeasurementConfigured, sendGooglePurchase } from './google-measurement';

/** Called on every signed webhook replay: a missed enqueue can be repaired without another grant. */
export async function enqueueGooglePurchase(purchaseId: string) {
  if (!isGoogleMeasurementConfigured()) return;
  const purchase = await db().purchase.findUnique({ where: { id: purchaseId } });
  if (purchase?.status !== 'paid') return;
  const checkout = await db().googleCheckout.findFirst({
    where: {
      userId: purchase.userId,
      OR: [{ id: purchase.stripeSessionId }, { invoiceId: purchase.stripeSessionId }],
    },
  });
  if (!checkout || checkout.revokedAt || checkout.expiresAt < purchase.updatedAt) return;
  await db().googlePurchaseDelivery.upsert({
    where: { purchaseId },
    update: { purchaseId },
    create: { purchaseId, checkoutId: checkout.id },
  });
}

/** Both invoice-first and checkout-first webhook ordering converge on the same purchase ID. */
export async function linkGoogleCheckout(checkoutId: string, invoiceId: string | null) {
  if (!isGoogleMeasurementConfigured()) return;
  if (invoiceId)
    await db().googleCheckout.updateMany({ where: { id: checkoutId }, data: { invoiceId } });
  const purchase = await db().purchase.findUnique({
    where: { stripeSessionId: invoiceId ?? checkoutId },
  });
  if (purchase?.status === 'paid') await enqueueGooglePurchase(purchase.id);
}

export async function flushGooglePurchases() {
  if (!isGoogleMeasurementConfigured()) return;
  const now = new Date();
  const pending = await db().googlePurchaseDelivery.findMany({
    where: {
      deliveredAt: null,
      nextAttemptAt: { lte: now },
      AND: [
        { OR: [{ leaseUntil: null }, { leaseUntil: { lte: now } }] },
        { OR: [{ lastError: null }, { lastError: 'transport' }] },
      ],
    },
    include: { purchase: true, checkout: true },
    orderBy: { nextAttemptAt: 'asc' },
    take: 10,
  });
  await Promise.all(
    pending.map(async (entry) => {
      const { count } = await db().googlePurchaseDelivery.updateMany({
        where: {
          purchaseId: entry.purchaseId,
          deliveredAt: null,
          OR: [{ leaseUntil: null }, { leaseUntil: { lte: now } }],
        },
        data: { leaseUntil: new Date(now.getTime() + 60000), attempts: { increment: 1 } },
      });
      if (!count) return;
      const isExpired = now.getTime() - entry.purchase.updatedAt.getTime() > 72 * 60 * 60 * 1000;
      const isRevoked = Boolean(entry.checkout.revokedAt);
      const result =
        isRevoked || isExpired ? null : await sendGooglePurchase(entry.purchase, entry.checkout);
      await db().googlePurchaseDelivery.update({
        where: { purchaseId: entry.purchaseId },
        data: {
          leaseUntil: null,
          deliveredAt: result === 'delivered' ? new Date() : null,
          lastError: isRevoked
            ? 'revoked'
            : isExpired
              ? 'expired'
              : result === 'delivered'
                ? null
                : 'transport',
          nextAttemptAt: new Date(
            Date.now() + Math.min(6 * 60 * 60, 60 * 2 ** Math.min(entry.attempts, 8)) * 1000,
          ),
        },
      });
    }),
  );
  return { examined: pending.length };
}
