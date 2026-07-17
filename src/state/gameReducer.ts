import { canDeliver } from '../rules/compatibilityRules';
import { getPendingDeliverySides, requiresDeliveryDecision } from '../rules/deliveryRules';
import { getSatisfaction } from '../rules/customerRules';
import { appendScentFIFO } from '../rules/scentRules';
import { getBottleScore } from '../rules/scoringRules';
import { getBestTechnique } from '../rules/techniqueRules';
import type {
  DeliveredOrder,
  GameAction,
  GameEvent,
  GameState,
  Side,
  WorktableState,
} from '../types/game';
import { createNewGameState, customerWorktable, emptyWorktable, shuffleWithState } from './initialGameState';

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

function hasEmptyTable(state: GameState): boolean {
  return !state.left.customer || !state.right.customer;
}

function nextSelectionSide(state: GameState): Side | null {
  if (!state.left.customer) return 'left';
  if (!state.right.customer) return 'right';
  return null;
}

function drawRound(state: GameState): GameState {
  if (state.bag.length < 4) {
    return withEvent(
      { ...state, phase: 'game_over', pool: [], usedPoolIndexes: [], actionsLeft: 0 },
      'GAME_OVER',
      { reason: 'BAG_BELOW_FOUR', bagRemaining: state.bag.length },
    );
  }

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
  return withEvent(next, 'ROUND_DRAWN', { pool, bagRemaining: next.bag.length });
}

function beginNextRound(state: GameState): GameState {
  return drawRound({
    ...state,
    phase: 'drawing',
    round: state.round + 1,
    roundsCompleted: state.roundsCompleted + 1,
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
    satisfaction,
    satisfactionLine: table.customer.satisfactionLine,
    formula: [...table.formula],
    technique,
    score: getBottleScore(table.formula),
  };
}

function resolveDelivery(state: GameState): GameState {
  if (state.phase !== 'delivery') return state;
  if (getPendingDeliverySides(state.left, state.right, state.deliveryDecisions).length > 0) {
    return state;
  }

  let score = state.score;
  let left = state.left;
  let right = state.right;
  const deliveredOrders = [...state.deliveredOrders];
  let next = state;

  for (const side of ['left', 'right'] as const) {
    const table = state[side];
    if (state.deliveryDecisions[side] !== true) continue;
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
      formula: order.formula,
      satisfaction: order.satisfaction,
      satisfactionLine: order.satisfactionLine,
      technique: order.technique.type,
      techniqueScore: order.technique.score,
      score: order.score,
    });
    if (side === 'left') left = emptyWorktable();
    else right = emptyWorktable();
  }

  const needsCustomerSelection = (!left.customer || !right.customer) && state.waitingCustomers.length > 0;
  const phase = needsCustomerSelection ? ('customer_selection' as const) : ('drawing' as const);
  const resolvedDelivery = withEvent(
    { ...next, score, left, right, deliveredOrders, phase },
    'DELIVERY_RESOLVED',
    { score, deliveredThisRound: deliveredOrders.length - state.deliveredOrders.length },
  );
  return phase === 'drawing' ? beginNextRound(resolvedDelivery) : resolvedDelivery;
}

function autoResolveDeliveryIfReady(state: GameState): GameState {
  if (state.phase !== 'delivery') return state;
  const pending = getPendingDeliverySides(state.left, state.right, state.deliveryDecisions);
  return pending.length === 0 ? resolveDelivery(state) : state;
}

function selectCustomer(state: GameState, side: Side, customerId: string): GameState {
  if (state.phase !== 'customer_selection') return state;
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
    satisfactionLine: selected.satisfactionLine,
    waitingCount: waitingCustomers.length,
  });
  return hasEmptyTable(recorded) && recorded.waitingCustomers.length > 0 ? recorded : beginNextRound(recorded);
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

    case 'SET_DELIVERY_DECISION': {
      if (state.phase !== 'delivery') return state;
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
        return beginNextRound(state);
      }
      return state;

    default:
      return state;
  }
}

