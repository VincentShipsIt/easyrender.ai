import { describe, expect, it } from 'vitest';
import robots, { AI_CRAWLERS } from '@/app/robots';
import { NOINDEX_PREFIXES } from './noindex';
import { DISALLOWED_PREFIXES } from './routes';

describe('robots.txt', () => {
  const { rules } = robots();
  const groups = Array.isArray(rules) ? rules : [rules];
  const groupFor = (agent: string) =>
    groups.find((group) =>
      Array.isArray(group.userAgent) ? group.userAgent.includes(agent) : group.userAgent === agent,
    );

  it('lets every search engine crawl the noindex zones, so their noindex is read', () => {
    const all = groupFor('*');
    expect(all?.allow).toBe('/');
    for (const prefix of NOINDEX_PREFIXES) expect(all?.disallow).not.toContain(prefix);
  });

  it.each(['GPTBot', 'OAI-SearchBot', 'PerplexityBot', 'ClaudeBot', 'Google-Extended'])(
    'allows %s on the site and keeps it out of the noindex zones',
    (agent) => {
      expect(AI_CRAWLERS).toContain(agent);
      const group = groupFor(agent);
      expect(group?.allow).toBe('/');
      for (const prefix of [...NOINDEX_PREFIXES, ...DISALLOWED_PREFIXES]) {
        expect(group?.disallow, prefix).toContain(prefix);
      }
    },
  );

  it('does not block AI crawlers from the published comparisons', () => {
    expect(NOINDEX_PREFIXES).not.toContain('/compare');
    for (const agent of AI_CRAWLERS) {
      const group = groupFor(agent);
      expect(group?.disallow, agent).not.toContain('/compare');
    }
  });
});
