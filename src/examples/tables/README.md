# L01 风格表格案例

入口：`L01TableExample`，1920×1080、30fps、28 秒，无配音和口播字幕。

## 画面安排

学习任务：通过共同维度分清项目、项目集与项目组合的管理对象和关注点。内容由 L01 已确认口播提炼，不是教材表 6-3 的逐字复刻。

| 时间 | 展示 | 教学用途 |
| --- | --- | --- |
| 0–7 秒 | 完整表格 | 建立对照结构 |
| 7–14 秒 | 项目集一行加强 | 连读管理对象、关注点和例子 |
| 14–21 秒 | 主要关注一列加强 | 同维度比较三类管理 |
| 21–28 秒 | 项目组合的关注点单元格加强 | 定位战略选择与资源分配 |

表格保持位置稳定，强调采用交接式淡入淡出，其他文字始终可读。复用本项目 TechNetwork 与头部组件，沿用 L01 中文字体、青金配色、细线及半透明底板；舞台内容在 y=900 以内，底部字幕区域留空。时序仅供视觉案例展示，不对应现有配音。

借鉴 `remotion-experiment/deepseek/shape-showcase/src/engine/table/` 的数据与强调分离思路，在本组件内实现；不跨项目导入代码，也不引入其演示背景或整套图形引擎。

## 查看与调整

```bash
npm run studio -- --entry src/examples/tables/index.tsx --public-dir=src/examples/tables/assets --port=3036 --no-open
```

在 Studio 中选择 `L01TableExample`；另一案例见 [表 6-7 两页演示](Table67Example.md)。两例均由 [compositions.ts](compositions.ts) 声明，独立入口 [index.tsx](index.tsx) 与 `src/examples/index.tsx` 共用这份注册信息。独立入口不加载课程数据，表格内容和视觉实现保持原样。若端口已占用，沿用本项目已启动的服务或另选空闲端口。

示例代码在 `L01TableExample.tsx`：`headings / rows` 为内容，`widths / rowHeight` 为尺寸，`rowFocus / columnFocus / cellFocus` 为强调时间。当前只提供这一张固定四列表格案例，没有增加通用 schema、分页或自动布局。使用不同长度的内容时需重新查看实际排版。

本例待用户审核，不代表已成为新的课程规范。
