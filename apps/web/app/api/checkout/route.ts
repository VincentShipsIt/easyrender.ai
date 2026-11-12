import { AppError, createCheckout } from '@easyrender/core';
import { NextResponse } from 'next/server';
import { resolveActor } from '@/lib/actor';
import { handle } from '@/lib/http';

export const POST = (request: Request) =>
  handle(async () => {
    const { userId, anonId } = await resolveActor(request.headers);
    if (!userId) throw new AppError('Sign in to buy credits', 401, 'unauthorized');
    const body = (await request.json().catch(() => ({}))) as { plan?: unknown; credits?: unknown };
    return NextResponse.json({
      url: await createCheckout(userId, body, {
        anonId,
        expectedVariant: request.headers.get('x-pricing-variant'),
        // Set by Vercel's edge from the connection, never by the browser.
        country: request.headers.get('x-vercel-ip-country'),
      }),
    });
  });
