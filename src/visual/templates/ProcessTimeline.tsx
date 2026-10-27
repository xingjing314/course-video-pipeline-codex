import React from "react";
import { CANVAS, Entered, SceneShell } from "./shared";
import { BASE_COLORS, resolveTone, rgba } from "../tokens/colorCard";
import type { ProcessTimelinePayload } from "../../../contracts/visual-props.schema";

/** 流程时间轴：支持步骤强调、金色印章（如“★不可缺少”）、防坑警示签与下方对比轨道。 */
export const ProcessTimeline: React.FC<{ payload: ProcessTimelinePayload }> = ({ payload }) => {
  const steps = payload.steps;
  const horizontal = (payload.orientation ?? "horizontal") === "horizontal";
  const hasRails = Boolean(payload.comparisonRails && payload.comparisonRails.length > 0);
  const count = steps.length;
  const left = 180;
  const right = CANVAS.width - 180;
  const spacing = count > 1 ? (right - left) / (count - 1) : 0;
  const baseLineY = hasRails ? 340 : 450;
  const rowHeight = Math.min(130, Math.floor(560 / Math.max(1, count)));

  return (
    <SceneShell title={payload.title} subtitle={payload.subtitle}>
      {payload.warningBanner ? (
        <Entered delay={14}>
          {(enter) => (
            <div
              style={{
                position: "absolute",
                top: 56,
                right: 96,
                maxWidth: 680,
                padding: "12px 22px",
                borderRadius: 12,
                background: rgba(resolveTone("red").rgb, 0.18),
                border: `1.5px solid ${resolveTone("red").hex}`,
                color: BASE_COLORS.text,
                fontSize: 21,
                fontWeight: 700,
                opacity: enter,
                transform: `translateY(${(1 - enter) * -12}px)`,
              }}
            >
              {payload.warningBanner}
            </div>
          )}
        </Entered>
      ) : null}

      <div
        style={{
          position: "absolute",
          left: horizontal ? left : 260,
          top: horizontal ? baseLineY : 250,
          width: horizontal ? right - left : 3,
          height: horizontal ? 3 : rowHeight * (count - 1),
          background: rgba(resolveTone("cyan").rgb, 0.32),
        }}
      />

      {steps.map((step, index) => {
        const tone = resolveTone(step.emphasis ? "gold" : index % 2 === 0 ? "cyan" : "blue");
        const x = horizontal ? left + spacing * index : 260;
        const y = horizontal ? baseLineY : 250 + rowHeight * index;
        return (
          <Entered key={`${step.label}-${index}`} delay={5 + index * 5}>
            {(enter) => (
              <>
                <div
                  style={{
                    position: "absolute",
                    left: x - 28,
                    top: y - 28,
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: rgba(tone.rgb, 0.94),
                    border: `2px solid ${tone.hex}`,
                    boxShadow: step.emphasis ? `0 0 24px ${rgba(tone.rgb, 0.65)}` : undefined,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                    fontWeight: 700,
                    color: BASE_COLORS.textOnSolid,
                    opacity: enter,
                    transform: `scale(${0.85 + enter * 0.15})`,
                  }}
                >
                  {index + 1}
                </div>
                {step.stampText ? (
                  <div
                    style={{
                      position: "absolute",
                      left: x - 110,
                      top: y - 78,
                      width: 220,
                      textAlign: "center",
                      padding: "4px 12px",
                      borderRadius: 999,
                      background: rgba(resolveTone("gold").rgb, 0.22),
                      border: `1.5px solid ${resolveTone("gold").hex}`,
                      color: resolveTone("gold").hex,
                      fontSize: 18,
                      fontWeight: 700,
                      opacity: enter,
                    }}
                  >
                    {step.stampText}
                  </div>
                ) : null}
                <div
                  style={{
                    position: "absolute",
                    left: horizontal ? Math.max(48, x - 175) : x + 52,
                    top: horizontal ? y + 44 : y - 26,
                    width: horizontal ? 350 : 1320,
                    textAlign: horizontal ? "center" : "left",
                    opacity: enter,
                    transform: `translateY(${(1 - enter) * 14}px)`,
                  }}
                >
                  <div style={{ fontSize: 26, fontWeight: 700, color: BASE_COLORS.text }}>{step.label}</div>
                  {step.description ? (
                    <div style={{ fontSize: 19, color: BASE_COLORS.text2, marginTop: 6, lineHeight: 1.4 }}>
                      {step.description}
                    </div>
                  ) : null}
                </div>
              </>
            )}
          </Entered>
        );
      })}

      {hasRails && payload.comparisonRails ? (
        <div
          style={{
            position: "absolute",
            left: 120,
            right: 120,
            top: 545,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {payload.comparisonRails.map((rail, rIdx) => {
            const rTone = resolveTone(rail.tone ?? (rIdx === 0 ? "gold" : rIdx === 1 ? "cyan" : "green"));
            return (
              <Entered key={`${rail.label}-${rIdx}`} delay={16 + rIdx * 6}>
                {(enter) => (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 20,
                      padding: "16px 26px",
                      borderRadius: 14,
                      background: "rgba(6, 14, 31, 0.78)",
                      border: `1.5px solid ${rgba(rTone.rgb, 0.55)}`,
                      opacity: enter,
                      transform: `translateX(${(1 - enter) * 24}px)`,
                    }}
                  >
                    <div
                      style={{
                        minWidth: 230,
                        padding: "6px 14px",
                        borderRadius: 8,
                        background: rgba(rTone.rgb, 0.2),
                        color: rTone.hex,
                        fontSize: 21,
                        fontWeight: 700,
                        textAlign: "center",
                      }}
                    >
                      {rail.label}
                    </div>
                    <div style={{ fontSize: 22, color: BASE_COLORS.text, lineHeight: 1.45 }}>{rail.rule}</div>
                  </div>
                )}
              </Entered>
            );
          })}
        </div>
      ) : null}
    </SceneShell>
  );
};
