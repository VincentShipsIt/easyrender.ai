import {
  AppError,
  bearerToken,
  createDraft,
  getBalance,
  listLibrary,
  MAX_UPLOAD_BYTES,
  toView,
} from '@easyrender/core';
import { normalizeAttribution } from '@easyrender/core/attribution';
import { NextResponse } from 'next/server';
import { resolveActor } from '@/lib/actor';
import { privacyRegion } from '@/lib/analytics/privacy-region';
import { handle } from '@/lib/http';

export const maxDuration = 60;

// Multipart upload: `image` (file), an optional `prompt` and an optional catalog `name`. Starts the free preview.
export const POST = (request: Request) =>
  handle(async () => {
    const actor = await resolveActor(request.headers);
    const form = await request.formData().catch(() => null);
    const image = form?.get('image');
    if (!(image instanceof File)) throw new AppError('Attach a photo as `image`', 400, 'no_image');
    if (image.size > MAX_UPLOAD_BYTES)
      throw new AppError('Photo is larger than 4 MB', 413, 'too_large');
    const prompt = form?.get('prompt');
    const name = form?.get('name');
    let attribution: unknown = null;
    try {
      attribution = JSON.parse(String(form?.get('attribution') ?? 'null'));
    } catch {
      /* Malformed optional attribution never rejects a photo. */
    }
    const render = await createDraft({
      actor,
      attribution: normalizeAttribution(
        attribution,
        new URL(request.url).origin,
        privacyRegion(request.headers),
      ),
      bytes: new Uint8Array(await image.arrayBuffer()),
      contentType: image.type,
      prompt: typeof prompt === 'string' ? prompt.slice(0, 500) : null,
      name: typeof name === 'string' ? name : null,
      source: bearerToken(request.headers) ? 'api' : 'web',
    });
    return NextResponse.json(toView(render), { status: 201 });
  });

// The signed-in user's catalog, for the library grid.
export const GET = (request: Request) =>
  handle(async () => {
    const actor = await resolveActor(request.headers);
    if (!actor.userId) throw new AppError('Sign in to see your library', 401, 'unauthorized');
    const [renders, balance] = await Promise.all([
      listLibrary(actor.userId),
      getBalance(actor.userId),
    ]);
    return NextResponse.json({ renders: renders.map(toView), balance });
  });
