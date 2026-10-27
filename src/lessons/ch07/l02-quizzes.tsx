/**
 * L02 真题四段（S15–S17 / S26–S29 / S36–S37 / S40–S41）。
 *
 * 全部复用 `exam-quiz` / `dual-quiz-battle` 两个模板，只写 payload 与 cue；
 * 不新增组件、不改公共代码。
 *
 * cue 的 localFrame 由 `l02-shot-table` 的估算镜长换算——配音落地后按真实音频重算。
 */
import React from "react";
import { Sequence } from "remotion";
import { ExamQuizCard } from "../../visual/templates/ExamQuizCard";
import { DualQuizBattleCard } from "../../visual/templates/DualQuizBattleCard";
import type {
  DualQuizBattlePayload,
  ExamQuizPayload,
  ResolvedCuePoint,
} from "../../../contracts/visual-props.schema";
import { L02_SHOTS } from "./l02-shot-table";
import cuesJson from "./l02-cues.json";

const shotFrame = (id: string) => L02_SHOTS.find((s) => s.id === id)!;

type CueRecord = ResolvedCuePoint & { sceneId?: string };
const CUES = cuesJson as Record<string, CueRecord[]>;

/** 取某段的 cue；`rebase` 用于段内第二个子序列（把绝对帧换算成子序列的本地帧）。 */
const cuesFor = (span: string, opts?: { scenes?: string[]; rebase?: number }): ResolvedCuePoint[] =>
  (CUES[span] ?? [])
    .filter((c) => !opts?.scenes || opts.scenes.includes(c.sceneId ?? ""))
    .map(({ sceneId, ...c }) => ({ ...c, localFrame: c.localFrame - (opts?.rebase ?? 0) }))
    .filter((c) => c.localFrame >= 0);

/* ───────────── S15–S17 · 2023年5月 第21题（人力资源 → 技术可行性） ───────────── */

const Q_T21: ExamQuizPayload = {
  title: "真题锚点：这属于哪个维度",
  subtitle: "先看题干到底在问什么——是人手，还是技术？",
  examMeta: "2023 年 5 月 · 第 21 题",
  stem: "可行性报告中，是否存在人力资源不足的问题，是否可以通过社会招聘或培训获得所需人员，属于（　）的内容。",
  stemHighlights: ["是否存在人力资源不足", "通过社会招聘或培训获得所需人员"],
  options: [
    { key: "A", text: "技术可行性分析", isCorrect: true },
    { key: "B", text: "经济可行性问题", isCorrect: false },
    { key: "C", text: "社会效益可行性分析", isCorrect: false },
    { key: "D", text: "运行环境可行性分析", isCorrect: false },
  ],
  tipBanner: "题干原话 ＝ 技术可行性分析「人力资源的有效性」",
};

const q21Start = shotFrame("S15").from;
const q21Cues = cuesFor("S15-S17");

export const QuizT21Span: React.FC = () => <ExamQuizCard payload={Q_T21} cues={q21Cues} />;

/* ───────────── S26–S29 · 23下1 T28 + 23下4 T22（+ 23下3 T22 迷你卡） ───────────── */

const Q_T28: ExamQuizPayload = {
  title: "经济可行性：哪一项描述错误",
  subtitle: "四个选项里有一项把两类支出混在了一起",
  examMeta: "2023 年 11 月 第 1 批次 · 第 28 题",
  stem: "关于经济可行性分析，描述错误的是（　）。",
  stemHighlights: [],
  options: [
    {
      key: "A",
      text: "一次性支出包括开发费、培训费、差旅费、软、硬件租金等费用",
      isCorrect: false,
      errorHighlight: "软、硬件租金",
      critiqueNote: "软硬件租金按期交租，属于非一次性支出",
    },
    { key: "B", text: "间接收益指通过项目实施降低了成本", isCorrect: true },
    { key: "C", text: "销售项目产品的收入属于直接收益", isCorrect: true },
    { key: "D", text: "收益投资比与投资回收期属于经济可行性分析", isCorrect: true },
  ],
  tipBanner: "设备购置费 = 一次性买断；软硬件租金 = 按期交租，绝不同类",
};

const Q_T22: ExamQuizPayload = {
  title: "经济可行性包括哪几项",
  subtitle: "先把四笔账的名称对上号",
  examMeta: "2023 年 11 月 第 4 批次 · 第 22 题",
  stem: "经济可行性分析具体包括支出分析、收益分析、投资回报分析以及（　）等。",
  stemHighlights: [],
  options: [
    { key: "A", text: "敏感性分析", isCorrect: true },
    { key: "B", text: "公共效益分析", isCorrect: false },
    { key: "C", text: "品牌效益分析", isCorrect: false },
    { key: "D", text: "技术创新效益分析", isCorrect: false },
  ],
  tipBanner: "第四笔账就是敏感性分析；B/C/D 全是社会效益的词",
};

const econStart = shotFrame("S26").from;
const t22Start = shotFrame("S28").from - econStart;
// T28 的 cue 以段起点为基准；T22 的 cue 要减去 t22Start（子序列本地帧）
const t28Cues = cuesFor("S26-S29", { scenes: ["S26", "S27"], rebase: 0 });
const t22Cues = cuesFor("S26-S29", { scenes: ["S28", "S29"], rebase: t22Start });

export const QuizEconomySpan: React.FC = () => {
  const t28Dur = shotFrame("S27").from + shotFrame("S27").duration - econStart;
  const allDur =
    shotFrame("S29").from + shotFrame("S29").duration - econStart;

  return (
    <>
      <Sequence from={0} durationInFrames={t28Dur} name="S26–S27 T28">
        <ExamQuizCard payload={Q_T28} cues={t28Cues} />
      </Sequence>
      <Sequence from={t22Start} durationInFrames={allDur - t22Start} name="S28–S29 T22">
        <ExamQuizCard payload={Q_T22} cues={t22Cues} />
      </Sequence>
    </>
  );
};

/* ───────────── S36–S37 · 双题对决 ───────────── */

const DUAL: DualQuizBattlePayload = {
  title: "同一组词，两条相反的考法",
  subtitle: "“人”和“技术”两组表述，换个提法就换一个维度",
  leftQuiz: {
    examMeta: "2023 年 11 月 第 1 批次 · 第 61 题",
    stem: "下列哪一项属于社会效益可行性研究的内容？",
    options: [
      { key: "A", text: "人力资源的有效性", isCorrect: false, critiqueNote: "属技术可行性" },
      { key: "B", text: "技术能力的可能性", isCorrect: false },
      { key: "C", text: "物资的可用性", isCorrect: false },
      { key: "D", text: "人员提升收益", isCorrect: true },
    ],
  },
  rightQuiz: {
    examMeta: "2026 年 5 月 第 2 批次 · 第 23 题",
    stem: "技术可行性分析考虑的因素不包括（　）。",
    options: [
      { key: "A", text: "人力资源的有效性", isCorrect: true },
      { key: "B", text: "物资的可用性", isCorrect: true },
      { key: "C", text: "技术能力的可能性", isCorrect: true },
      { key: "D", text: "技术创新效益", isCorrect: false, critiqueNote: "属社会效益" },
    ],
    extraNote: "“技术创新效益”属社会效益；其余三项都属技术可行性",
  },
};

const dualCues = cuesFor("S36-S37");

export const DualBattleSpan: React.FC = () => (
  <>
    <DualQuizBattleCard payload={DUAL} cues={dualCues} />
    {/* 模板正文偏上，下方留白用一条结论带补上（不占模板、不改公共代码） */}
    <div
      style={{
        position: "absolute",
        left: 96,
        top: 760,
        width: 1728,
        height: 84,
        borderRadius: 12,
        border: "1px solid rgba(46,196,214,0.45)",
        background: "rgba(46,196,214,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
        fontSize: 24,
        color: "#E6F1FA",
      }}
    >
      <span style={{ color: "#2EC4D6", fontWeight: 700 }}>人力资源的有效性 · 技术能力的可能性</span>
      <span>→ 技术可行性</span>
      <span style={{ color: "#8FB8D9" }}>｜</span>
      <span style={{ color: "#4CC38A", fontWeight: 700 }}>人员提升收益 · 技术创新效益</span>
      <span>→ 社会效益</span>
    </div>
  </>
);

/* ───────────── S40–S41 · 25上1 T58（四选项连四个维度） ───────────── */

const Q_T58: ExamQuizPayload = {
  title: "收官真题：四个选项，四个维度",
  subtitle: "一题串起今天讲的全部五顶帽子",
  examMeta: "2025 年 5 月 第 1 批次 · 第 58 题",
  stem: "在项目可行性分析的过程中，哪一项属于运行环境可行性分析的内容？",
  stemHighlights: [],
  options: [
    { key: "A", text: "项目能否为组织带来技术创新效益", isCorrect: false, critiqueNote: "社会效益" },
    { key: "B", text: "设备购置费是否超出预算", isCorrect: false, critiqueNote: "经济可行性" },
    { key: "C", text: "系统使用的开源协议是否符合商业目标", isCorrect: false, critiqueNote: "其他（法律）" },
    { key: "D", text: "用户的管理体制、人员素质及数据资源积累", isCorrect: true },
  ],
  tipBanner: "A 社会效益 · B 经济 · C 法律 · D 运行环境 —— 只有 D 对",
};

const t58Cues = cuesFor("S40-S41");

export const QuizT58Span: React.FC = () => <ExamQuizCard payload={Q_T58} cues={t58Cues} />;
