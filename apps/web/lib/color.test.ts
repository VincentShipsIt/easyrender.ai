import { describe, expect, it } from 'vitest';
import { hexToLinear, linearToHex } from './color';

describe('colour conversion for glTF factors', () => {
  it('maps white and black to 1 and 0, and mid grey to the linear value', () => {
    expect(hexToLinear('#ffffff')).toEqual([1, 1, 1]);
    expect(hexToLinear('#000000')).toEqual([0, 0, 0]);
    expect(hexToLinear('#808080')?.[0]).toBeCloseTo(0.2159, 3);
  });

  it('round-trips every picker value', () => {
    for (const hex of ['#c0392b', '#2e7d32', '#1f3a5f', '#d9c7a3', '#010203']) {
      const linear = hexToLinear(hex);
      expect(linear && linearToHex(linear)).toBe(hex);
    }
  });

  it('refuses what is not a six digit hex colour', () => {
    expect(hexToLinear('red')).toBeNull();
    expect(hexToLinear('#fff')).toBeNull();
  });
});
