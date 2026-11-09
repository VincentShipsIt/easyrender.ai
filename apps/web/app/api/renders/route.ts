import { AppError, createDraft, MAX_UPLOAD_BYTES, toView } from '@easyrender/core';
import { NextResponse } from 'next/server';
import { resolveActor } from '@/lib/actor';
import { handle } from '@/lib/http';

export const maxDuration = 60;

// Multipart upload: `image` (file) and an optional `prompt`. Starts the free preview.
export const POST = (request: Request) =>
  handle(async () => {
    const actor = await resolveActor(request.headers);
    const form = await request.formData().catch(() => null);
    const image = form?.get('image');
    if (!(image instanceof File)) throw new AppError('Attach a photo as `image`', 400, 'no_image');
    if (image.size > MAX_UPLOAD_BYTES)
      throw new AppError('Photo is larger than 4 MB', 413, 'too_large');
    const prompt = form?.get('prompt');
    const render = await createDraft({
      actor,
      bytes: new Uint8Array(await image.arrayBuffer()),
      contentType: image.type,
      prompt: typeof prompt === 'string' ? prompt.slice(0, 500) : null,
    });
    return NextResponse.json(toView(render), { status: 201 });
  });
