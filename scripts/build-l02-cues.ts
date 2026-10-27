/**
 * 从真实配音的 token 流里定位 L02 的判卷 cue。
 *
 * 之前 cue 的 localFrame 是手估的（如 "S37 起 +15 帧"），结果旁白还在念选项、
 * 画面已经把答案揭开了。这里改成：给一句**原文短语**，在 token 流里找到它的起始时间，
 * 再换算成相对段起点的帧号。
 *
 * 用法：node --experimental-strip-types scripts/build-l02-cues.ts --lesson=ch07-L02-ds
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseLessonArg } from "./_lesson-arg.ts";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const { workspace: WS } = parseLessonArg(ROOT);
const FPS = 30;

const ir = JSON.parse(fs.readFileSync(path.join(WS, "storyboard-ir.json"), "utf-8"));
const tl = JSON.parse(fs.readFileSync(path.join(WS, "audio-timeline.json"), "utf-8"));

const sceneById = new Map(ir.scenes.map((s: any) => [s.sceneId, s]));
const timelineById = new Map(tl.scenes.map((s: any) => [s.sceneId, s]));

/** 归一化：去掉标点与空白，只留中英文数字。 */
const norm = (s: string) => s.replace(/[^\u4e00-\u9fa5A-Za-z0-9]/g, "").toUpperCase();

type Spec = { span: string; scene: string; action: string; target?: string; phrase: string };

/** 段起点（绝对帧）＝该段首镜的起点。 */
const spanStart = (ids: string[]): number => {
  const first = timelineById.get(ids[0])!;
  return Math.round((first.startMs / 1000) * FPS);
};

const SPAN_OF: Record<string, string[]> = {
  "S15-S17": ["S15", "S16", "S17"],
  "S26-S29": ["S26", "S27", "S28", "S29"],
  "S36-S37": ["S36", "S37"],
  "S40-S41": ["S40", "S41"],
};

const SPECS: Spec[] = [
  // 2023.5 T21：念到"完全就是教材里技术可行性分析"划 A，念到"直接选 A"揭示
  { span: "S15-S17", scene: "S17", action: "eliminate-option", target: "A", phrase: "完全就是教材里技术可行性分析" },
  { span: "S15-S17", scene: "S17", action: "reveal-answer", target: "A", phrase: "直接选A" },

  // 23下1 T28
  { span: "S26-S29", scene: "S27", action: "eliminate-option", target: "A", phrase: "你看A选项" },
  { span: "S26-S29", scene: "S27", action: "reveal-answer", target: "A", phrase: "所以直接选A" },

  // 23下4 T22
  // 「直接选 A 敏感性分析」在 S29（S28 只念到选项）
  { span: "S26-S29", scene: "S29", action: "reveal-answer", target: "A", phrase: "直接选A敏感性分析" },

  // 双题对决
  // 双题对决模板用 targetId 区分左右：left / right（不是选项字母）
  // 模板的匹配顺序是 find(action==="reveal-answer") 兜底给右卡，
  // 所以左卡用 eliminate-option 作为触发，避免把右卡也提前点亮。
  { span: "S36-S37", scene: "S36", action: "eliminate-option", target: "left", phrase: "直接选D人员提升收益" },
  { span: "S36-S37", scene: "S37", action: "reveal-answer", target: "right", phrase: "直接选D技术创新效益" },

  // 25上1 T58：逐项认门
  { span: "S40-S41", scene: "S41", action: "eliminate-option", target: "A", phrase: "A技术创新效益" },
  { span: "S40-S41", scene: "S41", action: "eliminate-option", target: "B", phrase: "B设备购置费" },
  { span: "S40-S41", scene: "S41", action: "eliminate-option", target: "C", phrase: "C开源协议是否符合商业目标" },
  { span: "S40-S41", scene: "S41", action: "reveal-answer", target: "D", phrase: "只有D" },
];

const findLocalFrame = (spec: Spec): number => {
  const scene = sceneById.get(spec.scene) as { narration: string } | undefined;
  const tScene = timelineById.get(spec.scene) as { tokens: any[]; startMs: number } | undefined;
  if (!scene || !tScene) throw new Error(`缺少场景 ${spec.scene}`);

  const target = norm(spec.phrase);
  const tokens = tScene.tokens;
  const flat = tokens.map((t) => norm(t.text)).join("");
  const at = flat.indexOf(target);
  if (at < 0) {
    throw new Error(
      `场景 ${spec.scene} 找不到短语「${spec.phrase}」。\n口播：${scene.narration.slice(0, 60)}…\n可匹配文本前 80 字：${flat.slice(0, 80)}`,
    );
  }

  // 找到覆盖第 at 个字符的 token
  let acc = 0;
  let startMs = tScene.startMs;
  for (const t of tokens) {
    const len = norm(t.text).length;
    if (acc + len > at) {
      startMs = t.startMs;
      break;
    }
    acc += len;
  }

  const spanFrom = spanStart(SPAN_OF[spec.span]);
  return Math.max(0, Math.round(((startMs - Math.round((spanFrom / FPS) * 1000)) / 1000) * FPS));
};

const out: Record<string, any[]> = {};
for (const spec of SPECS) {
  const localFrame = findLocalFrame(spec);
  (out[spec.span] ??= []).push({
    id: `${spec.span}-${spec.action}-${spec.target ?? "x"}-${spec.scene}`,
    action: spec.action,
    targetId: spec.target,
    matchPhrase: spec.phrase,
    fallbackRatio: 0,
    triggerMs: Math.round((localFrame / FPS) * 1000),
    localFrame,
    matchedBy: "token-exact",
    sceneId: spec.scene,
  });
}

const outPath = path.join(ROOT, "src/lessons/ch07/l02-cues.json");
fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n", "utf-8");

console.log(`生成 ${Object.values(out).flat().length} 条 cue → ${path.relative(ROOT, outPath)}`);
for (const [span, cues] of Object.entries(out)) {
  console.log(`  ${span}: ${cues.map((c) => `${c.action}/${c.targetId}@${c.localFrame}f`).join(" · ")}`);
}
