/**
 * 给 L03 生成 StoryboardIR（音频阶段输入）。
 *
 * 与 L01/L02 同一套做法：口播稿行号 → 镜号，逐行分配、重复或遗漏直接报错。
 *
 * 本课特有：**7 处 3000ms 静音**（倒计时）。
 * 停顿点统一设在"该镜最后一个 clause 之后"——`tts_worker.py` 会在拼接时插入静音，
 * 因此画面上的倒计时环与音频里的空白严格对齐，不需要另建"无声场景"。
 *
 * 用法：node --experimental-strip-types scripts/build-l03-ir.ts --lesson=ch07-L03-ds
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { parseLessonArg } from "./_lesson-arg.ts";
import { StoryboardIRSchema } from "../contracts/storyboard-ir.schema.ts";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const { lessonId: LESSON_ID, workspace: WORKSPACE } = parseLessonArg(ROOT);

const positional = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const SCRIPT =
  positional[0] ??
  "/projects/gaoxiang/information-systems-project-management-4e-course-Gemini/docs/第7章/第七章-L03完整口播稿V0.1.md";

const sha256 = (s: string) => crypto.createHash("sha256").update(s, "utf-8").digest("hex");

/** 镜号 → 口播行号。 */
const SHOT_LINES: Record<string, number[]> = {
  S01: [1], S02: [3, 4, 5, 6], S03: [8, 9, 10, 11], S04: [13, 14], S05: [16],
  S06: [18, 20], S08: [21, 22, 23, 24], S09: [26], S11: [27],
  S12: [29], S13: [31, 32], S14: [34], S15: [35], S16: [37, 38, 39, 40, 41],
  S17: [42], S18: [44, 45, 46], S19: [47],
  S20: [49], S21: [51, 52, 53, 54], S22: [56, 57], S23: [58, 59],
  S24: [61], S25: [63, 64], S27: [], S28: [65], S30: [], S31: [67, 68], S33: [],
  S34: [69], S36: [],
  S37: [71, 73, 74], S38: [76, 77, 78, 79, 80, 81], S39: [83],
  S40: [85], S41: [87], S43: [88, 89],
  S44a: [91], S44b: [93], S44c: [94], S44d: [], S44e: [95],
  S45: [97, 98], S46: [],
};

/** 镜号 → 渲染段键。 */
const SHOT_SPAN: Record<string, string> = {
  S01: "S01", S02: "S02", S03: "S03", S04: "S04", S05: "S05",
  S06: "S06-S11", S08: "S06-S11", S09: "S06-S11", S11: "S06-S11",
  S12: "S12", S13: "S13", S14: "S14", S15: "S15", S16: "S16", S17: "S17",
  S18: "S18", S19: "S19", S20: "S20", S21: "S21", S22: "S22", S23: "S23",
  S24: "S24", S25: "S25-S27", S27: "S25-S27", S28: "S28-S30", S30: "S28-S30",
  S31: "S31-S33", S33: "S31-S33", S34: "S34-S36", S36: "S34-S36",
  S37: "S37", S38: "S38", S39: "S39", S40: "S40-S43", S41: "S40-S43", S43: "S40-S43",
  S44a: "S44a", S44b: "S44b", S44c: "S44c", S44d: "S44d", S44e: "S44e",
  S45: "S45", S46: "S46",
};

const SEGMENT_TITLE: Record<string, string> = {
  S01: "交棒与初可研", S02: "交棒与初可研", S03: "初可研报告与辅助研究", S04: "初可研报告与辅助研究",
  S05: "初可研报告与辅助研究", S06: "真题：初可研", S08: "真题：初可研", S09: "真题：初可研", S11: "真题：初可研",
  S12: "详细可行性研究", S13: "详细可行性研究", S14: "详细可行性研究", S15: "详细可行性研究",
  S16: "详细可行性研究", S17: "详细可行性研究", S18: "详细可行性研究", S19: "详细可行性研究",
  S20: "项目评估", S21: "项目评估", S22: "项目评估", S23: "项目评估",
  S24: "真题：项目评估", S25: "真题：项目评估", S27: "真题：项目评估", S28: "真题：项目评估",
  S30: "真题：项目评估", S31: "真题：项目评估", S33: "真题：项目评估", S34: "真题：项目评估", S36: "真题：项目评估",
  S37: "评估程序与内容", S38: "评估程序与内容", S39: "评估程序与内容",
  S40: "收官真题", S41: "收官真题", S43: "收官真题",
  S44a: "章末总图与交棒", S44b: "章末总图与交棒", S44c: "章末总图与交棒",
  S44d: "章末总图与交棒", S44e: "章末总图与交棒",
  S45: "章末总图与交棒", S46: "章末总图与交棒",
};

/** 需要 3 秒倒计时的镜（题干/选项读完、解析之前）。 */
const COUNTDOWN_SHOTS = new Set(["S06", "S09", "S25", "S28", "S31", "S34", "S41"]);

/** 被拆分的口播行：在 marker 之后切开，前半归 questionShot，后半归 answerShot。 */
const SPLITS: { line: number; marker: string; head: string; tail: string }[] = [
  { line: 64, marker: "论证？", head: "S25", tail: "S27" },
  { line: 65, marker: "横线？", head: "S28", tail: "S30" },
  { line: 68, marker: "选哪个？", head: "S31", tail: "S33" },
  { line: 69, marker: "D 又是项目章程！", head: "S34", tail: "S36" },
  // 章末总图：L94 前半讲初/详可研，后半讲五顶帽子辨析
  { line: 94, marker: "算增量净效益）。", head: "S44c", tail: "S44d" },
  // 收尾：L98 前半讲“三份文件化作依据文件”（配 S45 三卡），后半讲章程与下一章（S46 收尾卡）
  { line: 98, marker: "就会化作项目建设的依据文件。", head: "S45", tail: "S46" },
];

const raw = fs.readFileSync(SCRIPT, "utf-8");
const lines = raw.split("\n");
const contentLines = lines.map((l, i) => ({ no: i + 1, text: l.trim() })).filter((l) => l.text.length > 0);

const assigned = new Map<number, string>();
for (const [shot, nos] of Object.entries(SHOT_LINES)) {
  for (const n of nos) {
    if (assigned.has(n)) throw new Error(`第 ${n} 行被重复分配：${assigned.get(n)} 与 ${shot}`);
    assigned.set(n, shot);
  }
}
const unassigned = contentLines.filter((l) => !assigned.has(l.no));
if (unassigned.length > 0) {
  throw new Error(`有 ${unassigned.length} 行未分配镜头：${unassigned.map((l) => `L${l.no}`).join(", ")}`);
}

const byShot = new Map<string, string[]>();
for (const shot of Object.keys(SHOT_LINES)) byShot.set(shot, []);
for (const l of contentLines) byShot.get(assigned.get(l.no)!)!.push(l.text);

// 拆分行：确保切分后拼回与原文一致
for (const sp of SPLITS) {
  const full = lines[sp.line - 1].trim();
  const at = full.indexOf(sp.marker);
  if (at < 0) throw new Error(`L${sp.line} 找不到切分标记「${sp.marker}」`);
  const cut = at + sp.marker.length;
  const head = full.slice(0, cut);
  const tail = full.slice(cut);
  if (head + tail !== full) throw new Error(`L${sp.line} 切分丢字`);
  // 该行原先分配给 head 镜，现在把 tail 追加到 tail 镜的最前面
  byShot.set(sp.tail, [tail, ...byShot.get(sp.tail)!]);
  byShot.set(sp.head, byShot.get(sp.head)!.map((t) => (t === full ? head : t)));
}

const toClauses = (text: string): string[] => {
  const out: string[] = [];
  let buf = "";
  for (let i = 0; i < text.length; i += 1) {
    buf += text[i];
    if (/[，。、；：？！…]/.test(text[i])) {
      while (i + 1 < text.length && /[”’）》」』】]/.test(text[i + 1])) buf += text[++i];
      out.push(buf.trim());
      buf = "";
    }
  }
  if (buf.trim()) out.push(buf.trim());
  const joined = out.join("");
  if (joined !== text) throw new Error(`clause 切分丢字：${text.slice(0, 24)}…`);
  return out;
};

const charsOf = (s: string) => s.replace(/[\s，。、：；？！“”‘’（）()《》—…·,.:;?!%\-]/g, "").length;

const scenes = Object.keys(SHOT_LINES).map((shot, idx) => {
  const narration = byShot.get(shot)!.join("");
  if (!narration) throw new Error(`${shot} 没有分到口播`);
  const clauses = toClauses(narration);

  const pauseDirectives = COUNTDOWN_SHOTS.has(shot)
    ? [{ afterClauseIndex: clauses.length - 1, durationMs: 3000, reason: "倒计时：读完题干预留 3 秒思考" }]
    : [];

  return {
    sceneId: shot,
    parentSceneId: shot,
    segmentTitle: SEGMENT_TITLE[shot],
    sceneTitle: `${shot} · ${SEGMENT_TITLE[shot]}`,
    order: idx + 1,
    estimatedSeconds: Number((charsOf(narration) / 3.6 + pauseDirectives.length * 3).toFixed(2)),
    narration,
    narrationSha256: sha256(narration),
    clauses,
    pauseDirectives,
    rawVisualInstruction: SEGMENT_TITLE[shot],
    pedagogicalIntent: SEGMENT_TITLE[shot],
    cueSpecs: [],
    visualType: "chapter-local" as const,
    payload: { key: "l03-span", data: { span: SHOT_SPAN[shot] } },
  };
});

const totalSeconds = scenes.reduce((a, s) => a + s.estimatedSeconds, 0);
const pauseCount = scenes.reduce((a, s) => a + s.pauseDirectives.length, 0);

const ir = {
  schemaVersion: "1.0.0" as const,
  lessonId: LESSON_ID,
  lessonTitle: "第 7 章 项目立项管理 · L03（deepseek 版）",
  sourceMarkdownPath: SCRIPT,
  sourceMarkdownSha256: sha256(raw),
  companionScriptVerified: true,
  overview: {
    chapterScope: "第 7 章 7.2.2 初步可行性研究 — 7.3 项目评估与决策",
    estimatedDurationText: `${Math.floor(totalSeconds / 60)} 分 ${Math.round(totalSeconds % 60)} 秒`,
    cognitiveGoals: [
      "掌握初可研的定位、三件事与报告的 6 项内容",
      "分清辅助研究与初步可研的边界",
      "掌握详可研的依据三原则、有无比较法、精度阶梯",
      "掌握评估铁三角、5 项依据与「章程坑」",
    ],
    coreVisualAssets: ["A5 四关轨道", "A7 真题卡（含倒计时）", "A25 精度阶梯", "A27 铁三角", "A32 章末总图"],
    examAnchors: ["24上1批T17", "24上2批T19", "24上1批T18", "23下3批T23", "25上1批T33", "23年5月T22", "23下1批T46", "23下4批T23", "26上1批T27"],
  },
  scenes,
  compiledAt: new Date().toISOString(),
};

const parsed = StoryboardIRSchema.parse(ir);
fs.mkdirSync(WORKSPACE, { recursive: true });
const outPath = path.join(WORKSPACE, "storyboard-ir.json");
fs.writeFileSync(outPath, JSON.stringify(parsed, null, 2) + "\n", "utf-8");

console.log(`生成 ${parsed.scenes.length} 个场景 → ${path.relative(ROOT, outPath)}`);
console.log(`估算总时长 ${totalSeconds.toFixed(1)} s（${Math.floor(totalSeconds / 60)}:${String(Math.round(totalSeconds % 60)).padStart(2, "0")}）`);
console.log(`口播行 ${contentLines.length}，全部已分配；倒计时 ${pauseCount} 处（${[...COUNTDOWN_SHOTS].join(", ")}）`);
