import { describe, expect, it } from 'vitest';
import { MATERIALS, materialRules, selectMaterials } from './materials';
import { sheetPrompt } from './sheet';
import { selectSkill } from './skills';

const ids = (...texts: (string | null | undefined)[]) =>
  selectMaterials(...texts).map((material) => material.id);

describe('material selection', () => {
  it('finds the material in the name or the note, English and Spanish', () => {
    expect(ids('Marble coffee table')).toEqual(['stone']);
    expect(ids('Mesa auxiliar', 'tapa de mármol blanco')).toEqual(['stone']);
    expect(ids('Chair', 'solid oak with a chrome tube base')).toEqual(['wood', 'metal']);
  });

  it('matches whole words, with plurals, and nothing for unknown materials', () => {
    expect(ids('ashtray')).toEqual([]);
    expect(ids('wireless speaker')).toEqual([]);
    expect(ids('Walnut side tables')).toEqual(['wood']);
    expect(ids('Armchair', null, undefined)).toEqual([]);
    expect(ids('')).toEqual([]);
  });

  it('puts the most mentioned material first and returns at most three', () => {
    expect(ids('marble granite travertine top on a steel frame')).toEqual(['stone', 'metal']);
    expect(
      selectMaterials(MATERIALS.map((material) => material.keywords[0]).join(' ')),
    ).toHaveLength(MATERIALS.length);
  });
});

describe('material rules in the sheet prompt', () => {
  it('tells the model stone is not bendable, and keeps the note last', () => {
    const prompt = sheetPrompt(
      'marble dining table',
      selectSkill('table'),
      undefined,
      selectMaterials('Table', 'marble dining table'),
    );
    expect(prompt).toContain('3x3 turnaround sheet');
    expect(prompt).toContain('Material realism');
    expect(prompt).toMatch(/never bent/);
    expect(prompt.endsWith('Additional notes about the object: marble dining table')).toBe(true);
  });

  it('leaves the prompt unchanged when no material is known', () => {
    expect(materialRules([])).toBe('');
    expect(sheetPrompt('red armchair')).not.toContain('Material realism');
  });

  it('keeps every profile inside what a remote skill may carry', () => {
    for (const material of MATERIALS) expect(material.guidance.length).toBeLessThan(900);
  });
});
