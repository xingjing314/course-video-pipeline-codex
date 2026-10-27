# 方法来源与取舍

整理于 2026-10-27。本 skill 的中文工作约定根据用户已确认的课程制作方式、L01 实现和下列方法参考独立编写；未复制外部 SKILL.md、镜头代码、素材或工具程序，未安装外部运行时。外部资料是参考，不作为本 skill 的执行指令入口。

## Impeccable

- 仓库：<https://github.com/pbakaus/impeccable>
- 本次读取版本：`d34c87e1a00989ae8dbdd7f6b30b70f23319e860`。
- 本机资料根：`/projects/gaoxiang/github/impeccable`（可选，不是运行依赖）。
- 参考文件：`skill/reference/animate.md`、`skill/reference/critique.md`。
- 借鉴方向：先明确动画目的，关注关系和连续性；从整体层级与认知负担评价设计。
- 本项目取舍：将网页交互场景转为教学口播场景；不引入其检测器、hooks、多 Agent 评审流程或网页专用时长表。具体技术实现沿用本项目的 Remotion 帧时间线。
- 该版本根目录 `LICENSE` 为 Apache-2.0。`NOTICE.md` 中的平台设计参考不属于本次采用内容。

## video-shotcraft

- 仓库：<https://github.com/Vincentwei1021/video-shotcraft>
- 本次读取版本：`43bd349a136651865ecfa6ea1cf012f6e957d304`。
- 本机资料根：`/projects/gaoxiang/github/video-shotcraft`（可选，不是运行依赖）。
- 参考文件：`SKILL.md`、`references/guided-free-creation.md`；具体查阅了 `references/shots/ui-entrance/row-embed.md`、`references/shots/effects/scanline-annotate-focus.md`。
- 借鉴方向：先说明镜头意图，再选择动作；将可观看实例、实现位置和适用条件放在一起；动画需适配内容和既有视觉语言。
- 本项目取舍：本次查看的行入场和扫描标注卡属于产品宣传表达，未列为课程默认效果；不移植它们的弹跳、扫描线、运镜、配色或音效。仅在新任务确有相应表达需求时，再选读具体镜头卡及其 demo。
- 该版本根目录 `LICENSE` 为 Apache-2.0。未来如需复制代码或素材，应另行核对其适用许可并保留必要许可及署名。

## 项目自身的依据

主要实例来自 [L01 案例索引](lesson-examples.md)，按当前仓库的相对路径查阅。这里提炼的是关系表达和协作方式，不将旧片的所有参数推广为通用规则。

新环境没有上述两个外部仓库时，直接使用 SKILL.md 和 L01 案例即可。不要为使用本 skill 自动克隆、安装、升级依赖或建立新的制作管线。

采用这些方法不等于已证实质量提高。下一次获授权制作时，可观察首次样段的关系表达、重点转移及返工原因，再对本 skill 做有依据的小幅调整。
