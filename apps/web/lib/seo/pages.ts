import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { faqItems } from '@/components/landing';
import type { Locale } from '@/i18n/config';
import { schemaImage } from '@/lib/blog/images';
import type { BlogPost } from '@/lib/blog/posts';
import {
  indexableBlogIndexPaths,
  isBlogIndexIndexable,
  modifiedDate,
  postLivePaths,
} from '@/lib/blog/posts';
import {
  article,
  breadcrumbList,
  faqPage,
  organization,
  softwareApplication,
  webPage,
  website,
} from './jsonld';
import { pageMetadata } from './metadata';
import { livePaths, ROUTES } from './routes';
import { absoluteUrl } from './site';

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

/** Organization, WebSite, WebPage, SoftwareApplication and the FAQ, cross-referenced by @id. */
export async function homeGraph(locale: Locale) {
  const [t, items] = await Promise.all([
    getTranslations({ locale, namespace: 'Home.meta' }),
    faqItems(),
  ]);
  return [
    organization(),
    website(locale),
    webPage(locale, ROUTES.home.paths[locale], t('title'), t('description')),
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

// Search results cut a title at about 60 characters, so the brand is only appended when the
// whole thing still fits. A guide title is written to fit on its own.
export const MAX_TITLE_LENGTH = 60;
const TITLE_SUFFIX = ' · easyrender';

export const postTitle = (title: string): string =>
  title.length + TITLE_SUFFIX.length <= MAX_TITLE_LENGTH ? `${title}${TITLE_SUFFIX}` : title;

/** A guide's head. Its Open Graph image is the same picture as its BlogPosting image. */
export function postMetadata(post: BlogPost): Metadata {
  const image = schemaImage(post.body);
  return {
    ...pageMetadata({
      locale: post.locale,
      path: post.path,
      title: postTitle(post.title),
      description: post.description,
      alternates: postLivePaths(post.group),
      type: 'article',
      publishedTime: post.date,
      modifiedTime: modifiedDate(post),
      ...(image
        ? { image: image.src, imageSize: { width: image.width, height: image.height } }
        : {}),
    }),
    authors: [{ name: post.author.name, ...(post.author.url ? { url: post.author.url } : {}) }],
  };
}

/**
 * Organization, the BlogPosting, its breadcrumb and, when the guide has a FAQ section, a FAQPage
 * built from the same visible questions. Everything is cross-referenced by @id.
 */
export async function postGraph(post: BlogPost) {
  const t = await getTranslations({ locale: post.locale, namespace: 'Blog' });
  const image = schemaImage(post.body);
  return [
    organization(),
    article({ ...post, ...(image ? { image } : {}) }),
    breadcrumbList([
      { name: t('breadcrumb.home'), path: ROUTES.home.paths[post.locale] },
      { name: t('index.title'), path: ROUTES.blog.paths[post.locale] },
      { name: post.title, path: post.path },
    ]),
    ...(post.faq.length ? [faqPage(post.faq, `${absoluteUrl(post.path)}#faq`)] : []),
  ];
}
