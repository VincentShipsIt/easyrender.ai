import { notFound } from 'next/navigation';
import { isRoutableLocale, ROUTABLE_LOCALES } from '@/i18n/config';

// The non-English branches of the tree. English is at the root, so /en is not a URL: serving the
// same page twice would be the canibalisation hreflang exists to prevent.
//
// dynamicParams = false turns anything outside this list into a 404, which is the rule from the
// architecture: a language URL without approved copy does not exist. Opening a language means
// adding its messages file and its entry in ROUTABLE_LOCALES, and nothing else.
export const dynamicParams = false;

export function generateStaticParams() {
  return ROUTABLE_LOCALES.filter((locale) => locale !== 'en').map((lang) => ({ lang }));
}

export default async function LocaleLayout({ children, params }: LayoutProps<'/[lang]'>) {
  const { lang } = await params;
  if (!isRoutableLocale(lang) || lang === 'en') notFound();
  return children;
}
