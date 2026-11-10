// The marketing-root language preference, shared by proxy.ts and the language picker in the
// browser. Kept apart from lib/home-locale.ts so the picker does not ship the route registry.
export const HOME_LOCALE_COOKIE = 'er_home_locale';
export const HOME_LOCALE_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * Every request header the root's answer depends on, for `Vary`. Accept-Language is not one of
 * them: the country decides, and in doubt the answer is English.
 */
export const HOME_VARY = ['x-vercel-ip-country', 'Cookie', 'User-Agent', 'Referer'] as const;
