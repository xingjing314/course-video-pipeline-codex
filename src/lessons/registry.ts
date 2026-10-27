/**
 * 章节组件注册表：lessonId → { components }。
 *
 * 加一章只改这一处（以及新建 `src/lessons/<lessonId>/` 文件夹），
 * `SceneRouter` 与 `Root` 不再需要改动。
 *
 * L01 目前全部使用通用类型（exam-stats / gate-track / …），所以暂时没有章节组件；
 * 空表也走同一条查找路径，行为不变。
 */
import type { ChapterModule } from "./types";
import {
  ch07Components,
  ch07Lesson,
  ch07LessonId,
  l02Components,
  l02Lesson,
  l02LessonId,
  l03Components,
  l03Lesson,
  l03LessonId,
} from "./ch07";


export const CHAPTERS: Record<string, ChapterModule> = {
  [ch07LessonId]: { lessonId: ch07LessonId, components: ch07Components },
  [l02LessonId]: { lessonId: l02LessonId, components: l02Components },
  [l03LessonId]: { lessonId: l03LessonId, components: l03Components },
};



/** 章节成片的注册信息：只放数据，不放组件（组件由 compositions 层组装）。 */
export type LessonEntry = {
  lessonId: string;
  lesson: (typeof ch07Lesson);
  compositionIds: { voiced: string; silent: string };
};

export const LESSONS: LessonEntry[] = [
  { lessonId: ch07LessonId, lesson: ch07Lesson, compositionIds: { voiced: "L01Lesson", silent: "L01LessonSilent" } },
  { lessonId: l02LessonId, lesson: l02Lesson, compositionIds: { voiced: "L02Lesson", silent: "L02LessonSilent" } },
  { lessonId: l03LessonId, lesson: l03Lesson, compositionIds: { voiced: "L03Lesson", silent: "L03LessonSilent" } },
];
