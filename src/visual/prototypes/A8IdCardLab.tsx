/**
 * A8IdCardLab：IdCard 的评审编排（只用于 Studio 预览，不进产线）。
 * 组件本体已移至 templates/IdCard.tsx。
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BASE_COLORS, resolveTone, rgba } from "../tokens/colorCard";
import { TechNetwork } from "../backgrounds/tech-network/TechNetwork";
import { techNetworkSchema } from "../backgrounds/tech-network/schema";

import { IdCard, A8_STAGES } from "../templates/IdCard";

const GOLD = resolveTone("gold");

/** 评审用编排：三行依次点亮。 */
const BG = techNetworkSchema.parse({ type: "tech-network" });

export const A8IdCardLab: React.FC = () => {
  const frame = useCurrentFrame();

  let acc = 0;
  let idx = 0;
  for (let i = 0; i < A8_STAGES.length; i++) {
    if (frame >= acc + A8_STAGES[i].dur) {
      acc += A8_STAGES[i].dur;
      idx = i + 1;
    } else break;
  }
  const stage = Math.min(idx, A8_STAGES.length - 1);
  const local = frame - acc;
  const cur = A8_STAGES[stage];

  const total = A8_STAGES.reduce((a, b) => a + b.dur, 0);
  const progress = frame / total;

  return (
    <AbsoluteFill style={{ background: "#0B1A33" }}>
      <TechNetwork {...BG} />
      <IdCard stage={stage} f={local} />

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
      <div style={{ position: "absolute", left: 96, right: 96, bottom: 46, display: "flex", justifyContent: "space-between" }}>
        {A8_STAGES.map((st, i) => (
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
