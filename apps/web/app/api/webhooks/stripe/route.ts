import { flushGooglePurchases, handleStripeWebhook } from '@easyrender/core';
import { after, NextResponse } from 'next/server';
import { handle } from '@/lib/http';

export const maxDuration = 60;

export const POST = (request: Request) =>
  handle(async () => {
    await handleStripeWebhook(await request.text(), request.headers.get('stripe-signature'));
    after(() => flushGooglePurchases());
    return NextResponse.json({ received: true });
  });
