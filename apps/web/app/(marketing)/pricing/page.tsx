import type { Metadata } from 'next';
import { PricingView } from '@/components/pricing/pricing-view';
import { JsonLd } from '@/lib/seo/jsonld';
import { pricingGraph, pricingMetadata } from '@/lib/seo/pages';

// The English pricing page. Its Spanish twin is served by app/[lang]/[...path]. Plans are bought
// on /credits, behind sign-up; this page is the one that is public, indexed and linked.
export const generateMetadata = (): Promise<Metadata> => pricingMetadata('en');

export default async function PricingPage() {
  return (
    <>
      <JsonLd graph={await pricingGraph('en')} />
      <PricingView locale="en" />
    </>
  );
}
