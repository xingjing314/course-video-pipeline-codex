import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { TechNetwork } from "../../../visual/backgrounds/tech-network/TechNetwork";
import { techNetworkSchema } from "../../../visual/backgrounds/tech-network/schema";
import { HeaderBreadcrumb } from "../../../visual/shell/HeaderBreadcrumb";
import { CaptionsOverlay } from "../../../visual/shell/CaptionsOverlay";
import { g01Phase, type G01Preview } from "./g01-timing";

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
const gold = "#E0B050";

export const Test01L01G01: React.FC<G01Preview> = ({
  timeline,
  cues,
  includeAudio = true,
  includeCaptions = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (frame / fps) * 1000;
  const phase = g01Phase(ms, cues);
  const innerOn = phase === "inner";
  const outerOn = phase === "outer" || innerOn;
  const audioSrc = timeline.fullWavPath.replace(/^public\//u, "");

  return (
    <AbsoluteFill style={{ fontFamily: '"Noto Sans CJK SC", sans-serif', color: text }}>
      <TechNetwork {...background} />
      <HeaderBreadcrumb
        lessonId="test01-L01"
        lessonTitle="第6章第3课"
        sceneId="S01"
        sceneOrder={1}
        totalScenes={4}
        segmentTitle="这一课在讲哪一块"
      />
      {includeAudio && audioSrc ? <Audio src={staticFile(audioSrc)} /> : null}
      <div style={{ position: "absolute", left: 96, right: 96, top: 140, height: 740, display: "flex", gap: 48 }}>
        <section
          style={{
            width: 520,
            alignSelf: "center",
            padding: "36px 40px",
            borderRadius: 24,
            background: "rgba(8, 22, 42, 0.82)",
            border: `2px solid ${phase === "locate" ? cyan : "rgba(46,196,214,0.45)"}`,
          }}
        >
          <div style={{ fontSize: 28, color: muted, letterSpacing: 2 }}>第 6 章</div>
          <div style={{ marginTop: 12, fontSize: 64, fontWeight: 700, lineHeight: 1.15 }}>第 3 课</div>
          <div
            style={{
              marginTop: 28,
              display: "inline-block",
              padding: "8px 16px",
              borderRadius: 999,
              color: gold,
              border: `1px solid ${gold}`,
              fontSize: 26,
              opacity: phase === "locate" ? 0 : 1,
            }}
          >
            第一高频霸主区
          </div>
        </section>
        <section style={{ flex: 1, display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: "100%",
              minHeight: 460,
              padding: 36,
              borderRadius: 28,
              background: "rgba(8, 22, 42, 0.72)",
              border: `2px solid ${outerOn && !innerOn ? cyan : "rgba(143,184,217,0.45)"}`,
              opacity: outerOn ? 1 : 0,
            }}
          >
            <div style={{ fontSize: 26, color: cyan }}>6.4</div>
            <div style={{ marginTop: 8, fontSize: 36, fontWeight: 650, lineHeight: 1.35 }}>价值驱动的项目管理知识体系</div>
            <div
              style={{
                marginTop: 36,
                marginLeft: 48,
                padding: "28px 32px",
                borderRadius: 20,
                background: innerOn ? "rgba(46,196,214,0.12)" : "rgba(6, 14, 31, 0.45)",
                border: `2px solid ${innerOn ? cyan : "rgba(143,184,217,0.35)"}`,
                opacity: outerOn ? 1 : 0,
              }}
            >
              <div style={{ fontSize: 24, color: innerOn ? cyan : muted }}>6.4.1</div>
              <div style={{ marginTop: 8, fontSize: 34, fontWeight: 650, lineHeight: 1.35 }}>12 个项目管理原则</div>
            </div>
          </div>
        </section>
      </div>
      {includeCaptions ? <CaptionsOverlay captions={timeline.captions} /> : null}
    </AbsoluteFill>
  );
};
