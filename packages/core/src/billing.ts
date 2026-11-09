import { db } from '@easyrender/db';
import { findPack } from '@easyrender/harness';
import Stripe from 'stripe';
import { config } from './config';
import { grantCredits } from './credits';
import { AppError } from './errors';

let stripeClient: Stripe | null = null;
const stripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  stripeClient ??= new Stripe(key);
  return stripeClient;
};

// Without Stripe keys outside production, checkout is simulated so the flow can be tested end to end.
export const devCheckoutEnabled = () => !process.env.STRIPE_SECRET_KEY && !config.isProduction();

export async function createCheckout(userId: string, packId: string): Promise<string> {
  const pack = findPack(packId);
  if (!pack) throw new AppError('Unknown credit pack', 400, 'bad_pack');
  const client = stripe();
  if (!client) {
    if (devCheckoutEnabled()) return `${config.appUrl()}/api/dev/checkout?pack=${pack.id}`;
    throw new AppError('Payments are not configured', 503, 'no_stripe');
  }

  const session = await client.checkout.sessions.create({
    mode: 'payment',
    client_reference_id: userId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: pack.priceCents,
          product_data: { name: `${pack.label}: ${pack.credits.toLocaleString('en-US')} credits` },
        },
      },
    ],
    metadata: { userId, packId: pack.id },
    success_url: `${config.appUrl()}/credits?status=success`,
    cancel_url: `${config.appUrl()}/credits?status=canceled`,
  });
  await db().purchase.create({
    data: {
      userId,
      stripeSessionId: session.id,
      packId: pack.id,
      credits: pack.credits,
      amountCents: pack.priceCents,
    },
  });
  if (!session.url) throw new AppError('Stripe did not return a checkout URL', 502, 'upstream');
  return session.url;
}

export async function devGrant(userId: string, packId: string) {
  const pack = findPack(packId);
  if (!pack || !devCheckoutEnabled()) throw new AppError('Not available', 404, 'not_found');
  await grantCredits({
    userId,
    amount: pack.credits,
    key: `dev:${userId}:${Date.now()}`,
    reason: 'dev_purchase',
  });
}

// Verifies the signature, then grants the pack's credits once per checkout session.
export async function handleStripeWebhook(rawBody: string, signature: string | null) {
  const client = stripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!client || !secret || !signature)
    throw new AppError('Webhook not configured', 400, 'no_stripe');
  const event = client.webhooks.constructEvent(rawBody, signature, secret);
  if (event.type !== 'checkout.session.completed') return;

  const session = event.data.object;
  if (session.payment_status !== 'paid') return;
  const purchase = await db().purchase.findUnique({ where: { stripeSessionId: session.id } });
  if (!purchase) throw new Error(`unknown checkout session ${session.id}`);
  await grantCredits({
    userId: purchase.userId,
    amount: purchase.credits,
    key: `stripe:${session.id}`,
    reason: 'purchase',
    purchaseId: purchase.id,
  });
  await db().purchase.update({ where: { id: purchase.id }, data: { status: 'paid' } });
}
