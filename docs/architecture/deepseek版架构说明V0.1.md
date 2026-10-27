# deepseek 版架构说明 V0.1

| 属性 | 内容 |
| :--- | :--- |
| **文档版本** | V0.1（2026-10-26） |
| **适用范围** | `course-video-pipeline-Gemini` 当前生产路径（第七章 L01-ds / L02 / L03 均由此产出） |
| **与其他文档的关系** | [`architecture-design-v1.0.md`](architecture-design-v1.0.md) 描述的是"四阶段编译器"的**设计意图**；本文描述的是**落地后的实际结构**，两者冲突时以本文为准 |
| **读者** | 接手本仓库的开发者、要新增一课/新增原语的人 |

---

## 一、这套实现要解决什么

v1.0 设计稿把流水线拆成四阶段是合理的，但**落地时暴露了四个具体问题**，本版架构是对它们的直接回应：

| 问题 | 现象 | 本版对策 |
| :--- | :--- | :--- |
| 渲染入口分裂 | 每课一个 composition，越加越乱 | **单一入口** `MasterCanvas`，composition 只是薄壳 |
| 注册靠手改 | 加课要动 `Root`、`SceneRouter`、`composition` 三处 | **注册表驱动**：只改 `src/lessons/registry.ts` |
| 公共模板被内容污染 | 课内特殊版式往 `templates/` 里塞 | **`chapter-local`** 视觉类型 + 章节组件 |
| 时间点靠手写 | 判卷高亮写死帧号，与旁白错位 | **只允许 token / pauseDirective 派生** |

---

## 二、分层视图

```
┌──────────────────────────────────────────────┐
│ ⑤ 内容组件   src/lessons/ch07/*.tsx           │  课内版式与讲解节奏
├──────────────────────────────────────────────┤
│ ④ 原语       src/visual/kit/*.tsx             │  CardGrid / Flow / Scale / Reveal / Stepper
├──────────────────────────────────────────────┤
│ ③ 模板       src/visual/templates/*.tsx       │  19 类视觉类型（含 2 类真题）
├──────────────────────────────────────────────┤
│ ② 渲染壳     src/visual/shell/                │  MasterCanvas · SceneRouter · HeaderBreadcrumb · Captions
├──────────────────────────────────────────────┤
│ ① 契约       contracts/*.schema.ts            │  5 份 Zod 契约（唯一事实源）
└──────────────────────────────────────────────┘
        ↑ 数据来自 workspaces/<lessonId>/*.json
```

**依赖方向是单向的**：③ 不知道 ⑤ 的存在；⑤ 可以 import ③ 和 ④；④ 不 import 任何课内组件。

---

## 三、数据流

```
《完整口播稿V0.1.md》
   │  build-l0X-ir.ts            逐行分配镜号、切分句、插入停顿指令
   ▼
storyboard-ir.json  ────────────────┐
   │  run-l01-audio.ts --mode=cuda  │  Qwen3-TTS + ForcedAligner
   ▼                                │  分句级 SHA-256 缓存
audio-timeline.json ────────────────┤
   │  build-l0X-shot-table.ts       │  帧长由真实音频派生
   │  rebuild-l01-captions.ts       │  字幕按标点重切
   │  build-l0X-cues.ts --final     │  cue 用 token 定位
   ▼                                │
l0X-shot-table.ts / l0X-cues.json / *.srt / *-captions.json
   │  film-to-lesson.ts --spanModule=l0X-span-timeline
   ▼
compiled-lesson.json  →  MasterCanvas  →  mp4
```

关键点：**每一段数据都有唯一的生成脚本**。手改任何生成物（镜表、cue、字幕、编译产物）都会在下次重跑时被覆盖。

---

## 四、六个设计决策

### D1 · 单一渲染入口

`compositions.tsx` 里每个 composition 只是：

```tsx
{ id: "L03Lesson", component: () => <MasterCanvas lesson={l03Lesson} includeAudio includeCaptions />, durationInFrames }
```

**代价**：所有课共用同一套顶栏、字幕轨、安全区；课内要做特殊处理只能通过章节组件。

**收益**：加课不需要理解渲染壳；改顶栏一次全课生效。

### D2 · 注册表驱动

```ts
// src/lessons/registry.ts —— 加一课只改这一处
CHAPTERS[lessonId] = { lessonId, components }
LESSONS.push({ lessonId, lesson, compositionIds: { voiced, silent } })
```

`Root.tsx` 是纯 `COMPOSITIONS.map`，不含任何课程知识。

### D3 · `chapter-local`：公共模板的隔离阀

```ts
// 数据侧
{ "visualType": "chapter-local", "payload": { "key": "l03-span", "data": { "span": "S44c" } } }
```

- 章节组件签名：`React.FC<{ payload: unknown; cues?: ResolvedCuePoint[] }>`，payload 由组件自己 parse；
- **两者不互相 import**：模板不知道章节，章节可以 import 模板；
- 目前 L02/L03 的全部镜头都走这一条——公共模板一行没为内容改过。

**代价**：`chapter-local` 是弱类型入口，节流靠组件内 Zod parse；新增课时要自己维护段注册表。

### D4 · 原语优先，禁止复制粘贴

`kit/` 里五个原语覆盖了绝大多数版式：`CardGrid`（网格卡）、`Flow`（链式步骤）、`Scale`（刻度）、`Reveal`（逐行）、`Stepper`（按 cue 推进）。

规则：**新做一课前先找原语；找不到再加原语，不要在课内组件里复制坐标逻辑。**

### D5 · `patches.json`：最后一公里的逃生口

改一句文案、换一个标题，不必重编译、不必重跑 TTS：

```json
{ "S19": { "payload": { "title": "改后的标题" } } }
```

按场景 id 深合并；**未知场景 id 直接抛错**（防止补丁静默失效）。

### D6 · 时间点纪律（本架构最重要的一条）

三种合法的时间来源：

| 来源 | 用途 | 例 |
| :--- | :--- | :--- |
| **token 定位** | 判卷、高亮、结论出现 | `frameOfPhrase("S08", "完全正确，选 D")` |
| **`pauseDirectives`** | 教学停顿（含 3 秒倒计时） | `{ afterClauseIndex: 4, durationMs: 3000 }` |
| **段内相对偏移** | 同一场景内的定长动画 | `frame - shotStart` |

**禁止**：`sNN.duration + 常数`。

```ts
// ✗ 曾经的写法：少了段内起点，早了 10.6 秒（等于泄题）
const split = (frame - (s41.duration + 40)) / 20;
// ✓ 现在：cue 由 token 生成，组件只读 cue
```

---

## 五、模块职责表

| 目录 | 责任 | 明确不做 |
| :--- | :--- | :--- |
| `contracts/` | 定义并校验数据形状 | 不含任何业务文案 |
| `src/pipeline/1-ingest` | 合一稿 → IR | 不排版 |
| `src/pipeline/2-audio` | TTS、对齐、字幕切分、**语速守卫** | 不决定镜头时长 |
| `src/pipeline/3-link` | token → cue → localFrame | 不写死帧号 |
| `src/pipeline/4-render` | 交付与 ffprobe 核验 | 不改内容 |
| `src/visual/shell/` | 顶栏、字幕轨、安全区 | 不含课程内容 |
| `src/visual/templates/` | 19 类视觉类型模板 | 不为单课加分支 |
| `src/visual/kit/` | 无状态版式原语 | 不读全局 store |
| `src/lessons/<chapter>/` | 课内版式与节奏 | 不 import 其他课的组件 |
| `scripts/` | 每课的数据生成脚本 | 不写 React |

---

## 六、契约要点

| 契约 | 关键字段 | 谁消费 |
| :--- | :--- | :--- |
| `storyboard-ir` | `scenes[].narration / clauses / pauseDirectives / visualType / payload` | 2-audio、3-link |
| `audio-timeline` | `scenes[].startMs / durationMs / tokens[]`、`captions[]` | 镜表、字幕、cue |
| `visual-props` | 19 类视觉类型（含 2 类真题）+ `chapter-local` | SceneRouter |
| `compiled-lesson` | `scenes[]`（含 `headerMode`）、`captions[]`、`meta.durationInFrames` | MasterCanvas |
| `delivery-manifest` | 四件套路径 + SHA-256 + ffprobe 结果 | 交付核验 |

`visualType` 是判别联合的判别键；`headerMode: "scene" | "chapter"` 决定顶栏由壳画还是由章节自画（多镜共用一个章节组件时用 `chapter`，让镜号在段内推进）。

---

## 七、倒计时（L03 起的新机制，供后续课复用）

| 环节 | 做法 |
| :--- | :--- |
| 音频 | `pauseDirectives` 在场景最后一个分句后插 3000 ms，**是真静音**（实测 −91 dB） |
| 画面 | `ExamQuizCard` 的 `thinking-pause` cue 触发环 + 数字 3→2→1 |
| 字幕 | 静音期间**清空**，避免用读字幕代替思考 |
| 时长 | 该场景时长天然包含这 3 秒，镜表与音频自动对齐 |

目前 L03 用了 7 处；加一处只需在 IR 里多一条 `pauseDirectives` + 一条 `thinking-pause` cue。

---

## 八、扩展指南

### 新增一课（六步）

1. `scripts/build-lXX-ir.ts`：口播稿行号 → 镜号（逐行分配，重复/遗漏直接抛错）；
2. 跑 TTS，确认 `audio-timeline.json` 场景数与 IR 一致；
3. `build-lXX-shot-table.ts` / `rebuild-l01-captions.ts` / `build-lXX-cues.ts --final`；
4. `lXX-extra.tsx` / `lXX-quizzes.tsx` / `lXX-spans.tsx` / `lXX-span-timeline.ts`；
5. `film-to-lesson.ts --spanModule=lXX-span-timeline`；
6. `registry.ts` 注册 `CHAPTERS` 与 `LESSONS`，`compositions.tsx` 加两条薄壳。

### 新增原语

放 `kit/`，导出到 `index.ts`，**附一个 `KitDemo` 级别的可渲染示例**；不允许带课内文案。

### 改公共模板

必须自证未影响已验收课程，基线：

| 基线 | 期望 sha256 前 16 位 |
| :--- | :--- |
| `CourseVideoSilentClean` frame 7952 | `ebe975d1661629ce` |
| `L01Lesson` frame 9221 | `28f12d047310820f` |

---

## 九、已知债务

| # | 债务 | 影响 | 缓解 |
| :---: | :--- | :--- | :--- |
| 1 | **双轨并存**：`CourseVideo`（早期）与 `L0xLesson`（现行）两套 composition | 新人易认错入口 | README 已标注"早期模板" |
| 2 | **脚本按课复制**：`build-l02-*` 与 `build-l03-*` 高度相似 | 加课要复制两份 | 待抽公共 `build-ir` 基类 |
| 3 | **`.py` 估算脚本残留**（`gen-l0x-shot-table.py`） | 与真实镜表混淆 | 文件头已标"配音前估算，勿用" |
| 4 | **无 git** | 改动无法 diff | 依赖文档记录 |
| 5 | **契约为弱类型入口**（`chapter-local.payload`） | 错误延后到运行时 | 组件内 Zod parse |

---

## 十、版本记录

| 版本 | 日期 | 变更 |
| :--- | :--- | :--- |
| V0.1 | 2026-10-26 | 首版：固化 L01-ds/L02/L03 落地后的实际结构，明确六个设计决策与时间点纪律 |
