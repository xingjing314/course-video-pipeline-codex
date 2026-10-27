/**
 * L03 专用题卡：并置版（CompactQuizCard）与迷你版（BriefQuizCard）。
 *
 * 为什么不用 `ExamQuizCard`：模板是 1920 全幅布局（left 120 / width 1680），
 * 并置两卡要 830 宽、迷你卡要 510 宽，整体缩放会把 22 px 正文压到 11 px。
 * 这里只复用它的 payload 契约与判卷语义（cue 驱动、负向题、读题不泄题）。
 */
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { BASE_COLORS, resolveTone, rgba } from "../../visual/tokens/colorCard";
import { linearProgress, springEnter } from "../../visual/tokens/motionPresets";
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

/* ───────────────────────── 并置卡（S06 / S09） ───────────────────────── */

export const CompactQuizCard: React.FC<{
  payload: ExamQuizPayload;
  cues?: ResolvedCuePoint[];
  left: number;
  top: number;
  width: number;
  /** 讲解焦点：false 时压暗，题面仍可读 */
  active?: boolean;
  ring?: boolean;
}> = ({ payload, cues = [], left, top, width, active = true, ring = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const negative = payload.polarity === "negative";
  const answerKey = negative ? payload.options.find((o) => !o.isCorrect)?.key : undefined;

  const eliminateCues = cues.filter((c) => c.action === "eliminate-option");
  const revealCue = cues.find((c) => c.action === "reveal-answer");
  const thinkingCue = cues.find((c) => c.action === "thinking-pause");

  const revealAt = revealCue ? revealCue.localFrame : Infinity;
  const revealed = frame >= revealAt;
  const elimFallback = eliminateCues.length
    ? eliminateCues[0].localFrame
    : revealCue
      ? revealCue.localFrame
      : Infinity;

  const ringFrom = thinkingCue ? thinkingCue.localFrame : null;
  const ringSpan = 90;
  const showRing =
    ring && ringFrom !== null && frame >= ringFrom && frame < ringFrom + ringSpan;
  const ringProgress = ringFrom === null ? 0 : Math.max(0, Math.min(1, (frame - ringFrom) / ringSpan));
  const secondsLeft = Math.max(0, Math.ceil((ringSpan - (frame - (ringFrom ?? 0))) / fps));

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width,
        padding: "18px 22px 20px",
        borderRadius: 18,
        boxSizing: "border-box",
        background: active ? "rgba(8, 19, 41, 0.92)" : "rgba(8, 19, 41, 0.72)",
        border: `1.5px solid ${rgba(CYAN.rgb, active ? 0.62 : 0.22)}`,
        boxShadow: active ? `0 0 34px ${rgba(CYAN.rgb, 0.18)}` : undefined,
        opacity: active ? 1 : 0.46,
      }}
    >
      {/* 头部：场次 + 状态 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span
          style={{
            padding: "3px 12px",
            borderRadius: 999,
            border: `1px solid ${GOLD.hex}`,
            background: rgba(GOLD.rgb, 0.16),
            color: GOLD.hex,
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          {payload.examMeta}
        </span>
        <span style={{ fontSize: 13, color: revealed ? GREEN.hex : BASE_COLORS.text2, marginRight: showRing ? 62 : 0 }}>
          {revealed ? "✓ 已揭晓" : "⏱ 审题抓题眼"}
        </span>
      </div>

      {/* 倒计时环 */}
      {showRing ? (
        <div style={{ position: "absolute", right: 16, top: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ position: "relative", width: 52, height: 52 }}>
            <svg width={52} height={52} style={{ transform: "rotate(-90deg)" }}>
              <circle cx={26} cy={26} r={21} fill="none" stroke="rgba(143,184,217,0.22)" strokeWidth={4} />
              <circle
                cx={26}
                cy={26}
                r={21}
                fill="none"
                stroke={GOLD.hex}
                strokeWidth={4}
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 21}
                strokeDashoffset={2 * Math.PI * 21 * ringProgress}
              />
            </svg>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                fontWeight: 800,
                color: GOLD.hex,
              }}
            >
              {secondsLeft}s
            </div>
          </div>
        </div>
      ) : null}

      {/* 题干 */}
      <div style={{ fontSize: 19, fontWeight: 700, color: BASE_COLORS.text, lineHeight: 1.5 }}>
        {payload.stem}
      </div>

      {/* 选项 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
        {payload.options.map((opt, idx) => {
          const isAnswer = negative ? revealed && opt.key === answerKey : revealed && opt.isCorrect;
          const isTrueStmt = negative && revealed && opt.isCorrect;
          const elimCue = eliminateCues.find((c) => c.targetId === opt.key);
          const elimAt = elimCue ? elimCue.localFrame : elimFallback;
          const flagged = frame >= elimAt && (negative ? opt.key === answerKey && !revealed : !opt.isCorrect);
          const strike = !negative && flagged && !opt.critiqueNote ? linearProgress(frame, elimAt, 12) : 0;
          const enter = springEnter(frame, fps, 6 + idx * 3);

          return (
            <div
              key={opt.key}
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
                    fontSize: 17,
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
    </div>
  );
};

/* ───────────────────────── 迷你卡（S24 / T18 / T46） ───────────────────────── */

export const BriefQuizCard: React.FC<{
  payload: ExamQuizPayload;
  left: number;
  top: number;
  width: number;
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
}> = ({
  payload,
  left,
  top,
  width,
  height,
  columns = 2,
  revealAt = null,
  fillText,
  tag,
  bodySize = 13.5,
  optionSize = 12.5,
  enterAt = null,
}) => {
  const frame = useCurrentFrame();
  const negative = payload.polarity === "negative";
  const answerKey = negative ? payload.options.find((o) => !o.isCorrect)?.key : undefined;
  const revealed = revealAt !== null && frame >= revealAt;
  const filled = Boolean(fillText) && revealed;
  const entered = enterAt === null ? 1 : Math.max(0, Math.min(1, (frame - enterAt) / 10));

  const stem = filled
    ? payload.stem.replace(/（[\s　]*）/, `（${fillText}）`)
    : payload.stem;

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width,
        height,
        padding: "14px 16px",
        borderRadius: 14,
        boxSizing: "border-box",
        background: "rgba(8, 19, 41, 0.88)",
        border: `1.5px solid ${rgba(GOLD.rgb, 0.42)}`,
        overflow: "hidden",
        opacity: entered,
        transform: `translateY(${(1 - entered) * 10}px)`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: GOLD.hex }}>{payload.examMeta}</span>
        {tag ? <span style={{ fontSize: 11.5, color: BASE_COLORS.text2 }}>{tag}</span> : null}
      </div>
      <div style={{ marginTop: 6, fontSize: bodySize, lineHeight: 1.45, color: BASE_COLORS.text }}>
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
          marginTop: 8,
          display: "grid",
          gridTemplateColumns: columns === 2 ? "1fr 1fr" : "1fr",
          gap: 5,
        }}
      >
        {payload.options.map((opt) => {
          const isAnswer = revealed && (negative ? opt.key === answerKey : opt.isCorrect);
          return (
            <div
              key={opt.key}
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
    </div>
  );
};
