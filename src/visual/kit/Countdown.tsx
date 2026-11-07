import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { BASE_COLORS, resolveTone } from "../tokens/colorCard";

export type CountdownAppearance = {
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  labelStyle?: React.CSSProperties;
  numberSize?: number;
  showUnit?: boolean;
  ringInset?: number;
  style?: React.CSSProperties;
};

export type CountdownProps = CountdownAppearance & {
  /** 起止位置必须与当前 Sequence 使用同一局部帧坐标。 */
  startFrame: number;
  endFrame: number;
};

export const Countdown: React.FC<CountdownProps> = ({
  startFrame,
  endFrame,
  size = 64,
  strokeWidth = 5,
  color = resolveTone("gold").hex,
  trackColor = "rgba(143,184,217,0.22)",
  label, labelStyle, numberSize, showUnit = true, ringInset,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < startFrame || frame >= endFrame) return null;

  const progress = (frame - startFrame) / (endFrame - startFrame);
  const secondsLeft = Math.ceil((endFrame - frame) / fps);
  const radius = size / 2 - (ringInset ?? strokeWidth + 1);
  const circumference = 2 * Math.PI * radius;

  return (
    <div data-countdown-seconds={secondsLeft} style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0, ...style }}>
      {label ? <span style={{ fontSize: size * 0.28, color: BASE_COLORS.text2, ...labelStyle }}>{label}</span> : null}
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }} aria-hidden>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * progress} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: numberSize ?? size * 0.3125, fontWeight: 800, color }}>
          {secondsLeft}{showUnit ? "s" : null}
        </div>
      </div>
    </div>
  );
};
