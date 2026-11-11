import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import { type BrowserContext, expect, type Page, test } from '@playwright/test';

const base = process.env.ANALYTICS_BASE_URL || 'http://localhost:3100';
const output = process.env.EVIDENCE_DIR || '/Users/jorgeclawd/easyrender/analytics-evidence';
type Capture = { url: string; body: string; event?: string; properties?: Record<string, unknown> };
async function intercept(page: Page) {
  const requests: Capture[] = [];
  // PostHog deliberately filters automation; simulate a normal browser without changing production config.
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    Object.defineProperty(navigator, 'userAgentData', { get: () => undefined });
  });
  const gtag = await readFile(process.env.GTAG_FIXTURE || '/tmp/er-analytics-gtag.js', 'utf8');
  await page.route(
    /posthog\.com|googletagmanager\.com|google-analytics\.com|analytics\.google\.com/,
    async (route) => {
      const request = route.request();
      const url = request.url();
      let body = request.postData() || '';
      const buffer = request.postDataBuffer();
      if (buffer && buffer[0] === 31 && buffer[1] === 139) body = gunzipSync(buffer).toString();
      requests.push({ url, body });
      if (url.includes('/config.js'))
        return route.fulfill({
          contentType: 'application/javascript',
          body: 'window._POSTHOG_REMOTE_CONFIG={phc_localtest:{config:{hasFeatureFlags:false}}};',
        });
      if (url.includes('/gtag/js'))
        return route.fulfill({ contentType: 'application/javascript', body: gtag });
      if (url.includes('/g/collect'))
        return route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*' } });
      if (url.includes('/e/') || url.includes('/i/')) {
        try {
          const parsed = JSON.parse(body);
          for (const item of Array.isArray(parsed) ? parsed : (parsed.batch ?? [parsed]))
            requests.push({ url, body: '', event: item.event, properties: item.properties });
        } catch {
          /* Keep raw request if SDK encoding changes. */
        }
      }
      return route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ config: { enable_collect_everything: false }, featureFlags: {} }),
        headers: { 'access-control-allow-origin': '*' },
      });
    },
  );
  return requests;
}
async function evidence(page: Page, context: BrowserContext, label: string, requests: Capture[]) {
  await mkdir(output, { recursive: true });
  await page.screenshot({ path: `${output}/${label}.png`, fullPage: false });
  const cookies = (await context.cookies()).map(({ name }) => name);
  const storage = await page.evaluate(() => ({
    local: Object.keys(localStorage),
    session: Object.keys(sessionStorage),
  }));
  await writeFile(
    `${output}/${label}.json`,
    JSON.stringify({ requests, cookies, storage }, null, 2),
  );
}
test.setTimeout(60000);
test('DE rejects without contacting either vendor and remembers the choice', async ({
  page,
  context,
}) => {
  const requests = await intercept(page);
  await page.goto(`${base}/?__geo=DE&utm_source=test&utm_medium=qa&utm_campaign=req02-t1`);
  await expect(page.getByTestId('consent-banner')).toBeVisible();
  await page.waitForTimeout(2000);
  expect(requests).toHaveLength(0);
  await page.screenshot({ path: `${output}/de-before-choice.png` });
  expect((await context.cookies()).map((c) => c.name)).toEqual(['er_anon']);
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([]);
  await page
    .getByTestId('consent-banner')
    .getByRole('button', { name: 'Reject', exact: true })
    .click();
  await page.reload();
  await page.waitForTimeout(2000);
  await expect(page.getByTestId('consent-banner')).toHaveCount(0);
  expect(requests).toHaveLength(0);
  expect((await context.cookies()).map((c) => c.name)).toContain('er_consent');
  await evidence(page, context, 'de-reject', requests);
});
test('FR accepts: sanitized PostHog pageviews, one landing, real GA collects and cookies; withdrawal', async ({
  page,
  context,
}) => {
  const requests = await intercept(page);
  await page.goto(`${base}/fr?__geo=FR&utm_source=test&utm_campaign=req02-t1&foo=1&gclid=abc`, {
    referer: 'https://external.test/source?private=1',
  });
  await expect(page.getByTestId('consent-banner')).toBeVisible();
  await page
    .getByTestId('consent-banner')
    .getByRole('button', { name: 'Accepter', exact: true })
    .click();
  await page.waitForTimeout(3500);
  for (const href of ['/hub', '/explore', '/sign-up']) {
    await page.locator(`footer a[href="${href}"]`).first().click();
    await page.waitForTimeout(800);
  }
  await page.waitForTimeout(3000);
  await evidence(page, context, 'fr-accept', requests);
  const views = requests.filter((r) => r.event === '$pageview');
  expect(views.length).toBeGreaterThanOrEqual(4);
  expect(views[0].properties?.$current_url).toContain('utm_source=test');
  for (const view of views)
    expect(String(view.properties?.$current_url)).not.toMatch(/__geo|foo=|gclid/);
  const landings = requests.filter((r) => r.event === 'landing_view');
  expect(landings).toHaveLength(1);
  expect(landings[0].properties?.referrer_host).toBe('external.test');
  expect(String(views[0].properties?.$referrer)).not.toContain('private=');
  expect(
    requests.some(
      (r) => r.url.includes('/g/collect') && `${r.url}&${r.body}`.includes('en=page_view'),
    ),
  ).toBe(true);
  expect(
    requests.some((r) => r.url.includes('/g/collect') && `${r.url}&${r.body}`.includes('gcs=G101')),
  ).toBe(true);
  const cookies = (await context.cookies()).map((c) => c.name);
  expect(cookies).toContain('_ga');
  expect(cookies.some((name) => name.startsWith('ph_'))).toBe(false);
  expect(
    await page.evaluate(() => Object.keys(localStorage).filter((key) => key.startsWith('ph_'))),
  ).toEqual([]);
  await page.locator('footer a[href$="/cookies"]').click();
  await page.getByRole('button', { name: /^(Reject|Refuser)$/ }).click();
  await page.waitForTimeout(1000);
  expect((await context.cookies()).some((c) => c.name.startsWith('_ga'))).toBe(false);
  const count = requests.length;
  await page.locator('footer a[href="/explore"]').click();
  await page.waitForTimeout(2500);
  expect(requests.length).toBe(count);
});
for (const hasGpc of [false, true])
  test(`US standard, GPC=${hasGpc}`, async ({ page, context }) => {
    const requests = await intercept(page);
    if (hasGpc) {
      await context.setExtraHTTPHeaders({ 'Sec-GPC': '1' });
      await page.addInitScript(() =>
        Object.defineProperty(navigator, 'globalPrivacyControl', { value: true }),
      );
    }
    await page.goto(`${base}/?__geo=US&utm_source=test`);
    await page.waitForTimeout(3500);
    await expect(page.getByTestId('consent-banner')).toHaveCount(0);
    if (hasGpc) expect(requests).toHaveLength(0);
    else {
      expect(requests.some((r) => r.event === '$pageview')).toBe(true);
      expect(requests.some((r) => r.url.includes('/g/collect'))).toBe(true);
    }
    await evidence(page, context, `us-gpc-${hasGpc}`, requests);
  });
for (const query of ['__geo=XX', '__geo=', '__geo=zz1', '__geo=US&__privacy_fail=1'])
  test(`safe fallback ${query}`, async ({ page, context }) => {
    const requests = await intercept(page);
    await page.goto(`${base}/?${query}`);
    await page.waitForTimeout(2500);
    expect(requests).toHaveLength(0);
    await expect(page.locator('main')).toBeVisible();
    if (!query.includes('fail')) await expect(page.getByTestId('consent-banner')).toBeVisible();
    await evidence(page, context, `fallback-${query.replaceAll(/[^a-z0-9]/gi, '_')}`, requests);
  });
test('email signup preserves an in-memory first touch through internal navigation', async ({
  page,
  context,
}) => {
  const requests = await intercept(page);
  await page.goto(
    `${base}/?__geo=DE&utm_source=TEST&utm_medium=QA&utm_campaign=req02-t1&gclid=abc&fbclid=def`,
  );
  await expect(page.getByTestId('consent-banner')).toBeVisible();
  await page
    .getByTestId('consent-banner')
    .getByRole('button', { name: 'Reject', exact: true })
    .click();
  await page.locator('footer a[href="/explore"]').click();
  // Simulate a second UTM in an internal navigation without a full reload.
  await page.evaluate(() => {
    history.pushState(null, '', '/explore?utm_campaign=second');
  });
  await page.locator('footer a[href="/sign-up"]').click();
  await page.getByLabel('Email', { exact: true }).fill(`local-${Date.now()}@example.invalid`);
  await page.getByLabel('Password', { exact: true }).fill('Local-qa-only-password-123');
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });
  await page.waitForTimeout(2000);
  const session = await page.request.get(`${base}/api/auth/get-session`);
  const result = await session.json();
  await writeFile(`${output}/signup-user-id.json`, JSON.stringify({ userId: result.user.id }));
  expect(requests).toHaveLength(0);
  await evidence(page, context, 'email-signup', requests);
});
test('privacy endpoint has no-store and first visit retains only the existing anonymous cookie', async ({
  request,
}) => {
  const response = await request.get(`${base}/api/privacy-region?__geo=US`);
  expect(response.headers()['cache-control']).toBe('private, no-store');
  expect(await response.json()).toMatchObject({ country: 'US', consent_region: 'standard' });
  const home = await request.head(base);
  await writeFile(
    `${output}/headers.json`,
    JSON.stringify({ home: home.headers(), endpoint: response.headers() }, null, 2),
  );
  expect(home.headers().vary).not.toMatch(/country/i);
});

test('GA mirrors signup and confirmed purchase once per transaction in this page session', async ({
  page,
  context,
}) => {
  const requests = await intercept(page);
  await page.goto(`${base}/sign-up?__geo=US`);
  await page.waitForTimeout(2000);
  await page.getByLabel('Email', { exact: true }).fill(`purchase-${Date.now()}@example.invalid`);
  await page.getByLabel('Password', { exact: true }).fill('Local-qa-only-password-123');
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  await expect(page).toHaveURL(/dashboard/);
  const session = await (await page.request.get(`${base}/api/auth/get-session`)).json();
  const fixture = JSON.parse(
    execFileSync('bun', ['e2e/seed-purchase.ts', session.user.id], {
      env: {
        ...process.env,
        DATABASE_URL:
          process.env.TEST_DATABASE_URL || 'postgresql://jorgeclawd@127.0.0.1:54329/er_analytics',
        DATABASE_URL_UNPOOLED: '',
        NEXT_PUBLIC_POSTHOG_KEY: 'phc_localtest',
        POSTHOG_HOST: 'http://127.0.0.1:3901',
      },
      encoding: 'utf8',
    }),
  );
  await expect
    .poll(
      () =>
        requests.some(
          (r) => r.url.includes('/g/collect') && `${r.url}&${r.body}`.includes('en=sign_up'),
        ),
      { timeout: 15000 },
    )
    .toBe(true);
  await page.goto(`${base}/credits?__geo=US&status=success&session_id=${fixture.sessionId}`);
  await page.waitForTimeout(8000);
  const purchases = requests.filter(
    (r) => r.url.includes('/g/collect') && `${r.url}&${r.body}`.includes('en=purchase'),
  );
  expect(purchases).toHaveLength(1);
  expect(decodeURIComponent(`${purchases[0].url}&${purchases[0].body}`)).toContain(fixture.orderId);
  await evidence(page, context, 'ga-purchase', requests);
  expect(
    requests.some(
      (r) => r.url.includes('/g/collect') && `${r.url}&${r.body}`.includes('en=sign_up'),
    ),
  ).toBe(true);
  await evidence(page, context, 'ga-purchase', requests);
});

test('two-second region timeout stays closed even with an earlier accepted choice', async ({
  page,
  context,
}) => {
  const requests = await intercept(page);
  await context.addCookies([
    {
      name: 'er_consent',
      value: encodeURIComponent(
        JSON.stringify({ version: 'v1', date: new Date().toISOString(), accepted: true }),
      ),
      domain: 'localhost',
      path: '/',
    },
  ]);
  await page.route('**/api/privacy-region*', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 2800));
    await route
      .fulfill({
        json: { country: 'US', consent_region: 'standard', gpc: false, config_version: 'v1' },
      })
      .catch(() => {});
  });
  await page.goto(`${base}/?__geo=US`);
  await page.waitForTimeout(3500);
  expect(requests).toHaveLength(0);
  await expect(page.locator('main')).toBeVisible();
  await evidence(page, context, 'region-timeout', requests);
});
test('cookie information and equal-choice banner work in all six locales at 375px', async ({
  browser,
}) => {
  for (const [locale, accept, reject] of [
    ['en', 'Accept', 'Reject'],
    ['es', 'Aceptar', 'Rechazar'],
    ['de', 'Akzeptieren', 'Ablehnen'],
    ['fr', 'Accepter', 'Refuser'],
    ['it', 'Accetta', 'Rifiuta'],
    ['pt', 'Aceitar', 'Rejeitar'],
  ]) {
    const context = await browser.newContext({
      viewport: { width: 375, height: 812 },
      colorScheme: locale === 'en' ? 'light' : 'dark',
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    const requests = await intercept(page);
    const path =
      locale === 'en' ? '/cookies' : `/${locale}/${locale === 'it' ? 'cookie' : 'cookies'}`;
    const response = await page.goto(`${base}${path}?__geo=DE`);
    expect(response?.status()).toBe(200);
    const banner = page.getByTestId('consent-banner');
    await expect(banner).toBeVisible();
    await expect(banner.getByRole('button', { name: accept, exact: true })).toBeVisible();
    await expect(banner.getByRole('button', { name: reject, exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await evidence(page, context, `cookies-${locale}-mobile`, requests);
    await context.close();
  }
});

test('country resolution remains isolated across three alternating DE and US visits', async ({
  browser,
}) => {
  for (let pass = 0; pass < 3; pass++) {
    for (const country of pass % 2 ? ['US', 'DE'] : ['DE', 'US']) {
      const context = await browser.newContext();
      const page = await context.newPage();
      const requests = await intercept(page);
      await page.goto(`${base}/?__geo=${country}`);
      const response = await page.request.get(`${base}/api/privacy-region?__geo=${country}`);
      expect(response.headers()['cache-control']).toBe('private, no-store');
      expect((await response.json()).consent_region).toBe(country === 'DE' ? 'strict' : 'standard');
      if (country === 'DE') {
        await expect(page.getByTestId('consent-banner')).toBeVisible();
        expect(requests).toHaveLength(0);
      } else {
        await expect
          .poll(() => requests.some((request) => request.url.includes('/gtag/js')))
          .toBe(true);
        await expect(page.getByTestId('consent-banner')).toHaveCount(0);
      }
      await context.close();
    }
  }
});
