# 讲义公共处理：完整独立示例

使用本地三张图片和一份页面 JSON，生成知识、练习、解析三页讲义，输入不依赖具体课程文件。采用已确认的横向 A4、青色('#147984')页眉、20pt 标题、10pt 正文、页码、书签和笔记区样式。

[`run.py`](run.py) 直接调用公共 [`scripts/handout.py`](../../../scripts/handout.py) 的 `build_handout()`。

## 接手与运行入口

| 文件 | 用途 |
| --- | --- |
| [`data/handout.json`](data/handout.json) | 运行配置：标题、页面内容、本地图片名和裁切参数 |
| [`assets/knowledge.jpg`](assets/knowledge.jpg) | 知识配图 |
| [`assets/exercise.jpg`](assets/exercise.jpg) | 完整中性题面 |
| [`assets/analysis.jpg`](assets/analysis.jpg) | 解析配图，文字依据由 JSON 补充 |
| [`reference/handout-example.pdf`](reference/handout-example.pdf) | 用户审核通过的三页样式参考；保留旧版视频时间和课程页脚，当前输入不再生成这两项 |
| `output/` | PDF、`selection.json`、交付 JPEG 和检查预览；已忽略，不作为输入 |

三张素材均为 1760×860 的已裁切 JPEG 实文件，无软链接。本例 `crop=null`，保留全图。

## 环境与运行

需要 Python 3.10+、Pillow、ReportLab 和中文、符号 TrueType 字体。依赖见 [`requirements.txt`](requirements.txt)，缺少时安装：

```bash
python3 -m pip install -r src/examples/handout/requirements.txt
```

在项目根目录使用具备依赖的 Python 运行，输出到新临时目录：

```bash
python3 -B src/examples/handout/run.py --output "$(mktemp -d /tmp/handout-example.XXXXXX)"
```

本机可将 `python3` 替换为 `/home/xingjing314/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3`，该环境已验证可用。

Linux 默认字体如下；其他环境可用 `--font-chinese /path/to/chinese.ttf --font-symbols /path/to/symbols.ttf` 覆盖。字体缺失或缺字会报错。

```text
/usr/share/fonts/truetype/droid/DroidSansFallbackFull.ttf
/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf
```

省略 `--output` 时写入本例 `output/`。已有文件默认拒绝覆盖，明确重建时才使用 `--overwrite`。输入与输出目录不能相同或互相包含。

## 页面组织与选图

| 页面 | 图文要求 |
| --- | --- |
| 知识页 | 本例用权限对比图说明“可以提出建议”与“不能自行修改”。保留比较双方、关系、限定语和学习笔记区 |
| 练习页 | 题干、来源、题号、全部选项完整；有编号材料时一并保留。选取跟读强调已清除、无答案高亮或排除标记的画面，留出作答与判断依据区 |
| 解析页 | 题面、判断状态与答案依据对应；关系图保留人物、文档、连线和标签。解释仅使用材料支持的内容，另留复习笔记区 |

练习与解析分别成页。负向题须明确写出“本题答案”并解释错误表述，红色错误标记与绿色答案标记不能代替文字说明。长选项应全部完整可读后再截取；简短解析按实际提供的内容呈现。

## 配图与排版方法

- 合格图片直接放入素材目录，由页面 `image` 指定文件名；输入原图保留，交付图和预览由程序生成。
- 从视频补图时，按本课实际时间轴选帧，先保存完整原帧，再裁切。需要 GPU 截帧时，由 Agent 提供完整命令交用户执行。本例素材齐全。
- `crop=[宽, 高, 左, 上]`，单位为像素；`null` 或省略表示全图。裁切按实际内容确定，已裁切图片不要再次套用原帧裁切值。
- 图片等比缩放，文字放不下时拆页或精简内容。PDF 使用交付 JPEG，低清预览仅供检查。
- JPEG 默认采用 4:4:4 色度采样，输入像素默认不缩小；质量与尺寸参数见下表。验收看文字清晰度、边界和文件体积。
- `chapter` 在对应页面建立一级书签，页码自动生成。

## 输入与公共接口

```python
from handout import build_handout  # 将项目 scripts 目录加入模块搜索路径

build_handout(
    pages=config['pages'], lesson=config['lesson'],
    asset_dir=assets, output_dir=output,
    pdf_name='配套讲义V1.0.pdf',
    style=config.get('style'), fonts=config.get('fonts'),
    image_options=config.get('image_options'),
)
```

| 输入 | 必填与默认行为 |
| --- | --- |
| `lesson` | 必填 `title`；可选 `header`、`author`、`version`、`footer`、`fps` |
| `pages` | 每页必填 `id`、`title`、`kind`、`image`；`id` 唯一，`image` 相对 `asset_dir` 且须位于其中 |
| 页面可选项 | `crop`、`chapter`、`note`、`explanation`、`time`；没有 `time` 时可由 `frame / lesson.fps` 生成，二者都无则不显示视频时间 |
| `note` / `explanation` | 普通文字，支持显式换行；默认笔记提示为“学习笔记” |
| `style` | 可覆盖 `margin`、`title_size`、`text_size`、`leading`、`note_lines` 及 `accent/ink/muted/rule/footer` 颜色；完整默认值见公共模块 `Style` |
| `fonts` | 可覆盖 `chinese`、`symbols` TTF 路径；ASCII 使用 Helvetica |
| `image_options` | 默认 `quality=95`、`subsampling=0`；`max_long_edge` 可限制交付图尺寸，`preview_long_edge=1100`、`preview_quality=85` 控制检查预览 |
| `overwrite` | 默认 `False`，启用后允许重建已有输出 |

`selection.json` 自动记录页面内容、实际裁切、输出尺寸和输入哈希；调整输入后重新生成，不手工修改派生记录。

## 新课接入与复用边界

1. 在本课维护页面 JSON 和素材目录，按本例填写内容、图片名及裁切参数，页数按教学需要确定。
2. 需要视频回看时间时，填写核对后的 `frame` 与 `lesson.fps`，或页面 `time`，并记录源视频版本与选帧依据。组内帧到整课帧的偏移由调用方计算；纯图片讲义可省略时间字段。
3. 使用公共 CLI 或 Python 接口生成新版本输出：

```bash
python3 scripts/handout.py \
  --data /path/to/new-lesson/handout.json \
  --assets /path/to/new-lesson/assets \
  --output /path/to/new-lesson/handout-v1 \
  --pdf-name 配套讲义V1.0.pdf
```

公共入口负责图片处理、字体换行和 PDF 排版；选帧、题目正确性、解释依据和教学画面由调用方负责。流程、卡片、口诀或矩阵等含固定教学内容的设计案例，须按实际公共接口改编，不能只换标题。题卡与表格示例见 [quiz](../quiz/README.md)、[tables](../tables/README.md)。

课程制作与验收规则见[教学讲义制作方案](../../../docs/architecture/教学讲义制作方案V0.1.md)。

## 检查与参考成果

生成后检查内容顺序、图片清晰度与边界、中性题面、解析依据、笔记区、页码和书签；正式课时还需核对版本并由用户阅读验收。

现有 4 项回归通过，覆盖裁切与原图保留、独立预览、混合字体换行、失败不发布产物和拒绝覆盖。隔离运行禁止读取原项目文件，仍能生成三页 PDF、三个书签及 `01 / 03` 至 `03 / 03` 的页码。

回归检查另需 `pypdf`：

```bash
python3 -B -m unittest discover -s scripts/tests -p test_handout.py -v
```

参考 PDF 从检查后的实际输出选取，更新时保留已审核版本。
