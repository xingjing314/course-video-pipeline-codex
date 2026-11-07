# Course Video Pipeline Codex

用于制作中文教学视频的 Remotion 项目，包含课程画面、配音与字幕处理、视频导出及配套讲义脚本。

**版本库保留公共框架、必要文档、独立公共示例和流程演示课 test01。** 其他课程的私有代码、数据和媒体保留在本地或归档位置，不纳入本仓库提交。公共示例所需的小素材与参考成果随示例保留；课程音频、成片及缓存另行保存。test01 用于说明流程，不作为课程质量标准。

文档更新日期：2026-11-07。具体课时的制作进度、预览入口和用户审核结论查本课记录。

## 一、开始制作与文档导航

遵守 [AGENTS.md](AGENTS.md)，先看 [制作流程第一节](docs/architecture/AI互动流程总结V0.1.md#一接手与按需阅读)，从用户当前任务和本课已有记录进入对应阶段。输入位于 `docs/lessons/<章节>/<课时>/input/`，沿用用户实际目录、口播稿版本和已确认范围。

| 文档 | 何时使用 |
| --- | --- |
| [AI互动流程总结](docs/architecture/AI互动流程总结V0.1.md) | 接手先看第一节；分镜、分组审核、导出和讲义步骤在进入相应阶段时读 |
| [公共能力索引](docs/architecture/公共能力索引V0.1.md) | 选择组件、方法或命令时查对应条目；第一节是速查表 |
| [视频画面规范V0.2](docs/architecture/视频画面规范V0.2.md) | 画面制作时查布局、背景、导航、章节标题和字幕外观 |
| [字幕规范V0.2](docs/architecture/字幕规范V0.2.md) | 字幕制作时查文字、切分、时间与 SRT 格式 |
| [音频规范V0.2](docs/architecture/音频规范V0.2.md) | 配音与交付时查音频参数、音量处理、思考停顿和同步 |
| [教学讲义制作方案V0.1](docs/architecture/教学讲义制作方案V0.1.md) | 制作讲义时查选帧、公共生成流程、图片与 PDF 要求及验收分工 |
| [按步骤的提示词V0.1](docs/prompt/按步骤的提示词V0.1.md) | 用户分轮发起任务的模板，按本课替换输入、方案和制作范围 |
| [架构说明V2.0](docs/architecture/architecture-design-v2.0.md) | 理解工程或修改实现时查目录职责、数据流、调用关系和现有边界 |
| [公共能力更新建议](docs/architecture/公共能力更新建议V0.1.md) | 规划或实施公共能力改造时查阅；其中的建议不代表已经实现 |

链接用于定位当前需要的内容，不要求递归通读。提示词模板、架构说明和历史记录不增加开工必读项；续作时补读本课进度与审核记录，已确认内容直接沿用。

## 二、安装与预览

当前本机使用 Node.js 24 与 npm，依赖版本由 `package-lock.json` 固定。以下命令在项目根目录执行：

```bash
npm ci
npm run studio
```

`npm run dev` 与 `npm run studio` 均调用 [scripts/studio.mjs](scripts/studio.mjs)，默认入口是独立公共示例 `src/examples/index.tsx`，默认端口为 **3025**。本课预览须通过 `--entry` 指定本课入口；端口被占用时可指定其他空闲端口。按用途选择：

```bash
# 公共示例
npm run studio
# 本课预览：替换入口路径
npm run studio -- --entry="<本课入口>" --port=3027
# test01 流程演示
npm run studio -- --entry src/lessons/test01/studio.tsx
```

公共示例统一见 [src/examples/README.md](src/examples/README.md)，包含讲义、题卡与表格；题卡和表格同时支持公共示例总入口与各自独立 Studio 入口，启动命令见示例总说明。标准题卡 ID 对应已审核示例，旧原型使用 `LegacyQuizCard…`。

浏览器地址以启动日志为准，在 Studio 中选择本课已注册的 Composition。具体入口与素材要求查本课记录，不把其他课时的 Composition 名称直接用于新课。

`npm ci` 只安装 Node 依赖。已有课时预览前，应从备份恢复代码引用的音频和图片，保持相对路径：播放音轨放在 `public/audio/`，继续处理配音所需的 WAV 放在对应 `workspaces/` 目录。代码存在不代表本地媒体齐全。

按改动需要运行 `npm run lint`（TypeScript 类型检查）、`npm run check:public`（公共代码）或 `npm test`（仓库内契约检查）。演示课入口用 `npm run check:course -- --course=test01`。技术检查与用户视听审核分别记录。

## 三、目录与制作入口

```text
contracts/                 分镜、音频时间线、视觉和交付数据契约
src/
├── pipeline/              输入解析、音频处理、音画绑定和通用导出
├── visual/                公共原子图形、组合组件、模板、背景与渲染壳
├── lessons/               课时专用组件、数据与各课独立入口
├── examples/              独立公共示例、说明、数据与配套素材
└── cli/                   编译、渲染和自测入口
scripts/                   Studio、按组配音、共享导出、讲义等公共脚本
docs/
├── architecture/          流程、规范、架构说明与公共能力索引
├── prompt/                分步骤提示词模板
└── lessons/<章节>/<课时>/
    ├── input/             口播稿、必读清单及配套材料
    └── handout/           教学讲义、配图和选帧记录
workspaces/                课时私有配置、配音、对齐、字幕和编译数据
public/fonts/              字体及授权说明
public/audio/              本地播放音轨
deliverables/<lessonId>/   视频、WAV、SRT 和媒体交付 JSON
out/、tmp/、.cache/         关键帧、临时输出与缓存
.agents/skills/            项目内辅助方法与所需资源
```

分镜、分组与制作记录放在本课 `docs/lessons/<章节>/<课时>/`；课时专用代码沿用 `src/lessons/` 下的实际组织方式。不同课时使用各自的工作区与输出目录，目录和标识以本课为准。

课程调用公共能力，公共实现不依赖具体课程，课程之间不互相依赖。`workspaces/` 不存放公共实现；公共示例使用本例自己的固定数据和素材。

独立课时组件与“编译数据＋公共母版”两种接入方式并存，详见架构说明。新课优先复用现有公共能力，音频方法查公共能力索引第七节，接入方法查第八节，预览与导出参数查第九节。分阶段命令模板见[制作流程第二节](docs/architecture/AI互动流程总结V0.1.md#二五个制作步骤)。

| 入口 | 当前用途 |
| --- | --- |
| [scripts/run-group-audio.ts](scripts/run-group-audio.ts) | 用 `--workspace=<分组目录>` 读取该目录已有的 `storyboard-ir.json`，完成本组配音、对齐和字幕；默认 CUDA，支持 `--dry-run` 检查输入，不自动继续下一组 |
| [scripts/render-lesson.mjs](scripts/render-lesson.mjs) | 共享单版画面导出：传入已注册的 Composition、对应素材和输出路径，可先导出干净版 |
| [scripts/compose-lesson.mjs](scripts/compose-lesson.mjs) | 复用干净视频，合入同版整轨配音与字幕，输出有声 MP4、双声道 WAV、SRT 和媒体信息 JSON |
| [scripts/handout.py](scripts/handout.py) | 读取本课页面数据和配图，生成讲义 PDF、交付 JPEG、轻量预览及 `selection.json` |
| [src/cli/compile.ts](src/cli/compile.ts) / `npm run compile` | 按现有口播与分镜输入格式完成解析、配音、对齐和绑定；需明确输入文件、课时标识及音频模式 |
| [src/cli/render.ts](src/cli/render.ts) / `npm run render` | 读取本课 `compiled-lesson.json`。调用方传入 `--entry` 和 `--composition`，渲染一次干净版，或用 `--clean` 复用已有视频，再调用公共合成。公共代码不内置课程入口 |

双版本交付采用“渲染一次干净视频 → 公共入口合成有声字幕版”，详细参数与整课、样段命令查[公共能力索引](docs/architecture/公共能力索引V0.1.md)第九节。`npm run render` 已自动完成这两步，无需再次合成；仅导出干净视频的入口，再显式调用 `compose-lesson.mjs`。

现有编译入口不能直接处理任意纯口播稿。按组配音已支持 `--workspace`；`npm run compile` 与 `npm run render` 尚无统一的 `--group`／`--only` 选择接口，按各入口实际参数调用。

`handout/` 只收纳教学讲义相关成果。新课参考已通过用户审核的[独立讲义示例](src/examples/handout/README.md)，维护自己的页面输入与素材，调用公共入口生成 PDF 和选帧记录；输入与输出分开，已有课时脚本可继续沿用。选帧与教学内容由本课决定，通用视频导出不会自动生成讲义。

## 四、外部环境与素材依赖

以下依赖和素材需在本机另行准备，不会随 `npm ci` 恢复。表中的绝对路径是当前项目使用的本机路径，迁移环境时按实际位置核对。

| 依赖 | 当前路径或用途 |
| --- | --- |
| Qwen3-TTS 权重与 Python 环境 | `/projects/gaoxiang/qwen3-tts/`，音频调用使用其中 `.venv/bin/python` |
| Qwen3-ForcedAligner 权重与 Python 环境 | `/projects/gaoxiang/qwen3-forced-aligner/`，音频调用使用其中 `.venv/bin/python` |
| Chrome | 共享导出脚本使用 `/opt/google/chrome/chrome` |
| FFmpeg / ffprobe | 视频合并、截帧、音频处理及媒体参数检查；公共合成入口需要 CUDA 解码、`overlay_cuda` 和 `h264_nvenc` |
| Python 3.10+ / Pillow / ReportLab / 中文与符号 TTF | 公共讲义处理使用；环境、默认字体与覆盖方式见[讲义示例说明](src/examples/handout/README.md#环境与运行) |
| 教材、题库、音频、图片及交付媒体 | 按本课必读清单和代码引用恢复；公共示例的必要素材由本例提供 |

本机真题参考入口：[教材章节—历年真题总索引](/projects/gaoxiang/information-systems-project-management-4e-course/01-decisions/教材章节和历年真题映射/教材章节—历年真题总索引.md)。需要时按索引定位试卷与题号，并核对原解析版题干、选项和解析；该索引位于相邻项目，不随本仓库复制。

GPU 命令由 Agent 准备、用户在本机执行，具体分工与命令要求见[制作流程第三节](docs/architecture/AI互动流程总结V0.1.md#三gpu-分工与命令)。

项目内的 [教学画面编排 skill](.agents/skills/course-visual-storytelling/SKILL.md)、[frontend-design](.agents/skills/frontend-design/SKILL.md) 和 [doc-coauthoring](.agents/skills/doc-coauthoring/SKILL.md) 按当前任务与各 skill 的适用范围使用。环境提供的 PDF 等 skill 不随项目复制，接手时按任务确认可用性。

`frontend-design` 与 `doc-coauthoring` 来自 `anthropics/skills` 提交 `dbd4588f9e1033efb41dad4bef2f7947c8993d44`，保留完整目录和已有许可文件。教学画面编排的方法来源见其[参考说明](.agents/skills/course-visual-storytelling/references/sources.md)。

## 五、版本管理与素材保存

实际忽略规则以 [.gitignore](.gitignore) 为准：

| 范围 | 保存方式 |
| --- | --- |
| 公共源码、`contracts/`、公共脚本、依赖与工程配置 | 保留在 Git 中 |
| 通用文档、提示词、项目内 skills | 保留在 Git 中，连同所需资源和许可文件 |
| `src/examples/` | 示例代码、固定数据、必要小素材和参考成果保留；运行产物按各示例的忽略规则处理 |
| `src/lessons/`、`docs/lessons/` | 课程目录默认忽略，仅放开 `test01/`，保留演示课源码、文档与必要输入 |
| `workspaces/` | 默认忽略，仅放行 `workspaces/test01/**/*.json`；SRT、图片、音频等运行产物留在本地 |
| `public/fonts/` | 字体与授权说明保留在 Git 中 |
| `public/audio/` | 忽略，播放音轨留在本地或用户指定的备份位置 |
| `deliverables/`、`out/`、`tmp/` | 忽略，保存交付媒体与临时输出 |
| `node_modules/`、`.cache/`、日志及已匹配的本地环境配置 | 忽略，按需要恢复 |

公共示例的参考 PDF 与图片属于示例配套材料。课程讲义等交付媒体另行保存，具体路径是否被忽略以实际规则为准；新增忽略规则不会自动移除已被 Git 跟踪的文件。

忽略文件只控制提交范围，本地制作仍可读取相应课程目录。音频、成片和讲义的恢复位置由本课记录说明。提交与上传按已有授权执行，只纳入当前任务的文件。

`package.json` 仍保留历史包名 `course-video-pipeline-gemini`，不影响本仓库作为 `course-video-pipeline-codex` 使用。

## 六、课时与历史记录

课时进度、实际路径和审核结论维护在本课记录中。版本库中的课程材料只保留演示课 [test01](docs/lessons/test01/)；其他课程在本地或归档位置维护，不加入本仓库提交。公共示例与 test01 的运行不依赖这些课程。

历史音频原件位置见 [音频清理清单](docs/maintenance/audio-cleanup-2026-10-27.json)。当前实现查架构说明与代码。
