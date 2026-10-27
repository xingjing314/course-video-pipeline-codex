/**
 * 第六章 L01 的全部既有入口：整课、有声/无声及分段审核预览。
 * 只集中声明入口；已审核的内容组件仍保留在上级目录，不改画面与时序。
 * 新增本课入口在此维护，保持现有 id 和排列顺序兼容。
 */
import type { CompositionSpec } from "../../composition-types";
import { Ch06L01Preview, CH06_PREVIEW_FRAMES } from "../L01Preview";
import { Ch06L01Quiz, CH06_QUIZ_FRAMES } from "../L01QuizPreview";
import { Ch06L01Structure, Ch06L01ValueLoop } from "../L01RelationsPreview";
import { Ch06L01Relations, CH06_RELATIONS_FRAMES } from "../L01RelationsLesson";
import { Ch06L01Quiz69, CH06_QUIZ69_FRAMES } from "../L01Quiz69Preview";
import {
  Ch06L01Environment,
  CH06_ENVIRONMENT_FRAMES,
} from "../L01EnvironmentPreview";
import { Ch06L01Systems, CH06_SYSTEMS_FRAMES } from "../L01SystemsPreview";
import {
  Ch06L01EnvironmentQuiz,
  CH06_ENVQUIZ_FRAMES,
} from "../L01EnvironmentQuiz";
import { Ch06L01Closing, CH06_CLOSING_FRAMES } from "../L01ClosingPreview";
import { Ch06L01Opening, CH06_OPENING_FRAMES } from "../L01OpeningPreview";
import { Ch06L01Traits, CH06_TRAITS_FRAMES } from "../L01TraitsPreview";
import { Ch06L01Success, CH06_SUCCESS_FRAMES } from "../L01SuccessPreview";
import { Ch06L01Full, CH06_FULL_FRAMES } from "../L01Full";

export const CH06_L01_COMPOSITIONS: CompositionSpec[] = [
  {
    id: "Ch06L01SilentClean",
    component: Ch06L01Full,
    durationInFrames: CH06_FULL_FRAMES,
    fps: 30,
    width: 1920,
    height: 1080,
    defaultProps: { includeAudio: false, includeCaptions: false },
  },
  {
    id: "Ch06L01Full",
    component: Ch06L01Full,
    durationInFrames: CH06_FULL_FRAMES,
    fps: 30,
    width: 1920,
    height: 1080,
  },
  {
    id: "Ch06L01Success",
    component: Ch06L01Success,
    durationInFrames: CH06_SUCCESS_FRAMES,
    fps: 30,
    width: 1920,
    height: 1080,
  },
  {
    id: "Ch06L01Traits",
    component: Ch06L01Traits,
    durationInFrames: CH06_TRAITS_FRAMES,
    fps: 30,
    width: 1920,
    height: 1080,
  },
  {
    id: "Ch06L01Opening",
    component: Ch06L01Opening,
    durationInFrames: CH06_OPENING_FRAMES,
    fps: 30,
    width: 1920,
    height: 1080,
  },
  {
    id: "Ch06L01Closing",
    component: Ch06L01Closing,
    durationInFrames: CH06_CLOSING_FRAMES,
    fps: 30,
    width: 1920,
    height: 1080,
  },
  {
    id: "Ch06L01EnvironmentQuiz",
    component: Ch06L01EnvironmentQuiz,
    durationInFrames: CH06_ENVQUIZ_FRAMES,
    fps: 30,
    width: 1920,
    height: 1080,
  },
  {
    id: "Ch06L01Systems",
    component: Ch06L01Systems,
    durationInFrames: CH06_SYSTEMS_FRAMES,
    fps: 30,
    width: 1920,
    height: 1080,
  },
  {
    id: "Ch06L01Environment",
    component: Ch06L01Environment,
    durationInFrames: CH06_ENVIRONMENT_FRAMES,
    fps: 30,
    width: 1920,
    height: 1080,
  },
  {
    id: "Ch06L01Quiz69",
    component: Ch06L01Quiz69,
    durationInFrames: CH06_QUIZ69_FRAMES,
    fps: 30,
    width: 1920,
    height: 1080,
  },
  {
    id: "Ch06L01Relations",
    component: Ch06L01Relations,
    durationInFrames: CH06_RELATIONS_FRAMES,
    fps: 30,
    width: 1920,
    height: 1080,
  },
  {
    id: "Ch06L01Quiz",
    component: Ch06L01Quiz,
    durationInFrames: CH06_QUIZ_FRAMES,
    fps: 30,
    width: 1920,
    height: 1080,
  },
  {
    id: "Ch06L01Structure",
    component: Ch06L01Structure,
    durationInFrames: 300,
    fps: 30,
    width: 1920,
    height: 1080,
  },
  {
    id: "Ch06L01ValueLoop",
    component: Ch06L01ValueLoop,
    durationInFrames: 300,
    fps: 30,
    width: 1920,
    height: 1080,
  },
  {
    id: "Ch06L01Preview",
    component: Ch06L01Preview,
    durationInFrames: CH06_PREVIEW_FRAMES,
    fps: 30,
    width: 1920,
    height: 1080,
  },
];
