# tech-network 背景（信息系统项目管理师 · 科技感动态背景）

纯氛围背景层：径向底色 + 缓慢平移的网格 + 节点网络（定时点亮、光点沿连线流动）+ 甘特进度装饰带 + 静态颗粒。
视觉定稿：`背景/视觉工程师/SPEC.md`（参照同目录的静帧与高清视频）；改背景以它为准。

- 文件：`TechNetwork.tsx`（组件）、`schema.ts`（zod，全部字段带定稿默认值）、`layout.ts`（由 render.py 种子 20261018 导出的固定节点布局，勿手改）、`index.ts`（注册）。
- 注册：`src/backgrounds/registry.ts` 的 `"tech-network"`；风格文件 `styles/ispm-tech-network.json`（只写 `type` 即为定稿效果）。
- 纯背景预览：Studio 合成 `TechNetworkBackground`（1920×1080 / 30fps / 900 帧）。

## 发布信息

- 来源项目：`fruit-sales-bar-chart`，正本在 `src/backgrounds/tech-network/`；发布日期 2026-10-18。
- `templates/` 里是发布出来的副本，**不要直接在副本里改**；改动回到正本，每次发布整个文件夹覆盖，并记录 md5。
- 依赖版本（调用方需一致或兼容）：`remotion` 4.0.536、`zod` 4.5.4、`react` 19.2.3、`typescript` 5.9.3。不依赖其他 `@remotion/*` 包。
- 需要一起带走的共用文件（在 `templates/_shared/`）：`define.ts`（`defineBackground`）、`hex-color.ts`（颜色校验）。

## 调用方法

1. 复制：把 `_shared/define.ts`、`_shared/hex-color.ts` 和整个 `tech-network/` 文件夹复制到调用方项目的 `src/backgrounds/` 下，放好后目录如下（模板里写的是 `../define`、`../hex-color`，路径不要改）：
   ```
   src/backgrounds/
     define.ts
     hex-color.ts
     tech-network/  index.ts  TechNetwork.tsx  schema.ts  layout.ts  README.md
   ```
2. 注册（有背景注册表的项目）：在 `registry.ts` 里加一行 `"tech-network": techNetworkBackground`（从 `./tech-network` 导入），然后在 style JSON 里写：
   ```json
   { "background": { "type": "tech-network" } }
   ```
   只写 `type` 就是定稿效果；需要改的字段直接加在 `background` 里，例如 `"ganttEnabled": false`。参考 `style.example.json`。
3. 直接使用（没有注册表的项目）：
   ```tsx
   import { TechNetwork } from "./backgrounds/tech-network/TechNetwork";
   import { techNetworkSchema } from "./backgrounds/tech-network/schema";

   const params = techNetworkSchema.parse({ type: "tech-network" }); // 补齐全部默认值
   <TechNetwork {...params} />;
   ```
   把它放在内容层下面（例如 `<AbsoluteFill>` 的第一个子元素）。
4. 合成参数：1920×1080、30fps。动效按 `loopSeconds`（默认 30s，即 900 帧）循环，时长取 `loopSeconds` 的整数倍才能首尾无缝。
5. 自检：调用方项目 `npx tsc --noEmit` 通过；再按 `style.example.json` 的参数（`ganttEnabled: false`，其余用默认值）渲第 240 帧（如 `npx remotion still <合成名> --frame=240`），和 `preview.png` 对照。注意 schema 默认 `ganttEnabled: true`，不带这个参数渲出来会多出甘特线，和 `preview.png` 对不上。

## 规则

- **无缝循环**：所有运动都按 `frame % (loopSeconds × fps)` 计算，周期为整数圈，第 900 帧 = 第 0 帧。
  背景不读视频总时长（项目惯例）。**要完整循环，视频 JSON 需 `durationInSeconds: 30`**（= `loopSeconds`）；更短只会播放循环的前一段。
- **背景内禁止任何文字/标签**（含 render.py 草稿里的 "IS-PM // PROJECT NETWORK"，已去掉）。
- 动画只用 `useCurrentFrame` + `interpolate`，秒数经 fps 换算；随机量全部固定种子（颗粒：`grainSeed`）。

## 主要 props（默认值即定稿值）

| 分组 | props |
|---|---|
| 全局 | `loopSeconds` 30 · `easing` [0.45,0,0.55,1] · `lineWidth` 2（网格、连线、点亮连线共用） |
| 底色 | `baseCenterColor` #0B1A33 · `baseEdgeColor` #060E1F · `baseFalloff` 1.6 |
| 网格 | `gridColor` #2EC4D6 · `gridCellSize` 80 · `gridMajorEvery` 4 · `gridMinorOpacity` 0.04 · `gridMajorOpacity` 0.06 · `gridCellsPerLoop` 4（须为 `gridMajorEvery` 的倍数） |
| 节点网络 | `nodeColor` #8FB8D9 · `nodeOpacity` 0.18 · `linkOpacity` 0.11 · `driftScale` 1 |
| 点亮 | `highlightColor` #2EC4D6 · `highlightAltColor` #E0B050 · `highlightAltIndex` 2 · `highlightStarts` [0.5,6.5,12.5,18.5,24.5] · `highlightFadeIn/Hold/FadeOut` 0.8/1.5/1.2 · `highlightCoreOpacity` 0.6（**最终叠加值**，内部自动扣除柔光与连线的叠加）· `highlightGlowOpacity` 0.55 · `highlightGlowBlur` 12 · `highlightLinkOpacity` 0.35 · `pulseStart/Travel/Fade` 0.8/1.5/0.3 · `pulseDotOpacity` 0.75 · `arrivalOpacity` 0.6 |
| 颗粒 | `grainAmount` 0.02 · `grainSeed` |

## 中央区减淡

`centerZoneSize` 0.6（中央 60%×60%，留给讲师/课件）内的节点和连线透明度 × `centerDim` 0.5，边缘羽化 `centerZoneFeather` 60px。
大节点位置是固定布局，只保证落在默认 60% 区域之外；改 `centerZoneSize` 不会移动大节点。

## 甘特装饰带

| prop | 默认 | 说明 |
|---|---|---|
| `ganttEnabled` | true | false = 整条带（轨道、进度填充、里程碑菱形）都不画；此时甘特时间校验跳过 |
| `ganttBand` | "bottom" | "bottom" = 定稿位置 y≈946–1004；"top" = 整条带压缩进 **y 70–130**（3 条顺序不变、竖向间距按比例缩放，中心 y≈74/100/126），左右仍在 96px 边距内 |
| `ganttOffsetY` | 0 | 整条带额外竖移，px，正 = 向下，**限 ±60** |
| `ganttTopOpacityScale` | 0.7 | 仅 "top" 模式：轨道/填充/里程碑透明度统一 × 0.7 |
| `ganttTrackOpacity` / `ganttFillOpacity` | 0.1 / 0.25 | 轨道 / 进度填充 |
| `milestoneBaseOpacity` / `milestonePeakOpacity` / `milestonePulse` | 0.1 / 0.35 / 0.6s | 菱形常态 / 进度到达时峰值 / 闪动时长 |
| `ganttProgressEnd` / `ganttFadeEnd` | 27 / 29.5 | 0–27s 由左至右，27–29.5s 淡出（保证无缝） |

### 对比度（WCAG 亮度对比，装饰 vs 底色本身）

| 底色 | 轨道 0.1 | 填充 0.25（叠在轨道上） | 菱形峰值 0.35 |
|---|---|---|---|
| 中心 #0B1A33 | 1.20 : 1 | 1.99 : 1 | 2.14 : 1 |
| 四角 #060E1F | 1.17 : 1 | 1.95 : 1 | 2.10 : 1 |
| 实测带区平均底色（上/下带相同） | 1.18 : 1 | 1.98 : 1 | 2.13 : 1 |
| "top" 模式（× 0.7），带区底色 | 1.12 : 1 | 1.58 : 1 | 1.64 : 1 |

参照：`#E6F1FA` 文字对中心底色约 15 : 1。装饰带远低于 3 : 1，单独看不会"抢"文字，但细亮线穿过笔画时仍会干扰字形。
文字需要从带上经过时，在 style 里调低 `ganttTrackOpacity` / `ganttFillOpacity` / `milestonePeakOpacity`、换 `ganttBand` / `ganttOffsetY`，或干脆 `ganttEnabled: false`。

## 与内容层的约定

- **装饰带不得与内容层文字区争对比度；每个 style × 内容类型组合都需截图评审一次。**
- 内容层保持现有边距（左右 ≥ 80px、上下 100px），**目前不设全局 safeArea**；避让由背景侧参数解决。
- 已知：柱状图（`bar-chart`）标题字形约在 y 111–192。`ganttBand: "top"` 时第 3 条（y≈124–128，x 980–1824）会穿过长标题的末尾（演示数据在 x≈1003–1121 处重叠），
  所以柱状图配 "top" 时需要 `ganttOffsetY ≤ -20`（-30 留出约 10px 间隙）或关闭甘特，必须截图确认。
- 已知：默认 "bottom" 时，柱状图冠军徽标（`highlightLabel`，约 y 930–969）与第 1 条轨道（y≈948–952，x 96–1080）在 x≈891–1025 处重叠，
  冠军柱靠左时会更明显。下移最多只能到 `ganttOffsetY: 22`（带底 y 1026 = 54px 下安全边距），仍与徽标底部贴边，
  所以这类组合应调低甘特透明度或 `ganttEnabled: false`，需截图评审。
- 规则（视觉工程师 2026-10-18 定）：**数据图表类内容（如 `bar-chart`）默认关闭甘特**，在 style 里设 `ganttEnabled: false`；`styles/ispm-tech-network.json` 已按此设置。甘特带留给讲师画面或内容集中在中部的课件版式，schema 默认值仍为 `ganttEnabled: true`、`ganttBand: "bottom"`。
