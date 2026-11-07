import React from "react";
import { QuizOptionRow, QuizExplanation, quizFade, type QuizPresentation } from "./quiz-presentation";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Entered, SceneShell } from "./shared";
import { BASE_COLORS, resolveTone, rgba } from "../tokens/colorCard";
import { springEnter } from "../tokens/motionPresets";
import { Countdown, type CountdownAppearance } from "../kit/Countdown";
import { getDualQuizCues, getQuizSchedule, type QuizTiming } from "./quiz-timing";
import type { DualQuizBattlePayload, ExamQuizPayload, ResolvedCuePoint } from "../../../contracts/visual-props.schema";

type DualQuizQuestion = DualQuizBattlePayload["leftQuiz"] & Pick<ExamQuizPayload, "polarity"> & { extraNote?: string };
export type DualQuizCardPayload = Omit<DualQuizBattlePayload, "leftQuiz" | "rightQuiz"> & {
  leftQuiz: DualQuizQuestion;
  rightQuiz: DualQuizQuestion;
};

export type DualQuizBattleCardProps = {
  payload: DualQuizCardPayload;
  cues?: ResolvedCuePoint[];
  timing?: { left?: QuizTiming; right?: QuizTiming };
  countdown?: CountdownAppearance | false;
  /** 公共配色、逐项讲解与帧过渡；省略时保留原有课时表现。 */
  presentation?: { left?: QuizPresentation; right?: QuizPresentation };
  /** paper 沿用完整题面样式，将各题解析置于其下方。 */
  variant?: "stacked" | "paper";
  height?: number;
  left?: number;
  top?: number;
  width?: number;
  gap?: number;
  columns?: 1 | 2;
  bodySize?: number;
  optionSize?: number;
  tone?: string;
  style?: React.CSSProperties;
  cardStyle?: React.CSSProperties;
  cardStyles?: { left?: React.CSSProperties; right?: React.CSSProperties };
  withShell?: boolean;
};

export const DualQuizBattleCard: React.FC<DualQuizBattleCardProps> = ({
  payload, cues = [], timing, countdown = {}, variant = "stacked", height = 370, left = 120, top, width = 1680, gap = 40,
  columns = variant === "paper" ? 1 : 2, bodySize = 20, optionSize = variant === "paper" ? 17 : 18, tone = "cyan", style, cardStyle, cardStyles, withShell = true, presentation,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const hasTopTable = Boolean(payload.topComparisonTable && payload.topComparisonTable.rows.length > 0);
  const paper = variant === "paper";
  const quizTop = top ?? (hasTopTable ? 470 : paper ? 155 : 210);
  const leftSchedule = getQuizSchedule(getDualQuizCues(cues, "left"), fps, timing?.left);
  const rightSchedule = getQuizSchedule(getDualQuizCues(cues, "right"), fps, timing?.right);
  const tableRevealed = frame >= Math.max(leftSchedule.revealFrame, rightSchedule.revealFrame);

  const renderQuizColumn = (
    quiz: DualQuizQuestion,
    schedule: ReturnType<typeof getQuizSchedule>,
    side: "left" | "right",
    delayOffset: number,
  ) => {
    const enter = paper || (schedule.thinking && frame >= schedule.thinking.startFrame) ? 1 : springEnter(frame, fps, delayOffset);
    const visual = presentation?.[side] ?? (paper ? {} : undefined);
    const revealed = frame >= schedule.revealFrame;
    const answerProgress = quizFade(frame, schedule.revealFrame, Math.max(1, Math.round((visual?.transitionSeconds ?? 0.2) * fps)));
    const answerKeys = quiz.options.filter((option) => quiz.polarity === "negative" ? !option.isCorrect : option.isCorrect).map((option) => option.key).join("、");
    const explanation = <QuizExplanation presentation={visual} schedule={schedule} fontSize={optionSize} />;
    const card = (
      <div
        data-quiz-side={side}
        style={{
          position: "relative",
          width: "100%",
          boxSizing: "border-box",
          height: paper ? height : undefined,
          padding: paper ? "16px 24px" : "18px 24px",
          borderRadius: 16,
          background: paper ? "rgba(8, 19, 41, 0.94)" : "rgba(8, 19, 41, 0.86)",
          border: `${paper ? 2 : 1.5}px solid ${rgba(resolveTone(tone).rgb, paper ? 0.55 : 0.5)}`,
          boxShadow: paper ? "0 8px 32px rgba(0,0,0,0.45)" : undefined,
          opacity: enter,
          transform: `translateY(${(1 - enter) * 18}px)`,
          ...cardStyle,
          ...cardStyles?.[side],
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: paper ? 10 : 8,
          minHeight: paper ? Math.max(40, countdown !== false ? (countdown.size ?? 40) : 0) : schedule.thinking && countdown !== false ? (countdown.size ?? 52) : undefined }}>
          <span
            style={{
              padding: paper ? "4px 14px" : "3px 12px",
              borderRadius: 999,
              background: rgba(resolveTone("gold").rgb, paper ? 0.22 : 0.2),
              border: `${paper ? 1.5 : 1}px solid ${resolveTone("gold").hex}`,
              color: resolveTone("gold").hex,
              fontSize: paper ? 16 : 17,
              fontWeight: 700,
            }}
          >
            {quiz.examMeta}
          </span>
          {revealed ? (
            <span style={{ fontSize: paper ? 15 : 17, fontWeight: 700, color: resolveTone("green").hex,
              opacity: paper ? answerProgress : 1, whiteSpace: "nowrap" }}>{paper ? `✓ 正确选项：${answerKeys}` : "✓ 已锁定答案"}</span>
          ) : null}
          {schedule.thinking && countdown !== false ? <Countdown {...schedule.thinking} size={paper ? 40 : 52} strokeWidth={paper ? 4.5 : 4} {...(paper ? {
            ringInset: 2.25, numberSize: 16.8, showUnit: false,
          } : {})} {...countdown} /> : null}
        </div>
        <div style={{ fontSize: bodySize, fontWeight: 700, color: BASE_COLORS.text, lineHeight: 1.4, marginBottom: paper ? 10 : 12 }}>
          {quiz.stem}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: columns === 2 ? "1fr 1fr" : "1fr", gap: paper ? 8 : 10 }}>
          {quiz.options.map((opt) => {
            if (visual) return <QuizOptionRow key={opt.key} option={opt} negative={quiz.polarity === "negative"}
              schedule={schedule} presentation={visual} fontSize={optionSize} density={paper ? "paper" : "compact"} />;
            const isAnswer = quiz.polarity === "negative" ? !opt.isCorrect : opt.isCorrect;
            const isAns = revealed && isAnswer;
            const isWrongNote = revealed && !isAnswer && Boolean(opt.critiqueNote);
            return (
              <div
                key={opt.key}
                data-option-key={opt.key}
                data-answer-revealed={isAns || undefined}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: isAns
                    ? rgba(resolveTone("green").rgb, 0.22)
                    : isWrongNote
                      ? rgba(resolveTone("red").rgb, 0.18)
                      : "rgba(6, 14, 31, 0.78)",
                  border: `1.5px solid ${
                    isAns
                      ? resolveTone("green").hex
                      : isWrongNote
                        ? resolveTone("red").hex
                        : rgba(resolveTone("blue").rgb, 0.38)
                  }`,
                  color: BASE_COLORS.text,
                  fontSize: optionSize,
                  fontWeight: isAns ? 700 : 500,
                }}
              >
                <div>
                  <strong>{opt.key}.</strong> {opt.text} {isAns ? "✓" : ""}
                </div>
                {isWrongNote && opt.critiqueNote ? (
                  <div style={{ fontSize: 15, color: "#FCA5A5", marginTop: 4 }}>❌ {opt.critiqueNote}</div>
                ) : null}
              </div>
            );
          })}
        </div>
        {!paper ? explanation : null}
        {quiz.extraNote && revealed ? (
          <div
            style={{
              marginTop: 10,
              padding: "6px 12px",
              borderRadius: 8,
              background: rgba(resolveTone("purple").rgb, 0.18),
              color: BASE_COLORS.text2,
              fontSize: 16,
            }}
          >
            📌 {quiz.extraNote}
          </div>
        ) : null}
      </div>
    );
    return paper ? <div data-quiz-column={side} style={{ minWidth: 0 }}>
      {card}
      {explanation}
    </div> : card;
  };

  const content = (
    <div data-quiz-card="dual" style={{ fontFamily: '"Noto Sans CJK SC", sans-serif', ...style }}>
      {hasTopTable && payload.topComparisonTable && tableRevealed ? (
        <Entered delay={4}>
          {(enter) => (
            <div
              style={{
                position: "absolute",
                left,
                width,
                boxSizing: "border-box",
                top: 185,
                borderRadius: 14,
                overflow: "hidden",
                border: `1.5px solid ${rgba(resolveTone("gold").rgb, 0.55)}`,
                background: "rgba(6, 14, 31, 0.85)",
                opacity: enter,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2.2fr 1.1fr 1.6fr",
                  background: rgba(resolveTone("gold").rgb, 0.22),
                  padding: "10px 20px",
                  fontSize: 19,
                  fontWeight: 700,
                  color: resolveTone("gold").hex,
                }}
              >
                {payload.topComparisonTable!.headers.map((h, i) => (
                  <div key={i}>{h}</div>
                ))}
              </div>
              {payload.topComparisonTable!.rows.map((row, rIdx) => (
                <div
                  key={rIdx}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2.2fr 1.1fr 1.6fr",
                    padding: "9px 20px",
                    fontSize: 18,
                    color: BASE_COLORS.text,
                    borderTop: "1px solid rgba(148, 163, 184, 0.18)",
                    background: rIdx % 2 === 0 ? "transparent" : "rgba(15, 29, 56, 0.45)",
                  }}
                >
                  {row.map((cell, cIdx) => (
                    <div
                      key={cIdx}
                      style={{
                        fontWeight: cIdx === 1 ? 700 : 500,
                        color: cIdx === 1 ? resolveTone(tone).hex : BASE_COLORS.text,
                      }}
                    >
                      {cell}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </Entered>
      ) : null}

      <div style={{ position: "absolute", left, top: quizTop, width, display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap, alignItems: "stretch" }}>
        {renderQuizColumn(payload.leftQuiz, leftSchedule, "left", 10)}
        {renderQuizColumn(payload.rightQuiz, rightSchedule, "right", 16)}
      </div>
    </div>
  );

  return withShell ? <SceneShell title={payload.title} subtitle={payload.subtitle}>{content}</SceneShell> : content;
};
