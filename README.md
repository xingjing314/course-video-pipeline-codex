# Course Video Pipeline Codex

用于制作中文教学视频的 Remotion 项目，包含课程画面、配音与字幕处理、视频导出及配套讲义脚本。

**仓库用途：个人保存程序、课程数据和制作经验，便于持续制作与维护。** 音频、成片、讲义 PDF、截图及缓存保留在本地或用户指定的备份位置，不随代码上传 GitHub。

文档更新日期：2026-11-02。具体课时的制作进度、预览入口和用户审核结论查本课记录。

## 一、开始制作与文档导航

遵守 [AGENTS.md](AGENTS.md)，按 [AI互动流程总结](docs/architecture/AI互动流程总结V0.1.md)中的最小必读范围开工。输入位于 `docs/lessons/<章节>/<课时>/input/`，沿用用户实际目录、口播稿版本和已确认范围。

| 文档 | 何时使用 |
| --- | --- |
| [AI互动流程总结](docs/architecture/AI互动流程总结V0.1.md) | 日常制作入口：阅读范围、分镜分组、Studio 审核、集中渲染与讲义交付 |
| [公共能力索引](docs/architecture/公共能力索引V0.1.md) | 开工先读第一节入口速查；具体组件、方法和命令用到时再查 |
| [视频画面规范V0.2](docs/architecture/视频画面规范V0.2.md) | 画面制作时查布局、背景、导航、章节标题和字幕外观 |
| [字幕规范V0.2](docs/architecture/字幕规范V0.2.md) | 字幕制作时查文字、切分、时间与 SRT 格式 |
| [音频规范V0.2](docs/architecture/音频规范V0.2.md) | 配音与交付时查音频参数、音量处理、思考停顿和同步 |
| [按步骤的提示词V0.1](docs/prompt/按步骤的提示词V0.1.md) | 用户分轮发起任务的模板，按本课替换输入、方案和制作范围 |
| [架构说明V2.0](docs/architecture/architecture-design-v2.0.md) | 理解工程或修改实现时查目录职责、数据流、调用关系和现有边界 |
| [Agent 接手与协作说明](docs/architecture/课时制作-Agent接手与协作说明V0.1.md) | 独立工作环境、素材恢复、多人协作或成果移交时查阅 |
| [公共能力更新建议](docs/architecture/公共能力更新建议V0.1.md) | 规划或实施公共能力改造时查阅；其中的建议不代表已经实现 |

链接用于定位当前需要的内容，不要求递归通读。提示词模板、架构说明和历史记录不增加开工必读项；续作时补读本课进度与审核记录，已确认内容直接沿用。

## 二、安装与预览

当前本机使用 Node.js 24 与 npm，依赖版本由 `package-lock.json` 固定。以下命令在项目根目录执行：

```bash
npm ci
npm run studio
```

`npm run dev` 与 `npm run studio` 均调用 [scripts/studio.mjs](scripts/studio.mjs)，入口为 `src/visual/index.ts`，默认端口为 **3025**。端口被占用时会报错，可指定其他空闲端口：

```bash
npm run studio -- --port=3027
```

浏览器地址以启动日志为准，在 Studio 中选择本课已注册的 Composition。具体入口与素材要求查本课记录，不把其他课时的 Composition 名称直接用于新课。

`npm ci` 只安装 Node 依赖。已有课时预览前，应从备份恢复代码引用的音频和图片，保持相对路径：播放音轨放在 `public/audio/`，继续处理配音所需的 WAV 放在对应 `workspaces/` 目录。代码存在不代表本地媒体齐全。

按改动需要运行 `npm run lint`（TypeScript 类型检查）或 `npm test`（契约与编译自测）；技术检查与用户视听审核分别记录。

## 三、目录与制作入口

```text
contracts/                 分镜、音频时间线、视觉和交付数据契约
src/
├── pipeline/              输入解析、音频处理、音画绑定和通用导出
├── visual/                公共原子图形、组合组件、模板、背景与渲染壳
├── lessons/               课时专用组件、数据和入口汇总
└── cli/                   编译、渲染和自测入口
scripts/                   Studio、共享导出及课时专用脚本
docs/
├── architecture/          流程、规范、架构说明与公共能力索引
├── prompt/                分步骤提示词模板
└── lessons/<章节>/<课时>/
    ├── input/             口播稿、必读清单及配套材料
    └── handout/           教学讲义、配图和选帧记录
workspaces/                课时配置、配音、对齐、字幕和编译数据
public/fonts/              字体及授权说明
public/audio/              本地播放音轨
deliverables/<lessonId>/   视频、WAV、SRT 和媒体交付 JSON
out/、tmp/、.cache/         关键帧、临时输出与缓存
.agents/skills/            项目内辅助方法与所需资源
```

分镜、分组与制作记录放在本课 `docs/lessons/<章节>/<课时>/`；课时专用代码沿用 `src/lessons/` 下的实际组织方式。不同课时使用各自的工作区与输出目录，目录和标识以本课为准。

独立课时组件与“编译数据＋公共母版”两种接入方式并存，详见架构说明。新课优先复用现有公共能力，接入方法查公共能力索引第八节，预览与导出命令查第九节。

| 入口 | 当前用途 |
| --- | --- |
| [scripts/render-lesson.mjs](scripts/render-lesson.mjs) | 共享视频导出：传入已注册的 Composition、对应素材和输出路径 |
| [src/cli/compile.ts](src/cli/compile.ts) / `npm run compile` | 按现有口播与分镜输入格式完成解析、配音、对齐和绑定；需明确输入文件、课时标识及音频模式 |
| [src/cli/render.ts](src/cli/render.ts) / `npm run render` | 读取对应 workspace 的编译结果，生成两版视频及配套媒体文件 |

上述入口的数据前提和产物不同，沿用本课采用的路线。现有编译入口不能直接处理任意纯口播稿；通用分组参数和一次画面渲染生成两版视频仍属于待改进能力，具体限制见公共能力索引。

`handout/` 只收纳教学讲义相关成果。当前讲义生成仍依赖课时脚本和选帧记录，通用视频导出不会自动生成讲义。

## 四、外部环境与素材依赖

以下依赖和素材需在本机另行准备，不会随 `npm ci` 恢复。表中的绝对路径是当前项目使用的本机路径，迁移环境时按实际位置核对。

| 依赖 | 当前路径或用途 |
| --- | --- |
| Qwen3-TTS 权重与 Python 环境 | `/projects/gaoxiang/qwen3-tts/`，音频调用使用其中 `.venv/bin/python` |
| Qwen3-ForcedAligner 权重与 Python 环境 | `/projects/gaoxiang/qwen3-forced-aligner/`，音频调用使用其中 `.venv/bin/python` |
| Chrome | 共享导出脚本使用 `/opt/google/chrome/chrome` |
| FFmpeg / ffprobe | 视频合并、截帧、音频处理及媒体参数检查 |
| Python / ReportLab / 中文字体 | 现有讲义脚本使用；字体路径按具体脚本核对 |
| 教材、题库、音频、图片及交付媒体 | 按本课必读清单和代码引用恢复；部分历史脚本仍引用相邻项目的绝对路径 |

本机真题参考入口：[教材章节—历年真题总索引](/projects/gaoxiang/information-systems-project-management-4e-course/01-decisions/教材章节和历年真题映射/教材章节—历年真题总索引.md)。需要时按索引定位试卷与题号，并核对原解析版题干、选项和解析；该索引位于相邻项目，不随本仓库复制。

**GPU 分工按 AGENTS.md 执行：** 需要 GPU 的 TTS、强制对齐、渲染和截帧命令由 Agent 准备、用户在本机执行，优先使用 RTX 5060 Ti 16GB。Agent 检查返回日志和产物，不自行改用 CPU 执行这些耗时任务；GPU 是否启用以实际运行输出为准。

项目内的 [教学画面编排 skill](.agents/skills/course-visual-storytelling/SKILL.md)、[frontend-design](.agents/skills/frontend-design/SKILL.md) 和 [doc-coauthoring](.agents/skills/doc-coauthoring/SKILL.md) 按 AGENTS.md 规定的范围使用。环境提供的 PDF 等 skill 不随项目复制，接手时按任务确认可用性。

`frontend-design` 与 `doc-coauthoring` 来自 `anthropics/skills` 提交 `dbd4588f9e1033efb41dad4bef2f7947c8993d44`，保留完整目录和已有许可文件。教学画面编排的方法来源见其[参考说明](.agents/skills/course-visual-storytelling/references/sources.md)。

## 五、版本管理与素材保存

实际忽略规则以 [.gitignore](.gitignore) 为准：

| 范围 | 保存方式 |
| --- | --- |
| `src/`、`contracts/`、`scripts/`、依赖与工程配置 | 代码与配置保留在 Git 中 |
| 文档、课时输入、制作记录、选帧 JSON、项目内 skills | 保留在 Git 中，连同所需资源和许可文件 |
| `workspaces/` 中的 JSON、SRT | 保留在 Git 中，已忽略的历史修复备份目录除外 |
| `public/fonts/` | 字体与授权说明保留在 Git 中 |
| `public/audio/`、`workspaces/**/*.wav` | 忽略，媒体留在本地或用户指定的备份位置 |
| `docs/lessons/ch*/L*/handout/` 下的 PDF、PNG、JPG、JPEG、WebP | 忽略，讲义媒体留在本地；选帧 JSON 保留 |
| `deliverables/`、`out/`、`tmp/` | 忽略，保存交付媒体与临时输出 |
| `node_modules/`、`.cache/`、日志及已匹配的本地环境配置 | 忽略，按需要恢复 |

现有讲义媒体忽略规则匹配 `ch*/L*`；`ch08/02` 等目录命名不在这条规则的匹配范围内。讲义媒体仍按本地保存原则处理，提交时以实际忽略结果为准。

`workspaces/` 不能整体忽略，现有代码会读取其中的课时数据。Git 仓库不能代替音频、成片和讲义的备份；具体恢复位置由本课记录说明。提交与上传按已有授权执行，只纳入当前任务的文件。

`package.json` 仍保留历史包名 `course-video-pipeline-gemini`，不影响本仓库作为 `course-video-pipeline-codex` 使用。

## 六、课时与历史记录

课时进度、实际路径和审核结论维护在 [docs/lessons/](docs/lessons/) 下。历史记录用于理解当时的制作情况；当前实现查架构说明与代码，当前素材以本地文件和本课记录为准。

| 参考入口 | 用途 |
| --- | --- |
| [第六章 L01 制作与交付总结](docs/lessons/ch06/L01/第六章-L01-制作与交付工作总结V1.0.md)、[第六章 L02 交付说明](docs/lessons/ch06/L02/第六章-L02-交付说明V1.0.md) | 课时制作过程、成果路径和审核记录 |
| [第六章 L01 画面安排](docs/lessons/ch06/L01/第六章-L01-画面安排V0.1.md) | 既有分段画面设计参考 |
| [第七章 L02 复盘与交付总结](docs/lessons/ch07/L02/第七章-L02-复盘与交付总结V1.0.md)、[第七章 L03 整改方案](docs/lessons/ch07/L03/第七章-L03-整改方案V1.0.md) | 历史课时经验与问题处理 |
| [早期架构设计](docs/architecture/architecture-design-v1.0.md)、[DeepSeek 版架构说明](docs/architecture/deepseek版架构说明V0.1.md)、[有限架构调整方案](docs/architecture/多课时并行制作-有限架构调整方案V0.1.md) | 早期实现及阶段调整记录 |
| [音频清理清单](docs/maintenance/audio-cleanup-2026-10-27.json) | 历史音频原件位置、校验值和恢复线索 |

旧课记录和 V0.1 展示规范不列为新课制作必读，当前制作规范使用上方索引中的 V0.2 版本。
