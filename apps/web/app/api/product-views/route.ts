import {
  AppError,
  createViewSet,
  getBalance,
  listViewSets,
  MAX_UPLOAD_BYTES,
  toViewSetView,
} from '@easyrender/core';
import { NextResponse } from 'next/server';
import { resolveActor } from '@/lib/actor';
import { handle } from '@/lib/http';

export const maxDuration = 60;

// Multipart upload: `image` (file), an optional `prompt` and an optional `name`. Charges the set
// and starts drawing its nine views.
export const POST = (request: Request) =>
  handle(async () => {
    const actor = await resolveActor(request.headers);
    if (!actor.userId) throw new AppError('Sign in to make product views', 401, 'unauthorized');
    const form = await request.formData().catch(() => null);
    const image = form?.get('image');
    if (!(image instanceof File)) throw new AppError('Attach a photo as `image`', 400, 'no_image');
    if (image.size > MAX_UPLOAD_BYTES)
      throw new AppError('Photo is larger than 4 MB', 413, 'too_large');
    const prompt = form?.get('prompt');
    const name = form?.get('name');
    const set = await createViewSet({
      actor,
      bytes: new Uint8Array(await image.arrayBuffer()),
      contentType: image.type,
      prompt: typeof prompt === 'string' ? prompt.slice(0, 500) : null,
      name: typeof name === 'string' ? name : null,
    });
    return NextResponse.json(toViewSetView(set), { status: 201 });
  });

// The signed-in user's product views, newest first.
export const GET = (request: Request) =>
  handle(async () => {
    const actor = await resolveActor(request.headers);
    if (!actor.userId) throw new AppError('Sign in to see your product views', 401, 'unauthorized');
    const [sets, balance] = await Promise.all([
      listViewSets(actor.userId),
      getBalance(actor.userId),
    ]);
    return NextResponse.json({ sets: sets.map(toViewSetView), balance });
  });
