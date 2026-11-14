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
      for (const detail of [
        'Smithii LTD (Company Limited by Shares, RAK Digital Assets Oasis, Government of Ras Al Khaimah, UAE)',
        'Company Registration No. 01010192, Business Licence No. 07010192',
        'Office A, RAK DAO Business Centre, RAK BANK ROC Office, Ground Floor, Al Rifaa, Sheikh Mohammed Bin Zayed Road, Ras Al Khaimah, United Arab Emirates, PO Box 30099',
        'info@smithii.io',
      ]) {
        await expect(page.locator('main')).toContainText(detail);
      }
      await expect(page.locator('main')).not.toContainText(/\[[A-Z][A-Z _/-]*\]/);
      if (kind === 'privacy') {
        for (const detail of ['UAE Personal Data Protection Law', 'EU GDPR', 'UK GDPR']) {
          await expect(page.locator('main')).toContainText(detail);
        }
        await expect(page.locator('#legal-transfers + p')).toContainText(
          'UK International Data Transfer Agreement or UK Addendum',
        );
        await expect(page.locator('#legal-rights + p')).toContainText(
          'Information Commissioner’s Office (ICO)',
        );
      } else {
        await expect(page.locator('main')).toContainText(
          'Easy Render is a product operated by Smithii LTD',
        );
        const law = page.locator('#legal-law + p');
        await expect(law).toContainText('UAE federal law');
        await expect(law).toContainText('RAK Digital Assets Oasis Free Zone regulations');
        await expect(law).toContainText(
          'courts of Ras Al Khaimah, United Arab Emirates, have exclusive jurisdiction',
        );
        await expect(law).toContainText('mandatory protections');
        await expect(law).not.toContainText('Spanish law');
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
