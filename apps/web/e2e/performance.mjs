import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const output = process.env.EVIDENCE_DIR || '/Users/jorgeclawd/easyrender/analytics-evidence';
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const runs = [];
const gtag = await readFile('/tmp/er-analytics-gtag.js', 'utf8');
for (let i = 0; i < 5; i++) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();
  await page.route(
    /posthog\.com|google-analytics\.com|googletagmanager\.com|analytics\.google\.com/,
    (route) => {
      const url = route.request().url();
      if (url.includes('/gtag/js'))
        return route.fulfill({ contentType: 'application/javascript', body: gtag });
      if (url.includes('/config.js'))
        return route.fulfill({
          contentType: 'application/javascript',
          body: 'window._POSTHOG_REMOTE_CONFIG={phc_localtest:{config:{hasFeatureFlags:false}}};',
        });
      return route.fulfill({ contentType: 'application/json', body: '{}' });
    },
  );
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    Object.defineProperty(navigator, 'userAgentData', { get: () => undefined });
    window.metrics = { lcp: 0, tbt: 0 };
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) window.metrics.lcp = entry.startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) window.metrics.tbt += Math.max(0, entry.duration - 50);
    }).observe({ type: 'longtask', buffered: true });
  });
  const response = await page.goto(process.env.PERF_URL || 'http://localhost:3100/');
  await page.waitForTimeout(5000);
  runs.push({
    ...(await page.evaluate(() => window.metrics)),
    headers: await response.allHeaders(),
  });
  await context.close();
}
await browser.close();
await writeFile(
  `${output}/${process.env.PERF_LABEL || 'main'}-performance.json`,
  JSON.stringify(runs, null, 2),
);
