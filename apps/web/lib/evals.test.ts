import { describe, expect, it } from 'vitest';
import latest from '@/content/evals/latest.json';
import {
  EVAL_CRITERIA,
  type EvalResults,
  type EvalRun,
  hasPublishedRuns,
  listRuns,
  passRate,
  runPassRate,
} from './evals';

const score = (passed: number, total = 10) => ({ passed, total });

const run = (id: string, date: string, passed: number): EvalRun => ({
  id,
  date,
  photos: 10,
  sheetModel: 'google/nano-banana-pro',
  buildModel: 'firtoz/trellis',
  criteria: {
    shape: score(passed),
    views: score(passed),
    material: score(passed),
    finish: score(passed),
    file: score(passed),
  },
});

describe('the bundled eval results', () => {
  // The page prints every number it reads from this file, so a malformed run would show up as a
  // wrong score. Each run has to carry every criterion and a sane count.
  it('is well formed', () => {
    for (const published of (latest as EvalResults).runs) {
      expect(published.date, published.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      for (const { id } of EVAL_CRITERIA) {
        const { passed, total } = published.criteria[id];
        expect(Number.isInteger(passed) && Number.isInteger(total), `${published.id}/${id}`).toBe(
          true,
        );
        expect(passed, `${published.id}/${id}`).toBeGreaterThanOrEqual(0);
        expect(passed, `${published.id}/${id}`).toBeLessThanOrEqual(total);
      }
    }
  });
});

describe('listRuns', () => {
  it('returns the newest run first and leaves the input alone', () => {
    const results: EvalResults = {
      runs: [run('a', '2026-11-01', 5), run('c', '2026-12-01', 9), run('b', '2026-11-15', 7)],
    };
    expect(listRuns(results).map((r) => r.id)).toEqual(['c', 'b', 'a']);
    expect(results.runs.map((r) => r.id)).toEqual(['a', 'c', 'b']);
  });
});

describe('pass rates', () => {
  it('is a fraction, and 0 for an empty score instead of NaN', () => {
    expect(passRate({ passed: 8, total: 10 })).toBe(0.8);
    expect(passRate({ passed: 0, total: 0 })).toBe(0);
  });

  it('counts every criterion on every photo together', () => {
    const mixed = run('m', '2026-11-01', 10);
    mixed.criteria.material = { passed: 0, total: 10 };
    expect(runPassRate(mixed)).toBeCloseTo(0.8);
  });
});

describe('hasPublishedRuns', () => {
  it('is false with no run and true with one', () => {
    expect(hasPublishedRuns({ runs: [] })).toBe(false);
    expect(hasPublishedRuns({ runs: [run('a', '2026-11-01', 5)] })).toBe(true);
  });
});
