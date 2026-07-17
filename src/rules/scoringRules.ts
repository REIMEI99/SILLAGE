import type { ScentType } from '../types/game';
import { getBestTechnique } from './techniqueRules';

export function getBottleScore(formula: ScentType[]): number {
  return 3 + getBestTechnique(formula).score;
}
