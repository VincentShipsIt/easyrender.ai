import { describe, expect, it } from 'vitest';
import { arePrivacyOverridesAllowed, privacyRegion } from './privacy-region';

describe('privacy endpoint inputs', () => {
  it('reads country and Sec-GPC without setting cookies', () => {
    expect(privacyRegion(new Headers({ 'x-vercel-ip-country': 'US', 'sec-gpc': '1' }))).toEqual({
      country: 'US',
      consent_region: 'standard',
      gpc: true,
      config_version: 'v1',
    });
  });
  it('ignores both overrides and local flag in Vercel production', () => {
    const env = { VERCEL_ENV: 'production', NODE_ENV: 'development', ANALYTICS_LOCAL_TEST: '1' };
    expect(arePrivacyOverridesAllowed(env)).toBe(false);
    expect(
      privacyRegion(
        new Headers({ 'x-vercel-ip-country': 'DE', 'x-test-country': 'US' }),
        'https://x.test/?__geo=US',
        env,
      ).country,
    ).toBe('DE');
  });
  it('allows preview and explicitly local production builds, but no unflagged production build', () => {
    expect(arePrivacyOverridesAllowed({ VERCEL_ENV: 'preview', NODE_ENV: 'production' })).toBe(
      true,
    );
    expect(arePrivacyOverridesAllowed({ NODE_ENV: 'production', ANALYTICS_LOCAL_TEST: '1' })).toBe(
      true,
    );
    expect(
      arePrivacyOverridesAllowed({
        VERCEL: '1',
        NODE_ENV: 'production',
        ANALYTICS_LOCAL_TEST: '1',
      }),
    ).toBe(false);
    expect(arePrivacyOverridesAllowed({ NODE_ENV: 'production' })).toBe(false);
  });
  it.each(['', 'XX', 'zz1'])('an explicit invalid override %s stays strict', (code) => {
    expect(
      privacyRegion(new Headers({ 'x-vercel-ip-country': 'US' }), `https://x.test/?__geo=${code}`, {
        VERCEL_ENV: 'preview',
      }).consent_region,
    ).toBe('strict');
  });
});
