import { mkdir, writeFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

test.skip(
  process.env.ANALYTICS_UNSET !== '1',
  'Requires a separate build without public analytics variables',
);
test('unset keys load nothing, show no banner, and render pages', async ({ page }) => {
  const requests: string[] = [];
  await page.route(
    /posthog\.com|googletagmanager\.com|google-analytics\.com|analytics\.google\.com/,
    async (route) => {
      requests.push(route.request().url());
      await route.fulfill({ body: '' });
    },
  );
  for (const country of ['DE', 'US']) {
    await page.goto(
      `${process.env.ANALYTICS_BASE_URL || 'http://localhost:3100'}/?__geo=${country}`,
    );
    await page.waitForTimeout(2500);
    await expect(page.getByTestId('consent-banner')).toHaveCount(0);
    await expect(page.locator('main')).toBeVisible();
    expect(requests).toEqual([]);
    expect(
      await page.locator('script[src*="posthog"],script[src*="googletagmanager"]').count(),
    ).toBe(0);
  }
  const output = process.env.EVIDENCE_DIR || '/Users/jorgeclawd/easyrender/analytics-evidence';
  await mkdir(output, { recursive: true });
  await page.screenshot({ path: `${output}/env-unset.png` });
  await writeFile(
    `${output}/env-unset.json`,
    JSON.stringify({ requests, banner: false, scriptTags: 0 }),
  );
});
