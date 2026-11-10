export const LOCALES = ['en', 'es'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALE_COOKIE = 'NEXT_LOCALE';

export const LOCALE_NAMES: Record<Locale, string> = { en: 'English', es: 'Español' };

export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && (LOCALES as readonly string[]).includes(value);

// Picks the best supported locale from an Accept-Language header ("es-ES,es;q=0.9,en;q=0.8").
export function matchLocale(header: string | null | undefined): Locale {
  if (!header) return DEFAULT_LOCALE;
  const ranked = header
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const q = params.find((param) => param.trim().startsWith('q='));
      return { lang: tag.trim().toLowerCase().split('-')[0], q: q ? Number(q.split('=')[1]) : 1 };
    })
    .filter((entry) => entry.lang && !Number.isNaN(entry.q))
    .sort((a, b) => b.q - a.q);
  const match = ranked.find((entry) => isLocale(entry.lang))?.lang;
  return isLocale(match) ? match : DEFAULT_LOCALE;
}
