import { getFile, getRender } from '@easyrender/core';
import { resolveActor } from '@/lib/actor';
import { handle } from '@/lib/http';

export const maxDuration = 60;

// The photo the render was made from.
export const GET = (request: Request, { params }: RouteContext<'/api/renders/[id]/source'>) =>
  handle(async () => {
    const { id } = await params;
    const render = await getRender(id, await resolveActor(request.headers));
    const bytes = await getFile(render.sourceKey);
    const ext = render.sourceKey.split('.').pop();
    const type = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
    return new Response(bytes as BodyInit, {
      headers: { 'content-type': type, 'cache-control': 'private, max-age=3600' },
    });
  });
