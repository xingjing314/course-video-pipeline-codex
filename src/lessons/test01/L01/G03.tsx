import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { TechNetwork } from "../../../visual/backgrounds/tech-network/TechNetwork";
import { techNetworkSchema } from "../../../visual/backgrounds/tech-network/schema";
import { HeaderBreadcrumb } from "../../../visual/shell/HeaderBreadcrumb";
import { G03_DURATION_FRAMES, G03_INTRO_SECONDS, G03_ROW_SECONDS } from "./durations";

const cyan = "#46D6E3";
const text = "#E6F1FA";
const muted = "#8FB8D9";
const background = techNetworkSchema.parse({
  type: "tech-network",
  ganttEnabled: false,
  linkOpacity: 0.035,
  nodeOpacity: 0.06,
  highlightCoreOpacity: 0.1,
  highlightGlowOpacity: 0.06,
});

/** 教材 6.4.1 开篇顺序。只报名称。 */
const names = [
  "勤勉、尊重和关心他人",
  "营造协作的项目管理团队环境",
  "促进干系人有效参与",
  "聚焦于价值",
  "识别、评估和响应系统交互",
  "展现领导力行为",
  "根据环境进行裁剪",
  "将质量融入到过程和成果中",
  "驾驭复杂性",
  "优化风险应对",
  "拥抱适应性和韧性",
  "为实现目标而驱动变革",
];

const introSeconds = G03_INTRO_SECONDS;
const rowSeconds = G03_ROW_SECONDS;
export { G03_DURATION_FRAMES };

export const Test01L01G03: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const easing = Easing.bezier(0.22, 1, 0.36, 1);
  const ramp = (start: number) => interpolate(seconds, [start, start + 0.4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });
  const appear = ramp(0);
  const columns = [names.slice(0, 6), names.slice(6)];

  return (
    <AbsoluteFill style={{ background: "#081426", color: text, fontFamily: '"Noto Sans CJK SC", sans-serif' }}>
      <TechNetwork {...background} />
      <HeaderBreadcrumb
        lessonId="test01-L01"
        lessonTitle="第6章第3课"
        sceneId="S03"
        sceneOrder={3}
        totalScenes={4}
        segmentTitle="十二条只报名称"
      />
      <div style={{ position: "absolute", left: 96, top: 118, fontSize: 22, letterSpacing: 2, color: muted }}>6.4.1 · 只看名称</div>
      <div style={{ position: "absolute", left: 96, top: 156, fontSize: 42, fontWeight: 700 }}>十二条原则</div>
      <div style={{ position: "absolute", left: 96, right: 96, top: 240, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36, opacity: appear }}>
        {columns.map((column, columnIndex) => (
          <div key={columnIndex} style={{ border: "1.5px solid #46D6E34D", borderRadius: 20, overflow: "hidden", background: "#10213466" }}>
            {column.map((name, rowIndex) => {
              const order = columnIndex * 6 + rowIndex + 1;
              const start = introSeconds + (order - 1) * rowSeconds;
              const focus = ramp(start) * (order === names.length ? 1 : 1 - ramp(start + rowSeconds));
              return (
                <div key={name} style={{ position: "relative", display: "flex", alignItems: "center", height: 92, padding: "0 28px", borderTop: rowIndex ? "1px solid #8FB8D92A" : undefined }}>
                  <div style={{ position: "absolute", inset: 0, background: "#46D6E316", borderTop: "1px solid #46D6E3A0", borderBottom: "1px solid #46D6E3A0", opacity: focus }} />
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 5, background: cyan, opacity: focus }} />
                  <span style={{ position: "relative", width: 64, fontSize: 28, fontWeight: 700, color: cyan }}>{order}</span>
                  <span style={{ position: "relative", fontSize: 30, lineHeight: 1.4 }}>{name}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
