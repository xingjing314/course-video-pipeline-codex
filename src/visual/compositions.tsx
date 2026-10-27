/**
 * Composition 注册表。
 *
 * 目的：`Root.tsx` 不再逐条手写 `<Composition>`，而是遍历这张表。
 * 加一课/加一个评审片 = 往这里加一条，`Root` 一行不改。
 *
 * 章节自己的 composition（课时成片）由 `src/lessons/<chapter>/index.ts` 导出，
 * 经 `LESSON_COMPOSITIONS` 汇总进来；评审片与冒烟片属于原型，放在本文件底部。
 */
import React from "react";
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
import { Ch06L01Preview, CH06_PREVIEW_FRAMES } from "../lessons/ch06/L01Preview";
import { Ch06L01Quiz, CH06_QUIZ_FRAMES } from "../lessons/ch06/L01QuizPreview";
import { Ch06L01Structure, Ch06L01ValueLoop } from "../lessons/ch06/L01RelationsPreview";
import { Ch06L01Relations, CH06_RELATIONS_FRAMES } from "../lessons/ch06/L01RelationsLesson";
import { Ch06L01Quiz69, CH06_QUIZ69_FRAMES } from "../lessons/ch06/L01Quiz69Preview";
import { Ch06L01Environment, CH06_ENVIRONMENT_FRAMES } from "../lessons/ch06/L01EnvironmentPreview";
import { Ch06L01Systems, CH06_SYSTEMS_FRAMES } from "../lessons/ch06/L01SystemsPreview";
import { Ch06L01EnvironmentQuiz, CH06_ENVQUIZ_FRAMES } from "../lessons/ch06/L01EnvironmentQuiz";
import { Ch06L01Closing, CH06_CLOSING_FRAMES } from "../lessons/ch06/L01ClosingPreview";
import { Ch06L01Opening, CH06_OPENING_FRAMES } from "../lessons/ch06/L01OpeningPreview";
import { Ch06L01Traits, CH06_TRAITS_FRAMES } from "../lessons/ch06/L01TraitsPreview";
import { Ch06L01Success, CH06_SUCCESS_FRAMES } from "../lessons/ch06/L01SuccessPreview";
import {Ch06L01Full, CH06_FULL_FRAMES} from "../lessons/ch06/L01Full";
import currentLessonRaw from "../../workspaces/current-lesson.json";

import { L02_TOTAL_FRAMES } from "../lessons/ch07/l02-shot-table";

const defaultLesson = CompiledLessonSchema.parse(currentLessonRaw) as CompiledLesson;

export type CompositionSpec = {
  id: string;
  component: React.FC<any>;
  durationInFrames: number;
  fps: number;
  width: number;
  height: number;
  defaultProps?: Record<string, unknown>;
  calculateMetadata?: CalculateMetadataFunction<any>;
};

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
  {id:"Ch06L01SilentClean",component:Ch06L01Full,durationInFrames:CH06_FULL_FRAMES,fps:30,width:1920,height:1080,defaultProps:{includeAudio:false,includeCaptions:false}},
  {id:"Ch06L01Full",component:Ch06L01Full,durationInFrames:CH06_FULL_FRAMES,fps:30,width:1920,height:1080},
  { id: "Ch06L01Success", component: Ch06L01Success, durationInFrames: CH06_SUCCESS_FRAMES, fps: 30, width: 1920, height: 1080 },
  { id: "Ch06L01Traits", component: Ch06L01Traits, durationInFrames: CH06_TRAITS_FRAMES, fps: 30, width: 1920, height: 1080 },
  { id: "Ch06L01Opening", component: Ch06L01Opening, durationInFrames: CH06_OPENING_FRAMES, fps: 30, width: 1920, height: 1080 },
  { id: "Ch06L01Closing", component: Ch06L01Closing, durationInFrames: CH06_CLOSING_FRAMES, fps: 30, width: 1920, height: 1080 },
  { id: "Ch06L01EnvironmentQuiz", component: Ch06L01EnvironmentQuiz, durationInFrames: CH06_ENVQUIZ_FRAMES, fps: 30, width: 1920, height: 1080 },
  { id: "Ch06L01Systems", component: Ch06L01Systems, durationInFrames: CH06_SYSTEMS_FRAMES, fps: 30, width: 1920, height: 1080 },
  { id: "Ch06L01Environment", component: Ch06L01Environment, durationInFrames: CH06_ENVIRONMENT_FRAMES, fps: 30, width: 1920, height: 1080 },
  { id: "Ch06L01Quiz69", component: Ch06L01Quiz69, durationInFrames: CH06_QUIZ69_FRAMES, fps: 30, width: 1920, height: 1080 },
  { id: "Ch06L01Relations", component: Ch06L01Relations, durationInFrames: CH06_RELATIONS_FRAMES, fps: 30, width: 1920, height: 1080 },
  { id: "Ch06L01Quiz", component: Ch06L01Quiz, durationInFrames: CH06_QUIZ_FRAMES, fps: 30, width: 1920, height: 1080 },
  { id: "Ch06L01Structure", component: Ch06L01Structure, durationInFrames: 300, fps: 30, width: 1920, height: 1080 },
  { id: "Ch06L01ValueLoop", component: Ch06L01ValueLoop, durationInFrames: 300, fps: 30, width: 1920, height: 1080 },
  { id: "Ch06L01Preview", component: Ch06L01Preview, durationInFrames: CH06_PREVIEW_FRAMES, fps: 30, width: 1920, height: 1080 },
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
  ...LAB_COMPOSITIONS,
];
