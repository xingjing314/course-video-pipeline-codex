/**
 * A5GateTrackLab：GateTrack 的评审编排（只用于 Studio 预览，不进产线）。
 * 组件本体已移至 templates/GateTrack.tsx。
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BASE_COLORS, resolveTone, rgba } from "../tokens/colorCard";
import { TechNetwork } from "../backgrounds/tech-network/TechNetwork";
import { techNetworkSchema } from "../backgrounds/tech-network/schema";

import { GateTrack, A5_STAGES } from "../templates/GateTrack";

const GOLD = resolveTone("gold");

/** 评审用编排：7 个阶段顺序播放，底部带状态条。 */
const BG = techNetworkSchema.parse({ type: "tech-network" });

export const A5GateTrackLab: React.FC = () => {
  const frame = useCurrentFrame();

  let acc = 0;
  let idx = 0;
  for (let i = 0; i < A5_STAGES.length; i++) {
    if (frame >= acc + A5_STAGES[i].dur) {
      acc += A5_STAGES[i].dur;
      idx = i + 1;
    } else break;
  }
  const stage = Math.min(idx, A5_STAGES.length - 1);
  const local = frame - acc;
  const cur = A5_STAGES[stage];

  const total = A5_STAGES.reduce((a, b) => a + b.dur, 0);
  const progress = frame / total;

  return (
    <AbsoluteFill style={{ background: "#0B1A33" }}>
      <TechNetwork {...BG} />
      <GateTrack stage={stage} f={local} />

      <div
        style={{
          position: "absolute",
          left: 96,
          right: 96,
          bottom: 30,
          height: 5,
          background: "rgba(143,184,217,0.16)",
          borderRadius: 3,
        }}
      >
        <div style={{ width: `${progress * 100}%`, height: 5, background: GOLD.hex, borderRadius: 3 }} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 96,
          right: 96,
          bottom: 46,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {A5_STAGES.map((st, i) => (
          <div
            key={st.key}
            style={{
              fontSize: 15,
              letterSpacing: 1,
              color: i === stage ? GOLD.hex : BASE_COLORS.text2,
              opacity: i === stage ? 1 : 0.6,
            }}
          >
            {String(i + 1).padStart(2, "0")} {st.label}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
