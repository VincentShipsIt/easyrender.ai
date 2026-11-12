import { CONFIG_VERSION, classifyCountry, type PrivacyRegion } from '@easyrender/core/attribution';

type Environment = {
  VERCEL_ENV?: string;
  VERCEL?: string;
  NODE_ENV?: string;
  ANALYTICS_LOCAL_TEST?: string;
};
export function arePrivacyOverridesAllowed(env: Environment = process.env) {
  if (env.VERCEL_ENV === 'production') return false;
  return (
    env.VERCEL_ENV === 'preview' ||
    (!env.VERCEL && (env.NODE_ENV !== 'production' || env.ANALYTICS_LOCAL_TEST === '1'))
  );
}
export function privacyRegion(
  headers: Headers,
  url?: string,
  env: Environment = process.env,
): PrivacyRegion {
  const query = url ? new URL(url).searchParams : null;
  const override = arePrivacyOverridesAllowed(env);
  const country =
    override && query?.has('__geo')
      ? query.get('__geo')
      : override && headers.has('x-test-country')
        ? headers.get('x-test-country')
        : headers.get('x-vercel-ip-country');
  return {
    ...classifyCountry(country),
    gpc: headers.get('sec-gpc') === '1',
    config_version: CONFIG_VERSION,
  };
}
