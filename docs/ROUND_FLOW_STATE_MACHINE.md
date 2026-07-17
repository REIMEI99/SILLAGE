# SILLAGE v0.10 — Round Flow / State Machine

这份文档用于 React reducer / game engine 实现。

## Recommended phases

```ts
type GamePhase =
  | 'drawing'
  | 'mixing'
  | 'delivery'
  | 'patience'
  | 'customer_selection'
  | 'game_over'
```

## Phase transitions

```text
START_GAME
  ↓
DRAW_ROUND
  ├─ bag.length < 4 → GAME_OVER
  └─ draw 4 → MIXING

MIXING
  ├─ ADD_SCENT #1
  ├─ ADD_SCENT #2
  └─ return 2 unused scents to bag → DELIVERY

DELIVERY
  ├─ deliver left? yes/no
  ├─ deliver right? yes/no
  └─ when both decisions resolved → PATIENCE

PATIENCE
  ├─ decrement eligible non-delivered customers
  ├─ remove customers at 0 patience and clear bottles
  └─ if any empty worktable → CUSTOMER_SELECTION
     else → next round / DRAW_ROUND

CUSTOMER_SELECTION
  ├─ choose one waiting customer for an empty table
  ├─ replenish waiting queue from customer deck
  ├─ repeat if another table is empty
  └─ next round / DRAW_ROUND
```

## Required actions

```ts
type GameAction =
  | { type: 'START_GAME'; seed?: number }
  | { type: 'DRAW_ROUND' }
  | { type: 'ADD_SCENT'; poolIndex: number; side: 'left' | 'right' }
  | { type: 'SET_DELIVERY_DECISION'; side: 'left' | 'right'; deliver: boolean }
  | { type: 'RESOLVE_DELIVERY' }
  | { type: 'RESOLVE_PATIENCE' }
  | { type: 'SELECT_CUSTOMER'; side: 'left' | 'right'; customerId: string }
  | { type: 'ADVANCE_ROUND' }
```

动作名可改，但 reducer 必须保证：

1. `ADD_SCENT` 只在 mixing 阶段且 actionsLeft > 0 时合法；
2. 同一枚公共池香料不可使用两次；
3. 第 2 次操作后，未使用的 2 枚立即归袋；
4. delivery 阶段才允许交付；
5. 不满足 `formula.length >= 3 && compatibility > 0` 的工作台不能 deliver；
6. 每瓶独立做 DELIVER / KEEP 决策；
7. 新顾客进入当回合不扣耐心；
8. 顾客离店必须清空该工作台配方；
9. 顾客选择必须从公开 waiting queue 中选。

## Recommended pure functions

```ts
wheelDistance(a: ScentType, b: ScentType): number
scentCompatibilityValue(target: ScentType, scent: ScentType): 2 | 0 | -1
getCompatibility(target: ScentType, formula: ScentType[]): number
canDeliver(worktable: WorktableState): boolean
appendScentFIFO(formula: ScentType[], scent: ScentType): ScentType[]
getIntenseScore(formula: ScentType[]): TechniqueResult
getPureScore(formula: ScentType[]): TechniqueResult
getLayeredScore(formula: ScentType[]): TechniqueResult
getBestTechnique(formula: ScentType[]): TechniqueResult
getBottleScore(formula: ScentType[]): number
previewAddScent(worktable: WorktableState, scent: ScentType): PreviewResult
```

## Preview result

公共池卡 hover 时需要同时预演左右瓶，所以建议：

```ts
type PreviewResult = {
  nextFormula: ScentType[]
  compatibilityBefore: number
  compatibilityAfter: number
  compatibilityDelta: number
  deliverableBefore: boolean
  deliverableAfter: boolean
  techniqueBefore: TechniqueResult
  techniqueAfter: TechniqueResult
  techniqueDelta: number
  becomesPerfect: boolean
}
```

UI 不应该自己重写规则；hover 文案必须由 `previewAddScent()` 的结果生成。
