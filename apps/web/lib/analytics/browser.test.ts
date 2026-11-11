import { afterEach, expect, it, vi } from 'vitest';
import { beforeSend } from './browser';

afterEach(() => vi.unstubAllEnvs());
it('before_send retains the public SDK project key required for ingestion and strips all non-UTM URL data', () => {
  vi.stubEnv('NEXT_PUBLIC_POSTHOG_KEY', 'phc_localtest');
  const event = beforeSend({
    properties: {
      token: 'phc_localtest',
      $current_url: 'https://example.test/?utm_source=test&foo=1&gclid=abc',
      $referrer: 'https://ref.test/?private=1',
      title: 'private account name',
      fbclid: 'abc',
      referrer_host: 'external.test',
    },
  });
  expect(event.properties).toEqual({
    token: 'phc_localtest',
    $current_url: 'https://example.test/?utm_source=test',
    $referrer: 'https://ref.test/',
    referrer_host: 'external.test',
  });
});
