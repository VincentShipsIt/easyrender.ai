import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CompareView } from '@/components/compare/compare-view';
import { getComparePage } from '@/lib/compare/pages';
import { noindexMetadata } from '@/lib/seo/metadata';
import { postTitle } from '@/lib/seo/pages';

// An English comparison page, open for review only (ROUTES.compare.review): it answers 200 so
// Jorge can read it, with noindex here and an x-robots-tag from next.config.ts (NOINDEX_PREFIXES),
// no canonical, hreflang or social card, and no structured data. Nothing on the site links to it
// and no sitemap or llms.txt lists it. Publishing it is a separate, approved change.
export async function generateMetadata({
  params,
}: PageProps<'/compare/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const page = getComparePage(slug);
  return page ? noindexMetadata(postTitle(page.title), page.description) : {};
}

export default async function ComparePageRoute({ params }: PageProps<'/compare/[slug]'>) {
  const { slug } = await params;
  const page = getComparePage(slug);
  if (!page) notFound();
  return <CompareView page={page} />;
}
