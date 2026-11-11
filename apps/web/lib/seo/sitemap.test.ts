import { describe, expect, it } from 'vitest';
import { LOCALES } from '@/i18n/config';
import { NOINDEX_PREFIXES } from './noindex';
import { SITE_URL } from './site';
import { localeEntries, localeSitemapXml, sitemapIndexXml, sitemapLocales } from './sitemap';

// Guides go live on their `date`, so a test that reads the real clock changes result the day a
// guide lands. These pin `now`: before the first guide for the registry pages alone, and after it
// to check that a live guide is listed where its language is open and nowhere else.
const BEFORE_GUIDES = new Date('2026-11-01T00:00:00Z');
const FIRST_GUIDE_OUT = new Date('2026-11-11T12:00:00Z');
const ALL_WEEK_1_GUIDES_OUT = new Date('2026-12-01T00:00:00Z');

describe('the per-language sitemaps', () => {
  it('exist for every language with a live home', () => {
    expect(sitemapLocales()).toEqual(['en', 'es', 'de', 'fr', 'it', 'pt']);
  });

  it('lists the English home and pricing page, and each other home alone', () => {
    const paths = (locale: (typeof LOCALES)[number]) =>
      localeEntries(locale, BEFORE_GUIDES).map((entry) => entry.path);
    expect(paths('en')).toEqual(['/', '/credits']);
    expect(paths('es')).toEqual(['/es']);
    // Only the home is open in these languages: no guides, pricing or legal URL is listed.
    for (const locale of ['de', 'fr', 'it', 'pt'] as const) {
      expect(paths(locale), locale).toEqual([`/${locale}`]);
    }
  });

  it('adds a live guide to the English sitemap only', () => {
    const paths = (locale: (typeof LOCALES)[number]) =>
      localeEntries(locale, FIRST_GUIDE_OUT).map((entry) => entry.path);
    expect(paths('en')).toEqual(['/', '/credits', '/learn/how-to-make-a-3d-model-from-photos']);
    for (const locale of ['de', 'fr', 'it', 'pt'] as const) {
      expect(paths(locale), locale).toEqual([`/${locale}`]);
    }
  });

  it('gives each home the full hreflang block of the six homes', () => {
    const xml = localeSitemapXml('de');
    expect(xml).toContain(`<loc>${SITE_URL}/de</loc>`);
    for (const [tag, path] of [
      ['en', ''],
      ['es', '/es'],
      ['es-ES', '/es'],
      ['de', '/de'],
      ['fr', '/fr'],
      ['it', '/it'],
      ['pt-PT', '/pt'],
      ['x-default', ''],
    ]) {
      expect(xml, tag).toContain(`hreflang="${tag}" href="${SITE_URL}${path}"`);
    }
  });

  it('leaves the guides hub out while it is thin', () => {
    for (const locale of LOCALES) {
      expect(
        localeEntries(locale, FIRST_GUIDE_OUT).map((entry) => entry.path),
        locale,
      ).not.toContain('/learn');
    }
  });

  it('lists the English guides hub once it has enough guides', () => {
    expect(localeEntries('en', ALL_WEEK_1_GUIDES_OUT).map((entry) => entry.path)).toContain(
      '/learn',
    );
  });

  it('never lists a noindex path', () => {
    const xml = LOCALES.map((locale) => localeSitemapXml(locale)).join('');
    for (const prefix of NOINDEX_PREFIXES) {
      expect(xml, prefix).not.toContain(`${SITE_URL}${prefix}`);
    }
  });

  it('writes absolute canonical-host URLs with an x-default alternate', () => {
    const xml = localeSitemapXml('es');
    expect(xml).toContain(`<loc>${SITE_URL}/es</loc>`);
    expect(xml).toContain(`hreflang="x-default" href="${SITE_URL}"`);
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
    expect(xml).not.toMatch(/vercel\.app|localhost/);
  });

  it('gives a single-language page no hreflang block', () => {
    const xml = localeSitemapXml('en');
    const pricing = xml.slice(xml.indexOf('/credits'));
    expect(pricing).not.toContain('xhtml:link');
  });
});

describe('the sitemap index', () => {
  it('points only at the sitemaps that exist', () => {
    const xml = sitemapIndexXml();
    expect(xml).toContain(`<loc>${SITE_URL}/sitemap-en.xml</loc>`);
    expect(xml).toContain(`<loc>${SITE_URL}/sitemap-es.xml</loc>`);
    for (const locale of ['de', 'fr', 'it', 'pt']) {
      expect(xml).toContain(`<loc>${SITE_URL}/sitemap-${locale}.xml</loc>`);
    }
  });
});
