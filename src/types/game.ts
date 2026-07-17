export type ScentType =
  | 'citrus'
  | 'aquatic'
  | 'green'
  | 'fruity'
  | 'floral'
  | 'amber'
  | 'woody'
  | 'aromatic';

export type Side = 'left' | 'right';
export type GamePhase = 'drawing' | 'mixing' | 'delivery' | 'customer_selection' | 'game_over';
export type CustomerType = 'FOCUS' | 'DUET' | 'TRIO' | 'SPECIAL';
export type SpecialRule = 'COUNT_FOCUS' | 'UNIQUE_LAYERS';
export type TechniqueType = 'INTENSE' | 'PURE' | 'LAYERED';
export type RulesVersion = '0.13';

export interface ScentDefinition {
  id: ScentType;
  nameZh: string;
  nameEn: string;
  wheelIndex: number;
  color: string;
  glyph: string;
  bagCopies: number;
}

export interface Customer {
  id: string;
  type: CustomerType;
  specialRule?: SpecialRule;
  name: string;
  request: string;
  preferenceScents: ScentType[];
  negativeScents?: ScentType[];
  satisfactionLine: number;
  orderScore: number;
}

export interface WorktableState {
  customer: Customer | null;
  formula: ScentType[];
}

export interface TechniqueResult {
  type: TechniqueType;
  labelZh: string;
  labelEn: string;
  level: 0 | 1 | 2;
  score: 0 | 1 | 2 | 7 | 8;
  isPerfect: boolean;
  perfectBonus: 0 | 5 | 6;
}

export interface PreviewResult {
  nextFormula: ScentType[];
  satisfactionBefore: number;
  satisfactionAfter: number;
  satisfactionDelta: number;
  deliverableBefore: boolean;
  deliverableAfter: boolean;
  techniqueBefore: TechniqueResult;
  techniqueAfter: TechniqueResult;
  techniqueDelta: number;
  becomesPerfect: boolean;
}

export interface GameEvent {
  index: number;
  round: number;
  phase: GamePhase;
  type:
    | 'GAME_STARTED'
    | 'ROUND_DRAWN'
    | 'SCENT_ADDED'
    | 'POOL_RETURNED'
    | 'DELIVERY_DECISION'
    | 'ORDER_DELIVERED'
    | 'DELIVERY_RESOLVED'
    | 'CUSTOMER_SELECTED'
    | 'GAME_OVER';
  payload: Record<string, unknown>;
}

export interface DeliveredOrder {
  round: number;
  side: Side;
  customerId: string;
  customerName: string;
  customerType: CustomerType;
  specialRule?: SpecialRule;
  preferenceScents: ScentType[];
  negativeScents?: ScentType[];
  satisfaction: number;
  satisfactionLine: number;
  formula: ScentType[];
  technique: TechniqueResult;
  score: number;
}

export interface GameStartSnapshot {
  bag: ScentType[];
  left: WorktableState;
  right: WorktableState;
  waitingCustomers: Customer[];
  customerDeck: Customer[];
}

export interface GameState {
  sessionId: string;
  rulesVersion: RulesVersion;
  seed: number;
  startedAt: string;
  rngState: number;
  phase: GamePhase;
  round: number;
  score: number;
  bag: ScentType[];
  pool: ScentType[];
  usedPoolIndexes: number[];
  actionsLeft: number;
  left: WorktableState;
  right: WorktableState;
  waitingCustomers: Customer[];
  customerDeck: Customer[];
  deliveryDecisions: Partial<Record<Side, boolean>>;
  events: GameEvent[];
  deliveredOrders: DeliveredOrder[];
  roundsCompleted: number;
  initialSnapshot: GameStartSnapshot;
}

export type GameAction =
  | { type: 'START_GAME'; seed: number; sessionId: string; startedAt: string }
  | { type: 'DRAW_ROUND' }
  | { type: 'ADD_SCENT'; poolIndex: number; side: Side }
  | { type: 'SET_DELIVERY_DECISION'; side: Side; deliver: boolean }
  | { type: 'RESOLVE_DELIVERY' }
  | { type: 'SELECT_CUSTOMER'; side: Side; customerId: string }
  | { type: 'ADVANCE_ROUND' };

export interface GameRecord {
  id: string;
  rulesVersion?: string;
  startedAt: string;
  endedAt: string;
  sessionId: string;
  seed: number;
  finalScore: number;
  thought: string;
  initialSnapshot: GameStartSnapshot;
  finalState: GameState;
  events: GameEvent[];
  deliveredOrders: DeliveredOrder[];
}

export interface DashboardStats {
  gamesPlayed: number;
  totalScore: number;
  averageScore: number;
  highScore: number;
  totalOrders: number;
  averageOrders: number;
  averageRounds: number;
  techniqueCounts: Record<TechniqueType, number>;
}



