import React from "react";
import { AbsoluteFill } from "remotion";
import { CaptionsOverlay } from "../shell/CaptionsOverlay";

export const CaptionStill: React.FC<{ text: string }> = ({ text }) => (
  <AbsoluteFill style={{ fontFamily: '"Noto Sans CJK SC", "Source Han Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif' }}>
    <CaptionsOverlay captions={text ? [{ index: 1, sceneId: "caption-export", text, startMs: 0, endMs: 1000 }] : []} />
  </AbsoluteFill>
);
