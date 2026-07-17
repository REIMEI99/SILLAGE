import type { ScentType } from '../types/game';
import { ORDER_SCORE } from './gameRules';
import { getBestTechnique } from './techniqueRules';

export function getBottleScore(formula: ScentType[]): number {
  return ORDER_SCORE + getBestTechnique(formula).score;
}
