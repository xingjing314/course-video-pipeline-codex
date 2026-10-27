/**
 * Composition 注册表。
 *
 * 目的：`Root.tsx` 不再逐条手写 `<Composition>`，而是遍历这张表。
 * 第六章在章节/课时 index.ts 声明入口；公共文件只汇总章节，Root 保持不动。
 *
 * 第七章沿用 LESSONS 注册及 MasterCanvas；第六章沿用独立组件。
 * 公共原型入口仍在 LAB_COMPOSITIONS 中。
 */
import type { CompositionSpec } from "../lessons/composition-types";
import type { CalculateMetadataFunction } from "remotion";
import { CompiledLessonSchema, type CompiledLesson } from "../../contracts/compiled-lesson.schema";
import { MasterCanvas, type CourseVideoProps } from "./shell/MasterCanvas";
import { A5GateTrackLab } from "./prototypes/A5GateTrackLab";
import { A5_STAGES } from "./templates/GateTrack";
import { A7ExamQuizLab, A7_TOTAL_FRAMES } from "./prototypes/ExamQuizLab";
import { A8IdCardLab } from "./prototypes/A8IdCardLab";
import { A8_STAGES } from "./templates/IdCard";
import { A9MnemonicLab } from "./prototypes/A9MnemonicLab";
import { A9_STAGES } from "./templates/Mnemonic";
import { A14CardsLab, A14_STAGES } from "./prototypes/A14CardsLab";
import { A14Smoke } from "./prototypes/A14Smoke";
import { A59Smoke } from "./prototypes/A59Smoke";
import { KitDemo, KIT_STAGES } from "./prototypes/KitDemo";
import { L02Preview } from "./prototypes/L02Lab";
import { L03Preview } from "./prototypes/L03Preview";
import { L03_TOTAL_FRAMES } from "../lessons/ch07/l03-shot-table";
import { LESSONS } from "../lessons/registry";
import { CH06_COMPOSITIONS } from "../lessons/ch06";
import currentLessonRaw from "../../workspaces/current-lesson.json";

import { L02_TOTAL_FRAMES } from "../lessons/ch07/l02-shot-table";

const defaultLesson = CompiledLessonSchema.parse(currentLessonRaw) as CompiledLesson;

export type { CompositionSpec } from "../lessons/composition-types";

/** 课时成片：先挂载 MasterCanvas，时长/画幅/帧率取自 lesson.meta。 */
const lessonCompositions = (lesson: CompiledLesson): CompositionSpec[] => {
  const calculateMetadata: CalculateMetadataFunction<CourseVideoProps> = ({ props }) => {
    const parsed = CompiledLessonSchema.parse(props.lesson);
    return {
      durationInFrames: parsed.meta.durationInFrames,
      fps: parsed.meta.fps,
      width: parsed.meta.width,
      height: parsed.meta.height,
      props,
    };
  };

  return [
    {
      id: "CourseVideo",
      component: MasterCanvas,
      durationInFrames: lesson.meta.durationInFrames,
      fps: lesson.meta.fps,
      width: lesson.meta.width,
      height: lesson.meta.height,
      defaultProps: { lesson, includeAudio: true, includeCaptions: true },
      calculateMetadata,
    },
    {
      id: "CourseVideoSilentClean",
      component: MasterCanvas,
      durationInFrames: lesson.meta.durationInFrames,
      fps: lesson.meta.fps,
      width: lesson.meta.width,
      height: lesson.meta.height,
      defaultProps: { lesson, includeAudio: false, includeCaptions: false },
      calculateMetadata,
    },
  ];
};

/** 章节自己的成片（每章在 `src/lessons/<id>/index.ts` 里导出并汇总到 registry）。 */

const LAB_COMPOSITIONS: CompositionSpec[] = [
  {
    id: "A5GateTrack",
    component: A5GateTrackLab,
    durationInFrames: A5_STAGES.reduce((a: number, b: { dur: number }) => a + b.dur, 0),
    fps: 30,
    width: 1920,
    height: 1080,
  },
  { id: "A7ExamQuiz", component: A7ExamQuizLab, durationInFrames: A7_TOTAL_FRAMES, fps: 30, width: 1920, height: 1080 },
  {
    id: "A8IdCard",
    component: A8IdCardLab,
    durationInFrames: A8_STAGES.reduce((a: number, b: { dur: number }) => a + b.dur, 0),
    fps: 30,
    width: 1920,
    height: 1080,
  },
  {
    id: "A9Mnemonic",
    component: A9MnemonicLab,
    durationInFrames: A9_STAGES.reduce((a: number, b: { dur: number }) => a + b.dur, 0),
    fps: 30,
    width: 1920,
    height: 1080,
  },
  {
    id: "A14Cards",
    component: A14CardsLab,
    durationInFrames: A14_STAGES.reduce((a: number, b: { dur: number }) => a + b.dur, 0),
    fps: 30,
    width: 1920,
    height: 1080,
  },
  {
    id: "A14Smoke",
    component: A14Smoke,
    durationInFrames: A14_STAGES.reduce((a: number, b: { dur: number }) => a + b.dur, 0),
    fps: 30,
    width: 1920,
    height: 1080,
  },
  { id: "A59Smoke", component: A59Smoke, durationInFrames: 900, fps: 30, width: 1920, height: 1080 },
  {
    id: "KitDemo",
    component: KitDemo,
    durationInFrames: KIT_STAGES.reduce((a: number, b) => a + b.dur, 0),
    fps: 30,
    width: 1920,
    height: 1080,
  },
  { id: "L02Preview", component: L02Preview, durationInFrames: L02_TOTAL_FRAMES, fps: 30, width: 1920, height: 1080 },
  { id: "L03Preview", component: L03Preview, durationInFrames: L03_TOTAL_FRAMES, fps: 30, width: 1920, height: 1080 },
];

/** 章节成片：每章两条（有声 / 静音），id 由 registry 给出。 */
const chapterCompositions = (): CompositionSpec[] =>
  LESSONS.flatMap(({ lesson, compositionIds }) => [
    {
      id: compositionIds.voiced,
      component: MasterCanvas,
      durationInFrames: lesson.meta.durationInFrames,
      fps: lesson.meta.fps,
      width: lesson.meta.width,
      height: lesson.meta.height,
      defaultProps: { lesson, includeAudio: true, includeCaptions: true },
    },
    {
      id: compositionIds.silent,
      component: MasterCanvas,
      durationInFrames: lesson.meta.durationInFrames,
      fps: lesson.meta.fps,
      width: lesson.meta.width,
      height: lesson.meta.height,
      defaultProps: { lesson, includeAudio: false, includeCaptions: false },
    },
  ]);

export const COMPOSITIONS: CompositionSpec[] = [
  ...lessonCompositions(defaultLesson),
  ...chapterCompositions(),
  ...CH06_COMPOSITIONS,
  ...LAB_COMPOSITIONS,
];
