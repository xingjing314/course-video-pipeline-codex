import React from "react";
import type { CompiledScene } from "../../../contracts/compiled-lesson.schema";
import { AtomicCombo } from "./AtomicCombo/AtomicCombo";
import { ProcessTimeline } from "./ProcessTimeline";
import { LayeredArchitecture } from "./LayeredArchitecture";
import { TableTemplate } from "./TableTemplate";
import { TitleCard } from "./TitleCard";
import { MultiCards } from "./MultiCards";
import { FormulaCard } from "./FormulaCard";
import { BarChartCard } from "./BarChartCard";
import { ChapterMapCard } from "./ChapterMapCard";
import { RoadmapSummaryCard } from "./RoadmapSummaryCard";
import { ExamQuizCard } from "./ExamQuizCard";
import { DualQuizBattleCard } from "./DualQuizBattleCard";
import { A1ExamStats, A2Timeline, A3FourAccounts, A4ThreeSteps } from "./Cards14";
import { GateTrackScene, IdCardScene, MnemonicScene } from "./scene-adapters";
import type { ChapterModule } from "../../lessons/types";

/**
 * 两级查找：
 *   1. 通用 20 类（判别联合，穷尽检查保证不漏）；
 *   2. `chapter-local` → 查本章的组件表（由 MasterCanvas 从 registry 取出后下传）。
 *
 * 加一章不需要修改本文件。
 */
export const SceneRouter: React.FC<{ scene: CompiledScene; chapter?: ChapterModule }> = ({
  scene,
  chapter,
}) => {
  switch (scene.visualType) {
    case "atomic-combo":
      return <AtomicCombo payload={scene.payload} />;
    case "process-timeline":
      return <ProcessTimeline payload={scene.payload} />;
    case "layered-architecture":
      return <LayeredArchitecture payload={scene.payload} />;
    case "table":
      return <TableTemplate payload={scene.payload} />;
    case "title-card":
      return <TitleCard payload={scene.payload} />;
    case "multi-cards":
      return <MultiCards payload={scene.payload} />;
    case "formula-card":
      return <FormulaCard payload={scene.payload} />;
    case "bar-chart":
      return <BarChartCard payload={scene.payload} />;
    case "chapter-map":
      return <ChapterMapCard payload={scene.payload} />;
    case "roadmap-summary":
      return <RoadmapSummaryCard payload={scene.payload} />;
    case "exam-quiz":
      return <ExamQuizCard payload={scene.payload} cues={scene.cues} />;
    case "dual-quiz-battle":
      return <DualQuizBattleCard payload={scene.payload} cues={scene.cues} />;
    case "exam-stats":
      return <A1ExamStats payload={scene.payload} />;
    case "chapter-timeline":
      return <A2Timeline payload={scene.payload} />;
    case "four-accounts":
      return <A3FourAccounts payload={scene.payload} />;
    case "three-steps":
      return <A4ThreeSteps payload={scene.payload} />;
    case "gate-track":
      return <GateTrackScene payload={scene.payload} />;
    case "id-card":
      return <IdCardScene payload={scene.payload} />;
    case "mnemonic-card":
      return <MnemonicScene payload={scene.payload} />;
    case "chapter-local": {
      const key = scene.payload.key;
      const Chapter = chapter?.components[key];
      if (!Chapter) {
        throw new Error(
          `场景 ${scene.id} 引用了未注册的章节组件「${key}」` +
            `（lesson=${chapter?.lessonId ?? "未传入 chapter"}）。` +
            `请把组件挂到 src/lessons/<lessonId>/components.tsx 并登记到 registry。`,
        );
      }
      return <Chapter payload={scene.payload.data} cues={scene.cues} />;
    }
    default: {
      const exhaustive: never = scene;
      throw new Error(`未接入的场景视觉类型：${JSON.stringify(exhaustive)}`);
    }
  }
};
