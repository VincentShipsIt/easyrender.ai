import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { LOCALES, type Locale, ROUTABLE_LOCALES } from '@/i18n/config';
import { ROUTES } from '@/lib/seo/routes';
import { parseFrontMatter } from './frontmatter';

// Posts are content files: content/blog/{locale}/{slug}.md, one file per language per post.
//
//   ---
//   group: glb-vs-usdz          ties the six translations together for hreflang
//   title: GLB or USDZ?
//   description: One sentence for the search result and the card.
//   date: 2026-11-23            publishes at 00:00 UTC that day; a future date stays invisible
//   updated: 2026-11-30         optional
//   keyword: glb to usdz        optional, the target query, for the record
//   ---
//
// `date` is what makes one-post-a-day work: a week of posts can be committed at once and each
// one appears on its day, in the index, in the sitemap and at its own URL, with no deploy. The
// pages are server rendered, so the gate is applied per request.

export type BlogPost = {
  locale: Locale;
  slug: string;
  group: string;
  title: string;
  description: string;
  /** Publication instant, ISO 8601. */
  date: string;
  updated?: string;
  keyword?: string;
  body: string;
  /** Site-relative URL. */
  path: string;
};

const CONTENT_ROOT = join(process.cwd(), 'content', 'blog');

/** Where a post lives, given its locale and slug. */
export const postPath = (locale: Locale, slug: string): string =>
  `${ROUTES.blog.paths[locale]}/${slug}`;

const isoDate = (value: string): string | null => {
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00Z` : value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

/**
 * Turns one content file into a post. Returns the reason instead of throwing so that a single
 * malformed file cannot take the whole blog down; readPosts logs it and moves on.
 */
export function parsePost(
  locale: Locale,
  slug: string,
  source: string,
): { post: BlogPost } | { error: string } {
  const { data, body } = parseFrontMatter(source);
  for (const field of ['group', 'title', 'description', 'date'] as const) {
    if (!data[field]) return { error: `missing ${field}` };
  }
  const date = isoDate(data.date as string);
  if (!date) return { error: `invalid date "${data.date}"` };
  const updated = data.updated ? isoDate(data.updated) : null;
  if (data.updated && !updated) return { error: `invalid updated "${data.updated}"` };
  if (!body) return { error: 'empty body' };

  return {
    post: {
      locale,
      slug,
      group: data.group as string,
      title: data.title as string,
      description: data.description as string,
      date,
      ...(updated ? { updated } : {}),
      ...(data.keyword ? { keyword: data.keyword } : {}),
      body,
      path: postPath(locale, slug),
    },
  };
}

const cache = new Map<Locale, BlogPost[]>();

/** Every post written for a locale, published or not, newest first. */
export function readPosts(locale: Locale, root: string = CONTENT_ROOT): BlogPost[] {
  const cached = root === CONTENT_ROOT ? cache.get(locale) : undefined;
  if (cached) return cached;

  let files: string[];
  try {
    files = readdirSync(join(root, locale));
  } catch {
    files = [];
  }

  const posts: BlogPost[] = [];
  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    const slug = file.slice(0, -3);
    const result = parsePost(locale, slug, readFileSync(join(root, locale, file), 'utf8'));
    if ('error' in result) {
      console.warn(`blog: skipping ${locale}/${file}: ${result.error}`);
      continue;
    }
    posts.push(result.post);
  }
  posts.sort((a, b) => b.date.localeCompare(a.date));

  // Content only changes on deploy, and the publication gate is applied per request, so caching
  // the parsed files is safe. Not in development, where the files are being edited.
  if (root === CONTENT_ROOT && process.env.NODE_ENV === 'production') cache.set(locale, posts);
  return posts;
}

const isRoutable = (locale: Locale) => (ROUTABLE_LOCALES as readonly Locale[]).includes(locale);

export const isPublishedPost = (post: BlogPost, now: Date): boolean =>
  isRoutable(post.locale) && Date.parse(post.date) <= now.getTime();

/** The posts a locale shows today, newest first. */
export function listPosts(locale: Locale, now: Date = new Date()): BlogPost[] {
  return readPosts(locale).filter((post) => isPublishedPost(post, now));
}

/** One published post, or null: a future-dated or unknown slug is a 404. */
export function getPost(locale: Locale, slug: string, now: Date = new Date()): BlogPost | null {
  return listPosts(locale, now).find((post) => post.slug === slug) ?? null;
}

// A hub with one or two guides is a thin page, so it stays out of the index until it has
// something to be an index of (arch doc, section 1: "index con >= 3 guias").
export const MIN_INDEXABLE_POSTS = 3;

export const isBlogIndexIndexable = (locale: Locale, now: Date = new Date()): boolean =>
  listPosts(locale, now).length >= MIN_INDEXABLE_POSTS;

/**
 * The live URL of a post in each language, so its hreflang block only lists translations that
 * are actually published today.
 */
export function postLivePaths(
  group: string,
  now: Date = new Date(),
): Partial<Record<Locale, string>> {
  const paths: Partial<Record<Locale, string>> = {};
  for (const locale of LOCALES) {
    const match = listPosts(locale, now).find((post) => post.group === group);
    if (match) paths[locale] = match.path;
  }
  return paths;
}

/**
 * The guides hubs that are in the index today, keyed by locale. A hub stays noindex until it has
 * MIN_INDEXABLE_POSTS guides, and hreflang must never point at a noindex page, so the hreflang
 * block of a hub (in the head and in the sitemap) is built from this list only.
 */
export function indexableBlogIndexPaths(now: Date = new Date()): Partial<Record<Locale, string>> {
  const paths: Partial<Record<Locale, string>> = {};
  for (const locale of LOCALES) {
    if (isRoutable(locale) && isPublishedIndex(locale) && isBlogIndexIndexable(locale, now)) {
      paths[locale] = ROUTES.blog.paths[locale];
    }
  }
  return paths;
}

const isPublishedIndex = (locale: Locale): boolean =>
  (ROUTES.blog.published as readonly Locale[]).includes(locale);
