import type { Metadata } from 'next';
import { HomeView } from '@/components/home/home-view';
import { JsonLd } from '@/lib/seo/jsonld';
import { homeGraph, homeMetadata } from '@/lib/seo/pages';

// The English home, at the root. It is the x-default of every hreflang group.
export const generateMetadata = (): Promise<Metadata> => homeMetadata('en');

export default async function HomePage() {
  return (
    <>
      <JsonLd graph={await homeGraph('en')} />
      <HomeView />
    </>
  );
}
