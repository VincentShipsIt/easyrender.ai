import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { faqItems } from '@/components/landing';
import type { Locale } from '@/i18n/config';
import type { BlogPost } from '@/lib/blog/posts';
import { indexableBlogIndexPaths, isBlogIndexIndexable, postLivePaths } from '@/lib/blog/posts';
import {
  article,
  breadcrumbList,
  faqPage,
  organization,
  softwareApplication,
  website,
} from './jsonld';
import { pageMetadata } from './metadata';
import { livePaths, ROUTES } from './routes';

// The head and the structured data of every indexable page, in one place, so the home in English
// and the home in Spanish are built the same way and only the words differ.

export async function homeMetadata(locale: Locale): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Home.meta' });
  return pageMetadata({
    locale,
    path: ROUTES.home.paths[locale],
    title: t('title'),
    description: t('description'),
    alternates: livePaths('home'),
  });
}

/** Organization, WebSite, SoftwareApplication and the FAQ, cross-referenced by @id. */
export async function homeGraph(locale: Locale) {
  const [t, items] = await Promise.all([
    getTranslations({ locale, namespace: 'Home.meta' }),
    faqItems(),
  ]);
  return [
    organization(),
    website(locale),
    softwareApplication(locale, t('description')),
    faqPage(items),
  ];
}

/**
 * The guides hub. noindex while it has fewer than MIN_INDEXABLE_POSTS guides, and its hreflang
 * only lists hubs that are themselves indexable, so no alternate ever points at a noindex page.
 */
export async function blogIndexMetadata(locale: Locale): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Blog.index' });
  const isIndexable = isBlogIndexIndexable(locale);
  const metadata = pageMetadata({
    locale,
    path: ROUTES.blog.paths[locale],
    title: t('metaTitle'),
    description: t('metaDescription'),
    ...(isIndexable ? { alternates: indexableBlogIndexPaths() } : {}),
  });
  return isIndexable ? metadata : { ...metadata, robots: { index: false, follow: true } };
}

export async function blogIndexGraph(locale: Locale) {
  const t = await getTranslations({ locale, namespace: 'Blog' });
  return [
    breadcrumbList([
      { name: t('breadcrumb.home'), path: ROUTES.home.paths[locale] },
      { name: t('index.title'), path: ROUTES.blog.paths[locale] },
    ]),
  ];
}

export function postMetadata(post: BlogPost): Metadata {
  return pageMetadata({
    locale: post.locale,
    path: post.path,
    title: `${post.title} · easyrender`,
    description: post.description,
    alternates: postLivePaths(post.group),
    type: 'article',
    publishedTime: post.date,
    modifiedTime: post.updated ?? post.date,
  });
}

export async function postGraph(post: BlogPost) {
  const t = await getTranslations({ locale: post.locale, namespace: 'Blog' });
  return [
    article(post),
    breadcrumbList([
      { name: t('breadcrumb.home'), path: ROUTES.home.paths[post.locale] },
      { name: t('index.title'), path: ROUTES.blog.paths[post.locale] },
      { name: post.title, path: post.path },
    ]),
  ];
}
