// Local-only fixture: confirmed payment through the actual signed webhook function, no Stripe API.
import { createHmac } from 'node:crypto';
import { handleStripeWebhook, setAnalyticsScheduler } from '@easyrender/core';
import { db } from '@easyrender/db';

const url = process.env.DATABASE_URL;
if (!url || !['127.0.0.1', 'localhost'].includes(new URL(url).hostname) || process.env.VERCEL)
  throw new Error('Local database required');
const userId = process.argv[2];
if (!userId) throw new Error('Pass the local test user ID');
const pending: (() => Promise<void>)[] = [];
setAnalyticsScheduler((work) => pending.push(work));
process.env.STRIPE_SECRET_KEY = 'sk_test_local';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_local';
const sessionId = `cs_local_${crypto.randomUUID()}`;
const purchase = await db().purchase.create({
  data: { userId, stripeSessionId: sessionId, packId: 'payg', credits: 500, amountCents: 500 },
});
const body = JSON.stringify({
  id: `evt_${sessionId}`,
  type: 'checkout.session.completed',
  data: {
    object: {
      id: sessionId,
      mode: 'payment',
      payment_status: 'paid',
      currency: 'usd',
      client_reference_id: userId,
    },
  },
});
const time = Math.floor(Date.now() / 1000);
const signature = `t=${time},v1=${createHmac('sha256', 'whsec_local').update(`${time}.${body}`).digest('hex')}`;
await handleStripeWebhook(body, signature);
while (pending.length) await pending.shift()?.();
await db().$disconnect();
process.stdout.write(JSON.stringify({ sessionId, orderId: purchase.id }));
