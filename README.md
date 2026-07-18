# SILLAGE / 《余香》 v0.14

SILLAGE 是一个 React + TypeScript + Vite 网页单人调香游戏原型。B2.10 reference 是视觉 source of truth，v0.14 文档与数据是当前机械规则 source of truth。

## 当前规则摘要

- 8 种香气、16 张顾客卡、左右双工作台与三人公开等候区；
- 正常营业 20 回合，未完成委托最多加班至第 23 回合；
- 每回合公共池抽 4 枚、执行 2 次行动；
- 配方为 6 格 FIFO，至少 3 枚且顾客满意度达到 +2 才能交付；
- 订单固定 3 分，顾客满意度不直接计分；
- 技法使用三级牌型，技法分为 0 / 2 / 4 / 7–8；
- 每局一次转单：消耗一次行动、保留配方并从等候区更换顾客；
- 第 20 回合及加班阶段自动交付满足条件的瓶子，不再允许保留；
- 公共池 hover / focus 通过 pure rule functions 同时预演左右瓶满意度与技法；
- 每局结束可填写想法，原始记录保存在本地 `data/session-records.json`，该文件不会上传 GitHub。

## v0.14 更新日志

- 将技法改为三级阶梯：一级 +2、二级 +4、三级纯粹/层叠 +7、三级浓烈 +8；只结算最高一种技法；
- 新增每局一次的转单：第 1–19 回合可用，配方至少 3 枚且当前不可交付时，消耗 1 次行动更换顾客并保留瓶中配方；
- 新增打烊与加班：第 19 回合后停止补客，第 20 回合自动交付合格订单，未完成且至少 3 枚的配方可延长至第 23 回合；
- 加班期间不补客、不转单，订单达到满意线后自动交付；第 23 回合结束仍未完成的订单记为放弃；
- 同步游戏状态、事件日志、数据看板、v0.14 顾客数据和规则文档。

## 当前 source of truth

- [v0.14 机械规则](docs/RULES_v0.14.md)
- [v0.14 顾客卡池](docs/CUSTOMER_DECK_v0.14.md)
- [v0.14 回合状态机](docs/ROUND_FLOW_STATE_MACHINE_v0.14.md)
- [v0.14 顾客数据](data/customers.v014.json)
- [香气数据](data/scents.v010.json)
- [视觉说明](docs/VISUAL_UI_SPEC.md)

旧版文档与 JSON 继续保留，用于回溯测试记录，不作为当前实现依据。

## 启动与验证

```bash
npm install
npm run dev
npm run build
```

Vite middleware 在本地读写 `data/session-records.json`；接口不可用时，浏览器会下载一份备份 JSON。