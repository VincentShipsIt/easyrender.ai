import { describe, expect, it } from 'vitest';
import { LOCALES } from '@/i18n/config';
import { NOINDEX_PREFIXES } from './noindex';
import { SITE_URL } from './site';
import { localeEntries, localeSitemapXml, sitemapIndexXml, sitemapLocales } from './sitemap';

// No posts are published yet, so these assert the shape and the exclusions, which are the parts
// that must hold on the day the first post lands.

describe('the per-language sitemaps', () => {
  it('only exist for languages that have something to list', () => {
    expect(sitemapLocales()).toEqual(['en', 'es']);
    for (const locale of ['de', 'fr', 'it', 'pt'] as const) {
      expect(localeEntries(locale), locale).toEqual([]);
    }
  });

  it('lists the English home and pricing page, and the Spanish home', () => {
    expect(localeEntries('en').map((entry) => entry.path)).toEqual(['/', '/credits']);
    expect(localeEntries('es').map((entry) => entry.path)).toEqual(['/es']);
  });

  it('leaves the guides hub out while it is thin', () => {
    for (const locale of LOCALES) {
      expect(
        localeEntries(locale).map((entry) => entry.path),
        locale,
      ).not.toContain('/learn');
    }
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
    expect(xml).not.toContain('sitemap-de.xml');
  });
});
