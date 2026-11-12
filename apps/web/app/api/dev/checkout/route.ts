import { AppError, devGrant, parseCheckout } from '@easyrender/core';
import { NextResponse } from 'next/server';
import { resolveActor } from '@/lib/actor';
import { handle } from '@/lib/http';

// Local only: grants credits without Stripe. devGrant refuses in production or when Stripe is set.
export const GET = (request: Request) =>
  handle(async () => {
    const { userId, anonId } = await resolveActor(request.headers);
    if (!userId) throw new AppError('Sign in first', 401, 'unauthorized');
    const url = new URL(request.url);
    const request_ = parseCheckout({
      plan: url.searchParams.get('plan'),
      credits: url.searchParams.get('credits'),
    });
    await devGrant(userId, request_, anonId);
    return NextResponse.redirect(new URL('/credits?status=success', url));
  });
