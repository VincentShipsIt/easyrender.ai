import { createHmac } from 'node:crypto';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  bearerSessionToken,
  decryptToken,
  encryptToken,
  isShopDomain,
  signLinkState,
  verifyLinkState,
  verifySessionToken,
  verifyWebhook,
} from './shopify';

const KEY = 'client-id-123';
const SECRET = 'shpss_test_secret';

beforeAll(() => {
  process.env.SHOPIFY_API_KEY = KEY;
  process.env.SHOPIFY_API_SECRET = SECRET;
  process.env.BETTER_AUTH_SECRET = 'test-secret-test-secret-test-secret';
});

function jwt(
  claims: Record<string, unknown>,
  secret = SECRET,
  header: object = { alg: 'HS256', typ: 'JWT' },
) {
  const part = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const body = `${part(header)}.${part(claims)}`;
  return `${body}.${createHmac('sha256', secret).update(body).digest('base64url')}`;
}
const NOW = 1_800_000_000_000;
const good = {
  iss: 'https://my-store.myshopify.com/admin',
  dest: 'https://my-store.myshopify.com',
  aud: KEY,
  exp: NOW / 1000 + 60,
  nbf: NOW / 1000 - 5,
};

describe('verifySessionToken', () => {
  it('returns the shop of a valid token', () => {
    expect(verifySessionToken(jwt(good), { now: NOW })).toBe('my-store.myshopify.com');
  });

  it.each([
    ['signed with another secret', jwt(good, 'other')],
    ['for another app', jwt({ ...good, aud: 'someone-else' })],
    ['expired', jwt({ ...good, exp: NOW / 1000 - 60 })],
    ['not valid yet', jwt({ ...good, nbf: NOW / 1000 + 600 })],
    [
      'from a shop that is not myshopify.com',
      jwt({ ...good, dest: 'https://evil.example.com', iss: 'https://evil.example.com/admin' }),
    ],
    ['whose issuer is another shop', jwt({ ...good, iss: 'https://other.myshopify.com/admin' })],
    ['using the none algorithm', jwt(good, SECRET, { alg: 'none' })],
    ['not a JWT', 'abc'],
  ])('refuses a token %s', (_name, token) => {
    expect(() => verifySessionToken(token, { now: NOW })).toThrowError(/Invalid Shopify session/);
  });
});

describe('verifyWebhook', () => {
  const body = '{"shop_domain":"my-store.myshopify.com"}';
  const signature = createHmac('sha256', SECRET).update(body).digest('base64');

  it('accepts the body Shopify signed and nothing else', () => {
    expect(verifyWebhook(body, signature)).toBe(true);
    expect(verifyWebhook(`${body} `, signature)).toBe(false);
    expect(verifyWebhook(body, null)).toBe(false);
    expect(verifyWebhook(body, 'AAAA')).toBe(false);
  });
});

describe('link state', () => {
  it('round-trips a shop and expires', () => {
    const state = signLinkState('my-store.myshopify.com', NOW);
    expect(verifyLinkState(state, NOW + 1000)).toBe('my-store.myshopify.com');
    expect(() => verifyLinkState(state, NOW + 31 * 60 * 1000)).toThrowError(/expired/);
  });

  it('refuses a state that was changed or forged', () => {
    const [payload] = signLinkState('my-store.myshopify.com', NOW).split('.');
    const forged = Buffer.from(
      JSON.stringify({ shop: 'victim.myshopify.com', exp: NOW + 1e6 }),
    ).toString('base64url');
    expect(() => verifyLinkState(`${forged}.${payload}`, NOW)).toThrowError(/expired/);
    expect(() => verifyLinkState(null, NOW)).toThrowError(/expired/);
  });
});

describe('stored tokens', () => {
  it('encrypts so the plain token is not in the stored value, and decrypts back', () => {
    const stored = encryptToken('shpat_abc123');
    expect(stored).not.toContain('shpat_abc123');
    expect(decryptToken(stored)).toBe('shpat_abc123');
    expect(encryptToken('shpat_abc123')).not.toBe(stored);
  });

  it('refuses a stored value that was changed', () => {
    const [iv, tag, data] = encryptToken('shpat_abc123').split('.');
    expect(() => decryptToken(`${iv}.${tag}.${data?.slice(0, -2)}AA`)).toThrow();
  });
});

describe('small helpers', () => {
  it('only accepts permanent myshopify.com domains', () => {
    expect(isShopDomain('my-store.myshopify.com')).toBe(true);
    for (const bad of [
      'myshopify.com',
      'my-store.myshopify.com.evil.com',
      'x.example.com',
      '',
      'evil.com/.myshopify.com',
      undefined,
    ]) {
      expect(isShopDomain(bad)).toBe(false);
    }
  });

  it('reads the bearer token', () => {
    expect(bearerSessionToken(new Headers({ authorization: 'Bearer abc' }))).toBe('abc');
    expect(bearerSessionToken(new Headers())).toBeNull();
  });
});
