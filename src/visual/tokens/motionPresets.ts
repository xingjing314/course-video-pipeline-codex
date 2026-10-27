/**
 * 全局统一动效物理预设（Motion Physics System）。
 *
 * 所有组件入场、瀑布流延迟、排错划线与高亮脉冲统一调用此模块，
 * 杜绝各镜头动效物理曲线不一致导致的视觉割裂。
 */
import { interpolate, spring } from "remotion";

export const MOTION_TIMING = {
  staggerFrames: 5,
  strikeDurationFrames: 12,
  revealPulseFrames: 16,
  bannerSlideFrames: 14,
} as const;

export const springEnter = (frame: number, fps: number, delayFrames = 0) =>
  spring({
    frame: Math.max(0, frame - delayFrames),
    fps,
    config: {
      damping: 18,
      mass: 0.85,
      stiffness: 115,
    },
  });

export const linearProgress = (frame: number, startFrame: number, durationFrames: number) =>
  interpolate(frame, [startFrame, startFrame + durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const highlightPulseScale = (frame: number, triggerFrame: number) =>
  interpolate(
    frame,
    [triggerFrame, triggerFrame + 6, triggerFrame + 16],
    [1, 1.035, 1.01],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
