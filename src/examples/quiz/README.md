# 四种题卡的完整公共示例

直接调用四种公共题卡，覆盖完整解析、简短解析和直接答案。四种题卡已于 2026-11-06 通过用户视觉审核。本例无配音，使用演示时序；真实音频与字幕同步尚未验证。

## 环境与运行

使用项目锁定依赖：Remotion 4.0.536、React 19、TypeScript 5.9。已验证 Node 24.16.0；检查脚本使用 Node 24 的 `registerHooks`。安装 `Noto Sans CJK SC` 字体以保持中文排版一致。

在项目根目录执行：

```bash
npm run studio -- --entry src/examples/quiz/index.tsx --public-dir=src/examples/quiz/assets --port 3028 --no-open
```

保留 `--public-dir`，使用本例素材目录。端口占用时更换端口；远程访问时将 `localhost` 替换为运行机器地址。

| 预览入口 | 时长 | 内容 |
| --- | --- | --- |
| [QuizCardExam](http://localhost:3028/QuizCardExam) | 40 秒 | 2024 年 5 月第 2 批次第 26 题，上题下析、红色错词与绿色答案并存 |
| [QuizCardDual](http://localhost:3028/QuizCardDual) | 27 秒 | 左右等宽双题、独立思考及下方简短依据 |
| [QuizCardCompact](http://localhost:3028/QuizCardCompact) | 22 秒 | 左题卡内简短解析，右题直接答案 |
| [QuizCardBrief](http://localhost:3028/QuizCardBrief) | 33 秒 | 2×2 四道短题，逐题思考后直接给答案 |
| [QuizShowcase](http://localhost:3028/QuizShowcase) | 122 秒 | 按上表顺序连续预览四种形式 |

全项目 Studio 的同名 ID 使用相同示例；旧原型 ID 为 `LegacyQuizCardExam`、`LegacyQuizCardDual`、`LegacyQuizCardCompact`、`LegacyQuizCardBrief`。

## 文件与公共入口

- [compositions.ts](compositions.ts)：统一声明 ID、组件、时长、帧率和画幅，总入口与独立入口共用。
- [index.tsx](index.tsx)：独立启动，注册本例五个 Composition，不加载课程数据。
- [Examples.tsx](Examples.tsx)：组合公共题卡与背景；总览使用 `Sequence` 保持各段局部帧。
- [data.ts](data.ts)：题目、解释与演示时序；Exam 使用第 26 题，其余为自编题。
- [ExamAnalysis.tsx](ExamAnalysis.tsx)：第 26 题的教材依据与概念对照，通过 `analysisSlot` 接入。
- 公共导出：[quiz.ts](../../visual/templates/quiz.ts)；表现与过渡：[quiz-presentation.tsx](../../visual/templates/quiz-presentation.tsx)；倒计时：[quiz-timing.ts](../../visual/templates/quiz-timing.ts)。

| 示例 ID | 公共组件 |
| --- | --- |
| `QuizCardExam` | `ExamQuizCard` |
| `QuizCardDual` | `DualQuizBattleCard` |
| `QuizCardCompact` | `CompactQuizCard` |
| `QuizCardBrief` | `BriefQuizCard` |

## 重点观察位置

时间均为各自预览的局部时间，区间左闭右开。所有倒计时均为 **3 秒**；这些演示帧号不能用作正式课程的音频锚点。

| 预览 | 思考窗口 | 其他重点 |
| --- | --- | --- |
| Exam | 4–7 秒，120–209 帧 | 7 秒后继续 A–D 阅读；22/25/28/31 秒展开 A/B/C/D 判断与依据；35 秒揭晓 D，保留红色错词 |
| Dual | 左题 3–6 秒；右题 17–20 秒 | 11 秒左题答案；14 秒焦点交接；24 秒右题答案，左题判断保留 |
| Compact | 左题 3–6 秒；右题 16–19 秒 | 9 秒左题短解释；13 秒焦点交接；19 秒右题直接揭晓 |
| Brief | 左上 4–7 秒；右上 12–15 秒；左下 20–23 秒；右下 28–31 秒 | 8/16/24 秒交接焦点；各题思考结束后答案淡入，此前答案保留，后续题保持中性 |

| 颜色 | 含义 |
| --- | --- |
| 浅白 `#E6F1FA` | 中性题面 |
| 青色 `#2EC4D6` | 当前讲解、对照及符合原则的判断标记 |
| 朱红 `#E0605A` | 错词、错误判断及排除提示 |
| 绿色 `#4CC38A` | 明确本题答案 |
| 金色 `#E0B050` | 倒计时与解析依据等重点 |

本例将临时阅读关注覆盖为金色，判断标签仍用青色。Exam 的 D 先显示“偷换概念”，揭晓时显示绿色“答案项 / 正确选项：D”，同时保留红色错词；题干“不正确”保持普通文字。

题面从首帧完整可见。默认过渡 0.2 秒（30 fps 下 6 帧），标签和解析出现不移动题干与选项。无解析时不生成面板或预留空白。

## 新课接入

1. 从 `src/visual/templates/quiz` 导入组件；题目、解释及实际音频锚点由本课提供。使用 `variant="paper"` 和 `presentation` 接入本例样式；省略 `variant` 保留原 `stacked` 布局，省略 `presentation` 保留原表现。
2. `timing.stemEndFrame` 使用**题干读完**的实际锚点，立即开始三秒真实静音与倒计时，不等待选项朗读结束。此时题干、材料及全部选项完整可见，临时关注清除。音频处理负责插入或复用 3000 ms 零值 PCM，字幕在该窗口为空；题卡组件不修改 WAV 或字幕。
3. 有答案口播时，`revealFrame` 与口播同步；无答案口播时可显式设为 `stemEndFrame + QUIZ_THINK_SECONDS * fps`。不传揭晓时点时，不自动猜测。
4. `presentation.focus` 标明当前选项；`judgements` 和 `explanations` 仅包含实际讲到、材料支持的内容。直接答案使用 `presentation={}`。
5. 所有 `from / to / stemEndFrame / revealFrame` 均为题卡局部帧，放入 `Sequence` 后不重复叠加全局偏移。双题分别传 `timing.left / right` 和 `presentation.left / right`。

```tsx
import { ExamQuizCard } from "../../visual/templates/quiz";

// question、anchors 和 confirmedExplanation 由本课提供。
<ExamQuizCard
  variant="paper"
  payload={question}
  timing={{ stemEndFrame: anchors.stemEnd, revealFrame: anchors.answer }}
  presentation={{
    transitionSeconds: 0.2,
    focus: [{ targetId: "C", from: anchors.explainC, to: anchors.explainCEnd }],
    judgements: [{ targetId: "C", from: anchors.judgeC, label: "✕ 表述有误" }],
    explanations: [{ text: confirmedExplanation, from: anchors.explainC }],
  }}
/>
```

`focus.to` 是淡出起点；思考窗口清除读题关注且之后不复现。判断默认保留；解释省略 `to` 时保留，指定时从该帧淡出。过早的判断、解释和答案会被限制到思考结束之后；答案从允许揭晓的帧开始淡入，首帧透明。负向题设 `polarity="negative"`，`isCorrect` 表示表述本身是否正确；错误判断与本题答案须用文字区分。

四种 `paper` 形式默认 `bodySize=20 / optionSize=17`，布局参数如下：

| 形式 | 默认布局与覆盖入口 |
| --- | --- |
| Exam | `top=125 / height=400`；专用图解用 `analysisSlot / analysisFromFrame / analysisTop` 接入，内部出现时点由调用方控制 |
| Dual | `top=155 / height=370 / columns=1`；可覆盖 `width / gap / cardStyles`；各题短解析用 `presentation.explanations` |
| Compact | `left=120 / top=155 / width=820`；高度随题面和卡内解析自然展开 |
| Brief | `left=120 / top=155 / width=820 / columns=2`；本例覆盖 `bodySize=24 / optionSize=20`，四题及各自时序集中于 `data.ts` 的 `briefCards` |

`presentation.colors` 可覆盖 `text / focus / error / answer / evidence`；`focusColor` 只覆盖临时关注色，默认使用 `colors.focus`。其他位置、字号、列数和倒计时外观使用组件 Props。自定义 `renderOption` 优先于公共选项行，其内部时序由调用方控制。

## 技术检查与代表图

```bash
npm run lint
node src/cli/quiz-selftest.test.mjs
node src/examples/quiz/check.mjs
```

已通过类型检查、原接口 23 项回归和本例 13 项检查，覆盖不同帧率下的三秒窗口、中性题面、揭晓时机、焦点交接、过渡、无解析布局和独立依赖。

| 文件 | 代表状态 |
| --- | --- |
| [QuizCardExam-150.jpg](reference/QuizCardExam-150.jpg) | 中性题面，三秒倒计时剩余两秒 |
| [QuizCardExam-1140.jpg](reference/QuizCardExam-1140.jpg) | 完整双栏解析，D 红色错词与绿色答案同时保留 |
| [QuizCardDual-540.jpg](reference/QuizCardDual-540.jpg) | 右题倒计时剩余两秒；左题答案与依据保留 |
| [QuizCardDual-750.jpg](reference/QuizCardDual-750.jpg) | 两题答案及简短解析均已显示 |
| [QuizCardCompact-600.jpg](reference/QuizCardCompact-600.jpg) | 左侧短解析，右侧无解析面板 |
| [QuizCardBrief-960.jpg](reference/QuizCardBrief-960.jpg) | 四题答案全部揭晓 |

单帧导出命令（软件渲染 `--gl=swangle`）：

```bash
npx remotion still src/examples/quiz/index.tsx QuizCardExam src/examples/quiz/output/QuizCardExam-1140.jpg --frame=1140 --public-dir=src/examples/quiz/assets --gl=swangle --image-format=jpeg --jpeg-quality=90
```

详细规则见[题卡规范](../../../docs/architecture/题卡规范V0.1.md)；音频处理见[音频规范第五节](../../../docs/architecture/音频规范V0.2.md)。
