import { claimSignupReceipt } from '@easyrender/core';
import { resolveActor } from '@/lib/actor';
import { allowsServerMeasurement } from '@/lib/analytics/measurement-consent';
import { handle } from '@/lib/http';
export const POST = (request: Request) =>
  handle(async () => {
    const origin = request.headers.get('origin');
    if (origin !== new URL(request.url).origin) return new Response(null, { status: 403 });
    if (!allowsServerMeasurement(request.headers)) return new Response(null, { status: 204 });
    const { userId } = await resolveActor(request.headers);
    const receipt = userId ? await claimSignupReceipt(userId) : null;
    return receipt
      ? Response.json(receipt, { headers: { 'Cache-Control': 'private, no-store' } })
      : new Response(null, { status: 204, headers: { 'Cache-Control': 'private, no-store' } });
  });
