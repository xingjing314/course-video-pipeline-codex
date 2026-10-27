import React from "react";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { TechNetwork } from "../../visual/backgrounds/tech-network/TechNetwork";
import { techNetworkSchema } from "../../visual/backgrounds/tech-network/schema";
import {L01Captions as CaptionsOverlay} from "./L01FullPlayback";
import {L01Header as HeaderBreadcrumb, L01Audio as Audio} from "./L01FullPlayback";
import { L01Definition } from "./L01Definition";
import { L01StateChange } from "./L01StateChange";
import timing from "./l01-preview-timing.json";
import audio from "../../../workspaces/ch06-L01-preview/audio-timeline.json";

const background = techNetworkSchema.parse({ type: "tech-network", ganttEnabled: false, linkOpacity: 0.055, nodeOpacity: 0.09, highlightCoreOpacity: 0.22, highlightGlowOpacity: 0.12, highlightLinkOpacity: 0.09 });

export const CH06_PREVIEW_FRAMES = timing.totalFrames;

export const Ch06L01Preview: React.FC<{showProgress?:boolean}> = ({showProgress=true}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ color: "#EAF2FA", fontFamily: '"Noto Sans CJK SC", sans-serif', background: "#081426" }}>
      <TechNetwork {...background} />
      <HeaderBreadcrumb lessonId="ch06-L01" lessonTitle="第 6 章 项目管理概论 · L01" sceneId={frame < timing.splitFrame ? "D01" : "D02"} sceneOrder={frame < timing.splitFrame ? 1 : 2} totalScenes={2} segmentTitle={frame < timing.splitFrame ? "项目的定义" : "组织状态转换"} />
      <Audio src={staticFile("audio/ch06-L01-preview/narration.wav")} />
      <Sequence name="定义：独特与临时" from={0} durationInFrames={timing.splitFrame} premountFor={fps}>
        <L01Definition />
      </Sequence>
      <Sequence name="项目驱动组织状态转换" from={timing.splitFrame} durationInFrames={timing.totalFrames - timing.splitFrame} premountFor={fps}>
        <L01StateChange />
      </Sequence>
      <CaptionsOverlay captions={audio.captions} />
      {showProgress && <div style={{ position: "absolute", bottom: 0, left: 0, height: 3, width: `${100 * frame / (durationInFrames - 1)}%`, background: "#46D6E3", opacity: 0.65 }} />}
    </AbsoluteFill>
  );
};
