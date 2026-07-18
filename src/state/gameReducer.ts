import { canDeliver } from '../rules/compatibilityRules';
import { getSatisfaction } from '../rules/customerRules';
import { getPendingDeliverySides, requiresDeliveryDecision, WORKTABLE_SIDES } from '../rules/deliveryRules';
import { MAX_OVERTIME_ROUND, MAX_ROUNDS, MIN_OVERTIME_FORMULA_LENGTH } from '../rules/gameRules';
import { appendScentFIFO } from '../rules/scentRules';
import { getBottleScore } from '../rules/scoringRules';
import { getBestTechnique } from '../rules/techniqueRules';
import { canTransferCustomer } from '../rules/transferRules';
import type {
  DeliveredOrder,
  GameAction,
  GameEvent,
  GameState,
  Side,
  WorktableState,
} from '../types/game';
import { createNewGameState, customerWorktable, emptyWorktable, shuffleWithState } from './initialGameState';

type GameEndReason =
  | 'BAG_BELOW_FOUR'
  | 'CLOSING_COMPLETE'
  | 'OVERTIME_COMPLETE'
  | 'MAX_OVERTIME'
  | 'NO_ACTIVE_CUSTOMERS';

function withEvent(
  state: GameState,
  type: GameEvent['type'],
  payload: Record<string, unknown>,
): GameState {
  const event: GameEvent = {
    index: state.events.length,
    round: state.round,
    phase: state.phase,
    type,
    payload,
  };
  return { ...state, events: [...state.events, event] };
}

function endGame(state: GameState, reason: GameEndReason): GameState {
  return withEvent(
    { ...state, phase: 'game_over', pool: [], usedPoolIndexes: [], actionsLeft: 0 },
    'GAME_OVER',
    {
      reason,
      normalRounds: MAX_ROUNDS,
      maxOvertimeRound: MAX_OVERTIME_ROUND,
      bagRemaining: state.bag.length,
    },
  );
}

function hasEmptyTable(state: GameState): boolean {
  return !state.left.customer || !state.right.customer;
}

function hasActiveCustomer(state: GameState): boolean {
  return Boolean(state.left.customer || state.right.customer);
}

function activeSides(state: GameState): Side[] {
  return WORKTABLE_SIDES.filter((side) => Boolean(state[side].customer));
}

function nextSelectionSide(state: GameState): Side | null {
  if (!state.left.customer) return 'left';
  if (!state.right.customer) return 'right';
  return null;
}

function drawRound(state: GameState): GameState {
  if (state.round > MAX_OVERTIME_ROUND) return endGame(state, 'MAX_OVERTIME');
  if (!hasActiveCustomer(state)) return endGame(state, 'NO_ACTIVE_CUSTOMERS');
  if (state.bag.length < 4) return endGame(state, 'BAG_BELOW_FOUR');

  const pool = state.bag.slice(0, 4);
  const next = {
    ...state,
    phase: 'mixing' as const,
    bag: state.bag.slice(4),
    pool,
    usedPoolIndexes: [],
    actionsLeft: 2,
    deliveryDecisions: {},
  };
  return withEvent(next, 'ROUND_DRAWN', {
    pool,
    bagRemaining: next.bag.length,
    overtime: state.round > MAX_ROUNDS,
  });
}

function beginNextRound(state: GameState): GameState {
  const nextRound = state.round + 1;
  if (nextRound > MAX_OVERTIME_ROUND) return endGame(state, 'MAX_OVERTIME');
  return drawRound({
    ...state,
    phase: 'drawing',
    round: nextRound,
    pool: [],
    usedPoolIndexes: [],
    actionsLeft: 0,
    deliveryDecisions: {},
  });
}

function returnUnusedPool(state: GameState): GameState {
  const used = new Set(state.usedPoolIndexes);
  const returned = state.pool.filter((_, index) => !used.has(index));
  const shuffled = shuffleWithState([...state.bag, ...returned], state.rngState);
  const returnedState = withEvent(
    {
      ...state,
      phase: 'delivery',
      bag: shuffled.items,
      rngState: shuffled.rngState,
      pool: [],
      usedPoolIndexes: [],
      actionsLeft: 0,
    },
    'POOL_RETURNED',
    { returned, bagSize: shuffled.items.length },
  );
  return autoResolveDeliveryIfReady(returnedState);
}

function orderFromWorktable(
  state: GameState,
  side: Side,
  table: WorktableState,
): DeliveredOrder | null {
  if (!table.customer || !canDeliver(table)) return null;
  const technique = getBestTechnique(table.formula);
  const satisfaction = getSatisfaction(table.customer, table.formula);
  return {
    round: state.round,
    side,
    customerId: table.customer.id,
    customerName: table.customer.name,
    customerType: table.customer.type,
    specialRule: table.customer.specialRule,
    preferenceScents: [...table.customer.preferenceScents],
    negativeScents: table.customer.negativeScents ? [...table.customer.negativeScents] : undefined,
    satisfaction,
    satisfactionLine: table.customer.satisfactionLine,
    formula: [...table.formula],
    technique,
    score: getBottleScore(table.formula),
  };
}

function abandonWorktables(
  state: GameState,
  sides: Side[],
  reason: 'BELOW_OVERTIME_MINIMUM' | 'MAX_OVERTIME',
): GameState {
  let next = state;
  for (const side of sides) {
    const table = next[side];
    if (!table.customer) continue;
    next = withEvent(
      { ...next, [side]: emptyWorktable() },
      'ORDER_ABANDONED',
      {
        side,
        reason,
        customerId: table.customer.id,
        customerType: table.customer.type,
        formula: [...table.formula],
        satisfaction: getSatisfaction(table.customer, table.formula),
        satisfactionLine: table.customer.satisfactionLine,
      },
    );
  }
  return next;
}

function resolveClosing(state: GameState): GameState {
  const ineligible = activeSides(state).filter(
    (side) => state[side].formula.length < MIN_OVERTIME_FORMULA_LENGTH,
  );
  let next = abandonWorktables(state, ineligible, 'BELOW_OVERTIME_MINIMUM');
  const pending = activeSides(next);
  if (pending.length === 0) return endGame(next, 'CLOSING_COMPLETE');

  next = withEvent(next, 'OVERTIME_STARTED', {
    pendingSides: pending,
    maxOvertimeRound: MAX_OVERTIME_ROUND,
  });
  return beginNextRound(next);
}

function resolveOvertime(state: GameState): GameState {
  const pending = activeSides(state);
  if (pending.length === 0) return endGame(state, 'OVERTIME_COMPLETE');
  if (state.round >= MAX_OVERTIME_ROUND) {
    return endGame(abandonWorktables(state, pending, 'MAX_OVERTIME'), 'MAX_OVERTIME');
  }
  return beginNextRound(state);
}

function resolveDelivery(state: GameState): GameState {
  if (state.phase !== 'delivery') return state;
  const forcedDelivery = state.round >= MAX_ROUNDS;
  if (
    !forcedDelivery &&
    getPendingDeliverySides(state.left, state.right, state.deliveryDecisions).length > 0
  ) {
    return state;
  }

  let score = state.score;
  let left = state.left;
  let right = state.right;
  const deliveredOrders = [...state.deliveredOrders];
  let next = state;

  for (const side of WORKTABLE_SIDES) {
    const table = state[side];
    const shouldDeliver = forcedDelivery
      ? canDeliver(table)
      : state.deliveryDecisions[side] === true;
    if (!shouldDeliver) continue;
    const order = orderFromWorktable(state, side, table);
    if (!order) continue;
    score += order.score;
    deliveredOrders.push(order);
    next = withEvent(next, 'ORDER_DELIVERED', {
      side,
      customerId: order.customerId,
      customerType: order.customerType,
      specialRule: order.specialRule,
      preferenceScents: order.preferenceScents,
      negativeScents: order.negativeScents,
      formula: order.formula,
      satisfaction: order.satisfaction,
      satisfactionLine: order.satisfactionLine,
      technique: order.technique.type,
      techniqueLevel: order.technique.level,
      techniqueScore: order.technique.score,
      score: order.score,
      forcedDelivery,
    });
    if (side === 'left') left = emptyWorktable();
    else right = emptyWorktable();
  }

  const isNormalRefillRound = state.round < MAX_ROUNDS - 1;
  const needsCustomerSelection =
    isNormalRefillRound && (!left.customer || !right.customer) && state.waitingCustomers.length > 0;
  const resolvedDelivery = withEvent(
    {
      ...next,
      score,
      left,
      right,
      deliveredOrders,
      phase: needsCustomerSelection ? 'customer_selection' : 'drawing',
      roundsCompleted: Math.max(state.roundsCompleted, state.round),
    },
    'DELIVERY_RESOLVED',
    {
      score,
      deliveredThisRound: deliveredOrders.length - state.deliveredOrders.length,
      forcedDelivery,
      overtime: state.round > MAX_ROUNDS,
    },
  );

  if (state.round === MAX_ROUNDS) return resolveClosing(resolvedDelivery);
  if (state.round > MAX_ROUNDS) return resolveOvertime(resolvedDelivery);
  if (needsCustomerSelection) return resolvedDelivery;
  if (!hasActiveCustomer(resolvedDelivery)) return endGame(resolvedDelivery, 'CLOSING_COMPLETE');
  return beginNextRound(resolvedDelivery);
}

function autoResolveDeliveryIfReady(state: GameState): GameState {
  if (state.phase !== 'delivery') return state;
  if (state.round >= MAX_ROUNDS) return resolveDelivery(state);
  const pending = getPendingDeliverySides(state.left, state.right, state.deliveryDecisions);
  return pending.length === 0 ? resolveDelivery(state) : state;
}

function selectCustomer(state: GameState, side: Side, customerId: string): GameState {
  if (state.phase !== 'customer_selection' || state.round >= MAX_ROUNDS - 1) return state;
  if (state[side].customer) return state;
  const customerIndex = state.waitingCustomers.findIndex((customer) => customer.id === customerId);
  if (customerIndex < 0) return state;

  const selected = state.waitingCustomers[customerIndex];
  const waitingCustomers = state.waitingCustomers.filter((_, index) => index !== customerIndex);
  const customerDeck = [...state.customerDeck];
  if (customerDeck.length > 0) waitingCustomers.push(customerDeck.shift()!);
  const nextState: GameState = {
    ...state,
    [side]: customerWorktable(selected),
    waitingCustomers,
    customerDeck,
  };
  const recorded = withEvent(nextState, 'CUSTOMER_SELECTED', {
    side,
    customerId: selected.id,
    customerType: selected.type,
    specialRule: selected.specialRule,
    preferenceScents: selected.preferenceScents,
    negativeScents: selected.negativeScents,
    satisfactionLine: selected.satisfactionLine,
    waitingCount: waitingCustomers.length,
  });
  return hasEmptyTable(recorded) && recorded.waitingCustomers.length > 0
    ? recorded
    : beginNextRound(recorded);
}

function transferCustomer(state: GameState, side: Side, customerId: string): GameState {
  if (!canTransferCustomer(state, side)) return state;
  const customerIndex = state.waitingCustomers.findIndex((customer) => customer.id === customerId);
  if (customerIndex < 0) return state;

  const table = state[side];
  if (!table.customer) return state;
  const selected = state.waitingCustomers[customerIndex];
  const waitingCustomers = state.waitingCustomers.filter((_, index) => index !== customerIndex);
  const customerDeck = [...state.customerDeck];
  if (customerDeck.length > 0) waitingCustomers.push(customerDeck.shift()!);
  const selectedWorktable = customerWorktable(selected);
  const nextTable: WorktableState = {
    customer: selectedWorktable.customer,
    formula: [...table.formula],
  };
  const nextState: GameState = {
    ...state,
    [side]: nextTable,
    waitingCustomers,
    customerDeck,
    transferUsed: true,
    actionsLeft: state.actionsLeft - 1,
  };
  const recorded = withEvent(nextState, 'CUSTOMER_TRANSFERRED', {
    side,
    previousCustomerId: table.customer.id,
    nextCustomerId: selected.id,
    formula: [...table.formula],
    satisfactionBefore: getSatisfaction(table.customer, table.formula),
    satisfactionAfter: getSatisfaction(selected, table.formula),
    actionsLeft: nextState.actionsLeft,
    waitingCount: waitingCustomers.length,
  });
  return recorded.actionsLeft === 0 ? returnUnusedPool(recorded) : recorded;
}

export function gameReducer(state: GameState | null, action: GameAction): GameState | null {
  if (action.type === 'START_GAME') {
    return drawRound(
      createNewGameState({
        seed: action.seed,
        sessionId: action.sessionId,
        startedAt: action.startedAt,
      }),
    );
  }

  if (!state) return null;

  switch (action.type) {
    case 'DRAW_ROUND':
      return state.phase === 'drawing' ? drawRound(state) : state;

    case 'ADD_SCENT': {
      if (state.phase !== 'mixing' || state.actionsLeft <= 0) return state;
      if (
        action.poolIndex < 0 ||
        action.poolIndex >= state.pool.length ||
        state.usedPoolIndexes.includes(action.poolIndex)
      ) {
        return state;
      }
      const table = state[action.side];
      const scent = state.pool[action.poolIndex];
      if (!table.customer || !scent) return state;
      const nextTable: WorktableState = {
        ...table,
        formula: appendScentFIFO(table.formula, scent),
      };
      const nextState: GameState = {
        ...state,
        [action.side]: nextTable,
        usedPoolIndexes: [...state.usedPoolIndexes, action.poolIndex],
        actionsLeft: state.actionsLeft - 1,
      };
      const recorded = withEvent(nextState, 'SCENT_ADDED', {
        poolIndex: action.poolIndex,
        scent,
        side: action.side,
        formula: nextTable.formula,
        actionsLeft: nextState.actionsLeft,
      });
      return recorded.actionsLeft === 0 ? returnUnusedPool(recorded) : recorded;
    }

    case 'TRANSFER_CUSTOMER':
      return transferCustomer(state, action.side, action.customerId);

    case 'SET_DELIVERY_DECISION': {
      if (state.phase !== 'delivery' || state.round >= MAX_ROUNDS) return state;
      const table = state[action.side];
      if (!requiresDeliveryDecision(table)) return state;
      const recorded = withEvent(
        {
          ...state,
          deliveryDecisions: {
            ...state.deliveryDecisions,
            [action.side]: action.deliver,
          },
        },
        'DELIVERY_DECISION',
        { side: action.side, deliver: action.deliver },
      );
      return autoResolveDeliveryIfReady(recorded);
    }

    case 'RESOLVE_DELIVERY':
      return resolveDelivery(state);

    case 'SELECT_CUSTOMER':
      return selectCustomer(state, action.side, action.customerId);

    case 'ADVANCE_ROUND':
      if (state.phase === 'drawing') return beginNextRound(state);
      if (state.phase === 'customer_selection' && !nextSelectionSide(state)) {
        return beginNextRound(state);
      }
      if (state.phase === 'customer_selection' && state.waitingCustomers.length === 0) {
        return hasActiveCustomer(state) ? beginNextRound(state) : endGame(state, 'NO_ACTIVE_CUSTOMERS');
      }
      return state;

    default:
      return state;
  }
}