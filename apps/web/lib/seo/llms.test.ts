import { describe, expect, it } from 'vitest';
import { LOCALES } from '@/i18n/config';
import { FAQ_KEYS } from '@/lib/faq';
import en from '@/messages/en.json';
import es from '@/messages/es.json';
import { faqText, llmsFullTxt, llmsTxt } from './llms';
import { NOINDEX_PREFIXES } from './noindex';
import { DISALLOWED_PREFIXES } from './routes';
import { absoluteUrl, SITE_URL } from './site';
import { localeEntries } from './sitemap';

// llms.txt has to say what the sitemaps say and what claims.md allows, nothing more.

const urlsIn = (text: string) =>
  [...text.matchAll(/\]\((https:\/\/[^)]+)\)/g)].map((match) => match[1] as string);

// Phrases claims.md forbids, in either language. Negations such as "not real-world measurements"
// are allowed, so these match the promise, not the word.
const FORBIDDEN = [
  /\bSTL\b/,
  /\bOBJ\b/,
  /\bFBX\b/,
  /3D[- ]print/i,
  /impresi[oó]n 3D/i,
  /\b(true|real)[- ]to[- ]size\b/i,
  /\bat real scale\b/i,
  /\b1:1\b/,
  /a tama[nñ]o real/i,
  /\bembed\b/i,
  /\bin (two|2) minutes\b/i,
];

describe('llms.txt', () => {
  const text = llmsTxt();

  it('follows the llms.txt shape: one H1, a summary blockquote, link sections', () => {
    expect(text.startsWith('# easyrender\n')).toBe(true);
    expect(text.match(/^# /gm)).toHaveLength(1);
    expect(text).toMatch(/^> .+/m);
    expect(text).toContain('## Pages');
  });

  it('lists exactly the indexable URLs of the sitemaps', () => {
    const sitemap = LOCALES.flatMap((locale) => localeEntries(locale)).map((entry) =>
      absoluteUrl(entry.path),
    );
    const listed = urlsIn(text).filter((url) => !url.endsWith('.txt'));
    expect(listed.sort()).toEqual([...sitemap].sort());
    expect(listed).toEqual(
      expect.arrayContaining([SITE_URL, `${SITE_URL}/es`, `${SITE_URL}/credits`]),
    );
  });

  it('never points at a noindex, app or API path, or at another host', () => {
    for (const url of urlsIn(text)) {
      expect(url.startsWith(SITE_URL), url).toBe(true);
      const path = url.slice(SITE_URL.length) || '/';
      for (const prefix of [...NOINDEX_PREFIXES, ...DISALLOWED_PREFIXES]) {
        expect(path.startsWith(prefix), `${url} vs ${prefix}`).toBe(false);
      }
    }
    expect(text).not.toMatch(/\/de\b|\/fr\b|\/it\b|\/pt\b/);
  });

  it('describes the product within claims.md', () => {
    expect(text).toContain('GLB and USDZ');
    expect(text).toMatch(/angle sheet/);
    expect(text).toMatch(/coming soon/);
    for (const pattern of FORBIDDEN) expect(text, String(pattern)).not.toMatch(pattern);
  });
});

describe('llms-full.txt', () => {
  const text = llmsFullTxt();

  it('carries every FAQ answer of both homes, with prices filled in', () => {
    for (const locale of ['en', 'es'] as const) {
      for (const item of faqText(locale)) {
        expect(text).toContain(item.question);
        expect(text).toContain(item.answer);
        expect(item.answer, item.question).not.toMatch(/\{\w+\}/);
      }
    }
  });

  it('stays within claims.md and away from noindex paths', () => {
    for (const pattern of FORBIDDEN) expect(text, String(pattern)).not.toMatch(pattern);
    for (const url of urlsIn(text)) {
      const path = url.slice(SITE_URL.length) || '/';
      for (const prefix of NOINDEX_PREFIXES) expect(path.startsWith(prefix), url).toBe(false);
    }
  });
});

describe('the home FAQ copy', () => {
  it('has every FAQ key in both languages', () => {
    for (const messages of [en, es]) {
      const items = messages.Landing.faq.items as Record<string, { q?: string; a?: string }>;
      for (const key of FAQ_KEYS) {
        expect(items[key]?.q, key).toBeTruthy();
        expect(items[key]?.a, key).toBeTruthy();
      }
    }
  });

  it('makes no roadmap promise about link-only sharing', () => {
    const answers = [en, es].map((messages) => messages.Landing.faq.items.public.a).join(' ');
    expect(answers).not.toMatch(/product queue|pedida al producto|link-only|solo con enlace/i);
  });
});
