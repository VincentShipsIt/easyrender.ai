import 'server-only';
import { isPricingExperimentConfigured, pricingDecision, pricingSubject } from '@easyrender/core';
import { pricingFor } from '@easyrender/harness';
import { headers } from 'next/headers';
import { cache } from 'react';
import { PATH_HEADER } from '@/i18n/config';
import { resolveActor } from '@/lib/actor';
import { ROUTES } from '@/lib/seo/routes';

// One answer for the page, FAQ, metadata and layout within a request; never shared across visitors.
export const currentPricing = cache(async () => {
  if (!isPricingExperimentConfigured())
    return { ...pricingFor('control'), subject: null, isExperimentActive: false };
  const { userId, anonId } = await resolveActor();
  const path = (await headers()).get(PATH_HEADER);
  const isPricingPage = [
    ...Object.values(ROUTES.home.paths),
    ...Object.values(ROUTES.pricing.paths),
  ].some((route) => route === path);
  const { variant, isExperimentActive } = await pricingDecision(
    userId ?? null,
    anonId,
    isPricingPage,
  );
  return {
    ...pricingFor(variant),
    isExperimentActive,
    subject: await pricingSubject(userId ?? null, anonId),
  };
});
