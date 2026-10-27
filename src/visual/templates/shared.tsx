/** 业务模板共享视觉语言：统一 Tokens、纯透明背景、教学文字始终可见。 */
import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { BASE_COLORS, resolveTone, rgba } from "../tokens/colorCard";

export const CANVAS = { width: 1920, height: 1080 } as const;

export const useEnter = (delay = 0, stiffness = 120) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping: 200, stiffness } });
};

export const useFade = (start = 0, duration = 18) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

/** 在子组件内使用动画 hook，避免在 map 中直接调用 hook。 */
export const Entered: React.FC<{ delay?: number; children: (progress: number) => React.ReactNode }> = ({
  delay = 0,
  children,
}) => {
  const progress = useEnter(delay);
  return <>{children(progress)}</>;
};

export const SceneShell: React.FC<{
  title: string;
  subtitle?: string;
  eyebrow?: string;
  children?: React.ReactNode;
}> = ({ title, subtitle, eyebrow, children }) => {
  const enter = useEnter(0);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div
        style={{
          position: "absolute",
          top: 48,
          left: 96,
          right: 96,
          transform: `translateY(${(1 - enter) * 18}px)`,
          opacity: enter,
        }}
      >
        {eyebrow ? (
          <div style={{ fontSize: 20, letterSpacing: 3, color: BASE_COLORS.text2, marginBottom: 10 }}>
            {eyebrow}
          </div>
        ) : null}
        <div style={{ fontSize: 46, fontWeight: 700, color: BASE_COLORS.text, letterSpacing: 1.2 }}>{title}</div>
        {subtitle ? (
          <div style={{ fontSize: 24, color: BASE_COLORS.text2, marginTop: 8, maxWidth: 1500 }}>{subtitle}</div>
        ) : null}
      </div>
      {children}
    </div>
  );
};

export const Panel: React.FC<{
  x: number;
  y: number;
  width: number;
  height: number;
  tone?: string;
  children?: React.ReactNode;
  emphasis?: boolean;
  opacity?: number;
}> = ({ x, y, width, height, tone = "cyan", children, emphasis, opacity = 1 }) => {
  const color = resolveTone(tone);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        height,
        borderRadius: 16,
        background: emphasis ? rgba(color.rgb, 0.18) : BASE_COLORS.cardFill,
        border: `1.5px solid ${rgba(color.rgb, emphasis ? 0.75 : 0.35)}`,
        boxShadow: emphasis ? `0 0 32px ${rgba(color.rgb, 0.25)}` : `0 6px 18px rgba(0,0,0,0.28)`,
        padding: 22,
        boxSizing: "border-box",
        opacity,
      }}
    >
      {children}
    </div>
  );
};

export const Label: React.FC<{ tone?: string; size?: number; children: React.ReactNode; muted?: boolean }> = ({
  tone = "cyan",
  size = 24,
  children,
  muted,
}) => {
  const color = resolveTone(tone);
  return (
    <div
      style={{
        fontSize: size,
        fontWeight: 600,
        color: muted ? BASE_COLORS.text2 : BASE_COLORS.text,
        letterSpacing: 0.4,
        lineHeight: 1.35,
      }}
    >
      {children}
    </div>
  );
};

export const AccentBar: React.FC<{ tone?: string; width?: number }> = ({ tone = "cyan", width = 46 }) => {
  const color = resolveTone(tone);
  return <div style={{ width, height: 4, borderRadius: 2, background: color.hex, marginBottom: 12 }} />;
};
