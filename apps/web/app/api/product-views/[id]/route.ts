import { getViewSet, toViewSetView } from '@easyrender/core';
import { NextResponse } from 'next/server';
import { resolveActor } from '@/lib/actor';
import { handle } from '@/lib/http';

export const maxDuration = 60;

export const GET = (request: Request, { params }: RouteContext<'/api/product-views/[id]'>) =>
  handle(async () => {
    const { id } = await params;
    const set = await getViewSet(id, await resolveActor(request.headers));
    return NextResponse.json(toViewSetView(set), { headers: { 'cache-control': 'no-store' } });
  });
