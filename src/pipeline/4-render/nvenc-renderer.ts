/**
 * Stage 4 交付入口。
 *
 * 教学画面只渲染一次干净版（无音轨、无口播字幕），或复用调用方给出的干净版，
 * 然后调用 scripts/compose-lesson.mjs 的 composeLesson() 生成有声版、WAV、SRT 和媒体说明。
 * 帧范围对这三项一致生效。不在这里另写一套字幕叠加或媒体检查。
 */
import type { CompiledLesson } from "../../../contracts/compiled-lesson.schema.ts";
import { deliverCompiledLesson, type DualDeliveryDeps, type DualDeliveryResult } from "./dual-delivery.ts";

export const renderLessonDeliverables = (
  lesson: CompiledLesson,
  projectRoot: string,
  options: { maxFrames?: number; frames?: string; cleanVideo?: string; entry?: string; composition?: string } = {},
  deps?: DualDeliveryDeps,
): Promise<DualDeliveryResult> => deliverCompiledLesson(lesson, projectRoot, options, deps);
