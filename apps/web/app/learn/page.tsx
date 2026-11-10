import type { Metadata } from 'next';
import { BlogIndexView } from '@/components/blog/blog-index-view';
import { isBlogIndexIndexable } from '@/lib/blog/posts';
import { JsonLd } from '@/lib/seo/jsonld';
import { blogIndexGraph, blogIndexMetadata } from '@/lib/seo/pages';

// The English guides hub. Stays out of the index until it has guides to index.
export async function generateMetadata(): Promise<Metadata> {
  const metadata = await blogIndexMetadata('en');
  return isBlogIndexIndexable('en')
    ? metadata
    : { ...metadata, robots: { index: false, follow: true } };
}

export default async function LearnPage() {
  return (
    <>
      <JsonLd graph={await blogIndexGraph('en')} />
      <BlogIndexView locale="en" />
    </>
  );
}
