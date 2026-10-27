/**
 * A9MnemonicLab：Mnemonic 的评审编排（只用于 Studio 预览，不进产线）。
 * 组件本体已移至 templates/Mnemonic.tsx。
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BASE_COLORS, resolveTone, rgba } from "../tokens/colorCard";
import { TechNetwork } from "../backgrounds/tech-network/TechNetwork";
import { techNetworkSchema } from "../backgrounds/tech-network/schema";


import { MnemonicCard, A9_STAGES } from "../templates/Mnemonic";

const GOLD = resolveTone("gold");

/** 评审用编排。 */
export const A9MnemonicLab: React.FC = () => {
  const frame = useCurrentFrame();

  let acc = 0;
  let idx = 0;
  for (let i = 0; i < A9_STAGES.length; i++) {
    if (frame >= acc + A9_STAGES[i].dur) {
      acc += A9_STAGES[i].dur;
      idx = i + 1;
    } else break;
  }
  const stage = Math.min(idx, A9_STAGES.length - 1);
  const local = frame - acc;
  const cur = A9_STAGES[stage];

  const total = A9_STAGES.reduce((a, b) => a + b.dur, 0);
  const progress = frame / total;

  const BG = techNetworkSchema.parse({ type: "tech-network" });

  return (
    <AbsoluteFill style={{ background: "#0B1A33" }}>
      <TechNetwork {...BG} />
      <MnemonicCard stage={stage} f={local} />

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
        {A9_STAGES.map((st, i) => (
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
