import { canDeliver } from './compatibilityRules';
import type { Side, WorktableState } from '../types/game';

export const WORKTABLE_SIDES: readonly Side[] = ['left', 'right'];

export function requiresDeliveryDecision(worktable: WorktableState): boolean {
  return Boolean(worktable.customer && canDeliver(worktable));
}

export function getDeliveryDecisionSides(left: WorktableState, right: WorktableState): Side[] {
  return WORKTABLE_SIDES.filter((side) =>
    requiresDeliveryDecision(side === 'left' ? left : right),
  );
}

export function getPendingDeliverySides(
  left: WorktableState,
  right: WorktableState,
  decisions: Partial<Record<Side, boolean>>,
): Side[] {
  return getDeliveryDecisionSides(left, right).filter((side) => decisions[side] === undefined);
}
