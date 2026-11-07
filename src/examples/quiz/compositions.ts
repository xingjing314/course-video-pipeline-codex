import { ExamExample, DualExample, CompactExample, BriefExample, QuizShowcase } from "./Examples";
import { DURATIONS, FPS } from "./data";

// 总 Studio 与独立入口共用这份声明；不导入课程汇总。
const format = { fps: FPS, width: 1920, height: 1080 };
export const QUIZ_EXAMPLE_COMPOSITIONS = [
  { id: "QuizCardExam", component: ExamExample, durationInFrames: DURATIONS.exam, ...format },
  { id: "QuizCardDual", component: DualExample, durationInFrames: DURATIONS.dual, ...format },
  { id: "QuizCardCompact", component: CompactExample, durationInFrames: DURATIONS.compact, ...format },
  { id: "QuizCardBrief", component: BriefExample, durationInFrames: DURATIONS.brief, ...format },
  { id: "QuizShowcase", component: QuizShowcase, durationInFrames: DURATIONS.exam + DURATIONS.dual + DURATIONS.compact + DURATIONS.brief, ...format },
];
