/**
 * L01 的段表（纯数据，不含 JSX）。
 *
 * 成片、compiled-lesson 转换脚本、章节组件三处共用这一份，
 * 避免"键名对不上"这类低级错误。
 */
import { SHOTS } from "../../visual/prototypes/l01-generated.ts";

/** 段键 → 覆盖的镜号。合并段用 "S08-S13" 这种写法。 */
export const L01_SPAN_IDS: Record<string, string[]> = {
  S01: ["S01"],
  S02: ["S02"],
  S03: ["S03"],
  S04: ["S04"],
  S05: ["S05"],
  S06: ["S06"],
  S07: ["S07"],
  "S08-S13": ["S08", "S09", "S10", "S11", "S12", "S13"],
  "S14-S17": ["S14", "S15", "S16", "S17"],
  S18: ["S18"],
  "S19-S21": ["S19", "S20", "S21"],
  "S22-S25": ["S22", "S23", "S24", "S25"],
  S26: ["S26"],
  S27: ["S27"],
  S28: ["S28"],
  "S29-S30": ["S29", "S30"],
  S31: ["S31"],
};

const BY_ID = new Map(SHOTS.map((s) => [s.id, s]));

export type SpanTimeline = { key: string; ids: string[]; from: number; duration: number };

export const SPAN_TABLE: SpanTimeline[] = Object.keys(L01_SPAN_IDS).map((key) => {
  const ids = L01_SPAN_IDS[key];
  const from = BY_ID.get(ids[0])!.from;
  const to = BY_ID.get(ids[ids.length - 1])!.to;
  return { key, ids, from, duration: to - from };
});

/** 兼容旧名。 */
export { SPAN_TABLE as L01_SPAN_TABLE };
