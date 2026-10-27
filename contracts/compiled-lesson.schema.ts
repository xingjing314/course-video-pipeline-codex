/**
 * Stage 3 (`3-link`) 产出契约：CompiledLesson（供 Remotion Studio 与 NVENC 渲染消费的终态音画绑定数据）。
 */
import { z } from "zod";
import { CaptionSegmentSchema } from "./audio-timeline.schema.ts";
import { LessonOverviewCardSchema, Sha256Schema } from "./storyboard-ir.schema.ts";
import { ResolvedCuePointSchema, VisualSpecUnionSchema } from "./visual-props.schema.ts";

export const CompiledSceneSchema = z
  .object({
    id: z.string().min(1),
    parentSceneId: z.string().min(1),
    segmentTitle: z.string().min(1),
    sceneTitle: z.string().min(1),
    order: z.number().int().positive(),
    startMs: z.number().int().nonnegative(),
    endMs: z.number().int().positive(),
    durationMs: z.number().int().positive(),
    fromFrame: z.number().int().nonnegative(),
    durationInFrames: z.number().int().positive(),
    narration: z.string().min(1),
    narrationSha256: Sha256Schema,
    pedagogicalIntent: z.string().min(1),
    cues: z.array(ResolvedCuePointSchema).default([]),
    /**
     * 面包屑归属：
     * - "scene"（默认）：由 MasterCanvas 用场景 id / 序号渲染；
     * - "chapter"：场景自己渲染（跨多镜的状态机需要镜号随帧推进）。
     */
    headerMode: z.enum(["scene", "chapter"]).default("scene"),
  })
  .and(VisualSpecUnionSchema);

export type CompiledScene = z.infer<typeof CompiledSceneSchema>;

export const CompiledLessonSchema = z.object({
  schemaVersion: z.literal("1.0.0"),
  lessonId: z.string().min(1),
  lessonTitle: z.string().min(1),
  meta: z.object({
    fps: z.number().int().positive().default(30),
    width: z.number().int().positive().default(1920),
    height: z.number().int().positive().default(1080),
    durationMs: z.number().int().positive(),
    durationInFrames: z.number().int().positive(),
    /** 相对于 public/ 的音频路径（如 audio/ch07-L01/ch07-L01-full.wav） */
    audioPublicSrc: z.string().min(1),
    audioSha256: Sha256Schema,
    srtRelativePath: z.string().min(1),
    srtSha256: Sha256Schema,
  }),
  overview: LessonOverviewCardSchema,
  scenes: z.array(CompiledSceneSchema).min(1),
  captions: z.array(CaptionSegmentSchema).min(1),
  compiledAt: z.string().min(1),
});
export type CompiledLesson = z.infer<typeof CompiledLessonSchema>;
