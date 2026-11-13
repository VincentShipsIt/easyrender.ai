import { db } from '@easyrender/db';
import { resolveActor } from '@/lib/actor';
import { handle } from '@/lib/http';
export const POST = (request: Request) =>
  handle(async () => {
    if (request.headers.get('origin') !== new URL(request.url).origin)
      return new Response(null, { status: 403 });
    const { userId } = await resolveActor(request.headers);
    if (userId)
      await db().googleCheckout.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    return new Response(null, { status: 204 });
  });
