import { AppError, createCheckout } from '@easyrender/core';
import { NextResponse } from 'next/server';
import { resolveActor } from '@/lib/actor';
import { handle } from '@/lib/http';

export const POST = (request: Request) =>
  handle(async () => {
    const { userId } = await resolveActor(request.headers);
    if (!userId) throw new AppError('Sign in to buy credits', 401, 'unauthorized');
    const body = (await request.json().catch(() => ({}))) as { pack?: unknown };
    return NextResponse.json({ url: await createCheckout(userId, String(body.pack ?? '')) });
  });
