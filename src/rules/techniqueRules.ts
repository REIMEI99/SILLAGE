import type { ScentType, TechniqueResult, TechniqueType } from '../types/game';

type CraftTechniqueType = Exclude<TechniqueType, 'NONE'>;
type TechniqueLevel = TechniqueResult['level'];

const TECHNIQUE_LABELS: Record<CraftTechniqueType, { labelZh: string; labelEn: string }> = {
  INTENSE: { labelZh: '浓烈', labelEn: 'INTENSE' },
  PURE: { labelZh: '纯粹', labelEn: 'PURE' },
  LAYERED: { labelZh: '层叠', labelEn: 'LAYERED' },
};

function countsFor(formula: ScentType[]): number[] {
  const counts = formula.reduce((result, scent) => {
    result.set(scent, (result.get(scent) ?? 0) + 1);
    return result;
  }, new Map<ScentType, number>());
  return [...counts.values()].sort((a, b) => b - a);
}

function scoreFor(type: CraftTechniqueType, level: TechniqueLevel): TechniqueResult['score'] {
  if (level === 3) return type === 'INTENSE' ? 8 : 7;
  if (level === 2) return 4;
  if (level === 1) return 2;
  return 0;
}

function result(type: CraftTechniqueType, level: TechniqueLevel): TechniqueResult {
  return {
    type,
    ...TECHNIQUE_LABELS[type],
    level,
    score: scoreFor(type, level),
    isPerfect: level === 3,
  };
}

function noTechnique(): TechniqueResult {
  return {
    type: 'NONE',
    labelZh: '无技法',
    labelEn: 'NONE',
    level: 0,
    score: 0,
    isPerfect: false,
  };
}

function matchesSignature(counts: number[], signature: number[]): boolean {
  return counts.length === signature.length && counts.every((count, index) => count === signature[index]);
}

export function getIntenseScore(formula: ScentType[]): TechniqueResult {
  const counts = countsFor(formula);
  const maxCount = counts[0] ?? 0;
  const uniqueCount = counts.length;
  const isTierThree = formula.length >= 5 && uniqueCount <= 2 && maxCount >= 4;
  if (isTierThree) return result('INTENSE', 3);
  if (maxCount >= 4) return result('INTENSE', 2);
  if (formula.length >= 4 && maxCount >= 3) return result('INTENSE', 1);
  return result('INTENSE', 0);
}

export function getPureScore(formula: ScentType[]): TechniqueResult {
  const counts = countsFor(formula);
  const duplicateKinds = counts.filter((count) => count >= 2).length;
  const isTierThree =
    matchesSignature(counts, [3, 2]) ||
    matchesSignature(counts, [3, 3]) ||
    matchesSignature(counts, [2, 2, 2]);
  if (isTierThree) return result('PURE', 3);
  if (formula.length >= 5 && duplicateKinds >= 2) return result('PURE', 2);
  if (formula.length >= 4 && duplicateKinds >= 2) return result('PURE', 1);
  return result('PURE', 0);
}

export function getLayeredScore(formula: ScentType[]): TechniqueResult {
  const uniqueCount = countsFor(formula).length;
  if (uniqueCount === 6) return result('LAYERED', 3);
  if (uniqueCount === 5) return result('LAYERED', 2);
  if (uniqueCount === 4) return result('LAYERED', 1);
  return result('LAYERED', 0);
}

export function getBestTechnique(formula: ScentType[]): TechniqueResult {
  const candidates = [
    getIntenseScore(formula),
    getPureScore(formula),
    getLayeredScore(formula),
  ];
  const best = candidates.reduce((current, candidate) =>
    candidate.score > current.score ? candidate : current,
  );
  return best.score > 0 ? best : noTechnique();
}