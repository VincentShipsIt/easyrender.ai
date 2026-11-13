import 'server-only';
import {
  assignedPricing,
  buyerCurrency,
  isPricingExperimentConfigured,
  pricingSubject,
} from '@easyrender/core';
import { displayPricing } from '@easyrender/harness';
import { cache } from 'react';
import { resolveActor } from '@/lib/actor';

// One answer for the page, FAQ, metadata and layout within a request; never shared across visitors.
// Amounts are in the currency the visitor will be charged: EUR for euro-area countries (Vercel sets
// the country at the edge), USD otherwise, and a returning buyer keeps their last currency.
export const currentPricing = cache(async () => {
  const { userId, anonId, geoCountry } = await resolveActor();
  const currency = await buyerCurrency(userId ?? null, geoCountry);
  if (!isPricingExperimentConfigured())
    return { ...displayPricing('control', currency), subject: null };
  const variant = await assignedPricing(userId ?? null, anonId);
  return {
    ...displayPricing(variant, currency),
    subject: await pricingSubject(userId ?? null, anonId),
  };
});
