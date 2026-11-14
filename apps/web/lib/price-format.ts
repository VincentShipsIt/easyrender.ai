import { intlLocale } from '@/i18n/config';

// Prices and counts on the localized pages. next-intl formats with the bare locale of the URL, and
// Intl reads a bare 'pt' as Brazil ("US$ 0,20"); these go through intlLocale so Portugal gets
// "0,20 US$". The pricing cards, the FAQ (page and FAQPage data) and llms-full.txt all use them.

/** A USD amount in the visitor's locale, e.g. 0.2 → "0,20 US$" for pt. */
export function formatUsd(
  locale: string,
  value: number,
  options: Omit<Intl.NumberFormatOptions, 'style' | 'currency'> = {},
): string {
  return new Intl.NumberFormat(intlLocale(locale), {
    ...options,
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

/** An amount in the buyer's currency and the visitor's locale, e.g. 18 EUR in es → "18 €". */
export function formatMoney(
  locale: string,
  value: number,
  currency: 'usd' | 'eur',
  options: Omit<Intl.NumberFormatOptions, 'style' | 'currency'> = {},
): string {
  return new Intl.NumberFormat(intlLocale(locale), {
    ...options,
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(value);
}

/** A plain number (credit counts) in the visitor's locale. */
export function formatCount(locale: string, value: number): string {
  return new Intl.NumberFormat(intlLocale(locale)).format(value);
}
