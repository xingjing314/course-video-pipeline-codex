/**
 * 双真题同屏对决卡（DualQuizBattleCard）。
 *
 * 覆盖 L02 S03-2（两道经济可研真题左右同屏）与 L02 S04-2（顶部王牌防坑对照表 + 下方双真题同屏对决）。
 */
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Entered, SceneShell } from "./shared";
import { BASE_COLORS, resolveTone, rgba } from "../tokens/colorCard";
import { springEnter } from "../tokens/motionPresets";
import type { DualQuizBattlePayload, ResolvedCuePoint } from "../../../contracts/visual-props.schema";

export const DualQuizBattleCard: React.FC<{
  payload: DualQuizBattlePayload;
  cues?: ResolvedCuePoint[];
}> = ({ payload, cues = [] }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const hasTopTable = Boolean(payload.topComparisonTable && payload.topComparisonTable.rows.length > 0);
  const quizTop = hasTopTable ? 470 : 210;

  const leftRevealCue = cues.find((c) => c.targetId === "left" || c.action === "eliminate-option");
  const rightRevealCue = cues.find((c) => c.targetId === "right" || c.action === "reveal-answer");

  const leftRevealed = frame >= (leftRevealCue ? leftRevealCue.localFrame : Math.floor(durationInFrames * 0.38));
  const rightRevealed = frame >= (rightRevealCue ? rightRevealCue.localFrame : Math.floor(durationInFrames * 0.68));

  const renderQuizColumn = (
    quiz: DualQuizBattlePayload["leftQuiz"] & { extraNote?: string },
    revealed: boolean,
    leftPx: number,
    delayOffset: number,
  ) => {
    const enter = springEnter(frame, fps, delayOffset);
    return (
      <div
        style={{
          position: "absolute",
          left: leftPx,
          top: quizTop,
          width: 820,
          padding: "18px 24px",
          borderRadius: 16,
          background: "rgba(8, 19, 41, 0.86)",
          border: `1.5px solid ${rgba(resolveTone("cyan").rgb, 0.5)}`,
          opacity: enter,
          transform: `translateY(${(1 - enter) * 18}px)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span
            style={{
              padding: "3px 12px",
              borderRadius: 999,
              background: rgba(resolveTone("gold").rgb, 0.2),
              border: `1px solid ${resolveTone("gold").hex}`,
              color: resolveTone("gold").hex,
              fontSize: 17,
              fontWeight: 700,
            }}
          >
            {quiz.examMeta}
          </span>
          {revealed ? (
            <span style={{ fontSize: 17, fontWeight: 700, color: resolveTone("green").hex }}>✓ 已锁定答案</span>
          ) : null}
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: BASE_COLORS.text, lineHeight: 1.4, marginBottom: 12 }}>
          {quiz.stem}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {quiz.options.map((opt) => {
            const isAns = revealed && opt.isCorrect;
            const isWrongNote = revealed && !opt.isCorrect && Boolean(opt.critiqueNote);
            return (
              <div
                key={opt.key}
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
                  fontSize: 18,
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
  };

  return (
    <SceneShell title={payload.title} subtitle={payload.subtitle}>
      {hasTopTable && payload.topComparisonTable ? (
        <Entered delay={4}>
          {(enter) => (
            <div
              style={{
                position: "absolute",
                left: 120,
                right: 120,
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
                        color:
                          cIdx === 1
                            ? cell.includes("技术")
                              ? resolveTone("cyan").hex
                              : resolveTone("gold").hex
                            : BASE_COLORS.text,
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

      {renderQuizColumn(payload.leftQuiz, leftRevealed, 120, 10)}
      {renderQuizColumn(payload.rightQuiz, rightRevealed, 980, 16)}
    </SceneShell>
  );
};
