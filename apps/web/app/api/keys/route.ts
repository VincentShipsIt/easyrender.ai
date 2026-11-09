import { AppError, createApiKey, listApiKeys, revokeApiKey } from '@easyrender/core';
import { NextResponse } from 'next/server';
import { currentUser } from '@/lib/actor';
import { handle } from '@/lib/http';

// Keys are managed from a browser session only, never with another key.
async function requireUser() {
  const user = await currentUser();
  if (!user) throw new AppError('Sign in first', 401, 'unauthorized');
  return user;
}

export const GET = () =>
  handle(async () => NextResponse.json(await listApiKeys((await requireUser()).id)));

export const POST = (request: Request) =>
  handle(async () => {
    const user = await requireUser();
    const body = (await request.json().catch(() => ({}))) as { name?: unknown };
    return NextResponse.json(await createApiKey(user.id, String(body.name ?? 'API key')), {
      status: 201,
    });
  });

export const DELETE = (request: Request) =>
  handle(async () => {
    const user = await requireUser();
    await revokeApiKey(user.id, new URL(request.url).searchParams.get('id') ?? '');
    return new Response(null, { status: 204 });
  });
