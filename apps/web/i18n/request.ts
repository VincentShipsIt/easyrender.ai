import { headers } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { DEFAULT_LOCALE, isRoutableLocale, LOCALE_HEADER } from './config';

// The language comes from the URL and nothing else: English at the root, the rest under their
// prefix. proxy.ts puts the prefix in a header so the root layout and every server component
// agree without a cookie and without sniffing Accept-Language, which would make one URL answer
// in different languages (arch doc, section 4.4).
export default getRequestConfig(async ({ locale: override }) => {
  const fromUrl = (await headers()).get(LOCALE_HEADER);
  const locale = isRoutableLocale(override)
    ? override
    : isRoutableLocale(fromUrl)
      ? fromUrl
      : DEFAULT_LOCALE;
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
