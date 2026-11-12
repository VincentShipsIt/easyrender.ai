import 'server-only';
import { assignedPricing, isPricingExperimentConfigured, pricingSubject } from '@easyrender/core';
import { pricingFor } from '@easyrender/harness';
import { cache } from 'react';
import { resolveActor } from '@/lib/actor';

// One answer for the page, FAQ, metadata and layout within a request; never shared across visitors.
export const currentPricing = cache(async () => {
  if (!isPricingExperimentConfigured()) return { ...pricingFor('control'), subject: null };
  const { userId, anonId } = await resolveActor();
  const variant = await assignedPricing(userId ?? null, anonId);
  return { ...pricingFor(variant), subject: await pricingSubject(userId ?? null, anonId) };
});
