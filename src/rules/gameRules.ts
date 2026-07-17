import type { RulesVersion, TechniqueType } from '../types/game';

export const RULES_VERSION: RulesVersion = '0.13';
export const MAX_ROUNDS = 20;
export const ORDER_SCORE = 3;

export const PERFECT_TECHNIQUE_BONUS: Record<TechniqueType, 5 | 6> = {
  INTENSE: 6,
  PURE: 5,
  LAYERED: 5,
};