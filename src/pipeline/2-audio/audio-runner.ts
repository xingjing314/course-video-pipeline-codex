/**
 * Stage 2 (`2-audio`) 音频合成与对齐总调度器（audio-runner.ts）。
 *
 * 支持两种模式：
 * 1. `cuda`（默认生产模式）：调用 `/projects/gaoxiang/qwen3-tts` 与 `/projects/gaoxiang/qwen3-forced-aligner`
 *    在 RTX 5060 Ti 16G 上进行真实语音合成与毫秒级字对齐，具备分句级 SHA-256 缓存；
 * 2. `synthetic`（快速预检模式）：0.2 秒生成确定性静音/提示音 WAV 与字级时间轴，用于快速验证架构或无 GPU 调试。
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import {
  AudioTimelineSchema,
  type AlignedToken,
  type AudioTimeline,
  type CaptionSegment,
  type SceneAudioTiming,
} from "../../../contracts/audio-timeline.schema.ts";
import type { StoryboardIR } from "../../../contracts/storyboard-ir.schema.ts";
import { buildCaptionsFromNarration, exportCaptionsToSrt } from "./srt-exporter.ts";

const TTS_PYTHON = "/projects/gaoxiang/qwen3-tts/.venv/bin/python";
const ALIGN_PYTHON = "/projects/gaoxiang/qwen3-forced-aligner/.venv/bin/python";

const sha256File = (filePath: string): string =>
  crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");

/**
 * 写入标准 24000Hz 单声道 16-bit PCM WAV（用于 synthetic 快速预检模式）
 */
const writeSilentPcmWav = (filePath: string, durationMs: number, sampleRate = 24000) => {
  const numSamples = Math.max(240, Math.round((durationMs / 1000) * sampleRate));
  const dataSize = numSamples * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // Mono
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, buffer);
};

export const runAudioEngine = (
  ir: StoryboardIR,
  projectRoot: string,
  workspaceDir: string,
  mode: "cuda" | "cpu" | "synthetic" = "cuda",
): AudioTimeline => {
  const cacheDir = path.join(projectRoot, ".cache", "audio");
  fs.mkdirSync(cacheDir, { recursive: true });
  fs.mkdirSync(workspaceDir, { recursive: true });

  if (mode === "synthetic") {
    const sampleRate = 24000;
    const sceneTimings: SceneAudioTiming[] = [];
    const allCaptions: CaptionSegment[] = [];
    let cursorMs = 0;
    let capIndex = 1;

    for (const scene of ir.scenes) {
      const pauseExtraMs = scene.pauseDirectives.reduce((sum, p) => sum + p.durationMs, 0);
      const pureChars = Array.from(scene.narration.replace(/\s+/g, ""));
      // 约 4.2 字/秒 + 显式教学停顿
      const speechDurationMs = Math.max(4000, pureChars.length * 220 + pauseExtraMs);
      const wavAbs = path.join(workspaceDir, "audio", `${scene.sceneId}.wav`);
      writeSilentPcmWav(wavAbs, speechDurationMs, sampleRate);

      const startMs = cursorMs;
      const endMs = startMs + speechDurationMs;
      cursorMs = endMs;

      // 生成逐字均匀对齐 token（支持 CuePoint 精确匹配）
      const charStepMs = Math.max(40, Math.floor((speechDurationMs - 600) / Math.max(1, pureChars.length)));
      const tokens: AlignedToken[] = pureChars
        .filter((ch) => !/[，,、；;：:。！？!?“”‘’（）()—]/.test(ch))
        .map((ch, idx) => {
          const tStart = startMs + idx * charStepMs;
          return {
            sceneId: scene.sceneId,
            text: ch,
            startMs: tStart,
            endMs: Math.min(endMs - 10, tStart + charStepMs - 5),
          };
        });

      const sceneCaps = buildCaptionsFromNarration(scene.sceneId, scene.narration, tokens, capIndex);
      capIndex += sceneCaps.length;
      allCaptions.push(...sceneCaps);

      sceneTimings.push({
        sceneId: scene.sceneId,
        narrationSha256: scene.narrationSha256,
        wavRelativePath: path.relative(projectRoot, wavAbs),
        wavSha256: sha256File(wavAbs),
        startMs,
        endMs,
        durationMs: endMs - startMs,
        fromCache: false,
        tokens,
      });
    }

    const fullWavAbs = path.join(workspaceDir, `${ir.lessonId}-full.wav`);
    writeSilentPcmWav(fullWavAbs, cursorMs, sampleRate);

    const srtAbs = path.join(workspaceDir, `${ir.lessonId}.srt`);
    fs.writeFileSync(srtAbs, exportCaptionsToSrt(allCaptions), "utf-8");

    const timeline: AudioTimeline = AudioTimelineSchema.parse({
      schemaVersion: "1.0.0",
      lessonId: ir.lessonId,
      sampleRate,
      totalDurationMs: cursorMs,
      fullWavPath: path.relative(projectRoot, fullWavAbs),
      fullWavSha256: sha256File(fullWavAbs),
      srtPath: path.relative(projectRoot, srtAbs),
      srtSha256: sha256File(srtAbs),
      engineInfo: {
        ttsEngine: "synthetic-pcm-24k",
        alignerEngine: "deterministic-char-timeline",
        device: "synthetic",
      },
      scenes: sceneTimings,
      captions: allCaptions,
      generatedAt: new Date().toISOString(),
    });

    fs.writeFileSync(
      path.join(workspaceDir, "audio-timeline.json"),
      `${JSON.stringify(timeline, null, 2)}\n`,
      "utf-8",
    );
    return timeline;
  }

  // 真实 Qwen3-TTS + Qwen3-ForcedAligner 模式（cuda / cpu）
  const irPath = path.join(workspaceDir, "storyboard-ir.json");
  const ttsWorkerScript = path.join(projectRoot, "src/pipeline/2-audio/tts_worker.py");
  const alignWorkerScript = path.join(projectRoot, "src/pipeline/2-audio/align_worker.py");

  const ttsRes = spawnSync(
    TTS_PYTHON,
    [
      "-B",
      ttsWorkerScript,
      "--ir",
      irPath,
      "--workspace",
      workspaceDir,
      "--cache-dir",
      cacheDir,
      "--device",
      mode,
    ],
    { stdio: "inherit" },
  );
  if (ttsRes.status !== 0) {
    throw new Error(`Qwen3-TTS 执行失败（退出码 ${ttsRes.status}）`);
  }

  const ttsMetaPath = path.join(workspaceDir, "tts-output.json");
  const alignedOutPath = path.join(workspaceDir, "aligned-tokens.json");

  const alignRes = spawnSync(
    ALIGN_PYTHON,
    [
      "-B",
      alignWorkerScript,
      "--tts-meta",
      ttsMetaPath,
      "--cache-dir",
      cacheDir,
      "--out",
      alignedOutPath,
      "--device",
      mode,
    ],
    { stdio: "inherit" },
  );
  if (alignRes.status !== 0) {
    throw new Error(`Qwen3-ForcedAligner 执行失败（退出码 ${alignRes.status}）`);
  }

  const ttsMeta = JSON.parse(fs.readFileSync(ttsMetaPath, "utf-8"));

  /**
   * TTS 幻觉体检：单场景语速异常即中断。
   *
   * 背景：L03 的 S45 首分句「当第四关评估通过、」（8 字）被模型念成了 31.9 秒，
   * 导致整场景 37.2 s、对齐只覆盖前 7 s、后 30 s 无字幕，且听到的内容与稿子不符。
   * 这类失败此前没有任何拦截，直接进了成片。
   *
   * 判据：去掉显式停顿后的"秒/字"超过 0.8（正常中位数 0.29，最大 0.36）。
   */
  const pauseMsByScene = new Map<string, number>(
    ir.scenes.map((sc) => [sc.sceneId, sc.pauseDirectives.reduce((a, p) => a + p.durationMs, 0)]),
  );
  const speechRatioLimit = 0.8;
  const suspicious = ttsMeta.scenes
    .map((seg: { sceneId: string; narration: string; durationMs: number }) => {
      const chars = seg.narration.replace(/[^\u4e00-\u9fa5A-Za-z0-9]/g, "").length;
      const speechSec = (seg.durationMs - (pauseMsByScene.get(seg.sceneId) ?? 0)) / 1000;
      return { sceneId: seg.sceneId, chars, speechSec, ratio: speechSec / Math.max(1, chars) };
    })
    .filter((x: { ratio: number; chars: number }) => x.chars >= 3 && x.ratio > speechRatioLimit);

  if (suspicious.length > 0) {
    const lines = suspicious
      .map((x: { sceneId: string; chars: number; speechSec: number; ratio: number }) =>
        `  ${x.sceneId}: ${x.speechSec.toFixed(1)}s / ${x.chars} 字 = ${x.ratio.toFixed(2)} s/字`,
      )
      .join("\n");
    throw new Error(
      `TTS 语速异常（阈值 ${speechRatioLimit} s/字），拒绝产出时间线：\n${lines}\n` +
        `多半是某个分句被念飞了（幻觉）。请删除对应分句缓存后重跑：\n` +
        `  rm .cache/audio/clauses/*.wav   # 粗暴但有效；或按文本哈希精确删除\n` +
        `然后重跑本命令。`,
    );
  }

  const alignMeta = JSON.parse(fs.readFileSync(alignedOutPath, "utf-8"));
  const alignMap = new Map<string, { fromCache: boolean; tokens: AlignedToken[] }>(
    alignMeta.scenes.map((s: { sceneId: string; fromCache: boolean; tokens: AlignedToken[] }) => [
      s.sceneId,
      s,
    ]),
  );

  const sceneTimings: SceneAudioTiming[] = [];
  const allCaptions: CaptionSegment[] = [];
  let capIndex = 1;

  for (const seg of ttsMeta.scenes) {
    const aligned = alignMap.get(seg.sceneId);
    if (!aligned || aligned.tokens.length === 0) {
      throw new Error(`场景 ${seg.sceneId} 缺少对齐 token`);
    }
    const sceneCaps = buildCaptionsFromNarration(seg.sceneId, seg.narration, aligned.tokens, capIndex);
    capIndex += sceneCaps.length;
    allCaptions.push(...sceneCaps);

    sceneTimings.push({
      sceneId: seg.sceneId,
      narrationSha256: seg.narrationSha256,
      wavRelativePath: path.relative(projectRoot, seg.wavPath),
      wavSha256: seg.wavSha256,
      startMs: seg.startMs,
      endMs: seg.endMs,
      durationMs: seg.durationMs,
      fromCache: Boolean(seg.fromCache && aligned.fromCache),
      tokens: aligned.tokens,
    });
  }

  const srtAbs = path.join(workspaceDir, `${ir.lessonId}.srt`);
  fs.writeFileSync(srtAbs, exportCaptionsToSrt(allCaptions), "utf-8");

  const timeline: AudioTimeline = AudioTimelineSchema.parse({
    schemaVersion: "1.0.0",
    lessonId: ir.lessonId,
    sampleRate: ttsMeta.sampleRate,
    totalDurationMs: ttsMeta.totalDurationMs,
    fullWavPath: path.relative(projectRoot, ttsMeta.fullWavPath),
    fullWavSha256: ttsMeta.fullWavSha256,
    srtPath: path.relative(projectRoot, srtAbs),
    srtSha256: sha256File(srtAbs),
    engineInfo: {
      ttsEngine: ttsMeta.ttsEngine,
      alignerEngine: alignMeta.alignerEngine,
      device: mode,
    },
    scenes: sceneTimings,
    captions: allCaptions,
    generatedAt: new Date().toISOString(),
  });

  fs.writeFileSync(
    path.join(workspaceDir, "audio-timeline.json"),
    `${JSON.stringify(timeline, null, 2)}\n`,
    "utf-8",
  );
  return timeline;
};
