/**
 * 从真实配音产物（audio-timeline.json）重新生成 L01 的时间线、字幕与 cue 点。
 *
 * 配音一落地，分镜估算的 507 s 就该作废：镜头起止、字幕、cue 全部改由音频决定。
 * 本脚本产出 `l01-generated.ts`（镜头表 + cue 帧）与 `l01-captions.json`（真实字幕），
 * 均由 `workspaces/ch07-L01-ds/audio-timeline.json` 推导。
 *
 * 用法：
 *   node --experimental-strip-types scripts/build-l01-timeline.ts
 */
import fs from "node:fs";
import path from "node:path";
import { parseLessonArg } from "./_lesson-arg.ts";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const { lessonId: LESSON_ID, workspace: WS } = parseLessonArg(ROOT);
const FPS = 30;

type Token = { sceneId: string; text: string; startMs: number; endMs: number };
type Scene = { sceneId: string; startMs: number; endMs: number; durationMs: number; tokens: Token[] };
type Timeline = {
  totalDurationMs: number;
  scenes: Scene[];
  captions: { index: number; sceneId: string; text: string; startMs: number; endMs: number }[];
};

const timeline: Timeline = JSON.parse(fs.readFileSync(path.join(WS, "audio-timeline.json"), "utf-8"));

const SEGMENTS: Record<string, string> = {
  S01: "开场与全书坐标", S02: "开场与全书坐标", S03: "开场与全书坐标", S04: "开场与全书坐标", S05: "开场与全书坐标",
  S06: "四笔账与三件事", S07: "四笔账与三件事",
  S08: "投资前四阶段与裁剪", S09: "投资前四阶段与裁剪", S10: "投资前四阶段与裁剪", S11: "投资前四阶段与裁剪",
  S12: "投资前四阶段与裁剪", S13: "投资前四阶段与裁剪",
  S14: "真题 1：四阶段排除法", S15: "真题 1：四阶段排除法", S16: "真题 1：四阶段排除法", S17: "真题 1：四阶段排除法",
  S18: "7.1 进场",
  S19: "7.1 身份证 · 谁写给谁", S20: "7.1 身份证 · 什么深度", S21: "7.1 身份证 · 什么作用",
  S22: "真题 2：逐项判卷", S23: "真题 2：逐项判卷", S24: "真题 2：逐项判卷", S25: "真题 2：逐项判卷",
  S26: "四件套：连考三次", S27: "四件套：连考三次", S28: "四件套：连考三次",
  S29: "真题 3：一题带三题", S30: "真题 3：一题带三题",
  S31: "交棒 7.2",
};

const msToFrame = (ms: number) => Math.round((ms / 1000) * FPS);

const shots = timeline.scenes.map((s) => ({
  id: s.sceneId,
  from: msToFrame(s.startMs),
  to: msToFrame(s.endMs),
  segment: SEGMENTS[s.sceneId] ?? "第 7 章 L01",
}));

/* ── 把每个场景的字级 token 拼成可检索的字符串 ── */

const norm = (s: string) => s.replace(/[^\u4e00-\u9fa5A-Za-z0-9]/g, "").toUpperCase();

const sceneStreams = new Map<string, { chars: string[]; starts: number[] }>();
for (const sc of timeline.scenes) {
  const chars: string[] = [];
  const starts: number[] = [];
  for (const t of sc.tokens) {
    for (const ch of norm(t.text)) {
      chars.push(ch);
      starts.push(t.startMs);
    }
  }
  sceneStreams.set(sc.sceneId, { chars, starts });
}

/** 在若干场景的 token 流里找短语，返回绝对毫秒；找不到返回 null。 */
const findPhrase = (sceneIds: string[], phrase: string): number | null => {
  const chars: string[] = [];
  const starts: number[] = [];
  for (const id of sceneIds) {
    const st = sceneStreams.get(id);
    if (!st) continue;
    chars.push(...st.chars);
    starts.push(...st.starts);
  }
  const target = norm(phrase);
  const joined = chars.join("");
  const idx = joined.indexOf(target);
  return idx >= 0 ? starts[idx] : null;
};

const relFrame = (absMs: number, baseFrame: number) => Math.max(0, msToFrame(absMs) - baseFrame);

/* ── cue：A5 四门的节拍 ── */

const stepMs = ["第一步", "第二步", "第三步", "第四步"].map((p) => findPhrase(["S09"], p));
const stepFrames = stepMs.map((ms) => (ms === null ? null : msToFrame(ms)));
const beatFrames =
  stepFrames[0] !== null && stepFrames[3] !== null
    ? Math.round((stepFrames[3] - stepFrames[0]) / 3)
    : 180;

/* ── cue：三道真题 ── */

const q1Base = shots.find((s) => s.id === "S14")!.from;
const q2Base = shots.find((s) => s.id === "S22")!.from;
const q3Base = shots.find((s) => s.id === "S29")!.from;

const pick = (scenes: string[], phrase: string, base: number, fallbackRatio: number, spanScenes: string[]) => {
  const ms = findPhrase(scenes, phrase);
  if (ms === null) {
    const from = shots.find((s) => s.id === spanScenes[0])!.from;
    const to = shots.find((s) => s.id === spanScenes[spanScenes.length - 1])!.to;
    return Math.round((to - from) * fallbackRatio);
  }
  return relFrame(ms, base);
};

const Q1_SPAN = ["S14", "S15", "S16", "S17"];
const Q2_SPAN = ["S22", "S23", "S24", "S25"];
const Q3_SPAN = ["S29", "S30"];

const q1 = {
  think: pick(Q1_SPAN, "给你两秒钟", q1Base, 0.42, Q1_SPAN),
  elim: pick(Q1_SPAN, "干扰项", q1Base, 0.5, Q1_SPAN),
  reveal: pick(Q1_SPAN, "直接选", q1Base, 0.62, Q1_SPAN),
  tip: pick(Q1_SPAN, "这里需要提示", q1Base, 0.78, Q1_SPAN),
};

const q2 = {
  think: pick(Q2_SPAN, "给你两秒钟扫一下", q2Base, 0.24, Q2_SPAN),
  elimA: pick(Q2_SPAN, "A选项说", q2Base, 0.32, Q2_SPAN),
  revealB: pick(Q2_SPAN, "B选项说", q2Base, 0.55, Q2_SPAN),
  elimC: pick(Q2_SPAN, "再看C选项", q2Base, 0.66, Q2_SPAN),
  elimD: pick(Q2_SPAN, "D选项说", q2Base, 0.76, Q2_SPAN),
};

const q3Reveal = pick(Q3_SPAN, "闭着眼睛都能选", q3Base, 0.20, Q3_SPAN);
const q3 = { reveal: q3Reveal };

/* ── cue：A9 口诀卡的五个节拍 ── */

const a9Base = shots.find((s) => s.id === "S27")!.from;
const a9Marks = ["项目的必要性", "项目的市场预测", "预期成果", "必需的条件"].map((p) =>
  findPhrase(["S27"], p),
);
const a9Cuts = [0, ...a9Marks.map((ms) => (ms === null ? null : relFrame(ms, a9Base)))].map((v, i) => {
  if (v !== null) return v as number;
  const span = shots.find((s) => s.id === "S27")!;
  return Math.round(((span.to - span.from) * (i + 1)) / 5);
});

/* ── 输出 ── */

const captionJson = timeline.captions;
const captionsPath = path.join(ROOT, "src/visual/prototypes/l01-captions.json");
fs.writeFileSync(captionsPath, `${JSON.stringify(captionJson, null, 2)}\n`, "utf-8");

const generated = `/**
 * 自动生成，勿手改。来源：workspaces/ch07-L01-ds/audio-timeline.json
 * 由 scripts/build-l01-timeline.ts 生成。
 *
 * 配音落地后，镜头起止与所有 cue 点都以音频为准——分镜里的 507 s 估算作废。
 */

export type Shot = { id: string; from: number; to: number; segment: string };

export const L01_TOTAL_FRAMES = ${msToFrame(timeline.totalDurationMs)};

export const SHOTS: Shot[] = ${JSON.stringify(shots, null, 2)};

export const SEGMENT_TITLES = ${JSON.stringify(
  shots.reduce<Record<string, string>>((acc, s) => {
    acc[s.id] = s.segment;
    return acc;
  }, {}),
  null, 2)};

/** A5 四门点亮的平均间隔（S09 里\"第一步→第四步\"的真实跨度）。 */
export const A5_BEAT_FRAMES = ${beatFrames};

/** 三道真题的 cue（相对各自 span 起点，帧）。 */
export const QUIZ_CUES = ${JSON.stringify({ q1, q2, q3 }, null, 2)};

/** A9 口诀卡在 S27 内的五个节拍（相对 S27 起点，帧）。 */
export const A9_CUTS = ${JSON.stringify(a9Cuts)};
`;

const genPath = path.join(ROOT, "src/visual/prototypes/l01-generated.ts");
fs.writeFileSync(genPath, generated, "utf-8");

console.log(`场景 ${shots.length} 个，总长 ${(timeline.totalDurationMs / 1000).toFixed(1)}s / ${msToFrame(timeline.totalDurationMs)} 帧`);
console.log(`字幕 ${captionJson.length} 条 -> ${path.relative(ROOT, captionsPath)}`);
console.log(`A5 节拍 ${beatFrames} 帧/门；A9 cuts ${a9Cuts.join(", ")}`);
console.log(`真题 cue：Q1 ${JSON.stringify(q1)}`);
console.log(`            Q2 ${JSON.stringify(q2)}`);
console.log(`            Q3 ${JSON.stringify(q3)}`);
