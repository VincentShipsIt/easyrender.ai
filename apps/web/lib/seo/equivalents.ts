import type { Locale } from '@/i18n/config';
import { postLivePaths, readPosts } from '@/lib/blog/posts';
import { livePaths, ROUTE_KEYS, ROUTES } from './routes';

export type Equivalent = { locale: Locale; path: string };

/**
 * The same page in every language it is live in, for the language picker and for hreflang. A
 * path the registry does not know falls back to the homes, so the picker never links to a URL
 * that would 404.
 */
export function equivalentPaths(pathname: string, now: Date = new Date()): Equivalent[] {
  const path = pathname !== '/' && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

  for (const key of ROUTE_KEYS) {
    const paths = livePaths(key);
    if (Object.values(paths).includes(path)) return toList(paths);
  }

  const post = findPost(path, now);
  if (post) return toList(postLivePaths(post, now));

  return toList(livePaths('home'));
}

/**
 * What the language picker in the header lists. The page's own equivalents when it has at least
 * two, otherwise the homes, with this page kept for its own language: /compare is English only, and
 * the picker must not vanish there.
 */
export function pickerPaths(pathname: string, now: Date = new Date()): Equivalent[] {
  const own = equivalentPaths(pathname, now);
  if (own.length >= 2) return own;
  const homes = toList(livePaths('home'));
  const [page] = own;
  return page ? homes.map((home) => (home.locale === page.locale ? page : home)) : homes;
}

/** The post group whose URL this is, in any language. */
function findPost(path: string, now: Date): string | null {
  for (const locale of Object.keys(ROUTES.blog.paths) as Locale[]) {
    if (!path.startsWith(`${ROUTES.blog.paths[locale]}/`)) continue;
    const slug = path.slice(ROUTES.blog.paths[locale].length + 1);
    const match = readPosts(locale).find((post) => post.slug === slug);
    if (match && Date.parse(match.date) <= now.getTime()) return match.group;
  }
  return null;
}

const toList = (paths: Partial<Record<Locale, string>>): Equivalent[] =>
  (Object.entries(paths) as [Locale, string][]).map(([locale, path]) => ({ locale, path }));
