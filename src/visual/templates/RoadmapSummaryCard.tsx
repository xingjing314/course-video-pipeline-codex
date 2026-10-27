import React from "react";
import { CANVAS, Entered, SceneShell } from "./shared";
import { BASE_COLORS, resolveTone, rgba } from "../tokens/colorCard";
import type { RoadmapSummaryPayload } from "../../../contracts/visual-props.schema";

/** 路线图：阶段周期、目标与条目均为教学文字。 */
export const RoadmapSummaryCard: React.FC<{ payload: RoadmapSummaryPayload }> = ({ payload }) => {
  const phases = payload.phases;
  const gap = 30;
  const totalWidth = 1620;
  const columnWidth = (totalWidth - gap * (phases.length - 1)) / phases.length;
  const left = (CANVAS.width - totalWidth) / 2;
  const top = 320;

  return (
    <SceneShell title={payload.title} subtitle={payload.subtitle}>
      <div
        style={{
          position: "absolute",
          left,
          top: top - 26,
          width: totalWidth,
          height: 3,
          background: rgba(resolveTone("cyan").rgb, 0.24),
        }}
      />
      {phases.map((phase, index) => {
        const tone = resolveTone(phase.tone ?? (index % 3 === 0 ? "cyan" : index % 3 === 1 ? "blue" : "green"));
        return (
          <Entered key={`${phase.period}-${index}`} delay={6 + index * 6}>
            {(enter) => (
              <div
                style={{
                  position: "absolute",
                  left: left + index * (columnWidth + gap),
                  top,
                  width: columnWidth,
                  opacity: enter,
                  transform: `translateY(${(1 - enter) * 24}px)`,
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: tone.hex,
                    marginLeft: columnWidth / 2 - 11,
                    marginTop: -38,
                    boxShadow: `0 0 18px ${rgba(tone.rgb, 0.7)}`,
                  }}
                />
                <div
                  style={{
                    borderRadius: 16,
                    background: "rgba(6, 14, 31, 0.68)",
                    border: `1.5px solid ${rgba(tone.rgb, 0.4)}`,
                    padding: 24,
                    boxSizing: "border-box",
                    minHeight: 340,
                  }}
                >
                  <div style={{ fontSize: 20, letterSpacing: 2, color: tone.hex, marginBottom: 10 }}>{phase.period}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: BASE_COLORS.text, marginBottom: 16 }}>{phase.title}</div>
                  {phase.items.map((item) => (
                    <div key={item} style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: tone.hex, marginTop: 10, flex: "0 0 auto" }} />
                      <div style={{ fontSize: 20, color: BASE_COLORS.text2, lineHeight: 1.5 }}>{item}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Entered>
        );
      })}
    </SceneShell>
  );
};
