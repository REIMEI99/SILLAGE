# SILLAGE v0.12 — Round Flow

```text
START
  -> DRAWING
  -> DRAW ROUND (bag >= 4)
  -> MIXING
       ├─ 2 次投料完成 -> RETURN UNUSED POOL
       └─ 无可用投料 -> 静默 RETURN UNUSED POOL
  -> DELIVERY
       ├─ 可交付瓶子逐一选择交付 / 保留
       ├─ 不可交付瓶子静默保留
       └─ 所有选择完成 -> DELIVERY RESOLVED
  -> CUSTOMER SELECTION（有空工作台时）
       ├─ 选择等候顾客补入
       └─ 无等候顾客 -> 静默进入 DRAWING
  -> DRAWING（bag < 4 时 GAME OVER）
```

v0.12 删除 `patience` 阶段以及 `CUSTOMER_LEFT`、`PATIENCE_RESOLVED` 事件。顾客不会因为等待离开，也不会在回合收尾被清空。`useReducer` 只管理状态转移，规则判定集中在 `src/rules/` 的 pure functions 中。
