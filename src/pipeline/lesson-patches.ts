/**
 * 章节补丁（逃生通道）。
 *
 * 目的：改一句画面文案 / 换一个标题，不必重编译、不必重跑 TTS、更不必改组件。
 * 只在最后一步（composition 注册时）套用，所以数据源仍是 compiled-lesson.json。
 *
 * 写法：按场景 id 做深合并；数组整体替换，不与原值拼接。
 *
 * ```json
 * {
 *   "S19": { "payload": { "title": "《项目建议书》＝ 立项申请的身份证（改）" } },
 *   "S14-S17": { "sceneTitle": "真题 1（重命名）" }
 * }
 * ```
 */
import type { CompiledLesson, CompiledScene } from "../../contracts/compiled-lesson.schema";

type Json = Record<string, unknown>;

const isPlainObject = (v: unknown): v is Json =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const deepMerge = <T>(base: T, patch: unknown): T => {
  if (!isPlainObject(base) || !isPlainObject(patch)) return patch as T;
  const out: Json = { ...base };
  for (const [k, v] of Object.entries(patch)) {
    out[k] = k in out ? deepMerge((out as Json)[k], v) : v;
  }
  return out as T;
};

/** 把补丁套到 lesson 上；返回新对象，不修改入参。 */
export const applyLessonPatches = (
  lesson: CompiledLesson,
  patches: Record<string, Json>,
): CompiledLesson => {
  if (!patches || Object.keys(patches).length === 0) return lesson;

  const known = new Set(lesson.scenes.map((s) => s.id));
  const unknown = Object.keys(patches).filter((id) => !known.has(id));
  if (unknown.length > 0) {
    // 不静默吞掉：拼错的场景 id 最容易被忽视
    throw new Error(
      `patches.json 引用了不存在的场景 id：${unknown.join(", ")}。` +
        `可用 id：${[...known].join(", ")}`,
    );
  }

  return {
    ...lesson,
    scenes: lesson.scenes.map((scene) =>
      patches[scene.id] ? (deepMerge(scene, patches[scene.id]) as CompiledScene) : scene,
    ),
  };
};
