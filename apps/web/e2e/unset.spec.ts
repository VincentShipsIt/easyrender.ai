import { mkdir, writeFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { base, routeLocalApp } from './local-browser';

test.skip(
  process.env.ANALYTICS_UNSET !== '1',
  'Requires a separate build without public analytics variables',
);
test('unset keys retain only the denied Ads bootstrap, with no GA config or banner', async ({
  page,
}) => {
  await routeLocalApp(page.context());
  const requests: string[] = [];
  await page.route(
    /posthog\.com|googletagmanager\.com|google-analytics\.com|analytics\.google\.com/,
    async (route) => {
      requests.push(route.request().url());
      await route.fulfill({ body: '' });
    },
  );
  for (const country of ['DE', 'US']) {
    await page.goto(`${base}/?__geo=${country}`);
    await page.waitForTimeout(2500);
    await expect(page.getByTestId('consent-banner')).toHaveCount(0);
    await expect(page.locator('main')).toBeVisible();
    expect(
      requests.every((url) => url === 'https://www.googletagmanager.com/gtm.js?id=AW-18570382360'),
    ).toBe(true);
    expect(
      await page.evaluate(() =>
        (window.dataLayer || []).some(
          (entry) => Array.from(entry as ArrayLike<unknown>)[0] === 'config',
        ),
      ),
    ).toBe(false);
    expect(
      await page.locator('script[src*="posthog"],script[src*="googletagmanager"]').count(),
    ).toBe(1);
  }
  const output = process.env.EVIDENCE_DIR || '../../.data/analytics-evidence';
  await mkdir(output, { recursive: true });
  await page.screenshot({ path: `${output}/env-unset.png` });
  await writeFile(
    `${output}/env-unset.json`,
    JSON.stringify({ requests, banner: false, scriptTags: 1 }),
  );
});
