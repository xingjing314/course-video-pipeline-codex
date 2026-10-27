/**
 * 脚本共用的 `--lesson=<id>` 解析。
 *
 * 约定：lesson id 形如 `ch07-L01-ds`，workspace 目录同名，
 * 章节文件夹取前缀（`ch07`），组件键取中段（`l01-span`）。
 */
import path from "node:path";

export type LessonArg = {
  lessonId: string;
  /** workspaces/<lessonId> */
  workspace: string;
  /** 章节文件夹名，如 "ch07" */
  chapter: string;
  /** 章节组件键，如 "l01-span" */
  spanKey: string;
};

export const parseLessonArg = (root: string, argv: string[] = process.argv.slice(2)): LessonArg => {
  const raw = Object.fromEntries(
    argv
      .filter((a) => a.startsWith("--"))
      .map((a) => {
        const i = a.indexOf("=");
        return i < 0 ? [a.slice(2), ""] : [a.slice(2, i), a.slice(i + 1)];
      }),
  );

  const lessonId = raw.lesson ?? process.env.DSH_LESSON ?? "ch07-L01-ds";
  const parts = lessonId.split("-");
  const chapter = raw.chapter ?? parts[0];
  const spanKey = raw.spanKey ?? `${(parts[1] ?? "l01").toLowerCase()}-span`;

  if (!/^[a-z0-9]{2,}-[A-Za-z0-9]{2,}-[a-z0-9]+$/.test(lessonId)) {
    throw new Error(`--lesson 格式应为 ch07-L01-ds，收到：${lessonId}`);
  }

  return {
    lessonId,
    workspace: path.join(root, "workspaces", lessonId),
    chapter,
    spanKey,
  };
};
