import { db } from '@easyrender/db';
import { isValidPaygCredits, PAYG, PRO_PLAN, paygPriceCents } from '@easyrender/harness';
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

export type CheckoutRequest = { plan: 'payg'; credits: number } | { plan: 'pro' };

export function parseCheckout(body: { plan?: unknown; credits?: unknown }): CheckoutRequest {
  if (body.plan === 'pro') return { plan: 'pro' };
  if (body.plan === 'payg') {
    const credits = Number(body.credits);
    if (!isValidPaygCredits(credits)) {
      throw new AppError(
        `Buy between ${PAYG.min.toLocaleString('en-US')} and ${PAYG.max.toLocaleString('en-US')} credits`,
        400,
        'bad_amount',
      );
    }
    return { plan: 'payg', credits };
  }
  throw new AppError('Unknown plan', 400, 'bad_plan');
}

const priceId = (name: 'STRIPE_PRICE_PAYG' | 'STRIPE_PRICE_PRO') => {
  const id = process.env[name];
  if (!id) throw new AppError('Payments are not configured', 503, 'no_stripe');
  return id;
};

const devCheckoutUrl = (request: CheckoutRequest) =>
  request.plan === 'pro'
    ? `${config.appUrl()}/api/dev/checkout?plan=pro`
    : `${config.appUrl()}/api/dev/checkout?plan=payg&credits=${request.credits}`;

export async function createCheckout(userId: string, request: CheckoutRequest): Promise<string> {
  const client = stripe();
  if (!client) {
    if (devCheckoutEnabled()) return devCheckoutUrl(request);
    throw new AppError('Payments are not configured', 503, 'no_stripe');
  }
  const user = await db().user.findUnique({
    where: { id: userId },
    select: { email: true, stripeCustomerId: true, subscriptionStatus: true },
  });
  if (!user) throw new AppError('Sign in to buy credits', 401, 'unauthorized');
  const customer = user.stripeCustomerId
    ? { customer: user.stripeCustomerId }
    : { customer_email: user.email };
  const urls = {
    success_url: `${config.appUrl()}/credits?status=success`,
    cancel_url: `${config.appUrl()}/credits?status=canceled`,
  };

  if (request.plan === 'pro') {
    if (isActiveSubscription(user.subscriptionStatus)) {
      throw new AppError('You are already on Pro', 409, 'already_subscribed');
    }
    const session = await client.checkout.sessions.create({
      mode: 'subscription',
      client_reference_id: userId,
      ...customer,
      line_items: [{ price: priceId('STRIPE_PRICE_PRO'), quantity: 1 }],
      metadata: { userId, plan: 'pro' },
      subscription_data: { metadata: { userId, plan: 'pro' } },
      ...urls,
    });
    if (!session.url) throw new AppError('Stripe did not return a checkout URL', 502, 'upstream');
    return session.url;
  }

  const session = await client.checkout.sessions.create({
    mode: 'payment',
    client_reference_id: userId,
    ...customer,
    ...(user.stripeCustomerId ? {} : { customer_creation: 'always' as const }),
    line_items: [{ price: priceId('STRIPE_PRICE_PAYG'), quantity: request.credits }],
    metadata: { userId, plan: 'payg' },
    ...urls,
  });
  await db().purchase.create({
    data: {
      userId,
      stripeSessionId: session.id,
      packId: 'payg',
      credits: request.credits,
      amountCents: paygPriceCents(request.credits),
    },
  });
  if (!session.url) throw new AppError('Stripe did not return a checkout URL', 502, 'upstream');
  return session.url;
}

export const isActiveSubscription = (status: string | null | undefined) =>
  status === 'active' || status === 'trialing' || status === 'past_due';

// Stripe's customer portal: change card, see invoices, cancel Pro.
export async function createBillingPortal(userId: string): Promise<string> {
  const client = stripe();
  const user = await db().user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });
  if (!client || !user?.stripeCustomerId) {
    throw new AppError('No billing account yet', 404, 'no_customer');
  }
  const session = await client.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${config.appUrl()}/credits`,
  });
  return session.url;
}

export async function devGrant(userId: string, request: CheckoutRequest) {
  if (!devCheckoutEnabled()) throw new AppError('Not available', 404, 'not_found');
  if (request.plan === 'pro') {
    await db().user.update({ where: { id: userId }, data: { subscriptionStatus: 'active' } });
  }
  await grantCredits({
    userId,
    amount: request.plan === 'pro' ? PRO_PLAN.monthlyCredits : request.credits,
    key: `dev:${userId}:${Date.now()}`,
    reason: request.plan === 'pro' ? 'dev_subscription' : 'dev_purchase',
  });
}

const id = (value: string | { id: string } | null | undefined) =>
  typeof value === 'string' ? value : (value?.id ?? null);

// Verifies the signature, then grants credits once per paid checkout session or Pro invoice.
export async function handleStripeWebhook(rawBody: string, signature: string | null) {
  const client = stripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!client || !secret || !signature)
    throw new AppError('Webhook not configured', 400, 'no_stripe');
  const event = client.webhooks.constructEvent(rawBody, signature, secret);

  switch (event.type) {
    case 'checkout.session.completed':
      return onCheckoutCompleted(event.data.object);
    case 'invoice.paid':
      return onInvoicePaid(event.data.object);
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      return onSubscriptionChanged(event.data.object);
  }
}

async function onCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id;
  const customerId = id(session.customer);
  if (userId && customerId) {
    await db().user.update({ where: { id: userId }, data: { stripeCustomerId: customerId } });
  }
  // Pro credits arrive with invoice.paid, once per billing cycle.
  if (session.mode !== 'payment' || session.payment_status !== 'paid') return;

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

async function onInvoicePaid(invoice: Stripe.Invoice) {
  const details = invoice.parent?.subscription_details;
  const userId = details?.metadata?.userId;
  if (!details || !userId || details.metadata?.plan !== 'pro') return;
  await grantCredits({
    userId,
    amount: PRO_PLAN.monthlyCredits,
    key: `stripe:invoice:${invoice.id}`,
    reason: 'subscription',
  });
}

async function onSubscriptionChanged(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId || subscription.metadata?.plan !== 'pro') return;
  await db().user.update({
    where: { id: userId },
    data: {
      stripeCustomerId: id(subscription.customer),
      subscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
    },
  });
}

export async function getBillingStatus(userId: string) {
  const user = await db().user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true, subscriptionStatus: true },
  });
  return {
    pro: isActiveSubscription(user?.subscriptionStatus),
    canManage: Boolean(user?.stripeCustomerId && process.env.STRIPE_SECRET_KEY),
  };
}
