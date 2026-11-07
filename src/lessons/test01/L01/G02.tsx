import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { TechNetwork } from "../../../visual/backgrounds/tech-network/TechNetwork";
import { techNetworkSchema } from "../../../visual/backgrounds/tech-network/schema";
import { HeaderBreadcrumb } from "../../../visual/shell/HeaderBreadcrumb";
import { CaptionsOverlay } from "../../../visual/shell/CaptionsOverlay";
import { g02Phase, type G02Preview } from "./g02-timing";

const background = techNetworkSchema.parse({
  type: "tech-network",
  ganttEnabled: false,
  linkOpacity: 0.035,
  nodeOpacity: 0.06,
  highlightCoreOpacity: 0.1,
  highlightGlowOpacity: 0.06,
});

const text = "#E6F1FA";
const muted = "#8FB8D9";
const cyan = "#2EC4D6";

export const Test01L01G02: React.FC<G02Preview> = ({
  timeline,
  cues,
  includeAudio = true,
  includeCaptions = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (frame / fps) * 1000;
  const phase = g02Phase(ms, cues);
  const showPapers = phase !== "focus";
  const showNine = phase === "questions";
  const audioSrc = timeline.fullWavPath.replace(/^public\//u, "");

  return (
    <AbsoluteFill style={{ fontFamily: '"Noto Sans CJK SC", sans-serif', color: text }}>
      <TechNetwork {...background} />
      <HeaderBreadcrumb
        lessonId="test01-L01"
        lessonTitle="第6章第3课"
        sceneId="S02"
        sceneOrder={2}
        totalScenes={4}
        segmentTitle="密在哪一个小节"
      />
      {includeAudio && audioSrc ? <Audio src={staticFile(audioSrc)} /> : null}
      <div style={{ position: "absolute", left: 96, right: 96, top: 128, height: 750 }}>
        <div
          style={{
            padding: "22px 28px",
            borderRadius: 22,
            border: "2px solid rgba(143,184,217,0.4)",
            background: "rgba(8, 22, 42, 0.55)",
            color: muted,
          }}
        >
          <span style={{ fontSize: 22 }}>6.4</span>
          <span style={{ marginLeft: 16, fontSize: 28 }}>价值驱动的项目管理知识体系</span>
        </div>
        <div
          style={{
            marginTop: 22,
            marginLeft: 56,
            padding: "28px 32px 32px",
            borderRadius: 24,
            border: `2px solid ${cyan}`,
            background: "rgba(46,196,214,0.1)",
          }}
        >
          <div style={{ fontSize: 24, color: cyan }}>6.4.1</div>
          <div style={{ marginTop: 6, fontSize: 36, fontWeight: 700 }}>12 个项目管理原则</div>
          <div style={{ marginTop: 28, opacity: showPapers ? 1 : 0 }}>
            <div style={{ fontSize: 28, color: showNine ? muted : text }}>11 套试卷</div>
            <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
              {Array.from({ length: 11 }, (_, index) => {
                const chosen = showNine && index < 9;
                return (
                  <div
                    key={index}
                    style={{
                      width: 72,
                      height: 96,
                      borderRadius: 10,
                      border: `2px solid ${chosen ? cyan : "rgba(143,184,217,0.55)"}`,
                      background: chosen ? "rgba(46,196,214,0.28)" : "rgba(6,14,31,0.35)",
                    }}
                  />
                );
              })}
            </div>
            <div style={{ marginTop: 18, fontSize: 32, fontWeight: 700, color: cyan, opacity: showNine ? 1 : 0 }}>
              9 道选择题
            </div>
          </div>
        </div>
      </div>
      {includeCaptions ? <CaptionsOverlay captions={timeline.captions} /> : null}
    </AbsoluteFill>
  );
};
