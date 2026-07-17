# React + TypeScript + Vite Migration Notes

## Recommended stack

- React
- TypeScript
- Vite
- CSS Modules 或普通 CSS 均可
- v0.10 不引入 Redux / Zustand；优先 `useReducer`

## Suggested tree

```text
src/
  app/
    App.tsx
    gameReducer.ts
    gameState.ts
    gameTypes.ts
  game/
    rules/
      compatibility.ts
      techniques.ts
      scoring.ts
      roundFlow.ts
    data/
      scents.ts
      customers.ts
  components/
    GameStage/
    PlayerSide/
    CustomerCard/
    BottlePanel/
    CentralWorktable/
    ScentWheel/
    PublicPool/
    WaitingQueue/
    ImpactPreview/
  assets/
    glyphs/
  styles/
    tokens.css
```

## Single source of truth

建议核心状态：

```ts
type ScentType =
  | 'citrus'
  | 'aquatic'
  | 'green'
  | 'fruity'
  | 'floral'
  | 'amber'
  | 'woody'
  | 'aromatic'

type Customer = {
  id: string
  name: string
  targetScent: ScentType
  patience: 5
  orderScore: 3
}

type WorktableState = {
  customer: Customer | null
  formula: ScentType[]
  patienceLeft: number
  enteredRound: number | null
}

type GameState = {
  phase: GamePhase
  round: number
  score: number
  bag: ScentType[]
  pool: ScentType[]
  usedPoolIndexes: number[]
  actionsLeft: number
  left: WorktableState
  right: WorktableState
  waitingCustomers: Customer[]
  customerDeck: Customer[]
  deliveryDecisions: Partial<Record<'left' | 'right', boolean>>
}
```

不要保存以下冗余状态：

- compatibility
- deliverable
- technique score
- best technique
- preview result

这些都应通过 pure functions 从 `customer + formula` 派生，避免 UI 与 game state 不一致。

## First implementation milestone

第一步不要急着做完整动画。

先实现：

1. 读取 `data/scents.v010.json` 和 `data/customers.v010.json`；
2. 用固定 GameState 复刻 B2.10 静态局面；
3. 修改 formula / customer / pool 数据时，UI 自动重绘；
4. 中央轮盘目标边框随 left / right customer 自动变化；
5. glyph 复用独立 SVG；
6. hover 公共池卡调用 `previewAddScent()` 同时生成左右预演。

第二步再接 reducer 和完整回合流程。

## Non-goals for v0.10

不要实现：主页、经营系统、家园、剧情、存档、音效系统、动画系统、性质型顾客、特殊能力。
