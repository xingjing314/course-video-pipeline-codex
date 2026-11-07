import type { ExamQuizPayload } from "../../../contracts/visual-props.schema";
import { QUIZ_COLORS, QUIZ_THINK_SECONDS, type QuizPresentation, type QuizTiming } from "../../visual/templates/quiz";

/** Exam 采用 2024 年 5 月第二批次第 26 题；其余为自编最小示例。全片无配音：所有帧均为演示时序，不能照搬到课程。 */
export const FPS = 30;
export const DURATIONS = { exam: 1200, dual: 810, compact: 660, brief: 990 };
export const directTiming = (stemEndFrame: number): QuizTiming => ({
  stemEndFrame, revealFrame: stemEndFrame + QUIZ_THINK_SECONDS * FPS,
});

export const examQuestion: ExamQuizPayload = {
  title: "进度管理计划的概述", examMeta: "★ 2024年5月第2批次 · 第26题", stemHighlights: [], polarity: "negative",
  stem: "关于进度管理计划的概述，不正确的是（　）。",
  options: [
    { key: "A", text: "进度管理计划既可以是正式的也可以是非正式的，既可以是非常详细的也可以是高度概括的。", isCorrect: true },
    { key: "B", text: "项目管理计划中规定的偏差临界值，可以用于监督进度绩效，通常用偏离基准计划中的参数的某个百分数来表示。", isCorrect: true },
    { key: "C", text: "在采用适应型生命周期时，应指定进度管理计划发布，规划和迭代的固定时间段。", isCorrect: true },
    { key: "D", text: "进度管理计划描述如何定义、制定、监督、控制和确认项目范围，是项目管理计划的组成部分。", isCorrect: false,
      errorHighlight: "如何定义、制定、监督、控制和确认项目范围" },
  ],
};
// 明确的无配音演示时序：题干在 120 帧结束，先思考，再朗读选项和解析。
export const examTiming = { stemEndFrame: 120, revealFrame: 1050 };
export const examAnchors = { explainA: 660, explainB: 750, explainC: 840, explainD: 930 };
export const examPresentation: QuizPresentation = {
  focusColor: QUIZ_COLORS.evidence,
  focus: [
    { targetId: "A", from: 210, to: 300 }, { targetId: "B", from: 306, to: 420 },
    { targetId: "C", from: 426, to: 510 }, { targetId: "D", from: 516, to: 630 },
  ],
  judgements: [
    { targetId: "A", from: examAnchors.explainA, label: "✓ 教材真命题" },
    { targetId: "B", from: examAnchors.explainB, label: "✓ 教材真命题" },
    { targetId: "C", from: examAnchors.explainC, label: "✓ 教材真命题" },
    { targetId: "D", from: examAnchors.explainD, label: "✖ 偷换概念" },
  ],
};
export const examEvidence = [
  { key: "A", from: examAnchors.explainA, text: "形式具有高度灵活性（可正式/非正式、详细/概括），绝非一成不变。" },
  { key: "B", from: examAnchors.explainB, text: "精确对应第 7 项【控制临界值】，用偏离基准参数的某个百分数表示。" },
  { key: "C", from: examAnchors.explainC, text: "精确对应适应型生命周期，必须指定发布、规划和迭代的【固定时间段】。" },
];

export const sequence: ExamQuizPayload = {
  title: "先后顺序", examMeta: "自编示例 · 正向题", stemHighlights: [],
  stem: "按“先核查、再审批、后执行”的约定，哪组顺序正确？",
  options: [
    { key: "A", text: "核查 → 审批 → 执行", isCorrect: true },
    { key: "B", text: "执行 → 核查 → 审批", isCorrect: false },
    { key: "C", text: "审批 → 执行 → 核查", isCorrect: false },
    { key: "D", text: "执行 → 审批 → 核查", isCorrect: false },
  ],
};
export const records: ExamQuizPayload = {
  title: "保留依据", examMeta: "自编示例 · 对照题", stemHighlights: [],
  stem: "约定要求保留审批记录。以下哪项符合约定？",
  options: [
    { key: "A", text: "只保留口头印象", isCorrect: false },
    { key: "B", text: "完成后删除全部记录", isCorrect: false },
    { key: "C", text: "保存审批记录", isCorrect: true },
    { key: "D", text: "用个人猜测替代记录", isCorrect: false },
  ],
};
export const dualTiming = { left: { stemEndFrame: 90, revealFrame: 330 }, right: { stemEndFrame: 510, revealFrame: 720 } };
export const dualPresentation = {
  left: { focusColor: QUIZ_COLORS.evidence,
    focus: [{ targetId: "A", from: 180, to: 270 }], judgements: [{ targetId: "A", from: 285, label: "✓ 符合约定" }],
    explanations: [{ text: "按约定的三个步骤排列，A 符合顺序。", from: 285 }] },
  right: { focusColor: QUIZ_COLORS.evidence,
    focus: [{ targetId: "C", from: 600, to: 645 }], judgements: [{ targetId: "C", from: 660, label: "✓ 符合约定" }],
    explanations: [{ text: "题干要求保留记录，因此选择 C。", from: 660 }] },
} satisfies { left: QuizPresentation; right: QuizPresentation };
export const compactTiming = { left: { stemEndFrame: 90, revealFrame: 270 }, right: directTiming(480) };
export const compactPresentation: QuizPresentation = {
  focusColor: QUIZ_COLORS.evidence,
  focus: [{ targetId: "A", from: 180, to: 255 }],
  explanations: [{ text: "按照题干给出的顺序，答案为 A。", from: 270 }],
};

export const hour: ExamQuizPayload = {
  title: "时间换算", examMeta: "自编短题 01", stemHighlights: [], stem: "1 小时等于多少分钟？",
  options: [
    { key: "A", text: "30 分钟", isCorrect: false }, { key: "B", text: "60 分钟", isCorrect: true },
    { key: "C", text: "90 分钟", isCorrect: false }, { key: "D", text: "100 分钟", isCorrect: false },
  ],
};
export const addition: ExamQuizPayload = {
  title: "简短计算", examMeta: "自编短题 02", stemHighlights: [], stem: "2 + 3 的结果是多少？",
  options: [
    { key: "A", text: "4", isCorrect: false }, { key: "B", text: "6", isCorrect: false },
    { key: "C", text: "7", isCorrect: false }, { key: "D", text: "5", isCorrect: true },
  ],
};
const day: ExamQuizPayload = {
  title: "一天的时长", examMeta: "自编短题 03", stemHighlights: [], stem: "1 天等于多少小时？",
  options: [
    { key: "A", text: "12 小时", isCorrect: false }, { key: "B", text: "18 小时", isCorrect: false },
    { key: "C", text: "24 小时", isCorrect: true }, { key: "D", text: "36 小时", isCorrect: false },
  ],
};
const metre: ExamQuizPayload = {
  title: "长度换算", examMeta: "自编短题 04", stemHighlights: [], stem: "1 米等于多少厘米？",
  options: [
    { key: "A", text: "100 厘米", isCorrect: true }, { key: "B", text: "10 厘米", isCorrect: false },
    { key: "C", text: "60 厘米", isCorrect: false }, { key: "D", text: "1000 厘米", isCorrect: false },
  ],
};
// 无配音演示：依次读题 4 秒、立即思考 3 秒、揭晓后留 1 秒再交接。
export const briefCards = [
  { question: hour, startFrame: 0, timing: directTiming(120) },
  { question: addition, startFrame: 240, timing: directTiming(360) },
  { question: day, startFrame: 480, timing: directTiming(600) },
  { question: metre, startFrame: 720, timing: directTiming(840) },
];
