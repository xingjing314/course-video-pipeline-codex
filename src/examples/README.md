# 公共示例

`src/examples/` 是唯一公共示例目录，包含 `handout/`、`quiz/` 和 `tables/`。公共视觉实现继续位于 `src/visual/`，讲义公共处理继续位于 `scripts/handout.py`。

| 示例 | 入口 | 实际状态 |
| --- | --- | --- |
| 讲义公共处理 | [handout/README.md](handout/README.md) | 知识、练习、独立解析三页；已实际运行与技术检查，用户审核通过 |
| 四种公共题卡 | [quiz/README.md](quiz/README.md) | 独立 Studio 四种形式与连续总览，覆盖完整、简短和无解析；四种题卡已通过用户视觉审核 |
| 表格案例 | [tables/README.md](tables/README.md)、[表 6-7](tables/Table67Example.md) | 两个现有案例，保留原代码、数据与效果；已有检查记录，视觉审核状态见各例说明 |

示例调用项目公共实现，自带最小输入与必要素材，运行产物与输入分开；输入维护一份，派生结果由程序生成。新课参考相应示例接入自己的内容，沿用已确认样式，不必先重建示例或旧课。选图、练习与解析组织、配图处理及复用边界统一见[完整讲义示例](handout/README.md)；说明与必要素材在本例内齐全，其他能力按需整理。

## 运行入口

在项目根目录执行：

```bash
# 全项目 Studio：正式课程、标准公共示例与旧原型
npm run studio -- --port=3025 --no-open

# 仅题卡：不加载课程数据
npm run studio -- --entry src/examples/quiz/index.tsx --public-dir=src/examples/quiz/assets --port=3028 --no-open

# 仅表格：不加载课程数据
npm run studio -- --entry src/examples/tables/index.tsx --public-dir=src/examples/tables/assets --port=3036 --no-open

# 讲义：使用具备 Pillow、ReportLab 和所需字体的 Python，输出到新目录
python3 -B src/examples/handout/run.py --output /tmp/handout-example-new
```

讲义不注册到 Studio。题卡与表格分别在本目录的 `quiz/compositions.ts`、`tables/compositions.ts` 声明预览信息，独立入口和 `src/examples/index.tsx` 共用，不导入课程。标准 `QuizCardExam / Dual / Compact / Brief` ID 指向已审核示例，连续预览为 `QuizShowcase`；旧原型使用 `LegacyQuizCardExam / Dual / Compact / Brief`（每项均含完整 `LegacyQuizCard` 前缀）。表格 ID 为 `Table67Example` 与 `L01TableExample`。

迁移保留了讲义 `output/` 里的既有运行产物，以及所有示例输入和参考成果。再次运行请选新输出目录；既有参考 PDF 不自动覆盖。

## 本次目录迁移检查

`npm run lint`、题卡示例 13 项检查、既有题卡回归 23 项及讲义 4 项回归均通过。迁移后的讲义实际输出到新的临时目录，生成三页 PDF 与三个书签，原参考 PDF 和既有产物保留。

三个入口已实际加载：全项目 92 个 Composition、题卡独立入口 5 个、表格独立入口 2 个，无重复 ID；独立入口与总入口中的示例注册参数一致。原有 87 个注册仅四个旧题卡原型更名，其余 ID 及全部时长、帧率、画幅和参数保持一致；独立入口的实际打包依赖不含课程目录、工作区或全课程汇总。迁移涉及的 Markdown 文件链接已核对，未留下指向根目录旧示例的有效调用。

本次检查针对目录、引用与入口加载，未重新渲染整课或复审已确认的视觉效果；无配音题卡示例仍不覆盖真实音画同步验证。本轮不需要 GPU 工作。
