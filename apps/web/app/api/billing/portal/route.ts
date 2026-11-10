import { AppError, createBillingPortal } from '@easyrender/core';
import { NextResponse } from 'next/server';
import { resolveActor } from '@/lib/actor';
import { handle } from '@/lib/http';

export const POST = (request: Request) =>
  handle(async () => {
    const { userId } = await resolveActor(request.headers);
    if (!userId) throw new AppError('Sign in first', 401, 'unauthorized');
    return NextResponse.json({ url: await createBillingPortal(userId) });
  });
