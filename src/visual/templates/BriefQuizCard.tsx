import React from "react";
import { QuizOptionRow, QuizExplanation, quizFade, type QuizPresentation } from "./quiz-presentation";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { BASE_COLORS, resolveTone, rgba } from "../tokens/colorCard";
import { Countdown, type CountdownAppearance } from "../kit/Countdown";
import { getQuizSchedule, type QuizTiming } from "./quiz-timing";
import type { ExamQuizPayload } from "../../../contracts/visual-props.schema";

const CYAN = resolveTone("cyan");
const GOLD = resolveTone("gold");
const GREEN = resolveTone("green");

export type BriefQuizCardProps = {
  payload: ExamQuizPayload;
  timing?: QuizTiming;
  countdown?: CountdownAppearance | false;
  /** 公共配色、逐项讲解与帧过渡；省略时保留原有课时表现。 */
  presentation?: QuizPresentation;
  /** paper 复用完整题面样式，保留简版的双列短选项。 */
  variant?: "stacked" | "paper";
  left?: number;
  top?: number;
  width?: number;
  tone?: string;
  style?: React.CSSProperties;
  height?: number;
  /** 选项列数：长选项用 1 列 */
  columns?: 1 | 2;
  /** 到点后点亮正确项（读题阶段恒为 null / 不传） */
  revealAt?: number | null;
  /** 到点后把题干里的（　）填成这个词 */
  fillText?: string;
  /** 卡片右上角的来源小签（如「同一考点」） */
  tag?: string;
  /** 题干字号（右侧副栏用大一号） */
  bodySize?: number;
  /** 选项字号 */
  optionSize?: number;
  /** 入场帧（来自 cue）；不传则从本段第 0 帧就在场 */
  enterAt?: number | null;
};

export const BriefQuizCard: React.FC<BriefQuizCardProps> = ({
  payload,
  timing,
  presentation,
  countdown = {},
  variant = "stacked",
  left = variant === "paper" ? 120 : 96,
  top = variant === "paper" ? 155 : 300,
  width = variant === "paper" ? 820 : 510,
  tone = variant === "paper" ? "cyan" : "gold",
  style,
  height,
  columns = 2,
  revealAt = null,
  fillText,
  tag,
  bodySize = variant === "paper" ? 20 : 13.5,
  optionSize = variant === "paper" ? 17 : 12.5,
  enterAt = null,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const schedule = getQuizSchedule(
    revealAt === null ? [] : [{ action: "reveal-answer", localFrame: revealAt }], fps, timing,
  );
  const { thinking, revealFrame } = schedule;
  const negative = payload.polarity === "negative";
  const answerKey = negative ? payload.options.find((o) => !o.isCorrect)?.key : undefined;
  const revealed = frame >= revealFrame;
  const paper = variant === "paper";
  const visual = presentation ?? (paper ? {} : undefined);
  const answerProgress = quizFade(frame, revealFrame, Math.max(1, Math.round((visual?.transitionSeconds ?? 0.2) * fps)));
  const answerKeys = payload.options.filter((option) => negative ? !option.isCorrect : option.isCorrect).map((option) => option.key).join("、");
  const filled = Boolean(fillText) && revealed;
  const entered = enterAt === null || (thinking && frame >= thinking.startFrame) ? 1 : Math.max(0, Math.min(1, (frame - enterAt) / 10));

  const stem = filled
    ? payload.stem.replace(/（[\s　]*）/, `（${fillText}）`)
    : payload.stem;

  return (
    <div
      data-quiz-card="brief"
      style={{
        position: "absolute",
        left,
        top,
        width,
        height,
        padding: paper ? "16px 24px" : "14px 16px",
        borderRadius: paper ? 16 : 14,
        boxSizing: "border-box",
        background: paper ? "rgba(8, 19, 41, 0.94)" : "rgba(8, 19, 41, 0.88)",
        border: `${paper ? 2 : 1.5}px solid ${rgba(resolveTone(tone).rgb, paper ? 0.55 : 0.42)}`,
        boxShadow: paper ? "0 8px 32px rgba(0,0,0,0.45)" : undefined,
        overflow: "hidden",
        opacity: entered,
        transform: `translateY(${(1 - entered) * 10}px)`,
        fontFamily: '"Noto Sans CJK SC", sans-serif',
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
        minHeight: paper ? Math.max(40, countdown !== false ? (countdown.size ?? 40) : 0) : thinking && countdown !== false ? (countdown.size ?? 32) : undefined }}>
        <span style={{ fontSize: paper ? 16 : 12.5, fontWeight: 700, color: GOLD.hex,
          ...(paper ? { padding: "4px 14px", borderRadius: 999, background: rgba(GOLD.rgb, 0.22), border: `1.5px solid ${GOLD.hex}` } : {}) }}>{payload.examMeta}</span>
        {paper && revealed ? <span style={{ fontSize: 15, fontWeight: 700, color: GREEN.hex, opacity: answerProgress, marginLeft: "auto", whiteSpace: "nowrap" }}>✓ 正确选项：{answerKeys}</span> : null}
        {tag ? <span style={{ fontSize: 11.5, color: BASE_COLORS.text2, marginLeft: "auto" }}>{tag}</span> : null}
        {thinking && countdown !== false ? <Countdown {...thinking} size={paper ? 40 : 32} strokeWidth={paper ? 4.5 : 3}
          {...(paper ? { ringInset: 2.25, numberSize: 16.8, showUnit: false } : {})} {...countdown} /> : null}
      </div>
      <div style={{ marginTop: paper ? 10 : 6, fontSize: bodySize, fontWeight: paper ? 700 : undefined, lineHeight: paper ? 1.4 : 1.45, color: BASE_COLORS.text }}>
        {filled ? (
          <>
            {stem.split(`（${fillText}）`)[0]}
            <span style={{ color: GOLD.hex, fontWeight: 800 }}>（{fillText}）</span>
            {stem.split(`（${fillText}）`)[1]}
          </>
        ) : (
          stem
        )}
      </div>
      <div
        style={{
          marginTop: paper ? 10 : 8,
          display: "grid",
          gridTemplateColumns: columns === 2 ? "1fr 1fr" : "1fr",
          gap: paper ? 8 : 5,
        }}
      >
        {payload.options.map((opt) => {
          if (visual) return <QuizOptionRow key={opt.key} option={opt} negative={negative}
            schedule={schedule} presentation={visual} fontSize={optionSize} density={paper ? "paper" : "brief"} />;
          const isAnswer = revealed && (negative ? opt.key === answerKey : opt.isCorrect);
          return (
            <div
              key={opt.key}
              data-option-key={opt.key}
              data-answer-revealed={isAnswer || undefined}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 6,
                fontSize: optionSize,
                lineHeight: 1.35,
                color: isAnswer ? GREEN.hex : BASE_COLORS.text2,
                fontWeight: isAnswer ? 800 : 500,
              }}
            >
              <span
                style={{
                  width: 17,
                  height: 17,
                  borderRadius: 5,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  background: isAnswer ? rgba(GREEN.rgb, 0.9) : rgba(CYAN.rgb, 0.14),
                  color: isAnswer ? "#04131A" : BASE_COLORS.text2,
                }}
              >
                {opt.key}
              </span>
              <span>{opt.text}</span>
            </div>
          );
        })}
      </div>
      <QuizExplanation presentation={visual} schedule={schedule} fontSize={optionSize} />
    </div>
  );
};
