/**
 * Stage 1 (`1-ingest`) 产出契约：Storyboard IR（结构化分镜中间表征）。
 *
 * 将《讲师口播与画面分镜合一稿V0.1.md》确定性编译为带显式停顿指令、
 * 复合画面子镜头裂变、强类型视觉模板 Payload 与 Cue-Points 的中间表征。
 */
import { z } from "zod";
import { CuePointSpecSchema, VisualSpecUnionSchema } from "./visual-props.schema.ts";

export const Sha256Schema = z.string().regex(/^[a-f0-9]{64}$/, "必须为 64 位小写十六进制 SHA-256");

export const PauseDirectiveSchema = z.object({
  afterClauseIndex: z.number().int().nonnegative(),
  durationMs: z.number().int().min(300).max(10000),
  reason: z.string().min(1),
});
export type PauseDirective = z.infer<typeof PauseDirectiveSchema>;

export const LessonOverviewCardSchema = z.object({
  chapterScope: z.string().min(1),
  estimatedDurationText: z.string().min(1),
  cognitiveGoals: z.array(z.string().min(1)).min(1),
  coreVisualAssets: z.array(z.string().min(1)).min(1),
  examAnchors: z.array(z.string().min(1)).default([]),
});
export type LessonOverviewCard = z.infer<typeof LessonOverviewCardSchema>;

export const StoryboardSceneIRSchema = z
  .object({
    sceneId: z.string().min(1),
    parentSceneId: z.string().min(1),
    segmentTitle: z.string().min(1),
    sceneTitle: z.string().min(1),
    order: z.number().int().positive(),
    estimatedSeconds: z.number().positive(),
    narration: z.string().min(1),
    narrationSha256: Sha256Schema,
    clauses: z.array(z.string().min(1)).min(1),
    pauseDirectives: z.array(PauseDirectiveSchema).default([]),
    rawVisualInstruction: z.string().min(1),
    pedagogicalIntent: z.string().min(1),
    cueSpecs: z.array(CuePointSpecSchema).default([]),
  })
  .and(VisualSpecUnionSchema);

export type StoryboardSceneIR = z.infer<typeof StoryboardSceneIRSchema>;

export const StoryboardIRSchema = z.object({
  schemaVersion: z.literal("1.0.0"),
  lessonId: z.string().min(1),
  lessonTitle: z.string().min(1),
  sourceMarkdownPath: z.string().min(1),
  sourceMarkdownSha256: Sha256Schema,
  companionScriptVerified: z.boolean().default(false),
  overview: LessonOverviewCardSchema,
  scenes: z.array(StoryboardSceneIRSchema).min(1),
  compiledAt: z.string().min(1),
});
export type StoryboardIR = z.infer<typeof StoryboardIRSchema>;
