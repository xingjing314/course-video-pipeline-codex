/**
 * A14CardsLab：Cards14 的评审编排（只用于 Studio 预览，不进产线）。
 * 组件本体已移至 templates/Cards14.tsx。
 */
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { BASE_COLORS, resolveTone, rgba } from "../tokens/colorCard";

import {
  A1ExamStats,
  A2Timeline,
  A3FourAccounts,
  A4ThreeSteps,
  L01_EXAM_STATS,
  L01_TIMELINE,
  L01_FOUR_ACCOUNTS,
  L01_THREE_STEPS,
} from "../templates/Cards14";

const GOLD = resolveTone("gold");

/* ───────────────────────────── 评审编排 ───────────────────────────── */

export const A14_STAGES = [
  { key: "a1", label: "考情卡", dur: 180 },
  { key: "a2", label: "时间轴", dur: 180 },
  { key: "a3", label: "四笔账", dur: 180 },
  { key: "a4", label: "三件事", dur: 180 },
] as const;

export const A14CardsLab: React.FC = () => {
  const frame = useCurrentFrame();

  let acc = 0;
  let idx = 0;
  for (let i = 0; i < A14_STAGES.length; i++) {
    if (frame >= acc + A14_STAGES[i].dur) {
      acc += A14_STAGES[i].dur;
      idx = i + 1;
    } else break;
  }
  const stage = Math.min(idx, A14_STAGES.length - 1);
  const local = frame - acc;
  const cur = A14_STAGES[stage];
  const total = A14_STAGES.reduce((a, b) => a + b.dur, 0);

  return (
    <AbsoluteFill style={{ background: "#0B1A33" }}>
      <Sequence from={0} durationInFrames={180} name="A1">
        <A1ExamStats payload={L01_EXAM_STATS} />
      </Sequence>
      <Sequence from={180} durationInFrames={180} name="A2">
        <A2Timeline payload={L01_TIMELINE} />
      </Sequence>
      <Sequence from={360} durationInFrames={180} name="A3">
        <A3FourAccounts payload={L01_FOUR_ACCOUNTS} />
      </Sequence>
      <Sequence from={540} durationInFrames={180} name="A4">
        <A4ThreeSteps payload={L01_THREE_STEPS} />
      </Sequence>

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
        <div style={{ width: `${(frame / total) * 100}%`, height: 5, background: GOLD.hex, borderRadius: 3 }} />
      </div>
      <div style={{ position: "absolute", left: 96, right: 96, bottom: 46, display: "flex", justifyContent: "space-between" }}>
        {A14_STAGES.map((st, i) => (
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
