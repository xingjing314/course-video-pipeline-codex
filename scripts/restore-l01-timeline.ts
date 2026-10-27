/**
 * 从 tts-output.json + aligned-tokens.json + l01-captions.json 重建 audio-timeline.json。
 *
 * 背景：一次误操作让 synthetic 模式的 run-l01-audio 覆盖了真实产物
 * （wav 与 audio-timeline.json）。真实 WAV 已从 deliverables 恢复，
 * 本脚本用**幸存的真实记录**（逐场景 TTS 时长与哈希、逐字 token、字幕）重建时间线。
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = path.resolve(import.meta.dirname, "..");
const LESSON_ID = "ch07-L01-ds";
const WS = path.join(ROOT, "workspaces", LESSON_ID);

const sha256 = (b: Buffer | string) => crypto.createHash("sha256").update(b).digest("hex");
const read = (p: string) => JSON.parse(fs.readFileSync(p, "utf-8"));

const tts = read(path.join(WS, "tts-output.json"));
const aligned = read(path.join(WS, "aligned-tokens.json"));
const captions = read(path.join(ROOT, "src/visual/prototypes/l01-captions.json"));
const wavPath = path.join(WS, `${LESSON_ID}-full.wav`);
const srtPath = path.join(WS, `${LESSON_ID}.srt`);

const tokensByScene = new Map<string, any[]>(aligned.scenes.map((s: any) => [s.sceneId, s.tokens]));

const scenes = tts.scenes.map((s: any) => ({
  sceneId: s.sceneId,
  narrationSha256: s.narrationSha256,
  wavRelativePath: `workspaces/${LESSON_ID}/audio/${s.sceneId}.wav`,
  wavSha256: s.wavSha256,
  startMs: s.startMs,
  endMs: s.endMs,
  durationMs: s.durationMs,
  fromCache: s.fromCache,
  tokens: tokensByScene.get(s.sceneId) ?? [],
}));

const lastEnd = Math.max(...scenes.map((s: any) => s.endMs));

const timeline = {
  schemaVersion: "1.0.0",
  lessonId: LESSON_ID,
  sampleRate: tts.sampleRate,
  totalDurationMs: lastEnd,
  fullWavPath: `workspaces/${LESSON_ID}/${LESSON_ID}-full.wav`,
  fullWavSha256: sha256(fs.readFileSync(wavPath)),
  srtPath: `workspaces/${LESSON_ID}/${LESSON_ID}.srt`,
  srtSha256: sha256(fs.readFileSync(srtPath)),
  engineInfo: {
    ttsEngine: tts.ttsEngine,
    alignerEngine: aligned.alignerEngine,
    device: tts.device,
  },
  scenes,
  captions,
  generatedAt: new Date().toISOString(),
};

fs.writeFileSync(path.join(WS, "audio-timeline.json"), JSON.stringify(timeline, null, 2) + "\n", "utf-8");
console.log(`重建 ${scenes.length} 场景 / ${captions.length} 条字幕，总长 ${lastEnd} ms`);
console.log(`wav sha ${timeline.fullWavSha256.slice(0, 16)}（${(fs.statSync(wavPath).size / 1e6).toFixed(1)} MB）`);
