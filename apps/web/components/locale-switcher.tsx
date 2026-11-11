import { Languages } from 'lucide-react';
import { headers } from 'next/headers';
import { getLocale, getTranslations } from 'next-intl/server';
import { LocaleLink } from '@/components/locale-link';
import { HTML_LANG, LOCALE_NAMES, PATH_HEADER } from '@/i18n/config';
import { equivalentPaths } from '@/lib/seo/equivalents';
import { cn } from '@/lib/utils';

/**
 * Links to the same page in the other languages, which is what hreflang promises. Server
 * rendered and crawlable: every option is a plain <a href> in the HTML, with no redirect by
 * Accept-Language. A click also stores the choice for the marketing root (components/locale-link).
 */
export async function LocaleSwitcher({ className }: { className?: string } = {}) {
  const [locale, t, headerList] = await Promise.all([
    getLocale(),
    getTranslations('LocaleSwitcher'),
    headers(),
  ]);
  const options = equivalentPaths(headerList.get(PATH_HEADER) ?? '/');
  if (options.length < 2) return null;

  return (
    <nav aria-label={t('label')} className={cn('flex items-center gap-1 text-sm', className)}>
      <Languages className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      {options.map(({ locale: option, path }) => (
        <LocaleLink
          key={option}
          locale={option}
          href={path}
          hrefLang={HTML_LANG[option]}
          title={LOCALE_NAMES[option]}
          aria-current={option === locale ? 'true' : undefined}
          className={cn(
            'rounded px-2 py-1.5 font-medium transition-colors hover:text-foreground md:px-1 md:py-1',
            option === locale ? 'text-foreground' : 'text-muted-foreground',
          )}
        >
          {option.toUpperCase()}
        </LocaleLink>
      ))}
    </nav>
  );
}
