/**
 * 底部口播字幕轨（CaptionsOverlay）。
 *
 * 仅在 includeCaptions=true（有声带口播字幕版）时挂载；
 * 严格固定在画布底部安全槽（bottom: 36px），绝不侵入上方 110~900px 的教学舞台区。
 */
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { CaptionSegment } from "../../../contracts/audio-timeline.schema";
import { BASE_COLORS, resolveTone, rgba } from "../tokens/colorCard";

export const CaptionsOverlay: React.FC<{ captions: CaptionSegment[] }> = ({ captions }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nowMs = (frame / fps) * 1000;

  const active = captions.find((item) => nowMs >= item.startMs && nowMs < item.endMs);
  if (!active) return null;

  const cyan = resolveTone("cyan");

  return (
    <div
      style={{
        position: "absolute",
        left: 160,
        right: 160,
        bottom: 34,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 20,
      }}
    >
      <div
        style={{
          maxWidth: 1520,
          padding: "12px 30px",
          borderRadius: 14,
          background: "rgba(4, 10, 24, 0.86)",
          border: `1.5px solid ${rgba(cyan.rgb, 0.42)}`,
          boxShadow: "0 8px 28px rgba(0, 0, 0, 0.45)",
          color: BASE_COLORS.text,
          fontSize: 28,
          fontWeight: 600,
          letterSpacing: 0.8,
          textAlign: "center",
          lineHeight: 1.4,
        }}
      >
        {active.text}
      </div>
    </div>
  );
};
