/**
 * L02 的段表（纯数据，不含 JSX）。
 *
 * 与 L01 的 `span-timeline.ts` 同构：段键 → 覆盖的镜号 → 起止帧（由真实音频的镜表派生）。
 */
import { L02_SHOTS } from "./l02-shot-table.ts";

/** 段键 → 覆盖的镜号。合并段用 "S19-S21" 这种写法。 */
export const SPAN_IDS: Record<string, string[]> = {
  S01: ["S01"],
  S02: ["S02"],
  S03: ["S03"],
  S04: ["S04"],
  S05: ["S05", "S06", "S07"],
  S08: ["S08"],
  "S09-S10": ["S09", "S10"],
  S11: ["S11"],
  S12: ["S12"],
  S13: ["S13", "S14"],
  "S15-S17": ["S15", "S16", "S17"],
  S18: ["S18"],
  "S19-S21": ["S19", "S20", "S21", "S22"],
  S23: ["S23"],
  S24: ["S24"],
  S25: ["S25"],
  "S26-S29": ["S26", "S27", "S28", "S29"],
  S30: ["S30"],
  "S31-S33": ["S31", "S32", "S33"],
  S34: ["S34"],
  S35: ["S35"],
  "S36-S37": ["S36", "S37"],
  "S38-S39": ["S38", "S39"],
  "S40-S41": ["S40", "S41"],
  S42: ["S42"],
};

const BY_ID = new Map(L02_SHOTS.map((s) => [s.id, s]));

export type SpanTimeline = { key: string; ids: string[]; from: number; duration: number };

export const SPAN_TABLE: SpanTimeline[] = Object.keys(SPAN_IDS).map((key) => {
  const ids = SPAN_IDS[key];
  const first = BY_ID.get(ids[0])!;
  const last = BY_ID.get(ids[ids.length - 1])!;
  return { key, ids, from: first.from, duration: last.from + last.duration - first.from };
});
