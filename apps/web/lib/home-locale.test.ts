import { describe, expect, it } from 'vitest';
import { decideHome, type HomeRequest, isBot, localeForCountry } from './home-locale';

const CHROME =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1';

const visit = (overrides: Partial<HomeRequest> = {}): HomeRequest => ({
  method: 'GET',
  pathname: '/',
  host: 'easyrender.ai',
  country: null,
  userAgent: CHROME,
  cookie: null,
  referer: null,
  isRouterRequest: false,
  ...overrides,
});

describe('the country map', () => {
  it.each([
    ['DE', 'de'],
    ['AT', 'de'],
    ['CH', 'de'],
    ['LI', 'de'],
    ['FR', 'fr'],
    ['BE', 'fr'],
    ['LU', 'fr'],
    ['MC', 'fr'],
    ['IT', 'it'],
    ['SM', 'it'],
    ['VA', 'it'],
    ['PT', 'pt'],
    ['ES', 'es'],
    ['de', 'de'],
  ])('sends %s to /%s', (country, locale) => {
    expect(localeForCountry(country)).toBe(locale);
  });

  it.each(['US', 'GB', 'BR', 'MX', 'AR', 'NL', 'XX', '', null])(
    'keeps %s in English',
    (country) => {
      expect(localeForCountry(country)).toBeNull();
    },
  );
});

describe('the first visit to /', () => {
  it.each([
    ['DE', 'de'],
    ['FR', 'fr'],
    ['IT', 'it'],
    ['PT', 'pt'],
    ['ES', 'es'],
  ])('redirects a person from %s to /%s and remembers it', (country, locale) => {
    expect(decideHome(visit({ country }))).toEqual({ kind: 'redirect', locale, cookie: locale });
  });

  it('works the same on an iPhone', () => {
    expect(decideHome(visit({ country: 'DE', userAgent: IPHONE }))).toMatchObject({
      kind: 'redirect',
      locale: 'de',
    });
  });

  it.each(['US', 'BR', 'MX', null])('stays in English for %s and stores nothing', (country) => {
    expect(decideHome(visit({ country }))).toEqual({ kind: 'stay' });
  });
});

describe('what is never redirected', () => {
  it.each([
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'Googlebot-Image/1.0',
    'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0)',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0',
    'anthropic-ai',
    'Mozilla/5.0 (Linux; Android 5.0) AppleWebKit/537.36 (KHTML, like Gecko) Mobile Safari/537.36 (compatible; Bytespider; spider-feedback@bytedance.com)',
    'CCBot/2.0 (https://commoncrawl.org/faq/)',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Safari/605.1.15 (Applebot/0.1)',
    'DuckDuckBot/1.1; (+http://duckduckgo.com/duckduckbot.html)',
    'Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)',
    'Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)',
    'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
    'meta-externalagent/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler)',
    'FacebookBot/1.0',
    'curl/8.7.1',
    '',
    null,
  ])('a crawler or client: %s', (userAgent) => {
    expect(isBot(userAgent)).toBe(true);
    expect(decideHome(visit({ country: 'DE', userAgent }))).toEqual({ kind: 'skip' });
  });

  it('treats a desktop and a phone browser as people', () => {
    expect(isBot(CHROME)).toBe(false);
    expect(isBot(IPHONE)).toBe(false);
  });

  it.each([
    '/de',
    '/es',
    '/fr',
    '/it',
    '/pt',
    '/credits',
    '/sign-in',
    '/learn',
    '/r/demo',
    '/api/renders',
    '/hub',
  ])('any path other than the root: %s', (pathname) => {
    expect(decideHome(visit({ country: 'DE', pathname }))).toEqual({ kind: 'skip' });
    expect(decideHome(visit({ country: 'DE', pathname, cookie: 'fr' }))).toEqual({
      kind: 'skip',
    });
  });

  it('a POST, or a router prefetch fired before the click that sets the cookie', () => {
    expect(decideHome(visit({ country: 'DE', method: 'POST' }))).toEqual({ kind: 'skip' });
    expect(decideHome(visit({ country: 'DE', isRouterRequest: true }))).toEqual({ kind: 'skip' });
  });
});

describe('a later visit to /', () => {
  it('follows the cookie, not the country', () => {
    expect(decideHome(visit({ country: 'DE', cookie: 'fr' }))).toEqual({
      kind: 'redirect',
      locale: 'fr',
    });
    expect(decideHome(visit({ country: 'US', cookie: 'it' }))).toEqual({
      kind: 'redirect',
      locale: 'it',
    });
  });

  it('stays in English when the cookie says en, whatever the country', () => {
    expect(decideHome(visit({ country: 'DE', cookie: 'en' }))).toEqual({ kind: 'stay' });
  });

  it('ignores a cookie that names no live home', () => {
    expect(decideHome(visit({ country: 'US', cookie: 'pt-BR' }))).toEqual({ kind: 'stay' });
    expect(decideHome(visit({ country: 'DE', cookie: 'xx' }))).toMatchObject({ locale: 'de' });
  });

  it('remembers English when someone comes to / from one of our localised pages', () => {
    const fromGerman = visit({
      country: 'DE',
      cookie: 'de',
      referer: 'https://easyrender.ai/de',
    });
    expect(decideHome(fromGerman)).toEqual({ kind: 'stay', cookie: 'en' });
  });

  it('does not treat another site or an app page as a choice of English', () => {
    expect(
      decideHome(visit({ country: 'DE', referer: 'https://www.google.com/de' })),
    ).toMatchObject({ kind: 'redirect', locale: 'de' });
    expect(
      decideHome(visit({ country: 'DE', cookie: 'de', referer: 'https://easyrender.ai/credits' })),
    ).toMatchObject({ kind: 'redirect', locale: 'de' });
  });
});
