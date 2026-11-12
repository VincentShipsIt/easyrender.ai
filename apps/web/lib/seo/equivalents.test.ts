import { describe, expect, it } from 'vitest';
import { LOCALES } from '@/i18n/config';
import { equivalentPaths, pickerPaths } from './equivalents';
import { ROUTES } from './routes';

const homes = LOCALES.map((locale) => ROUTES.home.paths[locale]);

describe('pickerPaths', () => {
  it('lists a page in every language it is live in', () => {
    expect(pickerPaths('/es').map((option) => option.path)).toEqual(homes);
  });

  it('keeps the picker on a page in one language, linking the other homes', () => {
    // /credits is English only and is where the signed-in header's balance links to.
    expect(equivalentPaths('/credits')).toHaveLength(1);
    const options = pickerPaths('/credits');
    expect(options).toHaveLength(LOCALES.length);
    expect(options.find((option) => option.locale === 'en')?.path).toBe('/credits');
    expect(options.find((option) => option.locale === 'de')?.path).toBe('/de');
  });

  it('falls back to the homes for the signed-in app', () => {
    for (const path of ['/dashboard', '/library', '/connectors', '/account', '/hub', '/sign-in'])
      expect(pickerPaths(path).length, path).toBe(LOCALES.length);
  });
});
