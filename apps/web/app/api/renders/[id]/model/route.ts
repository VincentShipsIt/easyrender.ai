import { getFile, getRender, notFound } from '@easyrender/core';
import { resolveActor } from '@/lib/actor';
import { handle } from '@/lib/http';

export const maxDuration = 60;

export const GET = (request: Request, { params }: RouteContext<'/api/renders/[id]/model'>) =>
  handle(async () => {
    const { id } = await params;
    const actor = await resolveActor(request.headers);
    const render = await getRender(id, actor);
    if (!actor.userId || render.status !== 'ready' || !render.glbKey) throw notFound();
    const bytes = await getFile(render.glbKey);
    const download = new URL(request.url).searchParams.get('download') === '1';
    return new Response(bytes as BodyInit, {
      headers: {
        'content-type': 'model/gltf-binary',
        'cache-control': 'private, max-age=3600',
        ...(download
          ? { 'content-disposition': `attachment; filename="easyrender-${id}.glb"` }
          : {}),
      },
    });
  });
