/** L03 段组件注册表 + 段容器（渲染顶部导航）。 */
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { HeaderBreadcrumb } from "../../visual/shell/HeaderBreadcrumb";
import { L03_SHOTS, l03ShotAt } from "./l03-shot-table";
import {
  OpeningSpan, PreStudyThreeSpan, PreStudyDetailsSpan, AssistDefineSpan, AssistSixSpan,
  DetailEnterSpan, FourPointsSpan, TwoMethodsSpan, WithWithoutSpan, PrecisionSpan,
  FinanceSpan, EconCompareSpan, Table71Span, EvalWhySpan, IronTriangleSpan,
  EvalBasisSpan, CharterTrapSpan, ProgramSixSpan, EvalContentSpan, OutlineSpan,
  ChapterMapSpan, Gate1Span, PrecisionPairSpan, HatsSpan, Gate4Span, CrystallizeSpan, ClosingSpan,
} from "./l03-extra";
import { DualPreStudySpan, QuadIntroSpan, T18Span, T33Span, T22Span, T46Span, T27Span } from "./l03-quizzes";

export const L03_SPANS: Record<string, React.FC> = {
  S01: OpeningSpan, S02: PreStudyThreeSpan, S03: PreStudyDetailsSpan, S04: AssistDefineSpan, S05: AssistSixSpan,
  "S06-S11": DualPreStudySpan,
  S12: DetailEnterSpan, S13: FourPointsSpan, S14: TwoMethodsSpan, S15: WithWithoutSpan, S16: PrecisionSpan,
  S17: FinanceSpan, S18: EconCompareSpan, S19: Table71Span, S20: EvalWhySpan, S21: IronTriangleSpan,
  S22: EvalBasisSpan, S23: CharterTrapSpan, S24: QuadIntroSpan,
  "S25-S27": T18Span, "S28-S30": T33Span, "S31-S33": T22Span, "S34-S36": T46Span,
  S37: ProgramSixSpan, S38: EvalContentSpan, S39: OutlineSpan,
  "S40-S43": T27Span,
  S44a: ChapterMapSpan, S44b: Gate1Span, S44c: PrecisionPairSpan, S44d: HatsSpan, S44e: Gate4Span,
  S45: CrystallizeSpan, S46: ClosingSpan,
};

export const L03Span: React.FC<{ payload: unknown }> = ({ payload }) => {
  const { span, offset } = payload as { span: string; offset: number };
  const frame = useCurrentFrame();
  const { shot, order } = l03ShotAt(offset + frame);
  const Span = L03_SPANS[span];
  if (!Span) throw new Error(`L03Span: 未知段键「${span}」，可选：${Object.keys(L03_SPANS).join(", ")}`);
  return (
    <AbsoluteFill>
      <HeaderBreadcrumb
        lessonId="ch07-L03"
        lessonTitle="第 7 章 项目立项管理 · L03"
        sceneId={shot.id}
        sceneOrder={order}
        totalScenes={L03_SHOTS.length}
        segmentTitle={shot.segment}
      />
      <Span />
    </AbsoluteFill>
  );
};
