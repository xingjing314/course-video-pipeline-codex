/**
 * 用真实音频重算 L02 镜表（替换配音前的估算版）。
 *
 * 输入：workspaces/<lesson>/audio-timeline.json（逐场景 startMs / durationMs）
 * 输出：src/lessons/ch07/l02-shot-table.ts
 *
 * 与 L01 一样的口径：**音频是唯一真源**，镜长、总帧数都由它派生。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseLessonArg } from "./_lesson-arg.ts";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const { workspace: WS } = parseLessonArg(ROOT);
const FPS = 30;

const timeline = JSON.parse(fs.readFileSync(path.join(WS, "audio-timeline.json"), "utf-8"));
const ir = JSON.parse(fs.readFileSync(path.join(WS, "storyboard-ir.json"), "utf-8"));
const titleById = new Map<string, string>(ir.scenes.map((s: any) => [s.sceneId, s.segmentTitle]));

type Row = { id: string; segment: string; from: number; duration: number; ms: number };

const rows: Row[] = timeline.scenes.map((s: any) => ({
  id: s.sceneId,
  segment: titleById.get(s.sceneId) ?? "",
  from: Math.round((s.startMs / 1000) * FPS),
  duration: Math.max(1, Math.round((s.durationMs / 1000) * FPS)),
  ms: s.durationMs,
}));

// 帧必须首尾相接、无重叠（防止 round 造成的缝隙）
for (let i = 1; i < rows.length; i++) {
  const prevEnd = rows[i - 1].from + rows[i - 1].duration;
  if (rows[i].from !== prevEnd) rows[i].from = prevEnd;
}

const total = rows.reduce((a, r) => Math.max(a, r.from + r.duration), 0);

const ts = [
  "/**",
  " * 自动生成，勿手改。来源：scripts/build-l02-shot-table.ts",
  " *",
  " * 镜长由真实配音派生（audio-timeline.json），不是估算。",
  " * 配音若重录，重跑脚本即可，不要手改数字。",
  " */",
  "export type L02Shot = { id: string; segment: string; from: number; duration: number; ms: number };",
  "",
  "export const L02_SHOTS: L02Shot[] = [",
  ...rows.map(
    (r) => `  { id: "${r.id}", segment: "${r.segment}", from: ${r.from}, duration: ${r.duration}, ms: ${r.ms} },`,
  ),
  "];",
  "",
  "export const L02_TOTAL_FRAMES = L02_SHOTS.reduce((a, s) => Math.max(a, s.from + s.duration), 0);",
  "",
  "/** 当前帧属于哪一镜（1-based 序号供面包屑使用）。 */",
  "export const l02ShotAt = (frame: number): { shot: L02Shot; order: number } => {",
  "  for (let i = 0; i < L02_SHOTS.length; i++) {",
  "    const s = L02_SHOTS[i];",
  "    if (frame < s.from + s.duration) return { shot: s, order: i + 1 };",
  "  }",
  "  const last = L02_SHOTS[L02_SHOTS.length - 1];",
  "  return { shot: last, order: L02_SHOTS.length };",
  "};",
  "",
];

const out = path.join(ROOT, "src/lessons/ch07/l02-shot-table.ts");
fs.writeFileSync(out, ts.join("\n"), "utf-8");
console.log(`生成 ${rows.length} 镜 → ${path.relative(ROOT, out)}`);
console.log(`总帧 ${total}（${(total / FPS / 60).toFixed(2)} 分钟），音频 ${(timeline.totalDurationMs / 1000).toFixed(1)} s`);
console.log(`首镜 ${rows[0].id} 0–${rows[0].duration}，末镜 ${rows[rows.length - 1].id} 起 ${rows[rows.length - 1].from}`);
