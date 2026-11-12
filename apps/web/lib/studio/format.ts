import { intlLocale } from '@/i18n/config';

// Numbers on the page (sizes, triangle counts, mass) follow the visitor's locale (pt as pt-PT).
export function createFormat(siteLocale: string) {
  const locale = intlLocale(siteLocale);
  const whole = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
  const tenth = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  const cm = (metres: number) => tenth.format(metres * 100);
  return {
    int: (value: number) => whole.format(value),
    cm,
    dims: (item: { dims: readonly number[] }) => `${item.dims.map(cm).join(' × ')} cm`,
    kg: (value: number) =>
      `${new Intl.NumberFormat(locale, { maximumFractionDigits: value < 2 ? 2 : 1 }).format(value)} kg`,
    fixed: (value: number, digits = 2) =>
      new Intl.NumberFormat(locale, {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      }).format(value),
  };
}

export type Format = ReturnType<typeof createFormat>;
