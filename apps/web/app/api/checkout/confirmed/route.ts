import { confirmedPurchase } from '@easyrender/core';
import { resolveActor } from '@/lib/actor';
import { handle } from '@/lib/http';
export const GET = (request: Request) =>
  handle(async () => {
    const { userId } = await resolveActor(request.headers);
    const session = new URL(request.url).searchParams.get('session_id');
    const result = userId && session ? await confirmedPurchase(userId, session) : null;
    return Response.json(result, {
      status: result ? 200 : 404,
      headers: { 'Cache-Control': 'private, no-store' },
    });
  });
