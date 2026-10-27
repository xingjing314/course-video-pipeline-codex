/**
 * 第 7 章章节模块：每课一份「课时数据 + 组件表」。
 *
 * `Root` 不再直接引用本文件；成片注册走 `src/lessons/registry.ts` 的 `LESSONS`。
 */
import l01Raw from "../../../workspaces/ch07-L01-ds/compiled-lesson.json";
import l01Patches from "../../../workspaces/ch07-L01-ds/patches.json";
import l02Raw from "../../../workspaces/ch07-L02-ds/compiled-lesson.json";
import l03Raw from "../../../workspaces/ch07-L03-ds/compiled-lesson.json";
import l02Patches from "../../../workspaces/ch07-L02-ds/patches.json";
import l03Patches from "../../../workspaces/ch07-L03-ds/patches.json";
import { CompiledLessonSchema, type CompiledLesson } from "../../../contracts/compiled-lesson.schema";
import { applyLessonPatches } from "../patches";
import { L01Span } from "./components";
import { L02Span } from "./l02-spans";
import { L03Span } from "./l03-spans";

const parse = (raw: unknown, patches: unknown): CompiledLesson =>
  applyLessonPatches(
    CompiledLessonSchema.parse(raw) as CompiledLesson,
    patches as Record<string, Record<string, unknown>>,
  );

export const ch07LessonId = "ch07-L01-ds";
export const ch07Lesson = parse(l01Raw, l01Patches);
export const ch07Components = { "l01-span": L01Span };

export const l02LessonId = "ch07-L02-ds";
export const l02Lesson = parse(l02Raw, l02Patches);
export const l02Components = { "l02-span": L02Span };

export const l03LessonId = "ch07-L03-ds";
export const l03Lesson = parse(l03Raw, l03Patches);
export const l03Components = { "l03-span": L03Span };
