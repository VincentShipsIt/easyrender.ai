import { defineConfig } from '@playwright/test';

const output = process.env.EVIDENCE_DIR || '../../.data/analytics-evidence';
export default defineConfig({
  testDir: '.',
  outputDir: `${output}/playwright-artifacts`,
  testMatch: '*.spec.ts',
  workers: 1,
  reporter: [['list'], ['json', { outputFile: `${output}/playwright-results.json` }]],
  use: {
    headless: true,
    serviceWorkers: 'block',
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
    viewport: { width: 1440, height: 900 },
  },
});
