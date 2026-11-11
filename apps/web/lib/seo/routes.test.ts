import { describe, expect, it } from 'vitest';
import { HREFLANG, LOCALES, ROUTABLE_LOCALES } from '@/i18n/config';
import { isNoindexPath } from './noindex';
import { hreflangFor, isPublished, livePaths, ROUTE_KEYS, ROUTES } from './routes';
import { absoluteUrl, SITE_URL } from './site';

describe('the route registry', () => {
  it('gives every page a path in all six languages', () => {
    for (const key of ROUTE_KEYS) {
      for (const locale of LOCALES) {
        expect(ROUTES[key].paths[locale], `${key}/${locale}`).toMatch(/^\//);
      }
    }
  });

  it('prefixes every non-English path with its language', () => {
    for (const key of ROUTE_KEYS) {
      for (const locale of LOCALES) {
        if (locale === 'en') continue;
        expect(ROUTES[key].paths[locale], `${key}/${locale}`).toMatch(
          new RegExp(`^/${locale}(/|$)`),
        );
      }
    }
  });

  it('never reuses a path between two pages of the same language', () => {
    for (const locale of LOCALES) {
      const paths = ROUTE_KEYS.map((key) => ROUTES[key].paths[locale]);
      expect(new Set(paths).size, locale).toBe(paths.length);
    }
  });

  it('only publishes a language whose UI strings exist', () => {
    for (const key of ROUTE_KEYS) {
      for (const locale of ROUTES[key].published) {
        expect(ROUTABLE_LOCALES, `${key}/${locale}`).toContain(locale);
      }
    }
  });

  it('opens the six homes and nothing else in de, fr, it and pt', () => {
    expect(livePaths('home')).toEqual({
      en: '/',
      es: '/es',
      de: '/de',
      fr: '/fr',
      it: '/it',
      pt: '/pt',
    });
    // Routable for the home only: every other page in these languages is still a 404.
    for (const locale of ['de', 'fr', 'it', 'pt'] as const) {
      for (const key of ROUTE_KEYS) {
        if (key === 'home') continue;
        expect(isPublished(key, locale), `${key}/${locale}`).toBe(false);
      }
    }
  });

  it('hides the path of an unpublished language', () => {
    expect(livePaths('blog')).toEqual({ en: '/learn', es: '/es/guias' });
    // Declared in the registry, published nowhere yet, so it is not a URL in any language.
    expect(isPublished('compare', 'en')).toBe(false);
    expect(livePaths('compare')).toEqual({});
    // Pricing exists in English only until the Spanish copy lands.
    expect(livePaths('pricing')).toEqual({ en: '/credits' });
  });
});

describe('hreflang', () => {
  it('lists every tag of every live language plus x-default', () => {
    const alternates = hreflangFor(livePaths('home'));
    expect(alternates).toEqual({
      en: SITE_URL,
      es: `${SITE_URL}/es`,
      'es-ES': `${SITE_URL}/es`,
      de: `${SITE_URL}/de`,
      'de-DE': `${SITE_URL}/de`,
      'de-AT': `${SITE_URL}/de`,
      'de-CH': `${SITE_URL}/de`,
      fr: `${SITE_URL}/fr`,
      'fr-FR': `${SITE_URL}/fr`,
      it: `${SITE_URL}/it`,
      'it-IT': `${SITE_URL}/it`,
      pt: `${SITE_URL}/pt`,
      'pt-PT': `${SITE_URL}/pt`,
      'x-default': SITE_URL,
    });
    // Never an /en URL: English lives at the root.
    expect(Object.values(alternates ?? {}).some((href) => href.includes('/en'))).toBe(false);
  });

  it('points x-default at the English page', () => {
    const alternates = hreflangFor({ en: '/learn', es: '/es/guias' });
    expect(alternates?.['x-default']).toBe(absoluteUrl('/learn'));
  });

  it('is dropped when there is nothing to point at', () => {
    expect(hreflangFor({ en: '/credits' })).toBeUndefined();
    expect(hreflangFor({})).toBeUndefined();
  });

  it('only ever emits absolute canonical-host URLs', () => {
    for (const href of Object.values(hreflangFor(livePaths('home')) ?? {})) {
      expect(href.startsWith(`${SITE_URL}`)).toBe(true);
    }
  });

  it('never offers pt-BR', () => {
    expect(Object.values(HREFLANG).flat()).not.toContain('pt-BR');
    expect(HREFLANG.pt).toEqual(['pt', 'pt-PT']);
  });
});

describe('noindex paths', () => {
  it('covers the product surfaces and the ad landings', () => {
    for (const path of [
      '/explore',
      '/explore/chairs',
      '/hub',
      '/r/demo-armchair',
      '/lp/en/ecommerce',
      '/sign-in',
    ]) {
      expect(isNoindexPath(path), path).toBe(true);
    }
  });

  it('leaves the indexable tree alone', () => {
    for (const path of ['/', '/es', '/learn', '/learn/glb-vs-usdz', '/credits']) {
      expect(isNoindexPath(path), path).toBe(false);
    }
  });

  it('keeps every noindex path out of the registry', () => {
    for (const key of ROUTE_KEYS) {
      for (const locale of LOCALES) {
        expect(isNoindexPath(ROUTES[key].paths[locale]), `${key}/${locale}`).toBe(false);
      }
    }
  });
});
