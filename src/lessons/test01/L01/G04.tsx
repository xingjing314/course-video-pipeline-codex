import React from "react";
import { AbsoluteFill } from "remotion";
import type { ExamQuizPayload } from "../../../../contracts/visual-props.schema";
import { TechNetwork } from "../../../visual/backgrounds/tech-network/TechNetwork";
import { techNetworkSchema } from "../../../visual/backgrounds/tech-network/schema";
import { HeaderBreadcrumb } from "../../../visual/shell/HeaderBreadcrumb";
import { ExamQuizCard, QUIZ_THINK_SECONDS } from "../../../visual/templates/quiz";
import { FPS, G04_DURATION_FRAMES, G04_HOLD_SECONDS, G04_STEM_SECONDS, G04_THINK_SECONDS } from "./durations";

const background = techNetworkSchema.parse({
  type: "tech-network",
  ganttEnabled: false,
  linkOpacity: 0.035,
  nodeOpacity: 0.06,
  highlightCoreOpacity: 0.1,
  highlightGlowOpacity: 0.06,
});

if (QUIZ_THINK_SECONDS !== G04_THINK_SECONDS) {
  throw new Error(`题卡思考时长已变为 ${QUIZ_THINK_SECONDS}s，与 G04 的 ${G04_THINK_SECONDS}s 不一致。`);
}
/** 无配音演示：先给完整题面，再思考 3 秒，然后揭晓。这些帧不是正式口播锚点。 */
const stemEndFrame = G04_STEM_SECONDS * FPS;
const revealFrame = stemEndFrame + G04_THINK_SECONDS * FPS;
const holdFrames = G04_HOLD_SECONDS * FPS;
export { G04_DURATION_FRAMES };

/** 2023年5月信息系统项目管理师选择题第19题。答案 C。 */
const question: ExamQuizPayload = {
  title: "驾驭复杂性",
  examMeta: "2023年5月 · 第19题",
  stemHighlights: [],
  polarity: "negative",
  stem: "关于项目管理原则中“驾驭复杂性”原则的描述不正确的是（　）。",
  options: [
    { key: "A", text: "复杂性可能在项目生命周期的任何时间出现", isCorrect: true },
    { key: "B", text: "影响价值，沟通，技术风险的因素都可能造成复杂性", isCorrect: true },
    {
      key: "C",
      text: "项目团队能够实现预测未来复杂性的出现并分析其原因",
      isCorrect: false,
      errorHighlight: "能够实现预测未来复杂性的出现并分析其原因",
    },
    { key: "D", text: "复杂性是由系统交互，不确定性和模糊性等造成的", isCorrect: true },
  ],
};

export const Test01L01G04: React.FC = () => (
  <AbsoluteFill style={{ background: "#0B1A33", fontFamily: '"Noto Sans CJK SC", sans-serif' }}>
    <TechNetwork {...background} />
    <HeaderBreadcrumb
      lessonId="test01-L01"
      lessonTitle="第6章第3课"
      sceneId="S04"
      sceneOrder={4}
      totalScenes={4}
      segmentTitle="一题试题卡"
    />
    <ExamQuizCard
      variant="paper"
      withShell={false}
      payload={question}
      timing={{ stemEndFrame, revealFrame }}
      presentation={{
        transitionSeconds: 0.2,
        judgements: [{ targetId: "C", from: revealFrame, label: "与教材相反" }],
        explanations: [{
          text: "C把难以预见、难以分离原因的复杂性说成可以事先预测并分析原因，与教材相反。",
          from: revealFrame,
        }],
      }}
    />
  </AbsoluteFill>
);
