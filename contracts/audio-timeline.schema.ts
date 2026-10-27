/**
 * Stage 2 (`2-audio`) 产出契约：CUDA Qwen3-TTS 与 Qwen3-ForcedAligner 字级时间轴。
 */
import { z } from "zod";
import { Sha256Schema } from "./storyboard-ir.schema.ts";

export const AlignedTokenSchema = z.object({
  sceneId: z.string().min(1),
  text: z.string().min(1),
  startMs: z.number().int().nonnegative(),
  endMs: z.number().int().nonnegative(),
});
export type AlignedToken = z.infer<typeof AlignedTokenSchema>;

export const CaptionSegmentSchema = z.object({
  index: z.number().int().positive(),
  sceneId: z.string().min(1),
  text: z.string().min(1),
  startMs: z.number().int().nonnegative(),
  endMs: z.number().int().nonnegative(),
});
export type CaptionSegment = z.infer<typeof CaptionSegmentSchema>;

export const SceneAudioTimingSchema = z.object({
  sceneId: z.string().min(1),
  narrationSha256: Sha256Schema,
  wavRelativePath: z.string().min(1),
  wavSha256: Sha256Schema,
  startMs: z.number().int().nonnegative(),
  endMs: z.number().int().positive(),
  durationMs: z.number().int().positive(),
  fromCache: z.boolean(),
  tokens: z.array(AlignedTokenSchema).min(1),
});
export type SceneAudioTiming = z.infer<typeof SceneAudioTimingSchema>;

export const AudioTimelineSchema = z.object({
  schemaVersion: z.literal("1.0.0"),
  lessonId: z.string().min(1),
  sampleRate: z.number().int().positive(),
  totalDurationMs: z.number().int().positive(),
  fullWavPath: z.string().min(1),
  fullWavSha256: Sha256Schema,
  srtPath: z.string().min(1),
  srtSha256: Sha256Schema,
  engineInfo: z.object({
    ttsEngine: z.string().min(1),
    alignerEngine: z.string().min(1),
    device: z.enum(["cuda", "cpu", "synthetic"]),
  }),
  scenes: z.array(SceneAudioTimingSchema).min(1),
  captions: z.array(CaptionSegmentSchema).min(1),
  generatedAt: z.string().min(1),
});
export type AudioTimeline = z.infer<typeof AudioTimelineSchema>;
