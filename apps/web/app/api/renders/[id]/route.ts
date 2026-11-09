import { getRender, toView } from '@easyrender/core';
import { NextResponse } from 'next/server';
import { resolveActor } from '@/lib/actor';
import { handle } from '@/lib/http';

export const maxDuration = 60;

export const GET = (request: Request, { params }: RouteContext<'/api/renders/[id]'>) =>
  handle(async () => {
    const { id } = await params;
    const render = await getRender(id, await resolveActor(request.headers));
    return NextResponse.json(toView(render), { headers: { 'cache-control': 'no-store' } });
  });
