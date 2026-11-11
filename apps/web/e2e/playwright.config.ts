import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: '.',
  outputDir: '/Users/jorgeclawd/easyrender/analytics-evidence/playwright-artifacts',
  testMatch: '*.spec.ts',
  workers: 1,
  reporter: [
    ['list'],
    [
      'json',
      { outputFile: '/Users/jorgeclawd/easyrender/analytics-evidence/playwright-results.json' },
    ],
  ],
  use: {
    headless: true,
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
    viewport: { width: 1440, height: 900 },
  },
});
