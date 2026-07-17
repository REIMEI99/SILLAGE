import type { ScentType, TechniqueResult } from '../types/game';
import { PERFECT_TECHNIQUE_BONUS } from './gameRules';

const TECHNIQUE_LABELS = {
  INTENSE: { labelZh: '浓烈', labelEn: 'INTENSE' },
  PURE: { labelZh: '纯粹', labelEn: 'PURE' },
  LAYERED: { labelZh: '层叠', labelEn: 'LAYERED' },
} as const;

function countsFor(formula: ScentType[]): Map<ScentType, number> {
  return formula.reduce((counts, scent) => {
    counts.set(scent, (counts.get(scent) ?? 0) + 1);
    return counts;
  }, new Map<ScentType, number>());
}

function result(
  type: TechniqueResult['type'],
  level: 0 | 1 | 2,
  isPerfect: boolean,
): TechniqueResult {
  const perfectBonus = isPerfect ? PERFECT_TECHNIQUE_BONUS[type] : 0;
  return {
    type,
    ...TECHNIQUE_LABELS[type],
    level,
    score: isPerfect ? (perfectBonus === 6 ? 8 : 7) : level,
    isPerfect,
    perfectBonus,
  };
}

export function getIntenseScore(formula: ScentType[]): TechniqueResult {
  const counts = [...countsFor(formula).values()];
  const maxCount = counts.length ? Math.max(...counts) : 0;
  const isPerfect = formula.length >= 5 && counts.length === 2 && maxCount >= 4;
  const level = maxCount >= 3 ? 2 : maxCount === 2 ? 1 : 0;
  return result('INTENSE', level, isPerfect);
}

export function getPureScore(formula: ScentType[]): TechniqueResult {
  const duplicateKinds = [...countsFor(formula).values()].filter((count) => count >= 2);
  const counts = [...countsFor(formula).values()];
  const isPerfect =
    formula.length >= 5 && counts.length === 2 && counts.every((count) => count >= 2);
  const level = duplicateKinds.length >= 2 ? 2 : duplicateKinds.length === 1 ? 1 : 0;
  return result('PURE', level, isPerfect);
}

export function getLayeredScore(formula: ScentType[]): TechniqueResult {
  const uniqueCount = countsFor(formula).size;
  const isPerfect = uniqueCount === 6;
  const level = uniqueCount >= 3 ? 2 : uniqueCount === 2 ? 1 : 0;
  return result('LAYERED', level, isPerfect);
}

export function getBestTechnique(formula: ScentType[]): TechniqueResult {
  const candidates = [
    getIntenseScore(formula),
    getPureScore(formula),
    getLayeredScore(formula),
  ];
  return candidates.reduce((best, candidate) =>
    candidate.score > best.score ? candidate : best,
  );
}