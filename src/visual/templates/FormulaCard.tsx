import React from "react";
import { CANVAS, Entered, SceneShell } from "./shared";
import { BASE_COLORS, resolveTone, rgba } from "../tokens/colorCard";
import type { FormulaCardPayload } from "../../../contracts/visual-props.schema";

/** 公式卡：公式、变量说明与注释均为教学文字，使用等宽字体保证符号清晰。 */
export const FormulaCard: React.FC<{ payload: FormulaCardPayload }> = ({ payload }) => {
  const tone = resolveTone("gold");
  const panelWidth = 1400;
  const left = (CANVAS.width - panelWidth) / 2;
  return (
    <SceneShell title={payload.title}>
      <Entered delay={4}>
        {(enter) => (
          <div
            style={{
              position: "absolute",
              left,
              top: 300,
              width: panelWidth,
              minHeight: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 20,
              background: rgba(tone.rgb, 0.12),
              border: `1.5px solid ${rgba(tone.rgb, 0.5)}`,
              opacity: enter,
              transform: `scale(${0.96 + enter * 0.04})`,
            }}
          >
            <div
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 62,
                fontWeight: 600,
                color: BASE_COLORS.text,
                letterSpacing: 1.5,
              }}
            >
              {payload.formula}
            </div>
          </div>
        )}
      </Entered>
      <div style={{ position: "absolute", left, top: 540, width: panelWidth, display: "flex", flexWrap: "wrap", gap: 22 }}>
        {payload.variables.map((variable, index) => (
          <Entered key={`${variable.symbol}-${index}`} delay={10 + index * 5}>
            {(enter) => (
              <div
                style={{
                  minWidth: 300,
                  flex: "1 1 40%",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  borderRadius: 12,
                  border: `1px solid ${rgba(tone.rgb, 0.3)}`,
                  background: "rgba(6, 14, 31, 0.62)",
                  padding: "16px 22px",
                  boxSizing: "border-box",
                  opacity: enter,
                }}
              >
                <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 30, color: tone.hex, minWidth: 60 }}>
                  {variable.symbol}
                </div>
                <div style={{ fontSize: 22, color: BASE_COLORS.text2, lineHeight: 1.4 }}>{variable.meaning}</div>
              </div>
            )}
          </Entered>
        ))}
      </div>
      {payload.note ? (
        <div style={{ position: "absolute", left, top: 760, width: panelWidth, fontSize: 22, color: BASE_COLORS.text2 }}>
          {payload.note}
        </div>
      ) : null}
    </SceneShell>
  );
};
