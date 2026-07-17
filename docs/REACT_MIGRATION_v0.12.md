# SILLAGE v0.12 — React Migration Notes

当前实现使用 React + TypeScript + Vite，并以 `useReducer` 管理 `GameState`。不引入 Redux 或 Zustand。

## 数据入口

- `data/scents.v010.json`：8 种香气与环形顺序；
- `data/customers.v012.json`：16 张 v0.12 顾客卡；
- `src/data/gameData.ts`：将 JSON 和独立 SVG glyph 映射为类型化数据。

## 规则边界

`src/rules/` 中的函数保持无副作用：

- `customerRules.ts`：逐枚香气权重、特殊结构和满意度；
- `compatibilityRules.ts`：配方长度与满意线的交付判定；
- `previewRules.ts`：加入公共池香气后的左右瓶预演；
- `techniqueRules.ts`：三种技法与完美奖励；
- `scoringRules.ts`：固定订单 3 分加最高技法分。

UI 只读取这些函数的结果。中心环根据左右顾客的所有正权重香气高亮，不显示内部顾客类型名。

## 状态机

`src/state/gameReducer.ts` 管理抽池、投料、未用香料回袋、交付选择、补客和结束。v0.12 没有耐心、倒计时、自动离店、离店清瓶或 patience phase；没有可交付瓶子时交付阶段自动静默结束，没有等待顾客可补时补客阶段也自动跳过。

## 原始记录

`src/data/sessionStorage.ts` 通过 Vite middleware 读写 `data/session-records.json`。每局保存初始快照、最终状态、事件列表、交付订单和玩家想法；数据看板从这些记录计算统计。旧 v0.10 / v0.11 记录保留为历史原始数据，不覆盖。