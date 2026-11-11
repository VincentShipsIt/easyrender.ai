import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { LOCALES } from '@/i18n/config';
import { BLOG_IMAGES, parseImage } from '@/lib/blog/images';
import { heroSource, parseBlocks } from '@/lib/blog/markdown';
import { llmsFullTxt, llmsTxt } from '@/lib/seo/llms';
import { isNoindexPath } from '@/lib/seo/noindex';
import { postTitle } from '@/lib/seo/pages';
import { localeSitemapXml, sitemapIndexXml } from '@/lib/seo/sitemap';
import { getComparePage, isCompareInReview, readComparePages } from './pages';

// The comparison drafts: written to the same bar as the guides, and kept out of public view
// while they wait for Jorge's go-ahead. If one of these fails, either the copy broke a rule or
// a compare URL leaked into a place that would publish it.

const REVIEW_SLUGS = ['360-vs-3d', '3d-modeler-vs-ai', 'meshy', 'photogrammetry-software', 'tripo'];

const pages = readComparePages();
const ROOT = process.cwd();
const raw = (slug: string) =>
  readFileSync(join(ROOT, 'content', 'compare', 'en', `${slug}.md`), 'utf8');

/** Every file under a directory, recursively, with one of the given extensions. */
function filesUnder(dir: string, extensions: string[]): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...filesUnder(path, extensions));
    else if (extensions.some((extension) => name.endsWith(extension))) out.push(path);
  }
  return out;
}

describe('the comparison drafts', () => {
  it('are the five pages under review', () => {
    expect(pages.map((page) => page.slug)).toEqual(REVIEW_SLUGS);
    expect(isCompareInReview()).toBe(true);
    for (const slug of REVIEW_SLUGS) expect(getComparePage(slug)?.path).toBe(`/compare/${slug}`);
    expect(getComparePage('does-not-exist')).toBeNull();
  });
});

describe.each(pages.map((page) => [page.slug, page] as const))('compare page %s', (slug, page) => {
  it('fits a search result and records its keyword and last change', () => {
    expect(page.title.length).toBeLessThanOrEqual(60);
    expect(postTitle(page.title).length).toBeLessThanOrEqual(60);
    expect(page.description.length).toBeLessThanOrEqual(160);
    expect(page.keyword).toBeTruthy();
    expect(page.updated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('ends with an FAQ accordion of 3 to 6 questions', () => {
    expect(page.faq.length).toBeGreaterThanOrEqual(3);
    expect(page.faq.length).toBeLessThanOrEqual(6);
  });

  it('opens with its own illustration directly under the first paragraph', () => {
    const blocks = parseBlocks(page.body);
    expect(blocks[0]?.kind).toBe('paragraph');
    const hero = heroSource(blocks);
    const src = `/compare/illustrations/${slug}/hero.webp`;
    expect(hero).toBe(src);
    expect(BLOG_IMAGES[src]).toEqual({ width: 1280, height: 720 });
    expect(
      statSync(join(ROOT, 'public', 'compare', 'illustrations', slug, 'hero.webp')).isFile(),
    ).toBe(true);

    const image = page.body
      .split('\n')
      .map(parseImage)
      .find((item) => item?.src === src);
    expect(image?.alt).toMatch(/^Illustration of /);
    expect(image?.caption).toMatch(/^Illustration, not an easyrender result:/);
    expect(raw(slug)).not.toMatch(/ILLUSTRATION PENDING/);
  });

  it('types no easyrender price and leaves no token unfilled', () => {
    expect(page.body).not.toMatch(/\{\{\w+\}\}/);
    // Competitor prices are quoted from their pages; ours only ever come from the harness.
    for (const sentence of raw(slug).split(/(?<=[.?!])\s+/)) {
      if (/easyrender/i.test(sentence) && /\d+\s*credits?\b/i.test(sentence)) {
        expect(sentence, sentence).toMatch(/\{\{\w+\}\}/);
      }
    }
  });

  it('follows the tone guide: no em dashes, exclamations or stock AI phrases', () => {
    const text = `${page.title}\n${page.description}\n${page.body}`;
    expect(text).not.toMatch(/—/);
    expect(page.body.replace(/`[^`]*`/g, '')).not.toMatch(/!(?!\[)/);
    expect(text).not.toMatch(
      /\b(delve|unlock|elevate|leverage|landscape|seamless(ly)?|game-changer|tapestry|revolutioni[sz]e|cutting-edge|crucial|robust|in today's|in summary|ultimately|it's not just)\b/i,
    );
  });

  it('respects claims.md: no real-world scale, no 3D printing offer, no embed promise', () => {
    const text = page.body.toLowerCase();
    expect(text).not.toMatch(
      /\b(to scale|true-to-size|true to size|real-world size|will it fit\?)/,
    );
    for (const sentence of text.split(/(?<=[.?!])\s+/)) {
      if (sentence.includes('easyrender') && /\b(stl|3d print|embed)/.test(sentence)) {
        expect(sentence).toMatch(/\bnot\b|\bno\b/);
      }
    }
  });

  it('cites its outside facts with links to the pages they come from', () => {
    // An alternative page cites mostly the competitor's own docs and pricing, so this counts
    // distinct pages, not distinct sites.
    const external = new Set(
      [...page.body.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)].map((m) => m[1] as string),
    );
    expect(external.size).toBeGreaterThanOrEqual(3);
  });
});

describe('while they are in review', () => {
  it('are noindex at every path', () => {
    for (const page of pages) expect(isNoindexPath(page.path), page.path).toBe(true);
  });

  it('are in no sitemap and no llms.txt', () => {
    const published = [
      sitemapIndexXml(),
      ...LOCALES.map((locale) => localeSitemapXml(locale)),
      llmsTxt(),
      llmsFullTxt(),
    ].join('\n');
    expect(published).not.toMatch(/\/compare\b/);
  });

  it('are linked from nowhere on the public site: no nav, home, message or guide', () => {
    const sources = [
      ...filesUnder(join(ROOT, 'app'), ['.ts', '.tsx']),
      ...filesUnder(join(ROOT, 'components'), ['.ts', '.tsx']),
      ...filesUnder(join(ROOT, 'messages'), ['.json']),
      ...filesUnder(join(ROOT, 'content', 'blog'), ['.md']),
    ].filter(
      (file) =>
        !file.includes(`${join('app', 'compare')}`) &&
        !file.includes(`${join('components', 'compare')}`),
    );
    for (const file of sources) {
      expect(readFileSync(file, 'utf8'), file).not.toMatch(/["'(`]\/compare\b/);
    }
  });
});
