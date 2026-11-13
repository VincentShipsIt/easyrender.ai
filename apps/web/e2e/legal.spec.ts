import { expect, test } from '@playwright/test';
import { HTML_LANG, LOCALES } from '../i18n/config';
import { ROUTES } from '../lib/seo/routes';
import { base, routeLocalApp } from './local-browser';

for (const locale of LOCALES) {
  for (const kind of ['privacy', 'terms'] as const) {
    test(`${locale} ${kind} is public, linked and has canonical metadata`, async ({ page }) => {
      await routeLocalApp(page.context());
      const path = ROUTES[kind].paths[locale];
      const response = await page.goto(`${base}${path}`);
      expect(response?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', HTML_LANG[locale]);
      await expect(page.locator('main h1')).toBeVisible();
      for (const placeholder of [
        '[LEGAL NAME]',
        '[TAX ID]',
        '[REGISTERED ADDRESS]',
        '[CONTACT EMAIL]',
      ]) {
        await expect(page.locator('main')).toContainText(placeholder);
      }
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${base}${path}`);
      await expect(page.locator('link[hreflang="pt-PT"]')).toHaveAttribute(
        'href',
        `${base}${ROUTES[kind].paths.pt}`,
      );
      await expect(page.locator('link[hreflang="x-default"]')).toHaveAttribute(
        'href',
        `${base}${ROUTES[kind].paths.en}`,
      );
      for (const linked of ['privacy', 'terms', 'cookies'] as const) {
        await expect(
          page.locator(`footer a[href="${ROUTES[linked].paths[locale]}"]`),
        ).toBeVisible();
      }
      await expect(page.locator('main [lang="en"]')).toContainText(
        kind === 'privacy' ? 'PostHog' : 'public by default',
      );
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      ).toBe(true);
    });
  }
}

test('sign-up shows legal links before submitting an account', async ({ page }) => {
  await routeLocalApp(page.context());
  await page.goto(`${base}/sign-up`);
  await expect(page.locator('main a[href="/privacy"]')).toBeVisible();
  await expect(page.locator('main a[href="/terms"]')).toBeVisible();
});
