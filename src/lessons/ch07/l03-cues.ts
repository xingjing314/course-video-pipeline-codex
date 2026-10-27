/** L03 的 cue 读取层：组件只读数据，不写帧号。 */
import cuesJson from "./l03-cues.json";
import type { ResolvedCuePoint } from "../../../contracts/visual-props.schema";

export type CueRecord = ResolvedCuePoint & { matchPhrase: string };

const SPANS = (cuesJson as unknown as { spans: Record<string, CueRecord[]> }).spans;

export const cuesFor = (span: string): CueRecord[] => SPANS[span] ?? [];

/** 某一段里某类 cue 的本地帧（升序）。 */
export const cutsOf = (span: string, action: CueRecord["action"] = "highlight-item"): number[] =>
  cuesFor(span)
    .filter((c) => c.action === action)
    .map((c) => c.localFrame)
    .sort((a, b) => a - b);

/** 按 targetId 取单条 cue 的本地帧；不存在时返回 null。 */
export const cueFrame = (span: string, target: string): number | null => {
  const hit = cuesFor(span).find((c) => c.targetId === target);
  return hit ? hit.localFrame : null;
};
