/**
 * Stepper · 把「帧切点 / cue 数组」翻译成「当前第几步、已过几步」。
 *
 * 一个原语，多处用：S21 铁三角三块、S22 评估依据五条、S37 六步、
 * S39 大纲三块、S44 章末四关。切点一律来自 token 定位的 cue，
 * 组件里不出现任何手写帧号。
 *
 *   const steps = useStepper(cueCuts(cuesFor("S22")));
 *   steps.stateOf(i) // "past" | "current" | "future"
 */
import { useCurrentFrame } from "remotion";
import type { ResolvedCuePoint } from "../../../contracts/visual-props.schema";

export type StepState = "past" | "current" | "future";

export type StepperResult = {
  /** 已经到点的步数（0 = 一步都没到） */
  passed: number;
  /** 当前步下标；-1 = 还没开始 */
  current: number;
  total: number;
  /** 单步状态：已讲过的保持 past，当前步 current，未到的 future */
  stateOf: (index: number) => StepState;
  states: StepState[];
};

/** 由切点数组（升序帧号）算出各步状态；最后一步讲过之后停在 current，不回退。 */
export const stepStates = (cuts: readonly number[], frame: number): StepperResult => {
  const sorted = [...cuts].sort((a, b) => a - b);
  const passed = sorted.filter((c) => frame >= c).length;
  const total = sorted.length;
  const current = passed === 0 ? -1 : Math.min(passed - 1, total - 1);
  const states: StepState[] = sorted.map((_, i) => (i < passed - 1 ? "past" : i === current ? "current" : "future"));
  return {
    passed,
    current,
    total,
    states,
    stateOf: (index: number) => states[index] ?? "future",
  };
};

export const useStepper = (cuts: readonly number[]): StepperResult => stepStates(cuts, useCurrentFrame());

/** 取某一类 cue 的本地帧，升序；组件只读数据，不写帧号。 */
export const cueCuts = (
  cues: readonly ResolvedCuePoint[],
  action: ResolvedCuePoint["action"] = "highlight-item",
): number[] =>
  cues
    .filter((c) => c.action === action)
    .map((c) => c.localFrame)
    .sort((a, b) => a - b);
