import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

// A guides hub is noindex until it has three guides. With English over the line and Spanish not,
// neither the English hub's head nor its sitemap entry may point at the Spanish hub.

const NOW = new Date('2026-11-20T12:00:00Z');

function contentRoot(counts: Record<string, number>): string {
  const cwd = mkdtempSync(join(tmpdir(), 'easyrender-hub-'));
  for (const [locale, count] of Object.entries(counts)) {
    const dir = join(cwd, 'content', 'blog', locale);
    mkdirSync(dir, { recursive: true });
    for (let index = 0; index < count; index += 1) {
      writeFileSync(
        join(dir, `post-${index}.md`),
        [
          '---',
          `group: g${index}`,
          `title: Post ${index}`,
          'description: A guide.',
          `date: 2026-11-1${index}`,
          '---',
          '',
          'Body.',
        ].join('\n'),
      );
    }
  }
  return cwd;
}

async function load(counts: Record<string, number>) {
  vi.resetModules();
  vi.spyOn(process, 'cwd').mockReturnValue(contentRoot(counts));
  const posts = await import('@/lib/blog/posts');
  const sitemap = await import('./sitemap');
  return { posts, sitemap };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('hreflang of the guides hubs', () => {
  it('only lists hubs that are indexable', async () => {
    const { posts, sitemap } = await load({ en: 3, es: 1 });
    expect(posts.isBlogIndexIndexable('en', NOW)).toBe(true);
    expect(posts.isBlogIndexIndexable('es', NOW)).toBe(false);
    expect(posts.indexableBlogIndexPaths(NOW)).toEqual({ en: '/learn' });

    const xml = sitemap.localeSitemapXml('en', NOW);
    const hub = xml.slice(xml.indexOf('<loc>https://easyrender.ai/learn</loc>'));
    expect(hub.slice(0, hub.indexOf('</url>'))).not.toContain('/es/guias');
    expect(sitemap.localeSitemapXml('es', NOW)).not.toContain(
      '<loc>https://easyrender.ai/es/guias</loc>',
    );
  });

  it('links both hubs once both are indexable', async () => {
    const { posts } = await load({ en: 3, es: 3 });
    expect(posts.indexableBlogIndexPaths(NOW)).toEqual({ en: '/learn', es: '/es/guias' });
  });
});
