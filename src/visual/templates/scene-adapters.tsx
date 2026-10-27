/**
 * 把状态机资产适配成 SceneRouter 可调度的场景组件。
 *
 * 流水线里"一个镜头 = 一个场景"，而 A5/A8/A9 是**跨镜头累计**的状态机。
 * 适配层只做一件事：从 payload 取 stage，用场景本地帧驱动入场，
 * 因此每个镜头都能独立渲染出正确的累计状态（0→6 / 0→2 / 0→4）。
 *
 * 注意：跨镜头的"无缝连续"由章节段组件（`src/lessons/<id>/spans`）负责，
 * 它们以「一段一场景」的形式挂在 compiled-lesson 里；
 * 若按「一镜一场景」切开，每个镜头就是一次硬切，入场动效会重放。
 */
import React from "react";
import { useCurrentFrame } from "remotion";
import { GateTrack } from "./GateTrack";
import { IdCard } from "./IdCard";
import { MnemonicCard } from "./Mnemonic";
import type {
  GateTrackPayload,
  IdCardPayload,
  MnemonicCardPayload,
} from "../../../contracts/visual-props.schema";

export const GateTrackScene: React.FC<{ payload: GateTrackPayload }> = ({ payload }) => {
  const frame = useCurrentFrame();
  return (
    <GateTrack
      stage={payload.stage}
      f={frame}
      beatFrames={payload.beatFrames ?? 48}
      eyebrow={payload.eyebrow}
      title={payload.title}
      subtitle={payload.subtitle}
    />
  );
};

export const IdCardScene: React.FC<{ payload: IdCardPayload }> = ({ payload }) => {
  const frame = useCurrentFrame();
  return (
    <IdCard
      stage={payload.stage}
      f={frame}
      eyebrow={payload.eyebrow}
      title={payload.title}
      subtitle={payload.subtitle}
    />
  );
};

export const MnemonicScene: React.FC<{ payload: MnemonicCardPayload }> = ({ payload }) => {
  const frame = useCurrentFrame();
  const cuts = payload.cuts;
  const stage =
    cuts && cuts.length > 0 ? Math.min(4, cuts.filter((c) => frame >= c).length) : payload.stage;
  return (
    <MnemonicCard
      stage={stage}
      f={frame}
      eyebrow={payload.eyebrow}
      title={payload.title}
      subtitle={payload.subtitle}
    />
  );
};
