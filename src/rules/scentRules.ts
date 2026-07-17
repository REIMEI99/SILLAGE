import type { ScentType } from '../types/game';

export const SCENT_ORDER: readonly ScentType[] = [
  'citrus',
  'aquatic',
  'green',
  'fruity',
  'floral',
  'amber',
  'woody',
  'aromatic',
];

export function wheelDistance(a: ScentType, b: ScentType): number {
  const aIndex = SCENT_ORDER.indexOf(a);
  const bIndex = SCENT_ORDER.indexOf(b);
  const direct = Math.abs(aIndex - bIndex);
  return Math.min(direct, SCENT_ORDER.length - direct);
}

export function appendScentFIFO(formula: ScentType[], scent: ScentType): ScentType[] {
  return formula.length >= 6 ? [...formula.slice(1), scent] : [...formula, scent];
}

export function countRemainingScents(
  bag: ScentType[],
  pool: ScentType[],
  usedPoolIndexes: number[],
): Record<ScentType, number> {
  const counts = Object.fromEntries(SCENT_ORDER.map((scent) => [scent, 0])) as Record<ScentType, number>;
  for (const scent of bag) counts[scent] += 1;
  const used = new Set(usedPoolIndexes);
  pool.forEach((scent, index) => {
    if (!used.has(index)) counts[scent] += 1;
  });
  return counts;
}
