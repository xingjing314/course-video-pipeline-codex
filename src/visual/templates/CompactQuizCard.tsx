import React from "react";
import { QuizOptionRow, QuizExplanation, quizFade, type QuizPresentation } from "./quiz-presentation";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { BASE_COLORS, resolveTone, rgba } from "../tokens/colorCard";
import { linearProgress, springEnter } from "../tokens/motionPresets";
import { Countdown, type CountdownAppearance } from "../kit/Countdown";
import { getQuizSchedule, type QuizTiming } from "./quiz-timing";
import type { ExamQuizPayload, ResolvedCuePoint } from "../../../contracts/visual-props.schema";

const CYAN = resolveTone("cyan");
const GOLD = resolveTone("gold");
const GREEN = resolveTone("green");
const RED = resolveTone("red");
const BLUE = resolveTone("blue");

const highlight = (text: string, hl?: string) => {
  if (!hl) return text;
  const idx = text.indexOf(hl);
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span style={{ color: "#FCA5A5", textDecoration: "underline", textDecorationColor: RED.hex, textUnderlineOffset: 5 }}>
        {hl}
      </span>
      {text.slice(idx + hl.length)}
    </>
  );
};

export type CompactQuizCardProps = {
  payload: ExamQuizPayload;
  cues?: ResolvedCuePoint[];
  timing?: QuizTiming;
  countdown?: CountdownAppearance | false;
  /** 公共配色、逐项讲解与帧过渡；省略时保留原有课时表现。 */
  presentation?: QuizPresentation;
  /** paper 复用完整题面样式，卡片随实际解析自然增高。 */
  variant?: "stacked" | "paper";
  left?: number;
  top?: number;
  width?: number;
  columns?: 1 | 2;
  bodySize?: number;
  optionSize?: number;
  tone?: string;
  style?: React.CSSProperties;
  /** 讲解焦点：false 时压暗，题面仍可读 */
  active?: boolean;
  ring?: boolean;
};

export const CompactQuizCard: React.FC<CompactQuizCardProps> = ({
  payload, cues = [], timing, countdown = {}, variant = "stacked",
  left = variant === "paper" ? 120 : 96, top = variant === "paper" ? 155 : 214, width = variant === "paper" ? 820 : 830,
  columns = 1, bodySize = variant === "paper" ? 20 : 19, optionSize = 17, tone = "cyan", style, active = true, ring = true, presentation,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const negative = payload.polarity === "negative";
  const answerKey = negative ? payload.options.find((o) => !o.isCorrect)?.key : undefined;

  const schedule = getQuizSchedule(cues, fps, timing);
  const { thinking, eliminateCues, eliminateFrame: elimFallback, revealFrame } = schedule;
  const revealed = frame >= revealFrame;
  const accent = resolveTone(tone);
  const paper = variant === "paper";
  const visual = presentation ?? (paper ? {} : undefined);
  const answerProgress = quizFade(frame, revealFrame, Math.max(1, Math.round((visual?.transitionSeconds ?? 0.2) * fps)));
  const answerKeys = payload.options.filter((option) => negative ? !option.isCorrect : option.isCorrect).map((option) => option.key).join("、");

  return (
    <div
      data-quiz-card="compact"
      style={{
        position: "absolute",
        left,
        top,
        width,
        padding: paper ? "16px 24px" : "18px 22px 20px",
        borderRadius: paper ? 16 : 18,
        boxSizing: "border-box",
        background: paper ? "rgba(8, 19, 41, 0.94)" : active ? "rgba(8, 19, 41, 0.92)" : "rgba(8, 19, 41, 0.72)",
        border: `${paper ? 2 : 1.5}px solid ${rgba(accent.rgb, active ? (paper ? 0.55 : 0.62) : 0.22)}`,
        boxShadow: paper ? "0 8px 32px rgba(0,0,0,0.45)" : active ? `0 0 34px ${rgba(accent.rgb, 0.18)}` : undefined,
        opacity: active || visual ? 1 : 0.46,
        fontFamily: '"Noto Sans CJK SC", sans-serif',
        ...style,
      }}
    >
      {/* 头部：场次 + 状态 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 10,
        minHeight: paper ? Math.max(40, ring && countdown !== false ? (countdown.size ?? 40) : 0) : ring && thinking && countdown !== false ? (countdown.size ?? 52) : undefined }}>
        <span
          style={{
            padding: paper ? "4px 14px" : "3px 12px",
            borderRadius: 999,
            border: `${paper ? 1.5 : 1}px solid ${GOLD.hex}`,
            background: rgba(GOLD.rgb, paper ? 0.22 : 0.16),
            color: GOLD.hex,
            fontSize: paper ? 16 : 14,
            fontWeight: 700,
          }}
        >
          {payload.examMeta}
        </span>
        {!paper || revealed ? <span style={{ fontSize: paper ? 15 : 13, color: revealed ? GREEN.hex : BASE_COLORS.text2, marginLeft: "auto",
          fontWeight: paper ? 700 : undefined, opacity: paper ? answerProgress : 1, whiteSpace: "nowrap" }}>
          {paper ? `✓ 正确选项：${answerKeys}` : revealed ? "✓ 已揭晓" : "⏱ 审题抓题眼"}
        </span> : null}
        {ring && thinking && countdown !== false ? <Countdown {...thinking} size={paper ? 40 : 52} strokeWidth={paper ? 4.5 : 4}
          {...(paper ? { ringInset: 2.25, numberSize: 16.8, showUnit: false } : {})} {...countdown} /> : null}
      </div>

      {/* 题干 */}
      <div style={{ fontSize: bodySize, fontWeight: 700, color: BASE_COLORS.text, lineHeight: paper ? 1.4 : 1.5 }}>
        {payload.stem}
      </div>

      {/* 选项 */}
      <div style={{ display: "grid", gridTemplateColumns: columns === 2 ? "1fr 1fr" : "1fr", gap: 8, marginTop: paper ? 10 : 12 }}>
        {payload.options.map((opt, idx) => {
          if (visual) return <QuizOptionRow key={opt.key} option={opt} negative={negative}
            schedule={schedule} presentation={visual} fontSize={optionSize} density={paper ? "paper" : "compact"} />;
          const isAnswer = negative ? revealed && opt.key === answerKey : revealed && opt.isCorrect;
          const isTrueStmt = negative && revealed && opt.isCorrect;
          const elimCue = eliminateCues.find((c) => c.targetId === opt.key);
          const elimAt = elimCue ? elimCue.localFrame : elimFallback;
          const flagged = frame >= elimAt && (negative ? opt.key === answerKey && !revealed : !opt.isCorrect);
          const strike = !negative && flagged && !opt.critiqueNote ? linearProgress(frame, elimAt, 12) : 0;
          const enter = thinking && frame >= thinking.startFrame ? 1 : springEnter(frame, fps, 6 + idx * 3);

          return (
            <div
              key={opt.key}
              data-option-key={opt.key}
              data-answer-revealed={isAnswer || undefined}
              style={{
                position: "relative",
                padding: "8px 12px",
                borderRadius: 12,
                background: isAnswer ? rgba(GREEN.rgb, 0.2) : "rgba(6, 14, 31, 0.78)",
                border: `1.5px solid ${
                  isAnswer ? rgba(GREEN.rgb, 0.95) : flagged ? rgba(RED.rgb, 0.75) : rgba(BLUE.rgb, 0.35)
                }`,
                boxShadow: isAnswer ? `0 0 22px ${rgba(GREEN.rgb, 0.28)}` : undefined,
                opacity: enter * (flagged && !isAnswer ? 0.6 : 1),
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 7,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 800,
                  background: isAnswer ? GREEN.hex : flagged ? rgba(RED.rgb, 0.25) : rgba(CYAN.rgb, 0.18),
                  color: isAnswer ? "#04131A" : BASE_COLORS.text,
                }}
              >
                {opt.key}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: optionSize,
                    lineHeight: 1.4,
                    color: isAnswer ? "#ECFDF5" : BASE_COLORS.text,
                    fontWeight: isAnswer ? 700 : 500,
                    textDecoration: strike > 0.6 ? "line-through" : "none",
                  }}
                >
                  {highlight(opt.text, flagged && !isAnswer ? opt.errorHighlight : undefined)}
                </div>
                {opt.critiqueNote && (flagged || isAnswer) ? (
                  <div style={{ marginTop: 3, fontSize: 12.5, lineHeight: 1.3, color: flagged && !isAnswer ? "#FCA5A5" : BASE_COLORS.text2 }}>
                    {opt.critiqueNote}
                  </div>
                ) : null}
              </div>
              {isAnswer ? (
                <span
                  style={{
                    padding: "2px 10px",
                    borderRadius: 999,
                    background: GREEN.hex,
                    color: "#04131A",
                    fontSize: 13,
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  ✓ 正确答案
                </span>
              ) : isTrueStmt ? (
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: 999,
                    border: `1px solid ${rgba(CYAN.rgb, 0.6)}`,
                    color: CYAN.hex,
                    fontSize: 12.5,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  ✓ 表述正确
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
      <QuizExplanation presentation={visual} schedule={schedule} fontSize={optionSize} />
    </div>
  );
};
