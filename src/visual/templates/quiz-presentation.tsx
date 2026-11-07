import React from "react";
import { interpolateColors, useCurrentFrame, useVideoConfig } from "remotion";
import type { ExamQuizPayload } from "../../../contracts/visual-props.schema";
import { BASE_COLORS, resolveTone, rgba } from "../tokens/colorCard";
import type { getQuizSchedule } from "./quiz-timing";

export const QUIZ_COLORS = {
  text: BASE_COLORS.text,
  focus: resolveTone("cyan").hex,
  error: resolveTone("red").hex,
  answer: resolveTone("green").hex,
  evidence: resolveTone("gold").hex,
};

/** 局部帧来自本课音频锚点；示例可使用明确标注的演示时序。 */
export type QuizPresentation = {
  focus?: { targetId: string; from: number; to: number }[];
  judgements?: { targetId: string; from: number; label?: string }[];
  explanations?: { text: string; from: number; to?: number }[];
  transitionSeconds?: number;
  /** 阅读关注可单独覆盖；判断仍使用 focus（青色）。 */
  focusColor?: string;
  colors?: Partial<typeof QUIZ_COLORS>;
};

type Schedule = ReturnType<typeof getQuizSchedule>;
const clamp = (n: number) => Math.max(0, Math.min(1, n));
// Smoothstep is calculated from the requested frame, never wall-clock/CSS state.
export const quizFade = (frame: number, from: number, duration: number) => {
  const t = clamp((frame - from) / Math.max(1, duration));
  return t * t * (3 - 2 * t);
};
const mix = (a: string, b: string, progress: number) => interpolateColors(progress, [0, 1], [a, b]);
const durationFor = (p: QuizPresentation, fps: number) => Math.max(1, Math.round((p.transitionSeconds ?? 0.2) * fps));
const allowedFrom = (schedule: Schedule) => schedule.thinking?.endFrame ?? 0;

/** 四种布局共享颜色语义与动效，布局尺寸仍由各题卡决定。 */
export const QuizOptionRow: React.FC<{
  option: ExamQuizPayload["options"][number];
  negative?: boolean;
  schedule: Schedule;
  presentation: QuizPresentation;
  fontSize: number;
  density?: "normal" | "compact" | "brief" | "paper";
}> = ({ option, negative, schedule, presentation, fontSize, density = "normal" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const colors = { ...QUIZ_COLORS, ...presentation.colors };
  const duration = durationFor(presentation, fps);
  const paper = density === "paper";
  const focusColor = presentation.focusColor ?? colors.focus;
  const thinking = schedule.thinking && frame >= schedule.thinking.startFrame && frame < schedule.thinking.endFrame;
  const focus = thinking ? 0 : Math.max(0, ...(presentation.focus ?? [])
    .filter((event) => event.targetId === option.key)
    .map((event) => {
      // 读题关注在题干结束时清除，不能在思考结束后重新浮现。
      const to = schedule.thinking && event.from < schedule.thinking.startFrame
        ? Math.min(event.to, schedule.thinking.startFrame - duration) : event.to;
      return quizFade(frame, event.from, duration) * (1 - quizFade(frame, to, duration));
    }));
  const judgement = presentation.judgements?.find((event) => event.targetId === option.key);
  const judgedFrom = Math.max(judgement?.from ?? Infinity, allowedFrom(schedule));
  const judged = frame >= judgedFrom;
  const judgeFade = quizFade(frame, judgedFrom, duration);
  const isAnswer = negative ? !option.isCorrect : option.isCorrect;
  const answerAt = Math.min(...schedule.revealCues
    .filter((cue) => !cue.targetId || cue.targetId === option.key).map((cue) => cue.localFrame));
  const answered = isAnswer && frame >= answerAt;
  const answerFade = isAnswer ? quizFade(frame, answerAt, duration) : 0;
  const judgementColor = option.isCorrect ? colors.focus : colors.error;
  const border = mix(mix(mix("#304762", judgementColor, judgeFade * 0.75), focusColor, focus), colors.answer, answerFade);
  const background = mix(mix(mix("#0A172D", judgementColor, judgeFade * 0.09), focusColor, focus * 0.13), colors.answer, answerFade * 0.16);
  const labelSize = paper ? 14 : Math.max(12, fontSize * 0.72);
  const errorIndex = !option.isCorrect && judged && option.errorHighlight ? option.text.indexOf(option.errorHighlight) : -1;
  const text = errorIndex < 0 ? option.text : <>
    {option.text.slice(0, errorIndex)}
    <span data-error-phrase style={{ color: mix(colors.text, paper ? "#FCA5A5" : colors.error, judgeFade), textDecoration: "underline", textDecorationColor: colors.error, textDecorationThickness: paper ? 3 : undefined, textUnderlineOffset: paper ? 3 : 5 }}>
      {option.errorHighlight}
    </span>
    {option.text.slice(errorIndex + option.errorHighlight!.length)}
  </>;
  const paperBorder = mix(mix(mix(rgba(resolveTone("blue").rgb, 0.35), rgba(resolveTone(focusColor).rgb, 0.95), focus), rgba(resolveTone(judgementColor).rgb, 0.95), judgeFade), rgba(resolveTone(colors.answer).rgb, 0.95), answerFade);
  const paperBackground = mix(mix(mix("rgba(6, 14, 31, 0.78)", rgba(resolveTone(focusColor).rgb, 0.18), focus), rgba(resolveTone(judgementColor).rgb, 0.18), judgeFade), rgba(resolveTone(colors.answer).rgb, 0.18), answerFade);
  const paperKey = mix(mix(mix(rgba(resolveTone("cyan").rgb, 0.2), focusColor, focus), rgba(resolveTone(judgementColor).rgb, 0.28), option.isCorrect ? 0 : judgeFade), colors.answer, answerFade);
  const badge: React.CSSProperties = { position: "absolute", right: 0, fontSize: 14, fontWeight: 700, padding: "2px 8px", borderRadius: 4, whiteSpace: "nowrap" };
  return <div data-option-key={option.key} data-answer-revealed={answered || undefined}
    data-quiz-focus={focus > 0 || undefined} data-quiz-judged={judged || undefined}
    style={{ display: "grid", gridTemplateColumns: paper ? "28px minmax(0, 1fr) 124px" : `${fontSize * 1.45}px minmax(0, 1fr) ${labelSize * 8}px`,
      alignItems: "center", gap: paper ? 12 : density === "normal" ? 16 : 10,
      padding: paper ? "7px 16px" : density === "normal" ? "13px 22px" : density === "compact" ? "10px 12px" : "7px 9px",
      minHeight: paper ? 44 : density === "normal" ? 76 : 60, boxSizing: "border-box",
      border: `1.5px solid ${paper ? paperBorder : border}`,
      borderRadius: density === "normal" ? 14 : 10,
      background: paper ? paperBackground : background,
      boxShadow: paper && focus > 0 ? `inset 4px 0 0 ${rgba(resolveTone(focusColor).rgb, focus)}` : undefined,
      color: colors.text, fontSize, lineHeight: paper ? 1.36 : 1.45 }}>
    <span style={{ textAlign: "center", fontWeight: 800, color: paper ? mix(colors.text, "#04131A", Math.max(focus, answerFade)) : mix(colors.text, focusColor, focus),
      ...(paper ? { width: 28, height: 28, borderRadius: 6, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 16,
        background: paperKey } : {}) }}>{option.key}</span>
    <span style={{ fontWeight: paper && judged && !option.isCorrect ? 700 : 500, overflowWrap: "anywhere" }}>{text}</span>
    {/* 固定标签槽防止文字与其他选项因标签出现而跳动；无解析时不保留解析区域。 */}
    {paper ? <span style={{ position: "relative", height: 28 }}>
      {judged ? <span data-judgement-label style={{ ...badge, opacity: judgeFade * (1 - answerFade), color: judgementColor,
        background: rgba(resolveTone(judgementColor).rgb, option.isCorrect ? 0.16 : 0.2) }}>{judgement?.label ?? (option.isCorrect ? "✓ 表述正确" : "✖ 表述有误")}</span> : null}
      {answered ? <span data-answer-stamp style={{ ...badge, opacity: answerFade, color: colors.answer,
        background: rgba(resolveTone(colors.answer).rgb, 0.2) }}>✓ 答案项</span> : null}
    </span> : <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "center", height: labelSize * 2.8 + 8, fontSize: labelSize, lineHeight: 1.4, gap: 3 }}>
      {judged ? <span data-judgement-label style={{ opacity: judgeFade, color: judgementColor, whiteSpace: "nowrap" }}>
        {judgement?.label ?? (option.isCorrect ? "✓ 符合原则" : "✕ 表述有误")}
      </span> : null}
      {answered ? <span data-answer-stamp style={{ opacity: answerFade, color: colors.answer, border: `1px solid ${colors.answer}`,
        borderRadius: 6, padding: "1px 6px", whiteSpace: "nowrap", fontWeight: 700 }}>本题答案 {option.key}</span> : null}
    </span>}
  </div>;
};

export const QuizExplanation: React.FC<{ presentation?: QuizPresentation; schedule: Schedule; fontSize: number }> = ({ presentation, schedule, fontSize }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!presentation?.explanations?.some((item) => item.text.trim())) return null;
  const duration = durationFor(presentation, fps);
  const colors = { ...QUIZ_COLORS, ...presentation.colors };
  const items = presentation.explanations.filter((item) => item.text.trim()).map((item) => ({ ...item,
    from: Math.max(item.from, allowedFrom(schedule)),
    to: item.to === undefined ? Infinity : Math.max(item.to, allowedFrom(schedule)),
  }));
  const visible = items.filter((item) => frame >= item.from && frame < item.to + duration);
  if (!visible.length) return null;
  return <div data-quiz-explanation style={{ display: "grid", marginTop: 12 }}>
    {visible.map((item, index) => <div key={`${item.from}-${index}`} style={{ gridArea: "1 / 1", padding: "14px 18px", borderRadius: 12,
      border: `1px solid ${colors.evidence}`, background: "#101E32", color: colors.text, fontSize, lineHeight: 1.5,
      opacity: quizFade(frame, item.from, duration) * (1 - quizFade(frame, item.to, duration)) }}>
      <span style={{ color: colors.evidence, fontWeight: 700 }}>解析依据　</span>{item.text}
    </div>)}
  </div>;
};
