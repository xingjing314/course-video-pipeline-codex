/**
 * Reveal · 分步揭示。
 *
 * 两种用法：
 *   const step = useStep([0, 60, 120]);        // 按帧切点算当前步数
 *   <Stagger index={2}>…</Stagger>             // 按序号错峰入场
 *
 * 提炼自 A7 的逐项判卷、A8 的逐行点亮、A9 的逐卡点亮——
 * 三处都是"到点了才出现"，但各自写了一遍时间判断。
 */
import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

/** 帧切点 → 当前已揭开的步数（0 = 一步都没到）。 */
export const useStep = (cuts: readonly number[]): number => {
  const frame = useCurrentFrame();
  return cuts.filter((c) => frame >= c).length;
};

/** 错峰入场：index 越大越晚，步长 6 帧。 */
export const Stagger: React.FC<{ index?: number; step?: number; children: React.ReactNode }> = ({
  index = 0,
  step = 6,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - index * step,
    fps,
    config: { damping: 20, mass: 0.8, stiffness: 115 },
  });
  return (
    <div style={{ opacity: progress, transform: `translateY(${(1 - progress) * 14}px)` }}>{children}</div>
  );
};
