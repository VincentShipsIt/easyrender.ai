import { describe, expect, it } from 'vitest';
import { LOCALES } from '@/i18n/config';
import { NOINDEX_PREFIXES } from './noindex';
import { ROUTES } from './routes';
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

  it('lists the English home, pricing and models pages, and localized cookie information', () => {
    const paths = (locale: (typeof LOCALES)[number]) =>
      localeEntries(locale, BEFORE_GUIDES).map((entry) => entry.path);
    expect(paths('en')).toEqual([
      '/',
      '/pricing',
      '/mcp',
      '/image-to-3d-api',
      '/models',
      '/compare',
      '/compare/360-vs-3d',
      '/compare/3d-modeler-vs-ai',
      '/compare/meshy',
      '/compare/photogrammetry-software',
      '/compare/tripo',
      '/cookies',
    ]);
    expect(paths('es')).toEqual([
      '/es',
      '/es/precios',
      '/es/mcp',
      '/es/api-imagen-a-3d',
      '/es/modelos',
      '/es/cookies',
    ]);
    // Homes and cookie information are open; guides remain unpublished.
    for (const locale of ['de', 'fr', 'it', 'pt'] as const) {
      expect(paths(locale), locale).toEqual([
        `/${locale}`,
        ROUTES.pricing.paths[locale],
        ROUTES.cookies.paths[locale],
      ]);
    }
  });

  it('adds a live guide to the English sitemap only', () => {
    const paths = (locale: (typeof LOCALES)[number]) =>
      localeEntries(locale, FIRST_GUIDE_OUT).map((entry) => entry.path);
    expect(paths('en')).toEqual([
      '/',
      '/pricing',
      '/mcp',
      '/image-to-3d-api',
      '/models',
      '/compare',
      '/compare/360-vs-3d',
      '/compare/3d-modeler-vs-ai',
      '/compare/meshy',
      '/compare/photogrammetry-software',
      '/compare/tripo',
      '/cookies',
      '/learn/how-to-make-a-3d-model-from-photos',
    ]);
    for (const locale of ['de', 'fr', 'it', 'pt'] as const) {
      expect(paths(locale), locale).toEqual([
        `/${locale}`,
        ROUTES.pricing.paths[locale],
        ROUTES.cookies.paths[locale],
      ]);
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
    const start = xml.indexOf('/compare</loc>');
    const compare = xml.slice(start, xml.indexOf('</url>', start));
    expect(compare).not.toContain('xhtml:link');
  });

  it('publishes the API landing separately from MCP with localized alternates', () => {
    for (const locale of ['en', 'es'] as const) {
      const entry = localeEntries(locale, BEFORE_GUIDES).find(
        (item) => item.path === (locale === 'en' ? '/image-to-3d-api' : '/es/api-imagen-a-3d'),
      );
      expect(entry?.alternates).toEqual({ en: '/image-to-3d-api', es: '/es/api-imagen-a-3d' });
    }
  });

  it('publishes MCP with reciprocal English and Spanish alternates', () => {
    for (const [locale, path] of [
      ['en', '/mcp'],
      ['es', '/es/mcp'],
    ] as const) {
      const entry = localeEntries(locale, BEFORE_GUIDES).find((item) => item.path === path);
      expect(entry?.alternates).toEqual({ en: '/mcp', es: '/es/mcp' });
    }
  });

  it('gives the pricing page its English and Spanish alternates', () => {
    const xml = localeSitemapXml('en');
    const start = xml.indexOf('/pricing</loc>');
    const pricing = xml.slice(start, xml.indexOf('</url>', start));
    expect(pricing).toContain(`hreflang="es" href="${SITE_URL}/es/precios"`);
    expect(pricing).toContain(`hreflang="x-default" href="${SITE_URL}/pricing"`);
  });

  // /evals is noindex while it has no run to show, so the sitemap must not offer it. It joins the
  // sitemap on the day the first run is published (see lib/evals.test.ts for the empty file).
  it('leaves the evals page out while no run is published', () => {
    for (const locale of ['en', 'es'] as const) {
      const paths = localeEntries(locale, BEFORE_GUIDES).map((entry) => entry.path);
      expect(paths, locale).not.toContain(ROUTES.evals.paths[locale]);
    }
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
