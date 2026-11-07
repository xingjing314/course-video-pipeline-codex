import React from "react";
import { AbsoluteFill, Sequence, interpolateColors, useCurrentFrame, useVideoConfig } from "remotion";
import { ExamQuizCard, DualQuizBattleCard, CompactQuizCard, BriefQuizCard, QUIZ_COLORS } from "../../visual/templates/quiz";
import { ExamAnalysis } from "./ExamAnalysis";
import { HeaderBreadcrumb } from "../../visual/shell/HeaderBreadcrumb";
import { quizFade } from "../../visual/templates/quiz-presentation";
import { TechNetwork } from "../../visual/backgrounds/tech-network/TechNetwork";
import { techNetworkSchema } from "../../visual/backgrounds/tech-network/schema";
import { examQuestion, examAnchors, sequence, records, briefCards, examTiming, examPresentation, dualTiming,
  dualPresentation, compactTiming, compactPresentation, DURATIONS } from "./data";

const background = techNetworkSchema.parse({ type: "tech-network", ganttEnabled: false,
  linkOpacity: 0.035, nodeOpacity: 0.06, highlightCoreOpacity: 0.1, highlightGlowOpacity: 0.06 });

// 两题只转移边框与底色，题面文字保持可读；0.2 秒与选项过渡一致。
const useHandoff = (from: number, paper = false) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = quizFade(frame, from, Math.round(fps * 0.2));
  const style = (weight: number): React.CSSProperties => ({
    borderColor: interpolateColors(weight, [0, 1], ["#304762", QUIZ_COLORS.focus]),
    background: interpolateColors(weight, [0, 1], paper ? ["#081329", "#0B1C32"] : ["#0A172D", "#10283B"]),
  });
  return { left: style(1 - progress), right: style(progress) };
};

export const ExamExample: React.FC = () => <AbsoluteFill style={{ background: "#0B1A33", fontFamily: '"Noto Sans CJK SC", sans-serif' }}>
  <TechNetwork {...background} />
  <HeaderBreadcrumb lessonId="CH10-L01" lessonTitle="进度管理全景与“先立规矩”：规划进度管理"
    sceneId="S07" sceneOrder={7} totalScenes={10} segmentTitle="真题：进度管理计划的概述" />
  <ExamQuizCard payload={examQuestion} timing={examTiming} presentation={examPresentation}
    variant="paper" withShell={false} analysisSlot={<ExamAnalysis />} analysisFromFrame={examAnchors.explainA} />
</AbsoluteFill>;

export const DualExample: React.FC = () => {
  const cardStyles = useHandoff(420, true);
  return <AbsoluteFill style={{ background: "#0B1A33", fontFamily: '"Noto Sans CJK SC", sans-serif' }}>
    <TechNetwork {...background} />
    <HeaderBreadcrumb lessonId="练习" lessonTitle="约定的执行与记录"
      sceneId="双题" sceneOrder={2} totalScenes={4} segmentTitle="先后顺序 · 保留依据" />
    <DualQuizBattleCard payload={{ title: "双题对照", leftQuiz: sequence, rightQuiz: records }}
      timing={dualTiming} presentation={dualPresentation} cardStyles={cardStyles}
      variant="paper" withShell={false} />
  </AbsoluteFill>;
};

const relativeCard: React.CSSProperties = { position: "relative", left: 0, top: 0, width: "100%" };
export const CompactExample: React.FC = () => {
  const focus = useHandoff(390, true);
  return <AbsoluteFill style={{ background: "#0B1A33", fontFamily: '"Noto Sans CJK SC", sans-serif' }}>
    <TechNetwork {...background} />
    <HeaderBreadcrumb lessonId="练习" lessonTitle="约定的执行与记录"
      sceneId="紧凑" sceneOrder={3} totalScenes={4} segmentTitle="先后顺序 · 保留依据" />
    <div style={{ position: "absolute", left: 120, top: 155, width: 1680, display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 40, alignItems: "start" }}>
      <CompactQuizCard payload={sequence} timing={compactTiming.left} presentation={compactPresentation}
        variant="paper" style={{ ...relativeCard, ...focus.left }} />
      <CompactQuizCard payload={records} timing={compactTiming.right} presentation={{}}
        variant="paper" style={{ ...relativeCard, ...focus.right }} />
    </div>
  </AbsoluteFill>;
};

export const BriefExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const transition = Math.round(fps * 0.2);
  return <AbsoluteFill style={{ background: "#0B1A33", fontFamily: '"Noto Sans CJK SC", sans-serif' }}>
    <TechNetwork {...background} />
    <HeaderBreadcrumb lessonId="练习" lessonTitle="时间、计算与长度换算"
      sceneId="四题" sceneOrder={4} totalScenes={4} segmentTitle="基础知识小练习" />
    <div style={{ position: "absolute", left: 120, top: 155, width: 1680, display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 40, alignItems: "start" }}>
      {briefCards.map((item, index) => {
        const current = (index === 0 ? 1 : quizFade(frame, item.startFrame, transition))
          * (1 - quizFade(frame, briefCards[index + 1]?.startFrame ?? Infinity, transition));
        return <BriefQuizCard key={item.question.examMeta} payload={item.question} timing={item.timing}
          variant="paper" presentation={{}} bodySize={24} optionSize={20}
          style={{ ...relativeCard,
            borderColor: interpolateColors(current, [0, 1], ["#304762", QUIZ_COLORS.focus]),
            background: interpolateColors(current, [0, 1], ["#081329", "#0B1C32"]),
          }} />;
      })}
    </div>
  </AbsoluteFill>;
};

export const QuizShowcase: React.FC = () => <>
  <Sequence durationInFrames={DURATIONS.exam}><ExamExample /></Sequence>
  <Sequence from={DURATIONS.exam} durationInFrames={DURATIONS.dual}><DualExample /></Sequence>
  <Sequence from={DURATIONS.exam + DURATIONS.dual} durationInFrames={DURATIONS.compact}><CompactExample /></Sequence>
  <Sequence from={DURATIONS.exam + DURATIONS.dual + DURATIONS.compact} durationInFrames={DURATIONS.brief}><BriefExample /></Sequence>
</>;
