# SILLAGE / 《余香》 v0.12

SILLAGE 是一个 1920×1080 视觉构图的网页单人调香游戏原型，当前工程使用 React + TypeScript + Vite。B2.10 reference 保留为视觉 source of truth，v0.12 文档与数据是当前机械规则 source of truth。

## 当前可玩内容

- 从开始页面启动一局游戏；
- 两个工作台、中心香气环、公共池和三人公开等候区都由 `GameState` 驱动；
- 16 张顾客卡：8 张单香气、4 张双香气、2 张三香气、2 张特殊卡；
- 所有顾客满意线为 +2，配方长度为 3–6 枚；
- 所有逐枚正权重香气在中心香气环高亮，香气剩余枚数实时显示；
- 公共池 hover / focus 会通过 pure rule functions 同时预演加入左右瓶后的满意度与技法变化；
- 顾客满意度只决定能否交付，订单固定 3 分；技法最多结算一种，完美技法共 8 分技法分；
- 顾客没有耐心和自动离店，会一直等待到交付；
- 每局结束可输入本局想法，原始事件、状态、订单和反馈保存到 `data/session-records.json`，并在数据看板统计。

## 规则与数据

- [v0.12 机械规则](docs/RULES_v0.12.md)
- [v0.12 顾客卡池](docs/CUSTOMER_DECK_v0.12.md)
- [v0.12 回合状态机](docs/ROUND_FLOW_STATE_MACHINE_v0.12.md)
- [v0.10 视觉 / 迁移文档](docs/VISUAL_UI_SPEC.md)、[v0.12 React 迁移说明](docs/REACT_MIGRATION_v0.12.md)
- [v0.12 顾客数据](data/customers.v012.json)
- [香气数据](data/scents.v010.json)

## 启动

```bash
npm install
npm run dev
```

然后打开 Vite 输出的本地地址。测试阶段的记录由 Vite middleware 直接写入本地 JSON；如果接口不可用，浏览器会下载一份备份 JSON。

## 验证

```bash
npm run build
```
