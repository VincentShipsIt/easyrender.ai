import { describe, expect, it } from 'vitest';
import { LOCALES } from '@/i18n/config';
import { equivalentPaths, pickerPaths } from './equivalents';
import { ROUTES } from './routes';

const homes = LOCALES.map((locale) => ROUTES.home.paths[locale]);

describe('pickerPaths', () => {
  it('lists a page in every language it is live in', () => {
    expect(pickerPaths('/es').map((option) => option.path)).toEqual(homes);
  });

  it('links the pricing page in all six languages', () => {
    expect(equivalentPaths('/pricing').map((option) => option.path)).toEqual([
      '/pricing',
      '/es/precios',
      '/de/preise',
      '/fr/tarifs',
      '/it/prezzi',
      '/pt/precos',
    ]);
    expect(equivalentPaths('/es/precios').map((option) => option.locale)).toEqual(LOCALES);
  });

  it('keeps the picker on a page in one language, linking the other homes', () => {
    // /compare is English only.
    expect(equivalentPaths('/compare')).toHaveLength(1);
    const options = pickerPaths('/compare');
    expect(options).toHaveLength(LOCALES.length);
    expect(options.find((option) => option.locale === 'en')?.path).toBe('/compare');
    expect(options.find((option) => option.locale === 'de')?.path).toBe('/de');
  });

  it('falls back to the homes for the signed-in app', () => {
    for (const path of ['/dashboard', '/library', '/connectors', '/account', '/hub', '/sign-in'])
      expect(pickerPaths(path).length, path).toBe(LOCALES.length);
  });
});
