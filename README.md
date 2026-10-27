# Course Video Pipeline Codex

用于制作中文教学视频的 Remotion 项目，包含课程画面、配音与字幕处理、视频导出及配套讲义脚本。

**仓库用途：个人保存程序、记录制作经验，方便后续重构和继续开发。** 音频、成片、讲义 PDF、截图及缓存保留在本地或其他备份中，不随代码上传 GitHub。

本文按 2026-10-27 的项目状态整理。初始版本已由用户上传 GitHub；后续目录迁移和本轮有限架构调整尚未提交、上传。`package.json` 中仍保留历史包名 `course-video-pipeline-gemini`。

## 一、版本管理范围

以 [`.gitignore`](.gitignore) 为准：

| 范围 | 处理方式 | 用途 |
| --- | --- | --- |
| `src/`、`contracts/`、`scripts/` | 保留 | 程序、数据契约、课程和讲义制作脚本 |
| `package.json`、`package-lock.json`、TypeScript / Remotion 配置 | 保留 | 安装依赖和运行配置 |
| `docs/`、`README.md`、`AGENTS.md` | 保留 | 规范、课程材料、制作记录与协作要求 |
| `docs/lessons/ch*/L*/handout/` 中生成的 PDF 和位图 | 忽略，留在本地 | 课时讲义交付成果；选图 JSON 继续保留 |
| `workspaces/` 中的 JSON、SRT | 保留，修复前备份目录除外 | 课程配置、时间线、字幕及编译数据 |
| `public/fonts/` | 保留，包括授权文件 | 保持字体及画面排版 |
| `public/audio/` | 忽略，留在本地 | 播放音轨及其附带数据 |
| `workspaces/**/*.wav` | 忽略，留在本地 | 配音原件、逐场景素材和合成音轨 |
| `workspaces/ch06-L01-quiz/before-voice-fix/` | 忽略，留在本地 | 局部配音修复前的备份 |
| `deliverables/`、`out/`、`tmp/` | 忽略 | 交付成果、渲染中间文件和临时预览 |
| `node_modules/`、`.cache/`、日志、本地环境配置 | 忽略 | 依赖、缓存及机器相关配置 |

`workspaces/` 不能整体忽略：现有代码直接导入其中的 `current-lesson.json`、`audio-timeline.json`、`compiled-lesson.json`、`patches.json` 和 `assembly.json` 等文件。

按当前范围，拟上传文件约 43.4 MiB，其中字体约 32.2 MiB。当前方案无需为音频配置 Git LFS。GitHub 代码仓库不承担完整制作素材和交付成果的备份职责。

## 二、课程与交付状态

| 课程 | 主要 Composition | 制作状态 | 本项目中的交付文件 |
| --- | --- | --- | --- |
| 第六章 L01 | `Ch06L01Full` / `Ch06L01SilentClean` | 内容样段及有声字幕成片已审核通过，四项媒体交付齐全 | 保留在本地 `deliverables/ch06-L01/` |
| 第七章 L01（早期模板） | `CourseVideo` / `CourseVideoSilentClean` | 已交付，沿用历史制作记录 | 已从本项目清理，用户另有备份 |
| 第七章 L01（DeepSeek 版） | `L01Lesson` / `L01LessonSilent` | 已验收，沿用历史制作记录 | 已从本项目清理，用户另有备份 |
| 第七章 L02 | `L02Lesson` / `L02LessonSilent` | 已验收，沿用历史制作记录 | 已从本项目清理，用户另有备份 |
| 第七章 L03 | `L03Lesson` / `L03LessonSilent` | 已验收，沿用历史制作记录 | 已从本项目清理，用户另有备份 |

第七章的代码与课程 JSON / SRT 仍保留；本地音频与交付成果此前已清理，用户另有备份。接手时不能将课程代码存在视为素材齐全。

### 第六章 L01

- 输入稿：[`第6章-L01完整口播稿V0.3.md`](docs/lessons/ch06/L01/input/第6章-L01完整口播稿V0.3.md)。
- 整课由 11 个内容段、66 个场景组成，35369 帧，1920×1080、30fps，约 19 分 39 秒。
- 完整 SRT 含 315 条字幕；66 个场景不是 66 张静态图片。
- 6 页配套讲义样稿已审核通过；34 页整课讲义已生成并交付，尚未收到整课讲义的审核结论。
- 视频目前保留 S01–S66 场景标记；第六章 L02 尚未进入正片制作。

本地交付目录包括：

| 文件 | 用途 |
| --- | --- |
| `ch06-L01-voiced-captioned.mp4` | 含配音及口播字幕的视频 |
| `ch06-L01-silent-clean.mp4` | 无音轨、无底部口播字幕；保留教学文字、图形、题面、解析和倒计时 |
| `ch06-L01-full.wav` | 完整配音 |
| `ch06-L01.srt` | 独立字幕文件 |
| `media-info.json`、`media-info-silent-clean.json` | 两版视频的媒体参数记录，不参与播放 |
| `handout-sample-v0.1/`、`handout-v1.0/` | 讲义 PDF 和配套图片 |

这些交付成果均不上传 GitHub。完整过程见 [第六章 L01 制作与交付工作总结](docs/lessons/ch06/L01/第六章-L01-制作与交付工作总结V1.0.md)。

## 三、安装与预览

以下命令均在项目根目录执行。当前开发环境使用 Node.js 24、npm；Remotion 4、React 19 等具体依赖版本由 `package-lock.json` 固定。

```bash
npm ci
npm run studio
```

`npm run dev` 与 `npm run studio` 使用相同入口：`src/visual/index.ts`，默认端口为 **3025**；可用 `npm run studio -- --port=3027` 或 `npm run dev -- --port 3028` 指定独立端口。端口被占用时明确报错，请换用空闲端口，不会主动关闭现有服务。第六章整课入口为 `http://localhost:3025/Ch06L01Full`，无声版为 `http://localhost:3025/Ch06L01SilentClean`。历史制作记录中的 3026 是当时的预览端口，实际访问以启动日志为准。

### 在新电脑上恢复音频

克隆代码后不会自动获得配音。普通有声预览或渲染会读取音频文件，缺失时可能加载失败；仅运行 `npm ci` 不会恢复这些素材。

- 将备份中的播放音轨放回 `public/audio/`，保持原有相对路径。例如第六章整课使用 `public/audio/ch06-L01-full/narration.wav`，各样段使用 `public/audio/ch06-L01-<分段名>/narration.wav`。
- 需要继续处理配音或使用通用交付渲染流程时，也应恢复 `workspaces/<lessonId>/` 下相应的整课和逐场景 WAV。
- 当前 `public/audio/` 是普通目录。历史文档中的“软链接到 workspaces”不代表当前状态。
- 本次仅整理文档，未执行新电脑安装或恢复演练，不将这些步骤视为已经完成的验证。

## 四、程序结构与制作入口

```text
contracts/                 讲稿、音频时间线、视觉、编译和交付数据契约
src/
├── pipeline/              1-ingest / 2-audio / 3-link / 4-render
├── visual/                注册表、渲染壳、模板、原语、背景及原型
├── lessons/ch06/          第六章汇总入口及既有 L01 内容组件
│   └── L01/index.ts       L01 的整课、无声版和分段预览入口声明
├── lessons/ch07/          第七章内容组件与课程注册
└── cli/                   compile.ts / render.ts / selftest.ts
scripts/                   课程制作与导出脚本
scripts/ch06-L01/handout/   第六章讲义截帧与排版脚本
workspaces/                课程配置、时间线、字幕及本地音频
public/fonts/              字体及授权说明
public/audio/              本地播放音轨（不上传）
docs/                      架构规范、课程资料、制作记录和选图记录
deliverables/              本地交付成果（不上传）
out/、tmp/、.cache/         本地中间产物（不上传）
```

当前保留两种课程实现方式：

- **第六章 L01**：独立内容段组件按 `workspaces/ch06-L01-full/assembly.json` 组装；整课统一音轨、字幕开关和场景导航。入口为 `src/lessons/ch06/L01Full.tsx`，导出脚本为 `scripts/render-ch06-l01.mjs`。
- **第七章**：`compiled-lesson.json` 经课程注册进入 `MasterCanvas` / `SceneRouter`，结合课内组件、模板、`patches.json`、字幕和 cue 数据呈现画面。具体设计见 [DeepSeek 版架构说明](docs/architecture/deepseek版架构说明V0.1.md)。

### 课时边界（阶段 B 已落实）

- 第六章入口由 `src/lessons/ch06/L01/index.ts` → `src/lessons/ch06/index.ts` → `src/visual/compositions.tsx` 汇总；L01 的 15 个既有入口名称、顺序与参数保持不变。
- 后续同章新课在 `src/lessons/ch06/L02/` 等独立课时目录维护组件和 `index.ts` 入口，并在章节 `index.ts` 接入；无需在公共 Composition 文件逐段添加入口。本阶段未创建 L02 内容或入口。
- 新章节仍需在公共汇总处接入一次；第七章继续使用既有 `registry.ts`。公共注册和组件的改动需要集中整合，并非自动消除合并冲突。
- 新课使用完整课时标识（例如 `ch06-L02`），新增 Composition 名称包含章节和课时。既有标识、现有 L01 分段目录和内容文件不批量改名或搬迁。
- 每课拥有自己的 `docs/lessons/<章节>/<课时>/`、`workspaces/<lessonId>/`、`public/audio/<lessonId>/`、`out/<lessonId>/` 和媒体交付 `deliverables/<lessonId>/`；新课讲义交付沿用课时目录下的 `handout/`。
- 入口声明类型位于 `src/lessons/composition-types.ts`，只包含类型，课时入口不反向导入公共 Composition 汇总。`Root.tsx`、`current-lesson.json` 及其写入逻辑保持现状。

当前仍需独立工作目录来隔离同时制作的任务。阶段 C 已提供共享导出脚本和独立预览端口；尚未进行两工作目录编辑或其他 agent 接手试点。详细范围与验证记录见 [有限架构调整方案](docs/architecture/多课时并行制作-有限架构调整方案V0.1.md)。

公共制作管线按口播稿解析、配音与对齐、音画绑定、渲染交付组织。各课仍有专用脚本和输入依赖，不能通过简单替换课号保证完整复现。保留现有实现供后续重构参考，本次没有统一或重新设计架构。

### 第六章整课导出

恢复所需素材并具备 Chrome、FFmpeg、ffprobe 和相应 GPU 环境后，可使用：

```bash
# 有声口播字幕版
node scripts/render-ch06-l01.mjs

# 无声、无底部口播字幕版
node scripts/render-ch06-l01.mjs --silent-clean
```

脚本输出到 `deliverables/ch06-L01/`；目标成片已存在时会拒绝覆盖，可通过 `--output=deliverables/ch06-L01/ch06-L01-v2.mp4` 指定新的文件名。当前脚本使用 `/opt/google/chrome/chrome`，分四段渲染，并设置尽可能启用硬件加速。实际是否使用 GPU 取决于驱动与运行环境。

该脚本还会复制 SRT、生成媒体参数 JSON；独立 WAV 的归档和讲义制作另行处理，并非一条命令完成全部交付。

### 共享导出入口（阶段 C）

`scripts/render-lesson.mjs` 接收明确的课时、Composition、连续音轨、SRT 和输出文件。L01 原脚本已改为调用该入口，旧命令及默认成片、SRT、媒体信息文件名保留。下面用已存在的 L01 演示；其他课时需先准备好自己的入口与素材。

```bash
node scripts/render-lesson.mjs \
  --lesson=ch06-L01 --composition=Ch06L01Full \
  --audio=public/audio/ch06-L01-full/narration.wav \
  --srt=workspaces/ch06-L01-full/ch06-L01-full.srt \
  --output=deliverables/ch06-L01/ch06-L01-v2.mp4

# 短样段：零起始帧号，两端包含；另选未使用的输出文件名
node scripts/render-ch06-l01.mjs \
  --frames=240-389 --output=out/ch06-L01/sample-v2.mp4
```

- 无声版使用对应无字幕 Composition，并加 `--silent-clean`，无需传音频。共享入口会传入 `includeAudio=false`、`includeCaptions=false`；内容组件必须支持这两个参数，或本身就是无口播字幕入口。脚本不能自动识别任意组件中的口播字幕和教学文字。
- 有声画面中的字幕仍由 Composition 控制，传入的 SRT 用于配套字幕文件。音轨应与该 Composition 的第 0 帧对齐，不能直接给分段入口传整课音轨。
- `--frames` 可选；省略时导出完整 Composition。样段按相同帧范围裁切音频，将配套 SRT 裁切并归零，画面仍按原课时帧号渲染。样段截断处可能位于一句话中间。
- 自定义输出 `name.mp4` 同目录生成 `name.srt`、`name.media-info.json`；无声视频仍提供独立 SRT，不把它烧录进画面。
- 成片和媒体信息文件拒绝覆盖；同名 SRT 仅在内容完全一致时复用。每次导出的分段文件使用独立临时目录，成功后移除，失败时打印保留位置。
- 相对路径均相对于项目根目录解析。继续沿用 1080p L01 的渲染设置、四段并行与 GPU 优先编码；实际尺寸、帧率来自所选 Composition。未重写第七章通用渲染流程。


### 其他入口

| 命令或脚本 | 用途与前提 |
| --- | --- |
| `npm run compile -- --input=<口播与分镜稿路径> --lesson=<lessonId> --audio-mode=cuda` | 通用编译入口；需要适配输入格式及本地 TTS / 对齐环境 |
| `npm run render -- --lesson=ch07-L03-ds` | 通用交付渲染入口；读取同名 workspace 的编译数据和音频，不是第六章专用导出入口 |
| `scripts/build-l0*-ir.ts`、`scripts/build-l0*-shot-table.ts`、`scripts/build-l0*-cues.ts` | 第七章各课的专用制作脚本，使用前核对输入路径与参数 |
| `npm run lint` | TypeScript 类型检查，按需要手动执行 |
| `npm test` | 契约与编译自测，按需要手动执行 |

## 五、外部环境与素材依赖

`npm ci` 安装的是 Node 依赖；以下内容未包含在代码仓库中：

| 依赖 | 当前使用位置或要求 |
| --- | --- |
| Qwen3-TTS 权重和 Python 环境 | `/projects/gaoxiang/qwen3-tts/`，音频调用使用其中 `.venv/bin/python` |
| Qwen3-ForcedAligner 权重和 Python 环境 | `/projects/gaoxiang/qwen3-forced-aligner/`，音频调用使用其中 `.venv/bin/python` |
| Chrome | 第六章导出脚本固定使用 `/opt/google/chrome/chrome` |
| FFmpeg / ffprobe | 视频合并、截帧、音频处理和媒体参数记录 |
| Python / ReportLab / 中文字体 | 讲义排版使用 `/usr/share/fonts/truetype/droid/DroidSansFallbackFull.ttf` |
| 外部教材、题库和部分第七章口播稿 | 历史脚本引用相邻项目中的绝对路径，需从个人备份恢复并核对 |

本机硬件为 RTX 5060 Ti 16GB。适合 GPU 加速的制作任务优先使用 GPU；若驱动、权限或环境配置需要用户操作，应及时说明具体障碍与所需操作。代码阅读和文档整理不依赖 GPU。

跨机器使用前需核对上述路径；这些本机依赖尚未全部参数化，本轮未添加环境部署方案。

## 六、配套讲义

后续课时的讲义最终交付目录统一为 `docs/lessons/<章节>/<课时>/handout/`。第六章 L02 使用用户已建立的 `docs/lessons/ch06/L02/handout/`；其口播稿位于 `docs/lessons/ch06/L02/input/第6章-L02完整口播稿V0.3.md`。其他章节按同一结构安排。

生成的 PDF 和位图不上传 GitHub，选图记录 `selection.json` 属于制作数据，继续保留在 Git 中。本次阶段 A 保留 L01 已有交付物在 `deliverables/ch06-L01/` 的位置及脚本输出行为，未迁移成品，也未创建 L02 制作脚本。

| 文件 | 用途 |
| --- | --- |
| `scripts/ch06-L01/handout/build_sample.py` | 6 页样稿排版 |
| `scripts/ch06-L01/handout/extract.py` | 正式版选图及截帧 |
| `scripts/ch06-L01/handout/build.py` | 正式版 PDF 排版 |
| `docs/lessons/ch06/L01/handout/sample-v0.1/selection.json` | 样稿选图记录 |
| `docs/lessons/ch06/L01/handout/v1.0/selection.json` | 正式版选图记录 |

使用已有截图生成 PDF：

```bash
python3 scripts/ch06-L01/handout/build_sample.py
python3 scripts/ch06-L01/handout/build.py
```

两者分别读取本地交付目录 `handout-sample-v0.1/images/` 和 `handout-v1.0/images/`，需要先恢复相应图片。

重新截取正式版图片：

```bash
python3 scripts/ch06-L01/handout/extract.py
```

截帧依赖本地无声成片 `deliverables/ch06-L01/ch06-L01-silent-clean.mp4` 和可用的 FFmpeg CUDA 解码环境。脚本会根据内置选图设置重写正式版 `selection.json`，并跳过已存在的截图；若只修改了选图记录中的标题或笔记，应直接运行排版脚本，避免记录被覆盖。

## 七、协作与制作要求

新课接手先读 [课时制作：Agent 接手与协作说明](docs/architecture/课时制作-Agent接手与协作说明V0.1.md)，填写课时、输入稿、工作目录、分支、端口和本轮停止点。当前已完成说明文档，独立接手及两目录编辑试点尚未开展。

以 [AGENTS.md](AGENTS.md) 和已确认的画面、字幕规范为准：

- 先确认小样及关键规则，再逐段制作和审核，最后组装交付，遇到困难及时沟通。
- 优先处理直接改善视频展示的工作，避免过早工程化和扩大范围。
- 真题读题和倒计时阶段不提前泄露答案；题面、口播、解析与字幕保持同步。
- 无声无口播字幕版保留教学文字，字幕位置和章节标题样式遵循对应规范。
- 自动检查不能替代用户对画面和听感的审核。

## 八、文档索引

| 文档 | 内容 |
| --- | --- |
| [Agent 接手与协作说明](docs/architecture/课时制作-Agent接手与协作说明V0.1.md) | 任务卡、工作边界、素材准备、审核节点与归档要求 |
| [第六章 L01 制作与交付工作总结](docs/lessons/ch06/L01/第六章-L01-制作与交付工作总结V1.0.md) | 制作过程、交付状态及后续边界 |
| [第六章 L01 画面安排](docs/lessons/ch06/L01/第六章-L01-画面安排V0.1.md) | 分段画面设计和审核记录 |
| [视频头尾区域规范](docs/architecture/视频头尾区域规范V0.1.md) | 顶栏、字幕区域及布局要求 |
| [字幕规范](docs/architecture/字幕规范V0.1.md) | 字幕切分、时序和 SRT 要求 |
| [章节主标题样式规范](docs/architecture/章节主标题样式规范V0.1.md) | 已确认的章节标题样式 |
| [DeepSeek 版架构说明](docs/architecture/deepseek版架构说明V0.1.md) | 第七章实现的分层、数据流和设计记录 |
| [早期架构设计](docs/architecture/architecture-design-v1.0.md) | 四阶段编译器的历史设计参考 |
| [第七章 L02 复盘与交付总结](docs/lessons/ch07/L02/第七章-L02-复盘与交付总结V1.0.md) | 历史制作流程及经验 |
| [第七章 L03 整改方案](docs/lessons/ch07/L03/第七章-L03-整改方案V1.0.md) | 历史问题与整改记录 |
| [音频清理清单](docs/maintenance/audio-cleanup-2026-10-27.json) | 已清理的 148 个重复逐场景 WAV 的原件位置、校验值和恢复方法 |

历史文档保留当时的路径与交付信息；当前本地文件范围和版本管理约定以本文及 `.gitignore` 为准。
