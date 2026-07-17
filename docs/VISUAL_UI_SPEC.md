# SILLAGE v0.10 — Visual / UI Handoff

## Canonical visual reference

`visual/SILLAGE_B2.10_visual_reference.html`

不要从 B2.1–B2.9 的试错版本继续开发。B2.10 是当前唯一视觉基准。

## Layout principle

设计基准：`1920 × 1080`。

当前静态原型采用统一舞台缩放：整张 1920×1080 UI 根据 viewport 等比缩放并居中。React 迁移时可以保留这一行为作为第一版，不要立即重做成完全不同的 responsive grid。

主构图：

```text
LEFT CUSTOMER + LEFT BOTTLE
          ↘
      CENTRAL SCENT WHEEL
      PUBLIC POOL IN CENTER
          ↗
RIGHT CUSTOMER + RIGHT BOTTLE

      SHARED WAITING QUEUE
```

## Central wheel semantics

从内到外：

1. 中央公共池：每回合 4 枚香料；
2. 操作中心 / hover preview；
3. 弥散需求背景；
4. 8 香气轮盘节点。

视觉职责必须分开：

- 香气节点背景色 = 香气自身颜色；
- 左顾客目标 = 粉色边框；
- 右顾客目标 = 蓝色边框；
- 粉 / 蓝弥散背景 = 双顾客需求空间与整体氛围；
- 不要再加容易错位的外圈目标轨迹；
- 不要用顾客颜色覆盖香气本身颜色。

## Left / right identity

- left base color: `#cf8eaa`
- right base color: `#89b6d3`

左右工作台以基础色区分；提交按钮、目标节点边框与需求雾光沿用对应颜色。

## Bottle

瓶子是左右下半区的视觉主体。

- 瓶内最多显示 6 个成分槽；
- 成分使用“香气色块 + SVG glyph”；
- 不常驻显示 `MAIN SCENT / 当前香气`；
- 不常驻显示 `EMERGING TECHNIQUE`；
- 瓶子卡底部保留 Submit / Deliver 按钮；
- 技法信息只在 hover 公共池香料时做预演，以及交付结算时反馈。

## Glyphs

独立 SVG 在 `assets/glyphs/`：

- citrus.svg
- aquatic.svg
- green.svg
- fruity.svg
- floral.svg
- amber.svg
- woody.svg
- aromatic.svg

SVG 使用 `stroke="currentColor"`，调用方通过 CSS `color` 控制图标颜色。

图标必须同时用于：

- 瓶内成分；
- 公共池卡；
- 香气轮节点；
- 等候顾客卡。

## Hover preview

公共池卡 hover / focus 时，临时预演该香料分别加入左右瓶后的结果。

不要常驻给玩家一个 `Next Best Move`。

预演至少体现：

- 顾客相容度变化；
- 技法分变化；
- 是否完成完美技法。

具体文案由规则函数结果生成，不能 hard-code 静态示例。

## Waiting queue

公开 3 位顾客属于共享战略区，不属于某一个工作台。

空出工作台后才允许选择；选择后从牌库补位。

## Visual tone

关键词：

- completely flat
- pastel constructivist
- editorial niche fragrance brand
- soft diffused edges only as scent haze
- modular / ordered layout
- low saturation

避免：

- 中国风 / 古风
- 写实植物
- 3D
- 玻璃拟态堆叠
- 过度圆角胶囊 UI
- 用大量说明卡解释设计意图
