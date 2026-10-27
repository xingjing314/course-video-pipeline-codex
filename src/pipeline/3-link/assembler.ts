/**
 * Stage 3 (`3-link`) 响应式音画组装器（assembler.ts）。
 *
 * 将 Stage 1 的 `StoryboardIR` 与 Stage 2 的 `AudioTimeline` 绑定为 `CompiledLesson`，
 * 并同步写入：
 * 1. `workspaces/<lessonId>/compiled-lesson.json`
 * 2. `workspaces/current-lesson.json`（供 `npm run studio` 即时热重载预览）
 */
import fs from "node:fs";
import path from "node:path";
import type { AudioTimeline } from "../../../contracts/audio-timeline.schema.ts";
import {
  CompiledLessonSchema,
  type CompiledLesson,
  type CompiledScene,
} from "../../../contracts/compiled-lesson.schema.ts";
import type { StoryboardIR } from "../../../contracts/storyboard-ir.schema.ts";
import { resolveSceneCuePoints } from "./cue-point-resolver.ts";

export const linkAndAssembleLesson = (
  ir: StoryboardIR,
  timeline: AudioTimeline,
  projectRoot: string,
  workspaceDir: string,
  fps = 30,
): CompiledLesson => {
  const timingMap = new Map(timeline.scenes.map((s) => [s.sceneId, s]));
  const totalFrames = Math.max(1, Math.ceil((timeline.totalDurationMs / 1000) * fps));

  let frameCursor = 0;
  const compiledScenes: CompiledScene[] = ir.scenes.map((scene, idx) => {
    const audioTiming = timingMap.get(scene.sceneId);
    if (!audioTiming) {
      throw new Error(`找不到分镜 ${scene.sceneId} 的音频时间轴数据`);
    }

    const fromFrame = frameCursor;
    const endFrame =
      idx === ir.scenes.length - 1
        ? totalFrames
        : Math.max(fromFrame + 1, Math.round((audioTiming.endMs / 1000) * fps));
    const durationInFrames = Math.max(1, endFrame - fromFrame);
    frameCursor = endFrame;

    const cues = resolveSceneCuePoints(
      scene.cueSpecs,
      audioTiming.tokens,
      audioTiming.startMs,
      audioTiming.durationMs,
      fps,
    );

    return {
      id: scene.sceneId,
      parentSceneId: scene.parentSceneId,
      segmentTitle: scene.segmentTitle,
      sceneTitle: scene.sceneTitle,
      order: scene.order,
      startMs: audioTiming.startMs,
      endMs: audioTiming.endMs,
      durationMs: audioTiming.durationMs,
      fromFrame,
      durationInFrames,
      narration: scene.narration,
      narrationSha256: scene.narrationSha256,
      pedagogicalIntent: scene.pedagogicalIntent,
      cues,
      visualType: scene.visualType,
      payload: scene.payload,
    } as CompiledScene;
  });

  // public/audio 软链接指向 ../workspaces，因此相对于 public/ 的路径为 audio/<lessonId>/<lessonId>-full.wav
  const audioPublicSrc = `audio/${ir.lessonId}/${ir.lessonId}-full.wav`;

  const compiledCandidate: CompiledLesson = {
    schemaVersion: "1.0.0",
    lessonId: ir.lessonId,
    lessonTitle: ir.lessonTitle,
    meta: {
      fps,
      width: 1920,
      height: 1080,
      durationMs: timeline.totalDurationMs,
      durationInFrames: totalFrames,
      audioPublicSrc,
      audioSha256: timeline.fullWavSha256,
      srtRelativePath: timeline.srtPath,
      srtSha256: timeline.srtSha256,
    },
    overview: ir.overview,
    scenes: compiledScenes,
    captions: timeline.captions,
    compiledAt: new Date().toISOString(),
  };

  const validated = CompiledLessonSchema.parse(compiledCandidate);

  const lessonOutPath = path.join(workspaceDir, "compiled-lesson.json");
  const currentLessonPath = path.join(projectRoot, "workspaces", "current-lesson.json");
  const serialized = `${JSON.stringify(validated, null, 2)}\n`;

  fs.writeFileSync(lessonOutPath, serialized, "utf-8");
  fs.writeFileSync(currentLessonPath, serialized, "utf-8");

  return validated;
};
