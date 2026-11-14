import type { Metadata } from 'next';
import { ApiView } from '@/components/api-landing/api-view';
import { JsonLd } from '@/lib/seo/jsonld';
import { apiGraph, apiMetadata } from '@/lib/seo/pages';

export const generateMetadata = (): Promise<Metadata> => apiMetadata('en');

export default async function ApiPage() {
  return (
    <>
      <JsonLd graph={await apiGraph('en')} />
      <ApiView locale="en" />
    </>
  );
}
