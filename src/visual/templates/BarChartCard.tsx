import React from "react";
import { CANVAS, Entered, SceneShell } from "./shared";
import { BASE_COLORS, resolveTone, rgba } from "../tokens/colorCard";
import type { BarChartPayload } from "../../../contracts/visual-props.schema";

/** 柱状图：数值、单位与标签均为教学文字；柱高按最大值归一。 */
export const BarChartCard: React.FC<{ payload: BarChartPayload }> = ({ payload }) => {
  const series = payload.series;
  const maxValue = payload.maxValue ?? Math.max(...series.map((item) => item.value)) * 1.15;
  const chartLeft = 260;
  const chartWidth = CANVAS.width - 520;
  const chartTop = 300;
  const chartHeight = 480;
  const slot = chartWidth / series.length;
  const barWidth = Math.min(120, slot * 0.5);

  return (
    <SceneShell title={payload.title} subtitle={payload.subtitle}>
      <div style={{ position: "absolute", left: chartLeft, top: chartTop + chartHeight, width: chartWidth, height: 2, background: rgba(resolveTone("neutral").rgb, 0.5) }} />
      {series.map((item, index) => {
        const tone = resolveTone(item.tone ?? (index % 3 === 0 ? "cyan" : index % 3 === 1 ? "blue" : "green"));
        const height = Math.max(12, (item.value / maxValue) * chartHeight);
        const x = chartLeft + slot * index + (slot - barWidth) / 2;
        return (
          <Entered key={`${item.label}-${index}`} delay={6 + index * 5}>
            {(enter) => (
              <>
                <div
                  style={{
                    position: "absolute",
                    left: x,
                    top: chartTop + chartHeight - height,
                    width: barWidth,
                    height: height * enter,
                    borderRadius: "10px 10px 0 0",
                    background: `linear-gradient(180deg, ${tone.hex} 0%, ${rgba(tone.rgb, 0.35)} 100%)`,
                    border: `1px solid ${rgba(tone.rgb, 0.75)}`,
                    boxSizing: "border-box",
                    opacity: enter,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: x - 20,
                    top: chartTop + chartHeight - height - 46,
                    width: barWidth + 40,
                    textAlign: "center",
                    fontSize: 24,
                    fontWeight: 700,
                    color: BASE_COLORS.text,
                    opacity: enter,
                  }}
                >
                  {item.value}
                  {payload.unit ?? ""}
                </div>
                <div
                  style={{
                    position: "absolute",
                    left: x - 40,
                    top: chartTop + chartHeight + 18,
                    width: barWidth + 80,
                    textAlign: "center",
                    fontSize: 22,
                    color: BASE_COLORS.text2,
                    opacity: enter,
                  }}
                >
                  {item.label}
                </div>
              </>
            )}
          </Entered>
        );
      })}
      {payload.caption ? (
        <div style={{ position: "absolute", left: chartLeft, top: chartTop + chartHeight + 74, width: chartWidth, textAlign: "center", fontSize: 20, color: BASE_COLORS.text2 }}>
          {payload.caption}
        </div>
      ) : null}
    </SceneShell>
  );
};
