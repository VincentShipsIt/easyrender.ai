import { db } from '@easyrender/db';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { enqueueGooglePurchase, flushGooglePurchases, linkGoogleCheckout } from './google-outbox';
import { claimSignupReceipt } from './signup-receipt';

const url = process.env.TEST_DATABASE_URL;
if (url) {
  if (!['localhost', '127.0.0.1'].includes(new URL(url).hostname))
    throw new Error('Scratch local database only');
  process.env.DATABASE_URL = url;
}
const transport = vi.hoisted(() => ({ send: vi.fn().mockResolvedValue('delivered') }));
vi.mock('./google-measurement', () => ({
  isGoogleMeasurementConfigured: () => true,
  sendGooglePurchase: transport.send,
}));
describe.skipIf(!url)('durable Google delivery with real Postgres', () => {
  const userId = `ga-qa-${crypto.randomUUID()}`;
  beforeAll(async () => {
    await db().user.create({
      data: { id: userId, name: 'Local QA', email: `${userId}@example.invalid` },
    });
  });
  afterAll(async () => {
    await db().user.delete({ where: { id: userId } });
    await db().$disconnect();
  });
  async function checkout(id: string) {
    return db().googleCheckout.create({
      data: {
        id,
        userId,
        clientId: '123.456',
        sessionId: '123',
        expiresAt: new Date(Date.now() + 86400000),
      },
    });
  }
  async function purchase(id: string) {
    return db().purchase.create({
      data: {
        userId,
        stripeSessionId: id,
        packId: 'payg',
        credits: 500,
        amountCents: 500,
        currency: 'usd',
        status: 'paid',
      },
    });
  }
  it('converges across both subscription webhook orders and ignores automatic renewals', async () => {
    const first = `${userId}-checkout-first`,
      second = `${userId}-invoice-first`;
    await checkout(first);
    await linkGoogleCheckout(first, `${first}-invoice`);
    const p1 = await purchase(`${first}-invoice`);
    await enqueueGooglePurchase(p1.id);
    await checkout(second);
    const p2 = await purchase(`${second}-invoice`);
    await enqueueGooglePurchase(p2.id);
    expect(
      await db().googlePurchaseDelivery.findUnique({ where: { purchaseId: p2.id } }),
    ).toBeNull();
    await linkGoogleCheckout(second, `${second}-invoice`);
    await enqueueGooglePurchase(p1.id);
    await enqueueGooglePurchase(p2.id);
    const renewal = await purchase(`${first}-renewal`);
    await enqueueGooglePurchase(renewal.id);
    expect(await db().googlePurchaseDelivery.count({ where: { purchase: { userId } } })).toBe(2);
    await Promise.all([flushGooglePurchases(), flushGooglePurchases()]);
    expect(transport.send).toHaveBeenCalledTimes(2);
    expect(
      await db().googlePurchaseDelivery.count({
        where: { purchase: { userId }, deliveredAt: { not: null } },
      }),
    ).toBe(2);
  });
  it('retries a failed delivery with the same transaction and respects later revocation', async () => {
    transport.send.mockClear();
    transport.send.mockResolvedValue('retry');
    const id = `${userId}-retry`;
    await checkout(id);
    const p = await purchase(id);
    await enqueueGooglePurchase(p.id);
    await flushGooglePurchases();
    const failed = await db().googlePurchaseDelivery.findUniqueOrThrow({
      where: { purchaseId: p.id },
    });
    expect(failed).toMatchObject({
      attempts: 1,
      lastError: 'transport',
      deliveredAt: null,
      leaseUntil: null,
    });
    await db().googlePurchaseDelivery.update({
      where: { purchaseId: p.id },
      data: { nextAttemptAt: new Date(0) },
    });
    transport.send.mockResolvedValue('delivered');
    await flushGooglePurchases();
    expect(transport.send.mock.calls.map((c) => c[0].id)).toEqual([p.id, p.id]);
    const revoked = `${userId}-revoked`;
    await checkout(revoked);
    const p2 = await purchase(revoked);
    await enqueueGooglePurchase(p2.id);
    await db().googleCheckout.update({ where: { id: revoked }, data: { revokedAt: new Date() } });
    await flushGooglePurchases();
    expect(transport.send).toHaveBeenCalledTimes(2);
    expect(
      await db().googlePurchaseDelivery.findUnique({ where: { purchaseId: p2.id } }),
    ).toMatchObject({ lastError: 'revoked', deliveredAt: null });
  });
  it('consumes a real signup receipt only once under concurrent requests', async () => {
    const id = `analytics-signup:${userId}`;
    await db().verification.create({
      data: { id, identifier: id, value: 'google', expiresAt: new Date(Date.now() + 60000) },
    });
    const results = await Promise.all([claimSignupReceipt(userId), claimSignupReceipt(userId)]);
    expect(results.filter(Boolean)).toEqual([{ method: 'google' }]);
  });
});
