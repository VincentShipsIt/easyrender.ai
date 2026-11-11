import { headers } from 'next/headers';
import { getLocale, getTranslations } from 'next-intl/server';
import { LocaleMenu } from '@/components/locale-menu';
import { HTML_LANG, LOCALE_NAMES, type Locale, PATH_HEADER } from '@/i18n/config';
import { pickerPaths } from '@/lib/seo/equivalents';
import { cn } from '@/lib/utils';

/**
 * Links to the same page in the other languages, which is what hreflang promises, behind a
 * compact dropdown (components/locale-menu). Server rendered and crawlable: every option is a
 * plain <a href hreflang> in the HTML even while the list is closed, with no redirect by
 * Accept-Language. A page in one language only (/credits) lists the homes of the others, so the
 * picker is in every header, signed in or not. A click also stores the choice for the marketing root (components/locale-link).
 */
export async function LocaleSwitcher({ className }: { className?: string } = {}) {
  const [locale, t, headerList] = await Promise.all([
    getLocale(),
    getTranslations('LocaleSwitcher'),
    headers(),
  ]);
  const options = pickerPaths(headerList.get(PATH_HEADER) ?? '/');
  if (options.length < 2) return null;

  return (
    <nav aria-label={t('label')} className={cn('flex items-center', className)}>
      <LocaleMenu
        current={locale as Locale}
        label={t('label')}
        options={options.map(({ locale: option, path }) => ({
          locale: option,
          path,
          hrefLang: HTML_LANG[option],
          name: LOCALE_NAMES[option],
        }))}
      />
    </nav>
  );
}
