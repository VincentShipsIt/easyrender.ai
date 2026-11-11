import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseFrontMatter } from '@/lib/blog/frontmatter';
import { type FaqItem, faqFromBody, fillPrices, stripComments } from '@/lib/blog/posts';
import { isInReview, isPublished, ROUTES } from '@/lib/seo/routes';

// Comparison pages are content files, like the guides: content/compare/en/{slug}.md, with the
// same front matter, the same markdown subset (tables and the FAQ accordion included) and the
// same price tokens. English only.
//
//   ---
//   group: compare-meshy        stable id, for a translation later
//   title: Meshy alternative …  the <h1> and the <title>
//   description: One sentence.  the meta description
//   keyword: meshy alternative  the target query, for the record
//   updated: 2026-11-11         the last real change
//   cta: One sentence above the closing button.
//   ---
//
// English is published (`published` on ROUTES.compare): served at /compare and /compare/{slug},
// listed in the sitemap and llms.txt, and safe to link from the guides. Other locales wait.

export type ComparePage = {
  slug: string;
  group: string;
  title: string;
  description: string;
  keyword?: string;
  updated?: string;
  cta?: string;
  body: string;
  faq: FaqItem[];
  /** Site-relative URL. */
  path: string;
};

const CONTENT_ROOT = join(process.cwd(), 'content', 'compare', 'en');

export const comparePath = (slug: string): string => `${ROUTES.compare.paths.en}/${slug}`;

/** The English /compare hub: title and description for the page, the sitemap and llms.txt. */
export const COMPARE_INDEX = {
  title: 'Compare 3D modeling methods and tools',
  description:
    'Compare 3D modeling methods and tools for product work: a modeler vs AI, 360 vs 3D, photogrammetry, Meshy and Tripo.',
} as const;

export const isComparePublished = (): boolean => isPublished('compare', 'en');

/** One content file as a page, or the reason it cannot be one. */
export function parseComparePage(
  slug: string,
  source: string,
): { page: ComparePage } | { error: string } {
  const { data, body } = parseFrontMatter(source);
  for (const field of ['group', 'title', 'description'] as const) {
    if (!data[field]) return { error: `missing ${field}` };
  }
  const text = fillPrices(stripComments(body));
  if (!text) return { error: 'empty body' };
  return {
    page: {
      slug,
      group: data.group as string,
      title: fillPrices(data.title as string),
      description: fillPrices(data.description as string),
      ...(data.keyword ? { keyword: data.keyword } : {}),
      ...(data.updated ? { updated: data.updated } : {}),
      ...(data.cta ? { cta: fillPrices(data.cta) } : {}),
      body: text,
      faq: faqFromBody(text),
      path: comparePath(slug),
    },
  };
}

/** Every comparison page written, in file-name order. A malformed file is skipped and logged. */
export function readComparePages(root: string = CONTENT_ROOT): ComparePage[] {
  let files: string[];
  try {
    files = readdirSync(root);
  } catch {
    files = [];
  }
  const pages: ComparePage[] = [];
  for (const file of files.sort()) {
    if (!file.endsWith('.md')) continue;
    const result = parseComparePage(file.slice(0, -3), readFileSync(join(root, file), 'utf8'));
    if ('error' in result) {
      console.warn(`compare: skipping en/${file}: ${result.error}`);
      continue;
    }
    pages.push(result.page);
  }
  return pages;
}

/** True while the English comparisons are served for review only (noindex, listed nowhere). */
export const isCompareInReview = (): boolean => isInReview('compare', 'en');

/** The page to serve at /compare/{slug}, or null (a 404) when compare is not open in English. */
export function getComparePage(slug: string): ComparePage | null {
  if (!isCompareInReview() && !isComparePublished()) return null;
  return readComparePages().find((page) => page.slug === slug) ?? null;
}

/** Every comparison page, or an empty list when compare is not open in English. */
export function listComparePages(): ComparePage[] {
  if (!isCompareInReview() && !isComparePublished()) return [];
  return readComparePages();
}
