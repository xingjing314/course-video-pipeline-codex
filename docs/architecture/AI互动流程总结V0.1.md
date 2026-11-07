# AI互动流程总结V0.1

更新日期：2026-11-07。适用于当前项目的各课时制作。

目标是让学生随着口播看清对象、关系和变化。制作顺序：分镜方案 → 分组关键帧 → 逐组 Studio 审核 → 集中渲染 → 教学讲义。

## 一、接手与按需阅读

从本课记录接续进度，确定本轮范围与停止点，沿用已确认内容。按阶段读取：

| 阶段 | 所需资料 |
| --- | --- |
| 分镜与分组 | 本课 `input/` 的口播稿、必读清单及相关教材和题目；[教学画面编排 skill](../../.agents/skills/course-visual-storytelling/SKILL.md) |
| 组内制作 | 已确认方案；[画面规范](视频画面规范V0.2.md)；涉及配音、字幕或题卡时，分别查[音频规范](音频规范V0.2.md)、[字幕规范](字幕规范V0.2.md)、[题卡规范](题卡规范V0.1.md) |
| 组装与导出 | [公共能力索引第 9.2 节](公共能力索引V0.1.md#92-双版本交付复用干净视频)、音频规范中的交付要求 |
| 讲义 | [教学讲义制作方案](教学讲义制作方案V0.1.md) |

口播稿决定讲解顺序和配音正文，教材与题目提供解释和答案依据。组件与命令查[公共能力索引](公共能力索引V0.1.md)，需要理解工程结构时查[架构说明](architecture-design-v2.0.md)，无需沿链接逐篇通读。

课程制作复用公共框架，修改限于本课内容、专用实现和必要入口登记；公共能力不足时说明具体缺口，由用户另行安排框架调整。

## 二、五个制作步骤

下列命令按阶段使用，`<...>` 由 Agent 替换为本课真实标识、路径、端口和 Composition。均在当前项目根目录执行：

```bash
cd "<本项目根目录>"
```

### 1. 建立整课分镜方案

按教学意图划分 `S01、S02……`，每镜写明口播范围、教学目的、材料依据、画面关系与关键变化。画面承担关系、区别或过程的解释。

方案阶段用口播短语定位，配音完成后再确定精确时间。方案确认后进入分组制作。

### 2. 分镜分组，生成每组关键帧

按讲解完整性和画面连续性分组，列出组别、镜号范围、主题与关键状态。先确定全课分组，再逐组推进关键帧和视频。

关键帧尽量取自实际组件，覆盖必要教学状态；同时设计状态之间的变化与衔接。以组为审核单位，关键帧随本组迭代。

### 3. 分组制作，逐组在 Studio 审核

优先通过参数覆盖、组合或插槽复用公共能力；课时专用逻辑留在本课目录。

每组完成：

1. 实际配音、对齐、字幕和教学停顿。
2. 依据实际音频安排组件入场、强调、退场和镜间衔接，让画面解释跟随讲解展开。
3. 检查关键状态与连续播放，提供 Studio 链接、Composition 和分镜范围供用户审核。

**用户预览通过后才进入下一组。** 首组确认的风格与规则后续沿用；配音与对齐在组内完成。

真题：题干读完立即进入 **3 秒真实静音与倒计时**，不等待选项读完；全题可见、题面中性、口播字幕为空。题目长短不改变时长，完整时序按音频规范第五节执行。

Agent 准备本组工作目录中的 `storyboard-ir.json` 后，用户执行配音与对齐；换组只需更换工作目录：

```bash
CUDA_VISIBLE_DEVICES=0 node --experimental-strip-types \
  scripts/run-group-audio.ts \
  --workspace="<本组工作目录>" \
  --mode=cuda
```

产物为该目录内的 WAV、SRT、`audio-timeline.json` 及对齐数据。Agent 据此更新本组预览；若本课已有 `.mts` 预览准备入口，调用形式为：

```bash
node --experimental-strip-types "<本课分组预览准备脚本.mts>"
```

Agent 用本课入口启动 Studio，在浏览器选择本组 Composition：

```bash
npm run studio -- --entry="<本课入口>" --port="<预览端口>" --no-open
```

不带 `--entry` 的 `npm run studio` 打开公共示例，用于查看公共能力；本课预览使用本课自己的入口。

### 4. 整课组装与集中渲染

全部组通过后，复用确认版本组装整课。画面、音频和字幕共用组装偏移，核对组间衔接与思考停顿。

双版本采用 **干净视频渲染一次 → 公共 `compose-lesson.mjs` 合成有声字幕版**。干净版无音轨、无口播字幕，保留教学文字、题面、解析和倒计时；已有同版干净视频直接复用。

入口与参数查公共能力索引第九节。已自动编排的入口（如编译课的 `npm run render`）无需再次合成；仅生成干净视频的入口再显式调用公共合成。

Agent 使用本课组装入口生成连续 WAV、整课字幕和组装数据；下面以 `.mts` 入口为例，路径按实际实现填写：

```bash
node --experimental-strip-types "<本课整课组装脚本.mts>"
```

采用手动渲染与合成入口时，用户依次执行下面两段命令。所选干净版 Composition 须已关闭口播字幕，`--muted` 只关闭音轨；已有同版干净视频则直接进入合成。

```bash
set -o pipefail
mkdir -p "deliverables/<lessonId>" "out/<lessonId>"

npx --no-install remotion render "<入口>" "<干净版 Composition>" \
  "deliverables/<lessonId>/silent-clean.mp4" \
  --codec=h264 --hardware-acceleration=required \
  --video-bitrate=8M --concurrency=4 \
  --image-format=jpeg --jpeg-quality=95 \
  --muted --overwrite=false --gl=angle \
  --browser-executable=/opt/google/chrome/chrome \
  2>&1 | tee "out/<lessonId>/render-clean.log"
```

合成使用同版、已处理音量的整课 WAV 和整课字幕 JSON，保留干净版：

```bash
set -o pipefail
mkdir -p "out/<lessonId>"

node scripts/compose-lesson.mjs \
  --lesson="<lessonId>" \
  --video="deliverables/<lessonId>/silent-clean.mp4" \
  --audio="<本课整轨WAV路径>" \
  --captions="<本课整课字幕JSON路径>" \
  --output="deliverables/<lessonId>/voiced-captioned.mp4" \
  --wav-output="deliverables/<lessonId>/full.wav" \
  --srt-output="deliverables/<lessonId>/subtitles.srt" \
  --info-output="deliverables/<lessonId>/media-info.json" \
  2>&1 | tee "out/<lessonId>/compose.log"
```

交付同版、同时间轴的有声字幕 MP4、干净 MP4、完整 WAV、独立 SRT 和媒体说明 JSON；两版视频画面帧数一致。音频与字幕按对应规范核验，同版有效检查结果直接沿用。

### 5. 生成教学讲义

知识页选解释完整的稳定画面；练习页保留完整中性题面，答案与依据另设解析页。已有合格图片直接复用，仅补截缺失画面。

新课参考 [src/examples/handout/](../../src/examples/handout/README.md)，用本课页面数据和配图调用 [scripts/handout.py](../../scripts/handout.py)，生成 PDF、配图与 `selection.json`；已有课时流程可沿用。版式、检查与验收要求见教学讲义制作方案。

配图齐全后由 Agent 执行，`python3` 使用本机已配置讲义依赖的解释器：

```bash
python3 -B scripts/handout.py \
  --data="<本课讲义页面JSON路径>" \
  --assets="<本课讲义原始配图目录>" \
  --output="docs/lessons/<章节>/<课时>/handout/<版本>"
```

## 三、GPU 分工与命令

Agent 准备代码、数据和命令；TTS、强制对齐、视频渲染和截帧由用户在本机 GPU 执行，优先使用 RTX 5060 Ti 16GB，不自行改用 CPU 执行耗时任务。

提供当前阶段可直接复制的命令，包含工作目录、环境、输入输出路径与参数，注明预期产物和需反馈的日志。

## 四、目录与进度记录

| 内容 | 存放位置 |
| --- | --- |
| 用户输入 | `docs/lessons/<章节>/<课时>/input/` |
| 分镜、分组与制作记录 | `docs/lessons/<章节>/<课时>/` |
| 课时专用组件与预览入口 | 沿用本课在 `src/lessons/` 下的组织方式 |
| 配音、对齐、字幕与组装数据 | `workspaces/<工作区标识>/` |
| 播放音频 | `public/audio/<工作区标识>/` |
| 关键帧、短样与临时输出 | `out/<lessonId>/`，按组或用途区分 |
| 视频、WAV、SRT 与媒体交付 JSON | `deliverables/<lessonId>/` |
| 教学讲义及配图、选帧记录 | `docs/lessons/<章节>/<课时>/handout/` |

沿用本课实际目录与标识，保留已确认成果，重导使用新版本名称。进度写入现有课时记录，注明分组范围、预览入口、用户结论和待办。

视频与讲义分别由用户验收，技术检查结果与用户审核结论分开记录。
