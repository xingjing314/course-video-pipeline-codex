/**
 * 章节本地组件的契约。
 *
 * 通用 19 类模板不够用时，章节把自制组件挂进 `components` 表，
 * 数据侧用 `visualType: "chapter-local"` + `payload.key` 指过来。
 *
 * 设计边界：
 * - 通用模板放 `src/visual/templates/`，全课共享；
 * - 章节组件放 `src/lessons/<lessonId>/`，只服务本章；
 * - 两者不互相 import。
 */
import type React from "react";
import type { ResolvedCuePoint } from "../../contracts/visual-props.schema";

/** 章节组件统一签名：payload 由章节自己在组件内 parse。 */
export type ChapterComponent = React.FC<{
  payload: unknown;
  cues?: ResolvedCuePoint[];
}>;

export type ChapterComponents = Record<string, ChapterComponent>;

export type ChapterModule = {
  lessonId: string;
  components: ChapterComponents;
};
