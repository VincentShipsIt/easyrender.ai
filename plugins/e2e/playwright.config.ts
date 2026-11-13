import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 240_000,
  expect: { timeout: 20_000 },
  workers: 1,
  retries: 0,
  reporter: [['list']],
  outputDir: 'test-results',
  use: {
    baseURL: 'http://localhost:8080',
    viewport: { width: 1280, height: 900 },
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    // The shops hand shoppers links on api.test (the mock API); point it at the host.
    launchOptions: { args: ['--host-resolver-rules=MAP api.test 127.0.0.1'] },
  },
});
