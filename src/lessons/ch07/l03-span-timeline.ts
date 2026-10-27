/** L03 段表（纯数据）：段键 → 覆盖镜号 → 起止帧（由镜表派生）。 */
import { L03_SHOTS } from "./l03-shot-table.ts";

export const SPAN_IDS: Record<string, string[]> = {
  S01: ["S01"], S02: ["S02"], S03: ["S03"], S04: ["S04"], S05: ["S05"],
  "S06-S11": ["S06", "S08", "S09", "S11"],
  S12: ["S12"], S13: ["S13"], S14: ["S14"], S15: ["S15"], S16: ["S16"],
  S17: ["S17"], S18: ["S18"], S19: ["S19"], S20: ["S20"], S21: ["S21"],
  S22: ["S22"], S23: ["S23"], S24: ["S24"],
  "S25-S27": ["S25", "S27"], "S28-S30": ["S28", "S30"], "S31-S33": ["S31", "S33"], "S34-S36": ["S34", "S36"],
  S37: ["S37"], S38: ["S38"], S39: ["S39"],
  "S40-S43": ["S40", "S41", "S43"],
  S44a: ["S44a"], S44b: ["S44b"], S44c: ["S44c"], S44d: ["S44d"], S44e: ["S44e"],
  S45: ["S45"], S46: ["S46"],
};

const BY_ID = new Map(L03_SHOTS.map((s) => [s.id, s]));
export type SpanTimeline = { key: string; ids: string[]; from: number; duration: number };

export const SPAN_TABLE: SpanTimeline[] = Object.keys(SPAN_IDS).map((key) => {
  const ids = SPAN_IDS[key];
  const first = BY_ID.get(ids[0])!;
  const last = BY_ID.get(ids[ids.length - 1])!;
  return { key, ids, from: first.from, duration: last.from + last.duration - first.from };
});
