import { AppError, linkShop, verifyLinkState } from '@easyrender/core';
import { NextResponse } from 'next/server';
import { resolveActor } from '@/lib/actor';
import { handle } from '@/lib/http';

// Body: { state }. The signed-in easyrender user pays for this shop's models from now on.
export const POST = (request: Request) =>
  handle(async () => {
    const actor = await resolveActor(request.headers);
    if (!actor.userId) throw new AppError('Sign in to connect your store', 401, 'unauthorized');
    const body = await request.json().catch(() => null);
    const shop = verifyLinkState(typeof body?.state === 'string' ? body.state : null);
    await linkShop(shop, actor.userId);
    return NextResponse.json({ shop });
  });
