import type { Customer, WorktableState, ScentType } from '../types/game';
import { getSatisfaction } from './customerRules';

export function canDeliver(worktable: WorktableState): boolean {
  if (!worktable.customer) return false;
  return worktable.formula.length >= 3 && worktable.formula.length <= 6 &&
    getSatisfaction(worktable.customer, worktable.formula) >= worktable.customer.satisfactionLine;
}

export function getWorktableSatisfaction(customer: Customer | null, formula: ScentType[]): number {
  return customer ? getSatisfaction(customer, formula) : 0;
}
