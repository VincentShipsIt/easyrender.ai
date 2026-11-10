import { AppError, startSheet, toView } from '@easyrender/core';
import { NextResponse } from 'next/server';
import { resolveActor } from '@/lib/actor';
import { handle } from '@/lib/http';

export const maxDuration = 60;

// Spends the angle-sheet credits and generates the 3x3 sheet for a render that has none.
export const POST = (request: Request, { params }: RouteContext<'/api/renders/[id]/sheet'>) =>
  handle(async () => {
    const { id } = await params;
    const actor = await resolveActor(request.headers);
    if (!actor.userId)
      throw new AppError('Sign up to generate an angle sheet', 401, 'unauthorized');
    return NextResponse.json(toView(await startSheet(id, actor)));
  });
