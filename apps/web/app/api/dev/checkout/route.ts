import { AppError, devGrant } from '@easyrender/core';
import { NextResponse } from 'next/server';
import { resolveActor } from '@/lib/actor';
import { handle } from '@/lib/http';

// Local only: grants a pack without Stripe. devGrant refuses in production or when Stripe is set.
export const GET = (request: Request) =>
  handle(async () => {
    const { userId } = await resolveActor(request.headers);
    if (!userId) throw new AppError('Sign in first', 401, 'unauthorized');
    const url = new URL(request.url);
    await devGrant(userId, url.searchParams.get('pack') ?? '');
    return NextResponse.redirect(new URL('/credits?status=success', url));
  });
