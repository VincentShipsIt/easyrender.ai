import { afterEach, expect, it, vi } from 'vitest';
import { gaMeasurementId } from './config';

afterEach(() => vi.unstubAllEnvs());

it('connects unconfigured production builds to the easyrender GA4 property', () => {
  vi.stubEnv('VERCEL_ENV', 'production');
  vi.stubEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID', undefined);
  expect(gaMeasurementId()).toBe('G-H54Y1NW81X');
});

it.each(['preview', 'development', undefined])('keeps unconfigured %s builds off', (env) => {
  vi.stubEnv('VERCEL_ENV', env);
  vi.stubEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID', undefined);
  expect(gaMeasurementId()).toBe('');
});

it.each(['', 'G-TEST000000'])('honors an explicit production override of %s', (id) => {
  vi.stubEnv('VERCEL_ENV', 'production');
  vi.stubEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID', id);
  expect(gaMeasurementId()).toBe(id);
});
