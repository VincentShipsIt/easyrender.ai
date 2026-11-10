import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { CREDIT_USD, PRO_PLAN, RENDER_CREDITS } from '@easyrender/harness';
import { describe, expect, it } from 'vitest';
import { parseFrontMatter } from './frontmatter';
import {
  faqFromBody,
  isPublishedPost,
  modifiedDate,
  parsePost,
  postPath,
  readPosts,
} from './posts';

const post = (fields: Record<string, string>, body = 'A paragraph.') =>
  [
    '---',
    ...Object.entries(fields).map(([key, value]) => `${key}: ${value}`),
    '---',
    '',
    body,
  ].join('\n');

const VALID = {
  group: 'glb-vs-usdz',
  title: 'GLB or USDZ?',
  description: 'Which file you need.',
  date: '2026-11-23',
};

describe('front matter', () => {
  it('reads scalars and keeps the body', () => {
    const { data, body } = parseFrontMatter(post(VALID, 'Line one.\n\nLine two.'));
    expect(data).toEqual(VALID);
    expect(body).toBe('Line one.\n\nLine two.');
  });

  it('strips quotes, so a title with a colon can be written', () => {
    const { data } = parseFrontMatter(post({ ...VALID, title: '"GLB or USDZ: pick one"' }));
    expect(data.title).toBe('GLB or USDZ: pick one');
  });

  it('treats a file with no front matter as all body', () => {
    expect(parseFrontMatter('Just text.')).toEqual({ data: {}, body: 'Just text.' });
  });
});

describe('parsing a post', () => {
  it('normalises a date-only publication date to an instant', () => {
    const result = parsePost('en', 'glb-vs-usdz', post(VALID));
    expect(result).toMatchObject({
      post: { date: '2026-11-23T00:00:00.000Z', group: 'glb-vs-usdz', path: '/learn/glb-vs-usdz' },
    });
  });

  it('refuses a file that is missing a required field, naming it', () => {
    const { group, ...withoutGroup } = VALID;
    expect(group).toBeDefined();
    expect(parsePost('en', 'x', post(withoutGroup))).toEqual({ error: 'missing group' });
    expect(parsePost('en', 'x', post(VALID, ''))).toEqual({ error: 'empty body' });
    expect(parsePost('en', 'x', post({ ...VALID, date: 'soon' }))).toEqual({
      error: 'invalid date "soon"',
    });
  });

  it('builds the native path of each language', () => {
    expect(postPath('en', 'glb-vs-usdz')).toBe('/learn/glb-vs-usdz');
    expect(postPath('es', 'glb-vs-usdz')).toBe('/es/guias/glb-vs-usdz');
    expect(postPath('de', 'glb-vs-usdz')).toBe('/de/ratgeber/glb-vs-usdz');
  });
});

describe('what a post carries besides its text', () => {
  const parsed = (fields: Record<string, string>, body?: string) => {
    const result = parsePost('en', 'glb-vs-usdz', post({ ...VALID, ...fields }, body));
    if ('error' in result) throw new Error(result.error);
    return result.post;
  };

  it('is signed by the easyrender team, as an Organization, unless it names an author', () => {
    expect(parsed({}).author).toEqual({ name: 'easyrender team', type: 'Organization' });
    expect(
      parsed({ author: 'A Writer', authorType: 'person', authorUrl: '/about' }).author,
    ).toEqual({
      name: 'A Writer',
      type: 'Person',
      url: '/about',
    });
    expect(parsePost('en', 'x', post({ ...VALID, authorType: 'robot' }))).toEqual({
      error: 'invalid authorType "robot"',
    });
  });

  it('fills prices from the harness, so a guide cannot drift from the pricing page', () => {
    const { body } = parsed(
      {},
      'A model costs {{renderCredits}} credits ({{renderPrice}}). Pro is {{proPrice}} for {{proCredits}}.',
    );
    const price = (RENDER_CREDITS * CREDIT_USD).toFixed(2);
    const pro = String(PRO_PLAN.priceCents / 100);
    const proCredits = PRO_PLAN.monthlyCredits.toLocaleString('en-US');
    expect(body).toBe(
      `A model costs ${RENDER_CREDITS} credits ($${price}). Pro is $${pro} for ${proCredits}.`,
    );
    expect(parsed({}, 'Left alone: {{unknownToken}}.').body).toBe('Left alone: {{unknownToken}}.');
  });

  it('drops editor notes before anything reads the body', () => {
    const { body } = parsed({}, 'Before.\n\n<!-- IMAGE PENDING: a real screenshot -->\n\nAfter.');
    expect(body).toBe('Before.\n\nAfter.');
  });

  it('reads the FAQ section as plain question and answer pairs', () => {
    const faq = faqFromBody(
      [
        '## Something else',
        '### Not a question',
        'Ignored.',
        '## FAQ',
        '### Is GLB the same as [glTF](/learn/glb-file)?',
        'The **binary** version.',
        'Same standard.',
        '### Empty?',
        '## After',
        'Ignored too.',
      ].join('\n'),
    );
    expect(faq).toEqual([
      { question: 'Is GLB the same as glTF?', answer: 'The binary version. Same standard.' },
    ]);
  });

  it('never dates the last change before the publication', () => {
    const date = '2026-11-11T00:00:00.000Z';
    expect(modifiedDate({ date, updated: '2026-11-10T00:00:00.000Z' })).toBe(date);
    expect(modifiedDate({ date, updated: '2026-11-20T00:00:00.000Z' })).toBe(
      '2026-11-20T00:00:00.000Z',
    );
  });
});

describe('the publication date is a schedule', () => {
  const fixture = () => {
    const root = mkdtempSync(join(tmpdir(), 'easyrender-blog-'));
    mkdirSync(join(root, 'en'), { recursive: true });
    writeFileSync(
      join(root, 'en', 'yesterday.md'),
      post({ ...VALID, group: 'a', date: '2026-11-09' }),
    );
    writeFileSync(
      join(root, 'en', 'tomorrow.md'),
      post({ ...VALID, group: 'b', date: '2026-11-11' }),
    );
    writeFileSync(join(root, 'en', 'broken.md'), 'no front matter at all');
    writeFileSync(join(root, 'en', 'notes.txt'), 'ignored');
    return root;
  };

  const NOW = new Date('2026-11-10T12:00:00Z');

  it('reads every valid post, newest first, and skips the rest', () => {
    const posts = readPosts('en', fixture());
    expect(posts.map((entry) => entry.slug)).toEqual(['tomorrow', 'yesterday']);
  });

  it('publishes a past date and hides a future one', () => {
    const posts = readPosts('en', fixture());
    const published = posts.filter((entry) => isPublishedPost(entry, NOW));
    expect(published.map((entry) => entry.slug)).toEqual(['yesterday']);
  });

  it('hides every post of a language that is not routable yet', () => {
    const root = mkdtempSync(join(tmpdir(), 'easyrender-blog-de-'));
    mkdirSync(join(root, 'de'), { recursive: true });
    writeFileSync(join(root, 'de', 'glb-oder-usdz.md'), post({ ...VALID, date: '2026-11-01' }));
    const [entry] = readPosts('de', root);
    expect(entry).toBeDefined();
    expect(isPublishedPost(entry as NonNullable<typeof entry>, NOW)).toBe(false);
  });

  it('returns nothing for a language with no folder', () => {
    expect(readPosts('fr', mkdtempSync(join(tmpdir(), 'easyrender-blog-empty-')))).toEqual([]);
  });
});
