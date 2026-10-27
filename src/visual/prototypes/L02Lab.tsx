/**
 * L02 预览片（配音前）。
 *
 * 只排已经做好的段，位置取 `l02-shot-table` 的估算帧；
 * 用来验证 header 与段内标题的几何关系、以及跨镜段里镜号是否随帧推进。
 */
import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { L02Span } from "../../lessons/ch07/l02-spans";
import { L02_SHOTS, L02_TOTAL_FRAMES } from "../../lessons/ch07/l02-shot-table";
import { TechNetwork } from "../backgrounds/tech-network/TechNetwork";
import { techNetworkSchema } from "../backgrounds/tech-network/schema";

const BG = techNetworkSchema.parse({ type: "tech-network" });

/** 段键 → 覆盖的镜号（与 L02_SPANS 的键一致）。 */
const SPAN_IDS: Record<string, string[]> = {
  S01: ["S01"],
  S02: ["S02"],
  S03: ["S03"],
  S04: ["S04"],
  S05: ["S05"],
  S08: ["S08"],
  "S09-S10": ["S09", "S10"],
  S11: ["S11"],
  S12: ["S12"],
  S30: ["S30"],
  S34: ["S34"],
  S42: ["S42"],
  S13: ["S13"],
  S18: ["S18"],
  S23: ["S23"],
  S24: ["S24"],
  S25: ["S25"],
  "S19-S21": ["S19", "S20", "S21"],
  "S31-S33": ["S31", "S32", "S33"],
  S35: ["S35"],
  "S38-S39": ["S38", "S39"],
  "S15-S17": ["S15", "S16", "S17"],
  "S26-S29": ["S26", "S27", "S28", "S29"],
  "S36-S37": ["S36", "S37"],
  "S40-S41": ["S40", "S41"],
};

const byId = new Map(L02_SHOTS.map((s) => [s.id, s]));

const SPANS = Object.entries(SPAN_IDS).map(([key, ids]) => {
  const first = byId.get(ids[0])!;
  const last = byId.get(ids[ids.length - 1])!;
  return { key, from: first.from, duration: last.from + last.duration - first.from };
});

export const L02Preview: React.FC = () => (
  <AbsoluteFill style={{ background: "#0B1A33" }}>
    <TechNetwork {...BG} />
    {SPANS.map((s) => (
      <Sequence key={s.key} from={s.from} durationInFrames={s.duration} name={s.key}>
        <L02Span payload={{ span: s.key, offset: s.from }} />
      </Sequence>
    ))}
  </AbsoluteFill>
);

export { L02_TOTAL_FRAMES };
