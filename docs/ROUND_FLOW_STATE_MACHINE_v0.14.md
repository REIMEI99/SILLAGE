# SILLAGE v0.14 — Round Flow

```text
START
  -> ROUND 1–18
       -> DRAW 4 / TAKE 2 ACTIONS
            ├─ ADD SCENT
            └─ TRANSFER CUSTOMER（全局一次，消耗 1 行动）
       -> RETURN UNUSED POOL
       -> DELIVERY（可交付瓶：交付 / 保留）
       -> CUSTOMER SELECTION（工作台空出时）
  -> ROUND 19
       -> 正常投料与交付
       -> 不再补客
  -> ROUND 20 / CLOSING
       -> 可交付瓶自动交付
       -> 0–2 枚瓶作废
       -> 3–6 枚但不可交付：未完成委托
            ├─ 无未完成委托 -> GAME OVER
            └─ 有未完成委托 -> OVERTIME
  -> ROUND 21–23 / OVERTIME
       -> 不补客、不转单
       -> 达到交付线后自动交付
       -> 全部完成则立即 GAME OVER
       -> ROUND 23 后未完成瓶作废
```

正常营业上限为 `MAX_ROUNDS = 20`，绝对回合上限为 `MAX_OVERTIME_ROUND = 23`。加班是未完成委托的救援阶段，不是继续保留可交付瓶追求完美的额外构筑时间。