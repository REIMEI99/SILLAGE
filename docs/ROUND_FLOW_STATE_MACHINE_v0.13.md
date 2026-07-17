# SILLAGE v0.13 — Round Flow

```text
START
  -> DRAW ROUND 1
  -> MIXING（抽 4，用 2）
  -> RETURN UNUSED POOL
  -> DELIVERY
       ├─ 可交付瓶子：选择交付 / 保留
       ├─ 不可交付瓶子：静默保留
       └─ 所有选择完成：自动结算
  -> CUSTOMER SELECTION（仅第 1–19 回合，且工作台空出时）
  -> NEXT ROUND
  -> ROUND 20 DELIVERY RESOLVED
  -> GAME OVER（不再补客）
```

`MAX_ROUNDS = 20` 是显式规则常量，不再由香料袋剩余量间接决定局长。香料袋不足 4 枚仍保留为异常/兼容性结束条件。