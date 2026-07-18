import type { GameState, Side } from '../types/game';
import { canDeliver } from './compatibilityRules';
import { MAX_ROUNDS } from './gameRules';

export function canTransferCustomer(state: GameState, side: Side): boolean {
  const worktable = state[side];
  return (
    state.phase === 'mixing' &&
    state.round < MAX_ROUNDS &&
    state.actionsLeft > 0 &&
    !state.transferUsed &&
    state.waitingCustomers.length > 0 &&
    Boolean(worktable.customer) &&
    worktable.formula.length >= 3 &&
    !canDeliver(worktable)
  );
}