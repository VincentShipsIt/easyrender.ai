import { getViewImage } from '@easyrender/core';
import { resolveActor } from '@/lib/actor';
import { handle } from '@/lib/http';

export const maxDuration = 60;

// One finished packshot (a white-background JPEG). `?download=1` saves it as a file.
export const GET = (
  request: Request,
  { params }: RouteContext<'/api/product-views/[id]/views/[view]'>,
) =>
  handle(async () => {
    const { id, view } = await params;
    const { bytes, filename } = await getViewImage(id, view, await resolveActor(request.headers));
    const isDownload = new URL(request.url).searchParams.get('download') === '1';
    return new Response(bytes as BodyInit, {
      headers: {
        'content-type': 'image/jpeg',
        'cache-control': 'private, max-age=3600',
        ...(isDownload ? { 'content-disposition': `attachment; filename="${filename}"` } : {}),
      },
    });
  });
