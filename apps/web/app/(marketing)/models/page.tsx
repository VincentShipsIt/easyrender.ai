import type { Metadata } from 'next';
import { ModelsView } from '@/components/models/models-view';
import { JsonLd } from '@/lib/seo/jsonld';
import { modelsGraph, modelsMetadata } from '@/lib/seo/pages';

// The English models page. Its Spanish twin is served by app/[lang]/[...path].
export const generateMetadata = (): Promise<Metadata> => modelsMetadata('en');

export default async function ModelsPage() {
  return (
    <>
      <JsonLd graph={await modelsGraph('en')} />
      <ModelsView locale="en" />
    </>
  );
}
