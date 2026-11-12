import { describe, expect, test } from 'bun:test';
import {
  DEFAULT_APP_URL,
  decideNavigation,
  findDeepLinkInArgv,
  resolveAppUrl,
  resolveDeepLink,
} from './app-url';

const ORIGIN = 'https://easyrender.ai';

describe('resolveAppUrl', () => {
  test('defaults to production', () => {
    expect(resolveAppUrl(undefined).toString()).toBe(DEFAULT_APP_URL);
  });
  test('accepts https and local http, nothing else', () => {
    expect(resolveAppUrl('https://preview.example.dev/dashboard').host).toBe('preview.example.dev');
    expect(resolveAppUrl('http://localhost:3000/dashboard').origin).toBe('http://localhost:3000');
    expect(resolveAppUrl('http://evil.example.com/').toString()).toBe(DEFAULT_APP_URL);
    expect(resolveAppUrl('file:///etc/passwd').toString()).toBe(DEFAULT_APP_URL);
    expect(resolveAppUrl('not a url').toString()).toBe(DEFAULT_APP_URL);
  });
});

describe('decideNavigation', () => {
  test('keeps the app origin in the window', () => {
    expect(decideNavigation('https://easyrender.ai/library', ORIGIN)).toBe('allow');
  });
  test('sends other https sites and mail to the system', () => {
    expect(decideNavigation('https://checkout.stripe.com/c/pay', ORIGIN)).toBe('external');
    expect(decideNavigation('https://easyrender.ai.evil.com/', ORIGIN)).toBe('external');
    expect(decideNavigation('mailto:hi@easyrender.ai', ORIGIN)).toBe('external');
  });
  test('drops file, javascript and malformed urls', () => {
    expect(decideNavigation('file:///etc/passwd', ORIGIN)).toBe('deny');
    expect(decideNavigation('javascript:alert(1)', ORIGIN)).toBe('deny');
    expect(decideNavigation('http://easyrender.ai/', ORIGIN)).toBe('deny');
    expect(decideNavigation('::::', ORIGIN)).toBe('deny');
  });
});

describe('resolveDeepLink', () => {
  test('opens a known app path on the app origin', () => {
    expect(resolveDeepLink('easyrender://open/library', ORIGIN)).toBe(
      'https://easyrender.ai/library',
    );
    expect(resolveDeepLink('easyrender://open/r/abc123?x=1', ORIGIN)).toBe(
      'https://easyrender.ai/r/abc123?x=1',
    );
  });
  test('rejects other hosts, paths and schemes', () => {
    expect(resolveDeepLink('easyrender://evil/library', ORIGIN)).toBeNull();
    expect(resolveDeepLink('easyrender://open/api/auth/sign-out', ORIGIN)).toBeNull();
    expect(resolveDeepLink('easyrender://open//evil.com', ORIGIN)).toBeNull();
    expect(resolveDeepLink('https://easyrender.ai/library', ORIGIN)).toBeNull();
  });
});

describe('findDeepLinkInArgv', () => {
  test('finds the link among launch arguments', () => {
    expect(findDeepLinkInArgv(['easyrender.exe', '--flag', 'easyrender://open/credits'])).toBe(
      'easyrender://open/credits',
    );
    expect(findDeepLinkInArgv(['easyrender'])).toBeUndefined();
  });
});
