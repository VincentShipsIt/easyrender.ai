import { db } from '@easyrender/db';
import {
  isPlanId,
  isValidPaygCredits,
  PAYG,
  PLAN_IDS,
  type PlanId,
  paygPriceCents,
  SUBSCRIPTION_PLANS,
} from '@easyrender/harness';
import Stripe from 'stripe';
import { captureServer, deferAnalytics } from './analytics';
import { pickAttribution } from './attribution';
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

export type CheckoutRequest = { plan: 'payg'; credits: number } | { plan: PlanId };

export function parseCheckout(body: { plan?: unknown; credits?: unknown }): CheckoutRequest {
  if (isPlanId(body.plan)) return { plan: body.plan };
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

// One Stripe price per product, named STRIPE_PRICE_PAYG, STRIPE_PRICE_CREATOR, STRIPE_PRICE_PRO...
const priceId = (product: 'payg' | PlanId) => {
  const id = process.env[`STRIPE_PRICE_${product.toUpperCase()}`];
  if (!id) throw new AppError('Payments are not configured', 503, 'no_stripe');
  return id;
};

const devCheckoutUrl = (request: CheckoutRequest) =>
  request.plan === 'payg'
    ? `${config.appUrl()}/api/dev/checkout?plan=payg&credits=${request.credits}`
    : `${config.appUrl()}/api/dev/checkout?plan=${request.plan}`;

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
    success_url: `${config.appUrl()}/credits?status=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.appUrl()}/credits?status=canceled`,
  };

  if (request.plan !== 'payg') {
    if (isActiveSubscription(user.subscriptionStatus)) {
      throw new AppError(
        'You already have a monthly plan. Change it from billing.',
        409,
        'already_subscribed',
      );
    }
    const session = await client.checkout.sessions.create({
      mode: 'subscription',
      client_reference_id: userId,
      ...customer,
      line_items: [{ price: priceId(request.plan), quantity: 1 }],
      metadata: { userId, plan: request.plan },
      subscription_data: { metadata: { userId, plan: request.plan } },
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
    line_items: [{ price: priceId('payg'), quantity: request.credits }],
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

// Stripe's customer portal: change card, see invoices, change or cancel the monthly plan.
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
  const isPayg = request.plan === 'payg';
  if (!isPayg) {
    await db().user.update({
      where: { id: userId },
      data: { subscriptionStatus: 'active', subscriptionPlan: request.plan },
    });
  }
  await grantCredits({
    userId,
    amount: isPayg ? request.credits : SUBSCRIPTION_PLANS[request.plan].monthlyCredits,
    key: `dev:${userId}:${Date.now()}`,
    reason: isPayg ? 'dev_purchase' : 'dev_subscription',
  });
}

const id = (value: string | { id: string } | null | undefined) =>
  typeof value === 'string' ? value : (value?.id ?? null);

// The plan a Stripe price belongs to, from the STRIPE_PRICE_* env vars. The price is the truth:
// the plan tag on the subscription is written once at checkout and stays put when the customer
// switches plan in the billing portal.
export function planForPrice(price: string | { id: string } | null | undefined): PlanId | null {
  const priceId = id(price);
  if (!priceId) return null;
  return (
    PLAN_IDS.find((plan) => process.env[`STRIPE_PRICE_${plan.toUpperCase()}`] === priceId) ?? null
  );
}

const planTag = (metadata: Stripe.Metadata | null | undefined): PlanId | null =>
  isPlanId(metadata?.plan) ? metadata.plan : null;

// The plan this invoice bills for: its regular subscription line, not a proration for the old plan.
export function planFromInvoice(invoice: Stripe.Invoice): PlanId | null {
  for (const line of invoice.lines?.data ?? []) {
    const item = line.parent?.subscription_item_details;
    if (!item || item.proration) continue;
    const plan = planForPrice(line.pricing?.price_details?.price);
    if (plan) return plan;
  }
  return planTag(invoice.parent?.subscription_details?.metadata);
}

export function planFromSubscription(subscription: Stripe.Subscription): PlanId | null {
  for (const item of subscription.items?.data ?? []) {
    const plan = planForPrice(item.price);
    if (plan) return plan;
  }
  return planTag(subscription.metadata);
}

// Verifies the signature, then grants credits once per paid checkout session or monthly-plan invoice.
export async function handleStripeWebhook(rawBody: string, signature: string | null) {
  const client = stripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!client || !secret || !signature)
    throw new AppError('Webhook not configured', 400, 'no_stripe');
  const event = await client.webhooks.constructEventAsync(rawBody, signature, secret);

  switch (event.type) {
    case 'checkout.session.async_payment_succeeded':
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
  // Monthly-plan credits arrive with invoice.paid, once per billing cycle.
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
  const { count } = await db().purchase.updateMany({
    where: { id: purchase.id, status: 'pending' },
    data: { status: 'paid' },
  });
  if (count) deferAnalytics(() => capturePurchase(purchase, session.currency ?? 'usd'));
}

async function onInvoicePaid(invoice: Stripe.Invoice) {
  const details = invoice.parent?.subscription_details;
  const userId = details?.metadata?.userId;
  const plan = planFromInvoice(invoice);
  if (!details || !userId || !plan) return;
  const purchase = await db().purchase.upsert({
    where: { stripeSessionId: invoice.id },
    // A nonempty no-op update lets Prisma use a database-native atomic upsert on replays.
    update: { stripeSessionId: invoice.id },
    create: {
      userId,
      stripeSessionId: invoice.id,
      packId: plan,
      credits: SUBSCRIPTION_PLANS[plan].monthlyCredits,
      amountCents: invoice.amount_paid ?? SUBSCRIPTION_PLANS[plan].priceCents,
    },
  });
  await grantCredits({
    userId,
    amount: SUBSCRIPTION_PLANS[plan].monthlyCredits,
    key: `stripe:invoice:${invoice.id}`,
    reason: 'subscription',
    purchaseId: purchase.id,
  });
  const { count } = await db().purchase.updateMany({
    where: { id: purchase.id, status: 'pending' },
    data: { status: 'paid' },
  });
  if (count) deferAnalytics(() => capturePurchase(purchase, invoice.currency ?? 'usd'));
}

async function onSubscriptionChanged(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  const plan = planFromSubscription(subscription);
  if (!userId || !plan) return;
  await db().user.update({
    where: { id: userId },
    data: {
      stripeCustomerId: id(subscription.customer),
      subscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      subscriptionPlan: plan,
    },
  });
}

export async function getBillingStatus(userId: string) {
  const user = await db().user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true, subscriptionStatus: true, subscriptionPlan: true },
  });
  // Subscribers from before Creator and Scale have no stored plan: they are on Pro.
  const stored = user?.subscriptionPlan;
  const plan: PlanId | null = isActiveSubscription(user?.subscriptionStatus)
    ? isPlanId(stored)
      ? stored
      : 'pro'
    : null;
  return {
    plan,
    canManage: Boolean(user?.stripeCustomerId && process.env.STRIPE_SECRET_KEY),
  };
}

async function capturePurchase(
  purchase: { id: string; userId: string; packId: string; credits: number; amountCents: number },
  currency: string,
) {
  const user = await db().user.findUniqueOrThrow({ where: { id: purchase.userId } });
  const first = await db().purchase.findFirst({
    where: { userId: purchase.userId, status: 'paid' },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    select: { id: true },
  });
  captureServer(
    'purchase',
    purchase.id,
    { userId: purchase.userId, previewId: null, source: 'web', attribution: pickAttribution(user) },
    {
      order_id: purchase.id,
      pack_id: purchase.packId,
      credits: purchase.credits,
      amount: purchase.amountCents / 100,
      currency: currency.toUpperCase(),
      is_first_purchase: first?.id === purchase.id,
      payment_provider: 'stripe',
    },
  );
}

/** Owner-scoped, DB-confirmed checkout result. Never trust success query parameters. */
export async function confirmedPurchase(userId: string, sessionId: string) {
  let purchase = await db().purchase.findFirst({
    where: { userId, stripeSessionId: sessionId, status: 'paid' },
  });
  if (
    !purchase &&
    sessionId.startsWith('cs_') &&
    stripe() &&
    !(await db().purchase.findUnique({
      where: { stripeSessionId: sessionId },
      select: { id: true },
    }))
  ) {
    const session = await stripe()?.checkout.sessions.retrieve(sessionId);
    if (
      session?.client_reference_id === userId &&
      session.mode === 'subscription' &&
      session.payment_status === 'paid'
    ) {
      const invoiceId = id(session.invoice);
      if (invoiceId)
        purchase = await db().purchase.findFirst({
          where: { userId, stripeSessionId: invoiceId, status: 'paid' },
        });
    }
  }
  if (!purchase) return null;
  return {
    transaction_id: purchase.id,
    value: purchase.amountCents / 100,
    currency: 'USD',
    items: [{ item_id: purchase.packId, quantity: 1, price: purchase.amountCents / 100 }],
  };
}
