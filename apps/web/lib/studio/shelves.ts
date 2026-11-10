import type { CategoryKey } from './catalog';

// Each shelf is a small scene at real scale: [id, x, z, turn].
export type Placement = [id: string, x: number, z: number, yaw: number];

export const SHELVES: { category: CategoryKey; set: Placement[]; elev?: number }[] = [
  {
    category: 'furniture',
    set: [
      ['sofa', 0, -0.62, 0.08],
      ['coffee-table', -0.3, 0.5, 0.3],
      ['swivel-chair', 1.02, 0.42, -0.75],
    ],
    elev: 0.3,
  },
  { category: 'lighting', set: [['lamp', 0, 0, -0.5]] },
  {
    category: 'props',
    set: [
      ['barrel', -0.42, -0.1, 0.4],
      ['crate', 0.36, 0.14, -0.5],
    ],
  },
  {
    category: 'decor',
    set: [
      ['clay-vase', -0.12, 0, 0.3],
      ['vase', 0.22, 0.14, -0.4],
    ],
  },
  {
    category: 'product',
    set: [
      ['espresso', -0.14, -0.04, 0.5],
      ['sneaker', 0.2, 0.16, -0.95],
    ],
  },
  { category: 'outdoor', set: [['cactus', 0, 0, -0.4]] },
];
