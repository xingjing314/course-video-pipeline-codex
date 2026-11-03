# course-video-pipeline-codex 架构说明 V2.0

代码核对日期：2026-11-03。本文说明当前工程的结构、数据流与主要调用关系，供理解工程或修改相关实现时按需查阅。

日常制作按[AI互动流程总结](AI互动流程总结V0.1.md)推进，组件参数和调用示例查[公共能力索引](公共能力索引V0.1.md)。画面、字幕和音频要求分别由[视频画面规范V0.2](视频画面规范V0.2.md)、[字幕规范V0.2](字幕规范V0.2.md)、[音频规范V0.2](音频规范V0.2.md)规定，本篇不增加开工必读项。

## 一、总体结构

项目使用 React、TypeScript 和 Remotion 编排教学画面，Python worker 负责 Qwen3 配音与强制对齐，FFmpeg / ffprobe 负责媒体处理与参数检查。

用户输入位于 `docs/lessons/<章节>/<课时>/input/`。口播与教材先经过分镜、分组和画面设计，再形成课时组件或结构化分镜数据。输入目录本身不会自动触发制作，现有编译 CLI 也不直接接受任意纯口播稿。

当前有两种课时组织方式，最终都进入同一份 Remotion Composition 列表：

```mermaid
flowchart LR
    IR["StoryboardIR 分镜数据"] --> AUDIO["配音与对齐：AudioTimeline"]
    IR --> LINK["绑定为 CompiledLesson"]
    AUDIO --> LINK
    AUDIO -->|"复用音频与对齐数据"| LOCAL["独立课时组件与课时数据"]
    LOCAL --> SPEC["课时 CompositionSpec"]
    LINK --> MASTER["MasterCanvas / SceneRouter"]
    SPEC --> ALL["COMPOSITIONS"]
    MASTER --> ALL
    ALL --> ROOT["RemotionRoot"]
    ROOT --> STUDIO["Studio 预览"]
    ROOT --> RENDER["Remotion 教学画面渲染"]
    RENDER --> CLEAN["干净版 MP4"]
    CLEAN --> COMPOSE["composeLesson 公共合成"]
    AUDIO -->|"同版整轨 WAV 与字幕"| COMPOSE
    COMPOSE --> DELIVERY["有声 MP4 / WAV / SRT / JSON"]
```

独立课时组件可以复用音频管线和公共视觉能力，也可以读取本课已准备的数据。制作新课时沿用适合本课的现有接入方式，无需先统一两条路线。图中导出部分是当前双版本交付流程，干净版独立保留；原有导出入口的行为见第五节。

## 二、目录职责与公共能力边界

| 位置 | 职责 |
| --- | --- |
| [contracts/](../../contracts) | Zod 数据契约：分镜、音频时间轴、视觉 payload、编译课时、图元配置和交付清单 |
| [src/pipeline/](../../src/pipeline) | 输入解析、音频生成与对齐、音画绑定、通用媒体交付 |
| [src/visual/primitives/](../../src/visual/primitives) | 原子图形与注册表，供组合组件和课时设计复用 |
| [src/visual/kit/](../../src/visual/kit) 与 [templates/](../../src/visual/templates) | 组合组件、布局、动效与数据驱动模板 |
| [src/visual/shell/](../../src/visual/shell)、[backgrounds/](../../src/visual/backgrounds)、[tokens/](../../src/visual/tokens) | 母版、导航、字幕呈现、背景、颜色与动效参数 |
| [src/visual/caption-export/](../../src/visual/caption-export) | 独立字幕截帧入口，复用 `CaptionsOverlay`，不加载课程注册表或教学场景 |
| [src/lessons/](../../src/lessons) | 课时内容、专用图解、组件、入口声明与注册信息 |
| [src/cli/](../../src/cli) 与 [scripts/](../../scripts) | CLI、共享预览与导出入口，以及必要的课时准备、组装和讲义脚本 |

课程专用设计继续调用原子组件、kit 和公共方法。公共目录中的组件仍有使用范围限制，部分模板包含特定教学内容；能否覆盖参数或替换局部，以真实接口和公共能力索引为准。

`contracts` 定义通用管线的数据结构；独立课时也有自己的数据组织方式。不能仅因文件放入 `src/visual` 或 `workspaces`，就认为它已经具备通用接口。

## 三、课时接入与画面调用关系

共同入口为 [src/visual/index.ts](../../src/visual/index.ts) 中的 `registerRoot(RemotionRoot)`。[RemotionRoot](../../src/visual/Root.tsx) 遍历 [COMPOSITIONS](../../src/visual/compositions.tsx)，创建可预览和渲染的 Composition。

### 3.1 独立课时组件

课时入口用 [CompositionSpec](../../src/lessons/composition-types.ts) 声明组件、ID、时长、帧率、画幅和可选 Props，再由章节入口汇总到 `COMPOSITIONS`。现有章节汇总可参考 [src/lessons/ch06/index.ts](../../src/lessons/ch06/index.ts)。

同章新增课时在本课和章节入口登记；新增章节时再接入公共汇总，`Root.tsx` 继续遍历列表。组件自行组合画面、音轨、字幕和时间数据，`defaultProps` 只能覆盖组件实际支持的参数。

### 3.2 编译数据与公共母版

[课时注册表](../../src/lessons/registry.ts)中的两个映射分工不同：

- `LESSONS`：保存编译课时数据及有声、无声 Composition ID，供 `chapterCompositions()` 生成入口。
- `CHAPTERS`：按课时标识保存专用组件表，供 `chapter-local` 场景查找组件。

[MasterCanvas](../../src/visual/shell/MasterCanvas.tsx) 按 `CompiledLesson` 组织一层背景、可选音轨、场景 Sequence、头部导航和口播字幕。它将场景交给 [SceneRouter](../../src/visual/templates/SceneRouter.tsx)：

- 普通 `visualType` 选择对应公共模板，并传入 `payload`；需要时传入 `cues`。
- `chapter-local` 通过 `payload.key` 查本课组件，传入 `payload.data` 和 `cues`。
- `headerMode: "chapter"` 的场景由本课组件绘制导航，母版跳过，避免重复。

公共注册还提供 `CourseVideo` 与 `CourseVideoSilentClean`，默认数据来自 `workspaces/current-lesson.json`；其 `calculateMetadata` 可根据传入课时调整时长和画幅。该文件仍是注册模块加载的共享运行数据，编译某课会更新它。

[applyLessonPatches](../../src/lessons/patches.ts) 可在调用它的课时入口按场景 ID 合并画面数据：对象递归合并、数组整体替换。它不自动重做配音、字幕或对齐，也不会因出现一个补丁文件就被所有入口读取。

## 四、音频、字幕与时间轴

### 4.1 通用编译链

`npm run compile` 进入 [src/cli/compile.ts](../../src/cli/compile.ts)，依次调用：

| 阶段 | 主要调用 | 产物 |
| --- | --- | --- |
| 输入解析 | [compileMarkdownToStoryboardIR](../../src/pipeline/1-ingest/ingest-compiler.ts)：解析分镜表、拆分复合场景、切分口播、提取停顿与视觉信息 | `storyboard-ir.json` |
| 配音与对齐 | [runAudioEngine](../../src/pipeline/2-audio/audio-runner.ts)：运行 TTS worker、对齐 worker，组织音频时间与字幕 | WAV、`tts-output.json`、`aligned-tokens.json`、`audio-timeline.json`、SRT |
| 音画绑定 | [linkAndAssembleLesson](../../src/pipeline/3-link/assembler.ts)：结合分镜和音频，调用 `resolveSceneCuePoints`，计算场景帧区间 | 本课 `compiled-lesson.json`，同时更新 `workspaces/current-lesson.json` |

编译 CLI 处理现有口播与分镜合一稿格式，仍有历史默认输入与课号；使用时显式指定本课 `--input`、`--lesson`。课时准备脚本也可生成 IR 或组装本课数据，具体入口查公共能力索引。

### 4.2 关键数据

| 数据 | 定义位置与职责 |
| --- | --- |
| `StoryboardIR` | [storyboard-ir.schema.ts](../../contracts/storyboard-ir.schema.ts)：口播分句、停顿指令、视觉类型、payload 和待定位的 `cueSpecs` |
| `AudioTimeline` | [audio-timeline.schema.ts](../../contracts/audio-timeline.schema.ts)：实际音频路径、时长、逐场景 token、字幕与引擎信息 |
| `CompiledLesson` | [compiled-lesson.schema.ts](../../contracts/compiled-lesson.schema.ts)：画幅、场景帧区间、已解析 cues、字幕及公开音频路径 |
| `ResolvedCuePoint` | [visual-props.schema.ts](../../contracts/visual-props.schema.ts)：动作、目标、触发毫秒、场景内局部帧及匹配方式 |

实际音频与对齐结果决定时序。[resolveSceneCuePoints](../../src/pipeline/3-link/cue-point-resolver.ts) 将口播锚点转换为场景局部帧，并记录 `token-exact`、`token-fuzzy` 或 `fallback-ratio`。模糊匹配和比例回退需要结合实际讲解核对，不能视为已经精确对齐。

字幕由原文与 token 生成，视频和 SRT 使用同一版本数据。局部时间、整课时间和样段归零要保持一致；具体切分、静音窗口及同步要求按现行字幕、音频规范执行。

### 4.3 Python worker 与缓存

[tts_worker.py](../../src/pipeline/2-audio/tts_worker.py) 按分句生成音频，插入停顿并装配分镜和整轨；[align_worker.py](../../src/pipeline/2-audio/align_worker.py) 对实际分镜音频做强制对齐，再加上分镜偏移得到时间戳。

- 配音缓存位于 `.cache/audio/clauses/`，当前键包含停顿策略版本、seed、音色指令和分句文本。
- 对齐缓存位于 `.cache/audio/align/`，当前按分镜 WAV 的 SHA-256 保存相对 token 时间。
- `synthetic` 模式产生测试静音和估算 token，不能作为课程配音或精确同步的依据。

模型权重、各自 Python 环境和本机工具路径由现有环境提供，详见 [README](../../README.md)的外部环境说明，不随课程代码自动恢复。

## 五、预览、画面渲染与公共合成

`npm run studio` 与 `npm run dev` 使用 [scripts/studio.mjs](../../scripts/studio.mjs) 启动预览。课程预览和教学画面渲染从 `src/visual/index.ts` 注册的入口选择 Composition；公共合成另外使用独立字幕入口。Studio 通过不等于交付文件已经生成或验收。

### 5.1 当前导出入口

| 入口 | 输入与处理 | 产物及边界 |
| --- | --- | --- |
| [scripts/render-lesson.mjs](../../scripts/render-lesson.mjs) 的 `renderLesson` | 选择已注册 Composition，显式提供课号、SRT、输出路径；有声版另提供连续 WAV。支持指定帧范围 | 一次导出一个 MP4、配套 SRT、媒体信息 JSON；独立 WAV 归档另行处理 |
| [scripts/compose-lesson.mjs](../../scripts/compose-lesson.mjs) 的 `composeLesson` | 读取干净 MP4、同版整轨 WAV 和字幕 JSON / SRT，只生成字幕透明图，再合入视频 | 有声字幕 MP4、24 kHz 双声道 PCM16 WAV、SRT、媒体信息 JSON；保留输入干净版，所有输出拒绝覆盖 |
| [src/cli/render.ts](../../src/cli/render.ts) → [renderLessonDeliverables](../../src/pipeline/4-render/nvenc-renderer.ts) | 读取本课 `compiled-lesson.json`，向 `CourseVideo` 传入课时数据和音频、字幕开关 | 两次渲染分别生成有声、无声 MP4，复制整轨 WAV / SRT，写入 `delivery-manifest.json` |

双版本交付先取得干净版，再显式调用 `composeLesson`。它接收媒体文件和字幕数据，不依赖本课采用独立组件还是编译母版；当前要求 1920×1080、恒定 30 fps。已有同版干净视频直接复用，参数与命令集中在[公共能力索引](公共能力索引V0.1.md)第九节。

### 5.2 公共合成调用关系

`composeLesson` 按以下顺序工作：

1. 校验输入媒体与字幕；[caption-overlay.mjs](../../scripts/caption-overlay.mjs) 的 `readCaptionText`、`buildCaptionPlan` 保留字幕时间精度，生成不同文本的图片清单和显示区间。
2. `renderCaptionImages` 打包 [caption-export/index.tsx](../../src/visual/caption-export/index.tsx)，通过 `openBrowser → selectComposition → renderStill` 复用一个浏览器，为每个不同文本生成透明 PNG。[CaptionStill](../../src/visual/caption-export/CaptionStill.tsx) 直接调用公共 `CaptionsOverlay`，不重算教学画面。
3. `buildCaptionConcat` 写入图片时间表，`buildComposeArgs` 组织 FFmpeg 命令：CUDA 解码干净视频，`overlay_cuda` 叠加字幕，`h264_nvenc` 编码有声版，同时处理连续音轨。
4. `ffprobe → verifyComposedMedia` 核对视频帧数、尺寸、帧率、轨道、音频格式、起点和时长，再保存 MP4、WAV、SRT、JSON。JSON 含输入来源、时间范围、输出路径和视频／WAV 媒体参数，与旧 `delivery-manifest.json` 的结构不同。

样段由输入干净视频的帧数和 `start-frame` 确定，音频、字幕仍传整课版本；输出音频与字幕按同一范围裁切并归零。WAV 为 24 kHz 双声道 PCM16，MP4 为 48 kHz 双声道 AAC；单声道等幅复制，不重复处理已确认的音量。

视频解码、叠加、编码使用 GPU；PNG 解码与格式转换、音频处理使用 CPU。GPU 出错即失败并保留临时文件，不自动转为 CPU 视频渲染。命令交由用户执行，已有小样结论沿用；有声版仍需重新编码，省去的是教学组件、布局和动画的再次计算。

### 5.3 原有入口保留的行为

`renderLesson` 的流程仍是 `bundle → selectComposition → renderMedia 分段画面 → FFmpeg 拼接并按需合音轨 → ffprobe → 保存产物`。当前最多拆成四段并行，画面渲染时静音；有声版最后合入连续音轨，样段音频和 SRT 按同一范围裁切。**该入口的 SRT 只用于独立字幕文件，画面字幕仍由 Composition 绘制。**

`render-lesson.mjs`、课时包装脚本和 `npm run render` 均未自动调用 `composeLesson`。继续用旧命令分别导出两版，仍会分别计算画面；`npm run render` 的 `--max-frames` 也仍只限制视频帧范围，配套 WAV / SRT 复制整课文件，不能视为时间范围一致的样段。

原有两个渲染实现使用 `hardwareAcceleration: "if-possible"`，实际编码器以日志为准。公共能力索引提供要求硬件编码的干净版命令模板；已有分段渲染方式可以沿用。原共享入口拒绝覆盖已有视频和媒体信息，旧通用入口使用固定交付文件名，调用时按各自保存行为处理。

## 六、数据与成果的存放关系

`workspaces/<工作区标识>/` 保存课时制作数据与音频，`public/audio/<工作区标识>/` 提供浏览器可访问的播放素材。组装器会写入 `audioPublicSrc`，不会自动替本课恢复对应公开音频文件；路径和实际素材需匹配。

临时关键帧与短样放在 `out/`，媒体成果归档到 `deliverables/<lessonId>/`，教学讲义放在本课 `handout/`。讲义由现有课时脚本及制作步骤生成，不属于通用视频渲染器的自动产物；完整目录约定见 AI互动流程总结。

多人同时制作时，`current-lesson.json`、公共注册文件和可写素材需要协调，按[Agent 接手与协作说明](课时制作-Agent接手与协作说明V0.1.md)使用独立工作目录与输出位置。

## 七、现有边界与改进方向

| 现状 | 制作时的含义 |
| --- | --- |
| 两种课时组织路线与多个导出入口并存 | 按本课数据选择干净版 Composition，再显式调用公共合成入口；不假定所有课时都经过 `MasterCanvas` 或编译 CLI |
| 公共组件的默认值、覆盖项和插槽不统一 | 先查实际接口，通过已有参数和组合复用；课程内容与专用设计仍留在课时目录 |
| `MasterCanvas` 背景只解析 `type`，没有背景配置 Props | 默认值尚未完全对应画面规范；适配时处理实际配置，不额外叠一层背景遮盖 |
| 通用 TTS worker 与旧渲染器尚未完整落实音频规范；新合成入口已处理输出采样率和双声道 | 传入已确认音量的整轨，新入口不代替整轨音量处理；按实际产物核对格式与听感 |
| 通用编译 CLI 没有统一的 `--group` / `--only` 入口 | 分组范围由本课已有数据、脚本与命令安排，不照搬其他项目参数 |
| 公共合成入口已可复用，旧命令未自动接入 | 干净版渲染一次后显式合成有声版；既有课时不需要为此重写教学画面 |

后续改进见[公共能力更新建议](公共能力更新建议V0.1.md)，落实后同步相关索引与架构说明。本版只记录当前结构与边界，不要求为了统一架构批量重写已有课时。

本次导出更新按实际代码核对，公共合成入口的小样已由用户确认通过。各课正式交付的检查与视听验收仍以本课记录为准。
