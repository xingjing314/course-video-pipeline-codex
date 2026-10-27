/**
 * Stage 4 (`4-render`) 双版本渲染与四项交付打包器（nvenc-renderer.ts）。
 *
 * 1. 基于同一份 CompiledLesson 数据，渲染：
 *    - `<lessonId>-voiced-captioned.mp4`（有声 + 口播字幕）
 *    - `<lessonId>-silent-clean.mp4`（无声 + 无口播字幕，保留全部教学文字）
 * 2. 启用硬件加速渲染（RTX 5060 Ti GPU 光栅化与编码），并对四项标准交付物执行 ffprobe 探针校验。
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import type { CompiledLesson } from "../../../contracts/compiled-lesson.schema.ts";
import {
  DeliveryManifestSchema,
  type DeliveryManifest,
} from "../../../contracts/delivery-manifest.schema.ts";
import { probeMediaFile } from "./media-verifier.ts";

const sha256File = (filePath: string): string =>
  crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");

export const renderLessonDeliverables = async (
  lesson: CompiledLesson,
  projectRoot: string,
  options: { maxFrames?: number } = {},
): Promise<DeliveryManifest> => {
  const outDir = path.join(projectRoot, "deliverables", lesson.lessonId);
  fs.mkdirSync(outDir, { recursive: true });

  const entryPoint = path.join(projectRoot, "src/visual/index.ts");
  const publicDir = path.join(projectRoot, "public");

  console.log(`[RENDER] Bundling Remotion visual engine from ${entryPoint}...`);
  const serveUrl = await bundle({
    entryPoint,
    publicDir,
  });

  const frameRange: [number, number] | undefined = options.maxFrames
    ? [0, Math.min(lesson.meta.durationInFrames - 1, options.maxFrames - 1)]
    : undefined;

  const variants: Array<{
    role: "voiced-captioned" | "silent-clean";
    includeAudio: boolean;
    includeCaptions: boolean;
    fileName: string;
  }> = [
    {
      role: "voiced-captioned",
      includeAudio: true,
      includeCaptions: true,
      fileName: `${lesson.lessonId}-voiced-captioned.mp4`,
    },
    {
      role: "silent-clean",
      includeAudio: false,
      includeCaptions: false,
      fileName: `${lesson.lessonId}-silent-clean.mp4`,
    },
  ];

  for (const variant of variants) {
    const inputProps = {
      lesson,
      includeAudio: variant.includeAudio,
      includeCaptions: variant.includeCaptions,
    };

    const composition = await selectComposition({
      serveUrl,
      id: "CourseVideo",
      inputProps,
    });

    const outPath = path.join(outDir, variant.fileName);
    console.log(
      `[RENDER] Rendering ${variant.role} -> ${path.relative(projectRoot, outPath)} (${frameRange ? `${frameRange[1] + 1} frames` : `${composition.durationInFrames} frames`})...`,
    );

    let lastPercent = -1;
    await renderMedia({
      composition,
      serveUrl,
      codec: "h264",
      outputLocation: outPath,
      inputProps,
      frameRange,
      concurrency: 8,
      hardwareAcceleration: "if-possible",
      chromiumOptions: {
        gl: "angle",
      },
      onProgress: ({ renderedFrames, progress }) => {
        const pct = Math.floor(progress * 100);
        if (pct >= lastPercent + 10 || pct === 100) {
          lastPercent = pct;
          console.log(
            `  > [${variant.role}] 渲染进度: ${pct}% (已渲染 ${renderedFrames}/${frameRange ? frameRange[1] + 1 : composition.durationInFrames} 帧)`,
          );
        }
      },
    });
  }

  // 复制权威 SRT 与完整 WAV 到 deliverables/<lessonId>/
  const workspaceDir = path.join(projectRoot, "workspaces", lesson.lessonId);
  const srcSrt = path.join(workspaceDir, `${lesson.lessonId}.srt`);
  const srcWav = path.join(workspaceDir, `${lesson.lessonId}-full.wav`);
  const dstSrt = path.join(outDir, `${lesson.lessonId}.srt`);
  const dstWav = path.join(outDir, `${lesson.lessonId}-full.wav`);

  fs.copyFileSync(srcSrt, dstSrt);
  fs.copyFileSync(srcWav, dstWav);

  const voicedPath = path.join(outDir, `${lesson.lessonId}-voiced-captioned.mp4`);
  const silentPath = path.join(outDir, `${lesson.lessonId}-silent-clean.mp4`);

  const voicedStats = probeMediaFile(voicedPath);
  const silentStats = probeMediaFile(silentPath);
  const wavStats = probeMediaFile(dstWav);

  if (voicedStats.videoStreams !== 1 || voicedStats.audioStreams !== 1) {
    throw new Error(
      `有声带字幕版轨道异常：期望 video=1, audio=1，实际 video=${voicedStats.videoStreams}, audio=${voicedStats.audioStreams}`,
    );
  }
  if (silentStats.videoStreams !== 1 || silentStats.audioStreams !== 0) {
    throw new Error(
      `无声无字幕版轨道异常：期望 video=1, audio=0，实际 video=${silentStats.videoStreams}, audio=${silentStats.audioStreams}`,
    );
  }

  const compiledLessonPath = path.join(workspaceDir, "compiled-lesson.json");

  const manifest: DeliveryManifest = DeliveryManifestSchema.parse({
    schemaVersion: "1.0.0",
    lessonId: lesson.lessonId,
    lessonTitle: lesson.lessonTitle,
    compiledLessonSha256: sha256File(compiledLessonPath),
    encoderPolicy: "nvenc-preferred",
    actualVideoEncoder: "h264 (hardwareAcceleration=if-possible)",
    deliverables: [
      {
        role: "voiced-captioned",
        path: path.relative(projectRoot, voicedPath),
        sha256: sha256File(voicedPath),
        bytes: fs.statSync(voicedPath).size,
        mediaStats: voicedStats,
      },
      {
        role: "silent-clean",
        path: path.relative(projectRoot, silentPath),
        sha256: sha256File(silentPath),
        bytes: fs.statSync(silentPath).size,
        mediaStats: silentStats,
      },
      {
        role: "subtitles-srt",
        path: path.relative(projectRoot, dstSrt),
        sha256: sha256File(dstSrt),
        bytes: fs.statSync(dstSrt).size,
      },
      {
        role: "audio-wav",
        path: path.relative(projectRoot, dstWav),
        sha256: sha256File(dstWav),
        bytes: fs.statSync(dstWav).size,
        mediaStats: wavStats,
      },
    ],
    renderedAt: new Date().toISOString(),
  });

  const manifestPath = path.join(outDir, "delivery-manifest.json");
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf-8");
  return manifest;
};
