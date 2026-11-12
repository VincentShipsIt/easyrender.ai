import type { BrowserContext } from '@playwright/test';

// Exercise the exact production hostname guard without ever reaching the production app.
export const base = 'https://easyrender.ai';
export const localBase = process.env.ANALYTICS_BASE_URL || 'http://127.0.0.1:3100';
export async function routeLocalApp(context: BrowserContext) {
  const target = new URL(localBase);
  if (!['127.0.0.1', 'localhost'].includes(target.hostname))
    throw new Error('Analytics browser tests require a local app');
  await context.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== base) return route.abort();
    url.protocol = target.protocol;
    url.host = target.host;
    const response = await route.fetch({ url: url.href, maxRedirects: 0 });
    return route.fulfill({ response });
  });
}
