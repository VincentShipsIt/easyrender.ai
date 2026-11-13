import type { Render } from '@easyrender/db';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@easyrender/db', () => ({ db: vi.fn() }));

import { toView } from './renders';

const render = (overrides: Partial<Render>): Render =>
  ({
    id: 'r1',
    status: 'rendering',
    prompt: null,
    name: null,
    credits: 64,
    isPublic: true,
    source: 'web',
    sheetKey: null,
    glbKey: null,
    createdAt: new Date('2026-11-13T10:00:00Z'),
    updatedAt: new Date('2026-11-13T10:05:00Z'),
    ...overrides,
  }) as Render;

describe('toView', () => {
  it('shows the credits a running build has spent', () => {
    expect(toView(render({ status: 'rendering', credits: 64 })).credits).toBe(64);
  });

  it('shows no credits spent on a failed render, because it was refunded', () => {
    const view = toView(render({ status: 'failed', credits: 42 }));
    expect(view.credits).toBe(0);
    expect(view.error).toContain('refunded');
  });
});
