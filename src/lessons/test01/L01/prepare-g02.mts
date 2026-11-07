import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { AudioTimelineSchema } from "../../../../contracts/audio-timeline.schema.ts";
import { findPhraseStartMs } from "./g01-timing.ts";
import { G02_NARRATION } from "./g02-timing.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const work = path.join(root, "workspaces/test01/g02");
const timeline = AudioTimelineSchema.parse(JSON.parse(fs.readFileSync(path.join(work, "audio-timeline.json"), "utf8")));
if (timeline.engineInfo.device === "synthetic") throw new Error("G02 预览不使用 synthetic 配音。请用 --mode=cuda 重新生成。");

const tokens = timeline.scenes.flatMap((scene) => scene.tokens);
const publicDir = path.join(root, "public/audio/test01/g02");
fs.mkdirSync(publicDir, { recursive: true });
fs.copyFileSync(path.join(root, timeline.fullWavPath), path.join(publicDir, "narration.wav"));

const preview = {
  timeline: {
    totalDurationMs: timeline.totalDurationMs,
    fullWavPath: "public/audio/test01/g02/narration.wav",
    scenes: timeline.scenes.map((scene) => ({ sceneId: scene.sceneId, startMs: scene.startMs, endMs: scene.endMs })),
    captions: timeline.captions,
  },
  cues: {
    papersMs: findPhraseStartMs(tokens, "11套试卷"),
    questionsMs: findPhraseStartMs(tokens, "9道选择题"),
  },
  includeAudio: true,
  includeCaptions: true,
};
fs.writeFileSync(path.join(work, "preview-data.json"), `${JSON.stringify(preview, null, 2)}\n`);
console.log(`[G02] 预览已按配音更新。口播字数 ${G02_NARRATION.length}，时长 ${timeline.totalDurationMs}ms`);
console.log(`  cues ${JSON.stringify(preview.cues)}`);
