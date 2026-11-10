import { HREFLANG, LOCALES, type Locale, ROUTABLE_LOCALES } from '@/i18n/config';
import { absoluteUrl } from './site';

// The single source of truth for the indexable tree. One entry per page that exists in several
// languages, with the native slug of each. Canonical, hreflang, the language picker and every
// sitemap read from here, so a hreflang link can never point at a 404: a locale missing from
// `published` is not rendered, not linked and not listed.
//
// Slugs come from canales/04-seo/ARQUITECTURA-SEO.md table 1.1 and equivalencias-hreflang.csv.
// They are provisional for de/fr/it/pt until the native reviewer signs them off, which is also
// why those locales are unpublished: the slug can still change without breaking a live URL.

export type ChangeFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type RouteEntry = {
  /** Site-relative path per locale. English has no prefix. */
  paths: Record<Locale, string>;
  /** Locales whose copy is written and reviewed. Everything else 404s. */
  published: readonly Locale[];
  priority: number;
  changeFrequency: ChangeFrequency;
};

export const ROUTES = {
  home: {
    paths: { en: '/', es: '/es', de: '/de', fr: '/fr', it: '/it', pt: '/pt' },
    published: ['en', 'es'],
    priority: 1,
    changeFrequency: 'weekly',
  },
  blog: {
    paths: {
      en: '/learn',
      es: '/es/guias',
      de: '/de/ratgeber',
      fr: '/fr/guides',
      it: '/it/guide',
      pt: '/pt/guias',
    },
    published: ['en', 'es'],
    priority: 0.7,
    changeFrequency: 'daily',
  },
  pricing: {
    paths: {
      en: '/credits',
      es: '/es/precios',
      de: '/de/preise',
      fr: '/fr/tarifs',
      it: '/it/prezzi',
      pt: '/pt/precos',
    },
    published: ['en'],
    priority: 0.8,
    changeFrequency: 'monthly',
  },
  // Declared so the slugs are agreed and reserved, unpublished until the copy exists. Adding a
  // locale here without a page under app/ would 404, so each one lands with its route.
  compare: {
    paths: {
      en: '/compare',
      es: '/es/comparativas',
      de: '/de/vergleich',
      fr: '/fr/comparatifs',
      it: '/it/confronti',
      pt: '/pt/comparacoes',
    },
    published: [],
    priority: 0.6,
    changeFrequency: 'monthly',
  },
  services: {
    paths: {
      en: '/3d-modeling-services',
      es: '/es/render-de-producto',
      de: '/de/produktvisualisierung',
      fr: '/fr/modelisation-3d-produit',
      it: '/it/rendering-prodotto',
      pt: '/pt/modelacao-3d-de-produto',
    },
    published: [],
    priority: 0.7,
    changeFrequency: 'monthly',
  },
  privacy: {
    paths: {
      en: '/privacy',
      es: '/es/privacidad',
      de: '/de/datenschutz',
      fr: '/fr/confidentialite',
      it: '/it/privacy',
      pt: '/pt/privacidade',
    },
    published: [],
    priority: 0.3,
    changeFrequency: 'yearly',
  },
  terms: {
    paths: {
      en: '/terms',
      es: '/es/terminos',
      de: '/de/agb',
      fr: '/fr/conditions-generales',
      it: '/it/termini',
      pt: '/pt/termos',
    },
    published: [],
    priority: 0.3,
    changeFrequency: 'yearly',
  },
  cookies: {
    paths: {
      en: '/cookies',
      es: '/es/cookies',
      de: '/de/cookies',
      fr: '/fr/cookies',
      it: '/it/cookie',
      pt: '/pt/cookies',
    },
    published: [],
    priority: 0.3,
    changeFrequency: 'yearly',
  },
  legal: {
    paths: {
      en: '/legal',
      es: '/es/aviso-legal',
      de: '/de/impressum',
      fr: '/fr/mentions-legales',
      it: '/it/note-legali',
      pt: '/pt/aviso-legal',
    },
    published: [],
    priority: 0.3,
    changeFrequency: 'yearly',
  },
} as const satisfies Record<string, RouteEntry>;

export type RouteKey = keyof typeof ROUTES;

export const ROUTE_KEYS = Object.keys(ROUTES) as RouteKey[];

/** Paths crawlers should not fetch at all. */
export const DISALLOWED_PREFIXES = ['/api/', '/account', '/library', '/dashboard', '/connectors'];

export const isPublished = (key: RouteKey, locale: Locale): boolean =>
  (ROUTES[key].published as readonly Locale[]).includes(locale);

/** Every locale a page is live in, in LOCALES order. */
export function publishedLocales(key: RouteKey): Locale[] {
  return LOCALES.filter((locale) => isPublished(key, locale));
}

/** The locales that can be served at all: routable (UI strings exist) and published. */
export function liveLocales(key: RouteKey): Locale[] {
  return publishedLocales(key).filter((locale) =>
    (ROUTABLE_LOCALES as readonly Locale[]).includes(locale),
  );
}

export type Alternates = Record<string, string>;

/**
 * The hreflang block for a group of equivalent pages. Takes the live paths only, so there is no
 * way to emit a link to a page that does not answer 200. x-default is always the English one;
 * with no English version the block is dropped, because a group without x-default is worse than
 * no block at all.
 */
export function hreflangFor(paths: Partial<Record<Locale, string>>): Alternates | undefined {
  const entries = LOCALES.filter((locale) => paths[locale]);
  if (entries.length < 2) return undefined;
  const alternates: Alternates = {};
  for (const locale of entries) {
    for (const tag of HREFLANG[locale]) {
      alternates[tag] = absoluteUrl(paths[locale] as string);
    }
  }
  if (paths.en) alternates['x-default'] = absoluteUrl(paths.en);
  return alternates;
}

/** Live paths of a registry page, keyed by locale, ready for hreflangFor or a language picker. */
export function livePaths(key: RouteKey): Partial<Record<Locale, string>> {
  const paths: Partial<Record<Locale, string>> = {};
  for (const locale of liveLocales(key)) paths[locale] = ROUTES[key].paths[locale];
  return paths;
}
