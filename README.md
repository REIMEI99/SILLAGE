# SILLAGE / 《余香》 v0.13

SILLAGE 是一个 React + TypeScript + Vite 网页单人调香游戏原型。B2.10 reference 是视觉 source of truth，v0.13 文档与数据是当前机械规则 source of truth。

## 当前规则摘要

- 8 种香气、16 张顾客卡、左右双工作台与三人公开等候区；
- 固定 20 回合，每回合公共池抽 4 枚、投入 2 枚；
- 配方为 6 格 FIFO，至少 3 枚且顾客满意度达到 +2 才能交付；
- 订单固定 3 分，顾客满意度不直接计分；
- 完美浓烈奖励 +6，完美纯粹与完美层叠奖励 +5；
- 双香顾客两种偏好各 +1、一种指定对立香气 −1、其余 0；
- 顾客没有耐心或自动离店；
- 公共池 hover / focus 通过 pure rule functions 同时预演左右瓶满意度与技法；
- 每局结束可填写想法，原始记录保存在本地 `data/session-records.json`，该文件不会上传 GitHub。

## 当前 source of truth

- [v0.13 机械规则](docs/RULES_v0.13.md)
- [v0.13 顾客卡池](docs/CUSTOMER_DECK_v0.13.md)
- [v0.13 回合状态机](docs/ROUND_FLOW_STATE_MACHINE_v0.13.md)
- [v0.13 顾客数据](data/customers.v013.json)
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