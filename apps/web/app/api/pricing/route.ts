import { pricingDecision } from '@easyrender/core';
import { resolveActor } from '@/lib/actor';

// Functional pricing status, independent of analytics consent. Never enrols a visitor.
export async function GET(request: Request) {
  let decision = { variant: 'control', isExperimentActive: false };
  try {
    const { userId, anonId } = await resolveActor(request.headers);
    decision = await pricingDecision(userId ?? null, anonId);
  } catch {
    // Even an identity/session-store outage must disable experiment exposure.
  }
  return Response.json(decision, { headers: { 'Cache-Control': 'private, no-store' } });
}
