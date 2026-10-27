/**
 * 用"原文标点"重切 L01 的字幕，并写回音频产物与成片字幕。
 *
 * 背景：对齐 token 是纯字符、无标点，只按字数切会切出"…三个身份信"这种半句。
 * 这里拿 storyboard-ir.json 里的 narration（带标点）与 audio-timeline.json 的 token
 * 重新做一次切分，覆盖：audio-timeline.json 的 captions、<lesson>.srt、
 * 以及成片用的 l01-captions.json。
 *
 * 用法：node --experimental-strip-types scripts/rebuild-l01-captions.ts
 */
import fs from "node:fs";
import path from "node:path";
import { parseLessonArg } from "./_lesson-arg.ts";
import { fileURLToPath } from "node:url";
import {
  buildCaptionsFromNarration,
  exportCaptionsToSrt,
} from "../src/pipeline/2-audio/srt-exporter.ts";
import type { CaptionSegment } from "../contracts/audio-timeline.schema.ts";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const { lessonId: LESSON_ID, workspace: WS } = parseLessonArg(ROOT);

type IrScene = { sceneId: string; narration: string };
type TimelineScene = { sceneId: string; tokens: { sceneId: string; text: string; startMs: number; endMs: number }[] };
type Timeline = {
  scenes: TimelineScene[];
  captions: CaptionSegment[];
  srtPath?: string;
  srtSha256?: string;
};

const ir = JSON.parse(fs.readFileSync(path.join(WS, "storyboard-ir.json"), "utf-8")) as { scenes: IrScene[] };
const tl = JSON.parse(fs.readFileSync(path.join(WS, "audio-timeline.json"), "utf-8")) as Timeline;

const narrationByScene = new Map(ir.scenes.map((s) => [s.sceneId, s.narration]));

const captions: CaptionSegment[] = [];
let index = 1;

for (const scene of tl.scenes) {
  const raw = narrationByScene.get(scene.sceneId);
  if (!raw) throw new Error(`IR 里没有 ${scene.sceneId} 的口播`);
  // 口播稿里的列表符号（"- "）会被 TTS 忽略，但会漏进字幕；这里只剥掉行首标记
  const narration = raw.replace(/^\s*[-–—·•]\s*/, "");
  const built = buildCaptionsFromNarration(scene.sceneId, narration, scene.tokens, index);
  index += built.length;
  captions.push(...built);
}

// 单调递增兜底
for (let i = 1; i < captions.length; i += 1) {
  if (captions[i].startMs < captions[i - 1].endMs) {
    captions[i].startMs = captions[i - 1].endMs;
    captions[i].endMs = Math.max(captions[i].startMs + 120, captions[i].endMs);
  }
}

tl.captions = captions;

const srt = exportCaptionsToSrt(captions);
const srtPath = path.join(WS, `${LESSON_ID}.srt`);
fs.writeFileSync(srtPath, srt, "utf-8");
fs.writeFileSync(path.join(WS, "audio-timeline.json"), `${JSON.stringify(tl, null, 2)}\n`, "utf-8");

// 成片字幕落到章节目录：src/lessons/<chapter>/<lessonId>-captions.json
const { chapter } = parseLessonArg(ROOT);
const filmCaptions = path.join(ROOT, "src/lessons", chapter, `${LESSON_ID}-captions.json`);
fs.writeFileSync(filmCaptions, `${JSON.stringify(captions, null, 2)}\n`, "utf-8");

const lens = captions.map((c) => [...c.text].filter((ch) => !/[，。、；：？！…—]/.test(ch)).length);
const avg = (lens.reduce((a, b) => a + b, 0) / lens.length).toFixed(1);
const endsWithPunct = captions.filter((c) => /[。！？，；：]$/.test(c.text)).length;

console.log(`字幕 ${captions.length} 条（原 209 条）`);
console.log(`平均可见字数 ${avg}，最长 ${Math.max(...lens)}，最短 ${Math.min(...lens)}`);
console.log(`以标点结尾 ${endsWithPunct} 条（${((endsWithPunct / captions.length) * 100).toFixed(0)}%）`);
console.log("样例：");
for (const c of captions.slice(0, 6)) {
  console.log(`  [${(c.startMs / 1000).toFixed(1)}s] ${c.text}`);
}
