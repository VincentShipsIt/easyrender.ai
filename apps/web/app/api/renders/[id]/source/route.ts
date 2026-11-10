import { canAccess, getFile, notFound } from '@easyrender/core';
import { db } from '@easyrender/db';
import { resolveActor } from '@/lib/actor';
import { handle } from '@/lib/http';

export const maxDuration = 60;

// The original flat photo, for the owner's library grid. Reads the row directly so loading
// a grid of thumbnails never nudges the Replicate pipeline.
export const GET = (request: Request, { params }: RouteContext<'/api/renders/[id]/source'>) =>
  handle(async () => {
    const { id } = await params;
    const render = await db().render.findUnique({
      where: { id },
      select: { userId: true, anonId: true, sourceKey: true },
    });
    if (!render || !canAccess(render, await resolveActor(request.headers))) throw notFound();
    const bytes = await getFile(render.sourceKey);
    const type = render.sourceKey.match(/\.(png|webp)$/)?.[1];
    return new Response(bytes as BodyInit, {
      headers: {
        'content-type': type ? `image/${type}` : 'image/jpeg',
        'cache-control': 'private, max-age=86400, immutable',
      },
    });
  });
