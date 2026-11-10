import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogIndexView } from '@/components/blog/blog-index-view';
import { BlogPostView } from '@/components/blog/blog-post-view';
import { isRoutableLocale, type Locale } from '@/i18n/config';
import { type BlogPost, getPost, isBlogIndexIndexable } from '@/lib/blog/posts';
import { JsonLd } from '@/lib/seo/jsonld';
import { blogIndexGraph, blogIndexMetadata, postGraph, postMetadata } from '@/lib/seo/pages';
import { isPublished, ROUTES } from '@/lib/seo/routes';

// Everything below a language home, resolved through the route registry so only the native slugs
// it knows are served. English has one folder per page instead, because its paths are the plain
// English words and reading app/learn/[slug] is clearer than a dispatcher.
//
// Adding a page type here means adding its case: a published registry entry with no case falls
// through to notFound, which is the safe direction.

type Match =
  | { kind: 'blogIndex'; locale: Locale }
  | { kind: 'post'; post: BlogPost }
  | { kind: 'none' };

function resolve(lang: string, segments: string[]): Match {
  if (!isRoutableLocale(lang) || lang === 'en') return { kind: 'none' };
  const locale: Locale = lang;
  const path = `/${[locale, ...segments].join('/')}`;

  if (isPublished('blog', locale)) {
    const hub = ROUTES.blog.paths[locale];
    if (path === hub) return { kind: 'blogIndex', locale };
    if (path.startsWith(`${hub}/`)) {
      const slug = path.slice(hub.length + 1);
      const post = slug.includes('/') ? null : getPost(locale, slug);
      if (post) return { kind: 'post', post };
    }
  }

  return { kind: 'none' };
}

export async function generateMetadata({
  params,
}: PageProps<'/[lang]/[...path]'>): Promise<Metadata> {
  const { lang, path } = await params;
  const match = resolve(lang, path);
  if (match.kind === 'post') return postMetadata(match.post);
  if (match.kind === 'blogIndex') {
    const metadata = await blogIndexMetadata(match.locale);
    return isBlogIndexIndexable(match.locale)
      ? metadata
      : { ...metadata, robots: { index: false, follow: true } };
  }
  return {};
}

export default async function LocalePage({ params }: PageProps<'/[lang]/[...path]'>) {
  const { lang, path } = await params;
  const match = resolve(lang, path);

  if (match.kind === 'blogIndex') {
    return (
      <>
        <JsonLd graph={await blogIndexGraph(match.locale)} />
        <BlogIndexView locale={match.locale} />
      </>
    );
  }
  if (match.kind === 'post') {
    return (
      <>
        <JsonLd graph={await postGraph(match.post)} />
        <BlogPostView post={match.post} />
      </>
    );
  }
  notFound();
}
