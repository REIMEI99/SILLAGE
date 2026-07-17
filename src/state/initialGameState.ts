import { CUSTOMERS, FULL_BAG } from '../data/gameData';
import type { Customer, GameEvent, GameState, GameStartSnapshot, ScentType, WorktableState } from '../types/game';

export interface StartGameOptions {
  seed: number;
  sessionId: string;
  startedAt: string;
}

function normalizeSeed(seed: number): number {
  const normalized = Math.abs(Math.floor(seed)) >>> 0;
  return normalized || 1;
}

function nextRandom(rngState: number): { value: number; rngState: number } {
  let state = (rngState + 0x6d2b79f5) >>> 0;
  let value = Math.imul(state ^ (state >>> 15), state | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  return {
    value: ((value ^ (value >>> 14)) >>> 0) / 4294967296,
    rngState: state,
  };
}

export function shuffleWithState<T>(items: T[], rngState: number): { items: T[]; rngState: number } {
  const result = [...items];
  let state = rngState;
  for (let index = result.length - 1; index > 0; index -= 1) {
    const random = nextRandom(state);
    state = random.rngState;
    const swapIndex = Math.floor(random.value * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return { items: result, rngState: state };
}

export function emptyWorktable(): WorktableState {
  return { customer: null, formula: [] };
}

export function customerWorktable(customer: Customer): WorktableState {
  return { customer, formula: [] };
}

function cloneWorktable(worktable: WorktableState): WorktableState {
  return {
    ...worktable,
    formula: [...worktable.formula],
    customer: worktable.customer ? { ...worktable.customer, preferenceScents: [...worktable.customer.preferenceScents] } : null,
  };
}

function cloneSnapshot(snapshot: GameStartSnapshot): GameStartSnapshot {
  return {
    bag: [...snapshot.bag],
    left: cloneWorktable(snapshot.left),
    right: cloneWorktable(snapshot.right),
    waitingCustomers: snapshot.waitingCustomers.map((customer) => ({ ...customer, preferenceScents: [...customer.preferenceScents] })),
    customerDeck: snapshot.customerDeck.map((customer) => ({ ...customer, preferenceScents: [...customer.preferenceScents] })),
  };
}

export function createNewGameState(options: StartGameOptions): GameState {
  const seed = normalizeSeed(options.seed);
  const customerShuffle = shuffleWithState(CUSTOMERS, seed);
  const bagShuffle = shuffleWithState(FULL_BAG, customerShuffle.rngState);
  const activeCustomers = customerShuffle.items.slice(0, 5);
  const left = customerWorktable(activeCustomers[0]);
  const right = customerWorktable(activeCustomers[1]);
  const waitingCustomers = activeCustomers.slice(2, 5);
  const customerDeck = customerShuffle.items.slice(5);
  const initialSnapshot: GameStartSnapshot = {
    bag: [...bagShuffle.items],
    left: cloneWorktable(left),
    right: cloneWorktable(right),
    waitingCustomers: waitingCustomers.map((customer) => ({ ...customer, preferenceScents: [...customer.preferenceScents] })),
    customerDeck: customerDeck.map((customer) => ({ ...customer, preferenceScents: [...customer.preferenceScents] })),
  };
  const startedEvent: GameEvent = {
    index: 0,
    round: 1,
    phase: 'drawing',
    type: 'GAME_STARTED',
    payload: { seed, customerCount: CUSTOMERS.length, scentCount: FULL_BAG.length },
  };

  return {
    sessionId: options.sessionId,
    seed,
    startedAt: options.startedAt,
    rngState: bagShuffle.rngState,
    phase: 'drawing',
    round: 1,
    score: 0,
    bag: [...bagShuffle.items],
    pool: [],
    usedPoolIndexes: [],
    actionsLeft: 0,
    left,
    right,
    waitingCustomers,
    customerDeck,
    deliveryDecisions: {},
    events: [startedEvent],
    deliveredOrders: [],
    roundsCompleted: 0,
    initialSnapshot: cloneSnapshot(initialSnapshot),
  };
}
