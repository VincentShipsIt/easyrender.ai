import { Languages } from 'lucide-react';
import { headers } from 'next/headers';
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { HTML_LANG, LOCALE_NAMES, PATH_HEADER } from '@/i18n/config';
import { equivalentPaths } from '@/lib/seo/equivalents';
import { cn } from '@/lib/utils';

/**
 * Links to the same page in the other languages, which is what hreflang promises. Server
 * rendered and crawlable: no cookie, no redirect by Accept-Language, no client JavaScript.
 */
export async function LocaleSwitcher() {
  const [locale, t, headerList] = await Promise.all([
    getLocale(),
    getTranslations('LocaleSwitcher'),
    headers(),
  ]);
  const options = equivalentPaths(headerList.get(PATH_HEADER) ?? '/');
  if (options.length < 2) return null;

  return (
    <nav aria-label={t('label')} className="flex items-center gap-1 text-sm">
      <Languages className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      {options.map(({ locale: option, path }) => (
        <Link
          key={option}
          href={path}
          hrefLang={HTML_LANG[option]}
          title={LOCALE_NAMES[option]}
          aria-current={option === locale ? 'true' : undefined}
          className={cn(
            'rounded px-1.5 py-1 font-medium transition-colors hover:text-foreground',
            option === locale ? 'text-foreground' : 'text-muted-foreground',
          )}
        >
          {option.toUpperCase()}
        </Link>
      ))}
    </nav>
  );
}
