import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { CompositionSpec } from "../composition-types";
import { TechNetwork } from "../backgrounds/tech-network/TechNetwork";
import { techNetworkSchema } from "../backgrounds/tech-network/schema";
import { ExamQuizCard, DualQuizBattleCard, CompactQuizCard, BriefQuizCard } from "../templates/quiz";
import { SceneShell } from "../templates/shared";
import { Q2, Q3 } from "./ExamQuizLab";

const background = techNetworkSchema.parse({
  type: "tech-network", ganttEnabled: false, linkOpacity: 0.035, nodeOpacity: 0.06,
  highlightCoreOpacity: 0.1, highlightGlowOpacity: 0.06,
});

// 无配音的组件演示。正式课时用实际题干结束位置覆盖这些样例时间。
const firstTiming = { stemEndFrame: 120, revealFrame: 240 };
const secondTiming = { stemEndFrame: 420, revealFrame: 540 };
const compactCardStyle: React.CSSProperties = { position: "relative", left: 0, top: 0, width: "100%" };
type Kind = "exam" | "dual" | "compact" | "brief";

const QuizCardsPreview: React.FC<{ kind: Kind }> = ({ kind }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#0B1A33", fontFamily: '"Noto Sans CJK SC", sans-serif' }}>
      <TechNetwork {...background} />
      {kind === "exam" ? (
        <ExamQuizCard payload={{ ...Q2, subtitle: "读题 · 独立思考 · 讲解" }} timing={firstTiming} />
      ) : kind === "dual" ? (
        <DualQuizBattleCard
          payload={{ title: "双题对照", subtitle: "两道题分别思考与揭示", leftQuiz: Q2, rightQuiz: Q3 }}
          timing={{ left: firstTiming, right: secondTiming }}
        />
      ) : kind === "compact" ? (
        <SceneShell title="紧凑题卡" subtitle="当前讲解题与对照题并排呈现">
          <div style={{ position: "absolute", left: 96, top: 214, width: 1728, display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 68, alignItems: "stretch" }}>
            <CompactQuizCard payload={Q2} timing={firstTiming} active={frame < 300} style={compactCardStyle} />
            <CompactQuizCard payload={Q3} timing={secondTiming} active={frame >= 300} style={compactCardStyle} />
          </div>
        </SceneShell>
      ) : (
        <SceneShell title="简版题卡" subtitle="四卡布局，逐题思考">
          {[Q2, Q3, Q2, Q3].map((payload, index) => (
            <BriefQuizCard key={index} payload={payload}
              left={96 + (index % 2) * 888} top={220 + Math.floor(index / 2) * 290}
              width={840} height={260} bodySize={18} optionSize={16}
              timing={{ stemEndFrame: 120 + index * 300, revealFrame: 240 + index * 300 }}
            />
          ))}
        </SceneShell>
      )}
      <div style={{ position: "absolute", left: 96, bottom: 70, color: "#8FB8D9", fontSize: 20 }}>
        组件样式预览 · 无配音 · 演示中每题题干结束后倒数 3 秒，再按讲解时点揭示答案
      </div>
    </AbsoluteFill>
  );
};

export const QUIZ_CARD_PREVIEWS: CompositionSpec[] = [
  { id: "LegacyQuizCardExam", kind: "exam", durationInFrames: 360 },
  { id: "LegacyQuizCardDual", kind: "dual", durationInFrames: 660 },
  { id: "LegacyQuizCardCompact", kind: "compact", durationInFrames: 660 },
  { id: "LegacyQuizCardBrief", kind: "brief", durationInFrames: 1260 },
].map(({ id, kind, durationInFrames }) => ({
  id, component: QuizCardsPreview, defaultProps: { kind: kind as Kind },
  durationInFrames, fps: 30, width: 1920, height: 1080,
}));
