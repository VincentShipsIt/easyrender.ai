import { describe, expect, test } from 'bun:test';
import { buildOfflineHtml, offlineDataUrl } from './offline-page';

describe('offline page', () => {
  test('retries the url that failed', () => {
    const html = buildOfflineHtml('https://easyrender.ai/library');
    expect(html).toContain('content="5;url=https://easyrender.ai/library"');
  });
  test('escapes the url it embeds', () => {
    const html = buildOfflineHtml('https://easyrender.ai/?q="><script>x</script>');
    expect(html).not.toContain('<script>');
  });
  test('is a data url', () => {
    expect(offlineDataUrl('https://easyrender.ai/').startsWith('data:text/html')).toBe(true);
  });
});
