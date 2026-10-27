/**
 * 给 deepseek 版 L01 生成 StoryboardIR（音频阶段的输入）。
 *
 * 为什么需要它：`npm run compile` 的入口是《合一稿》Markdown 表格，而 deepseek 版目前只有
 * 口播稿 + 分镜方案。本脚本用「口播稿自然段 → 镜号」的既定映射（分镜第七节覆盖表）
 * 直接拼出 IR，绕开第 3 列的散文抽取。
 *
 * 视觉字段目前是**占位**：S02/S05/S06/S07 用已经接好的四种卡，其余镜号统一挂 title-card。
 * 音频阶段只读 sceneId / clauses / pauseDirectives / narration / narrationSha256，
 * 视觉占位不影响配音；等状态机类资产接进 SceneRouter 后再替换。
 *
 * 用法：
 *   node --experimental-strip-types scripts/build-l01-ir.ts [口播稿路径]
 */
import fs from "node:fs";
import path from "node:path";
import { parseLessonArg } from "./_lesson-arg.ts";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { SHOTS, PARAGRAPH_SHOTS, L01_FPS } from "../src/visual/prototypes/l01-timeline.ts";
import { StoryboardIRSchema } from "../contracts/storyboard-ir.schema.ts";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");

const DEFAULT_SCRIPT =
  "/projects/gaoxiang/information-systems-course-Gemini-placeholder.md";
const SCRIPT =
  process.argv[2] ??
  "/projects/gaoxiang/information-systems-project-management-4e-course-Gemini/docs/deepseek版/第七章-L01完整口播稿V0.1.md";

const { lessonId: LESSON_ID, workspace: WORKSPACE } = parseLessonArg(ROOT);

const sha256 = (s: string) => crypto.createHash("sha256").update(s, "utf-8").digest("hex");

const raw = fs.readFileSync(SCRIPT, "utf-8");
const paragraphs = raw
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l.length > 0);

if (paragraphs.length !== PARAGRAPH_SHOTS.length) {
  throw new Error(`自然段数 ${paragraphs.length} ≠ 映射表 ${PARAGRAPH_SHOTS.length}`);
}

/** 按镜头聚合口播段落（保持原顺序）。 */
const byShot = new Map<string, string[]>();
paragraphs.forEach((p, i) => {
  const id = PARAGRAPH_SHOTS[i];
  byShot.set(id, [...(byShot.get(id) ?? []), p]);
});

/** 切成 clause（保留句末标点），保证拼回去与原文一致。 */
const toClauses = (text: string): string[] => {
  const out = text.split(/(?<=[。！？；])/).filter((s) => s.length > 0);
  if (out.join("") !== text) throw new Error(`clause 切分丢字：${text.slice(0, 30)}…`);
  return out;
};

/** 需要显式留白的句子（真题思考）→ 2 秒停顿。 */
const PAUSE_AFTER = /看一眼|扫一下四个选项/;

/* 视觉占位：只有这四镜挂了真实的卡，其余用 title-card */
const VISUAL_BY_SHOT: Record<string, { visualType: string; payload: unknown }> = {
  S02: {
    visualType: "exam-stats",
    payload: {
      title: "第 7 章 项目立项管理",
      subtitle: "2023—2026 · 11 套卷",
      kicker: "考情速览",
      stats: [
        { value: "22", unit: "题", label: "10 套卷命中（共 11 套）" },
        { value: "≈2", unit: "分", label: "本章平均分值" },
        { value: "≈2.68", unit: "%", label: "全卷占比", emphasis: true },
        { value: "2 / 1", unit: "题", label: "2026 两个批次" },
      ],
      tags: [
        { text: "纯记忆送分题", tone: "gold", solid: true },
        { text: "图谱速记 · 不念书", tone: "cyan" },
      ],
    },
  },
  S05: {
    visualType: "chapter-timeline",
    payload: {
      title: "项目是怎么来的：建之前，还是建之后",
      before: { kicker: "建项目之前", title: "第 7 章 项目立项管理", note: "论证价值 + 走完审批" },
      after: {
        kicker: "建项目之后",
        title: "第 6、8—19 章：十大知识领域 · 绩效域 · 配置变更",
        note: "项目经理进场以后，怎么把项目建好、管好",
      },
      questions: ["项目建设是否有价值？", "为什么要掏几百万、几千万？"],
      conclusion: "立项所必需的 论证文档 与 审批过程",
      axisLabel: "时间",
    },
  },
  S06: {
    visualType: "four-accounts",
    payload: {
      title: "立项之前，先把这四笔账算清楚",
      subtitle: "教材 7.0 导言",
      items: [
        { name: "技术", line: "适不适用 · 先不先进", tone: "cyan" },
        { name: "经济", line: "合不合理 · 有没有效益", tone: "gold" },
        { name: "实施", line: "有没有可能 · 风险大不大", tone: "blue" },
        { name: "社会价值", line: "有没有效果 · 能不能持续", tone: "green" },
      ],
      stamp: "算账",
    },
  },
  S07: {
    visualType: "three-steps",
    payload: {
      title: "立项管理就三件事",
      subtitle: "后面每一页都挂在这条线上",
      steps: [
        { code: "7.1", verb: "提申请", full: "项目建议与立项申请", output: "《项目建议书》", tone: "cyan" },
        { code: "7.2", verb: "做论证", full: "项目可行性研究", output: "《可行性研究报告》", tone: "blue" },
        { code: "7.3", verb: "拍板定案", full: "项目评估与决策", output: "《项目评估报告》", tone: "gold" },
      ],
      footnote: "提申请 → 做论证 → 拍板定案：顺序不能反，每一步都有对应的一份文件",
    },
  },
};

/* 状态机资产：按镜头给 stage（A9 在单镜内用 cuts 推进） */
const STATE_VISUAL: Record<string, { visualType: string; payload: unknown }> = {
  S08: { visualType: "gate-track", payload: { stage: 0 } },
  S09: { visualType: "gate-track", payload: { stage: 1, beatFrames: 180 } },
  S10: { visualType: "gate-track", payload: { stage: 2 } },
  S11: { visualType: "gate-track", payload: { stage: 2 } },
  S12: { visualType: "gate-track", payload: { stage: 3 } },
  S13: { visualType: "gate-track", payload: { stage: 4 } },
  S18: { visualType: "gate-track", payload: { stage: 5 } },
  S31: { visualType: "gate-track", payload: { stage: 6 } },
  S19: { visualType: "id-card", payload: { stage: 0 } },
  S20: { visualType: "id-card", payload: { stage: 1 } },
  S21: { visualType: "id-card", payload: { stage: 2 } },
  S27: { visualType: "mnemonic-card", payload: { stage: 0, cuts: [120, 300, 540, 780] } },
};

const scenes = SHOTS.map((shot, idx) => {
  const paras = byShot.get(shot.id) ?? [];
  const narration = paras.join("");
  if (!narration) throw new Error(`${shot.id} 没有口播段`);

  const clauses = toClauses(narration);
  const pauseDirectives = clauses
    .map((c, i) => (PAUSE_AFTER.test(c) ? { afterClauseIndex: i, durationMs: 2000, reason: "真题思考留白" } : null))
    .filter((x): x is { afterClauseIndex: number; durationMs: number; reason: string } => x !== null);

  const visual = VISUAL_BY_SHOT[shot.id] ??
    STATE_VISUAL[shot.id] ?? {
      visualType: "title-card",
      payload: { title: shot.segment, subtitle: `占位：${shot.id}`, eyebrow: "待接入状态机资产" },
    };

  return {
    sceneId: shot.id,
    parentSceneId: shot.id,
    segmentTitle: shot.segment,
    sceneTitle: `${shot.id} · ${shot.segment}`,
    order: idx + 1,
    estimatedSeconds: Number(((shot.to - shot.from) / L01_FPS).toFixed(2)),
    narration,
    narrationSha256: sha256(narration),
    clauses,
    pauseDirectives,
    rawVisualInstruction: shot.segment,
    pedagogicalIntent: shot.segment,
    cueSpecs: [],
    ...visual,
  };
});

const ir = {
  schemaVersion: "1.0.0" as const,
  lessonId: LESSON_ID,
  lessonTitle: "第 7 章 项目立项管理 · L01（deepseek 版）",
  sourceMarkdownPath: SCRIPT,
  sourceMarkdownSha256: sha256(raw),
  companionScriptVerified: true,
  overview: {
    chapterScope: "第 7 章 7.0 导言 — 7.1 项目建议与立项申请",
    estimatedDurationText: "8 分 27 秒",
    cognitiveGoals: [
      "记住投资前时期四个阶段与三条裁剪规则",
      "掌握《项目建议书》的三条身份信息与四项核心内容",
    ],
    coreVisualAssets: ["A5 四关轨道", "A7 真题卡", "A8 身份证卡", "A9 口诀卡"],
    examAnchors: ["23下3批T21", "26上1批T42", "24上2批T18", "23下1批T27", "23下4批T21"],
  },
  scenes,
  compiledAt: new Date().toISOString(),
};

const parsed = StoryboardIRSchema.parse(ir);
fs.mkdirSync(WORKSPACE, { recursive: true });
const outPath = path.join(WORKSPACE, "storyboard-ir.json");
fs.writeFileSync(outPath, `${JSON.stringify(parsed, null, 2)}\n`, "utf-8");

const total = parsed.scenes.reduce((a, s) => a + s.estimatedSeconds, 0);
console.log(`生成 ${parsed.scenes.length} 个场景 -> ${path.relative(ROOT, outPath)}`);
console.log(`估算总时长 ${total.toFixed(1)} s（占位视觉：${parsed.scenes.filter((s) => s.visualType === "title-card").length} 镜）`);
console.log(`显式停顿：${parsed.scenes.reduce((a, s) => a + s.pauseDirectives.length, 0)} 处`);
