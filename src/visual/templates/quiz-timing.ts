import type { ResolvedCuePoint } from "../../../contracts/visual-props.schema";

export const QUIZ_THINK_SECONDS = 3;

export type QuizTiming = {
  /** 当前题卡局部帧：实际读题完成后的思考起点；是否包含选项朗读按音频规范。 */
  stemEndFrame: number;
  /** 答案在讲解中的出现位置；省略时沿用 reveal-answer cue。 */
  revealFrame?: number;
};

type QuizEvent = Pick<ResolvedCuePoint, "action" | "targetId" | "localFrame">;

export const getQuizSchedule = (cues: QuizEvent[], fps: number, timing?: QuizTiming) => {
  // 保留 thinking-pause 接入，起点均来自本课真实静音窗口。
  const startFrame = timing?.stemEndFrame ?? cues.find((cue) => cue.action === "thinking-pause")?.localFrame;
  const thinking = startFrame === undefined
    ? null
    : { startFrame, endFrame: startFrame + Math.round(QUIZ_THINK_SECONDS * fps) };
  const judgementFrom = thinking?.endFrame ?? 0;
  const revealCues: QuizEvent[] = timing?.revealFrame === undefined
    ? cues.filter((cue) => cue.action === "reveal-answer")
    : [{ action: "reveal-answer", localFrame: timing.revealFrame }];
  const reveals = revealCues.map((cue) => ({ ...cue, localFrame: Math.max(cue.localFrame, judgementFrom) }));
  const eliminates = cues
    .filter((cue) => cue.action === "eliminate-option")
    .map((cue) => ({ ...cue, localFrame: Math.max(cue.localFrame, judgementFrom) }));
  const revealFrame = Math.min(...reveals.map((cue) => cue.localFrame));
  // 指向某个选项的事件不能让其他选项提前被排除。
  const eliminateFrame = Math.min(revealFrame, ...eliminates.filter((cue) => !cue.targetId).map((cue) => cue.localFrame));
  const tipFrame = Math.max(cues.find((cue) => cue.action === "show-tip")?.localFrame ?? revealFrame, revealFrame);

  return { thinking, revealCues: reveals, eliminateCues: eliminates, revealFrame, eliminateFrame, tipFrame };
};

/** 双题旧 cue 的 left/right 表示整题判卷，不能把 thinking-pause 当作揭示事件。 */
export const getDualQuizCues = (cues: ResolvedCuePoint[], side: "left" | "right"): ResolvedCuePoint[] =>
  cues.flatMap((cue) => {
    const judgement = cue.action === "reveal-answer" || cue.action === "eliminate-option";
    const belongs = cue.targetId === side || (!cue.targetId && (
      cue.action === "thinking-pause" || (side === "left" ? cue.action === "eliminate-option" : cue.action === "reveal-answer")
    ));
    return belongs ? [{ ...cue, action: judgement ? "reveal-answer" as const : cue.action, targetId: undefined }] : [];
  });
