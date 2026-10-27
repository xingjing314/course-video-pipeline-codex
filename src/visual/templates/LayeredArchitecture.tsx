import React from "react";
import { CANVAS, Entered, SceneShell } from "./shared";
import { BASE_COLORS, resolveTone, rgba } from "../tokens/colorCard";
import type { LayeredArchitecturePayload } from "../../../contracts/visual-props.schema";

/** 分层架构：自上而下的层叠结构，层名与条目均为教学文字。 */
export const LayeredArchitecture: React.FC<{ payload: LayeredArchitecturePayload }> = ({ payload }) => {
  const layers = payload.layers;
  const count = layers.length;
  const panelWidth = 1180;
  const gap = 18;
  const available = 640;
  const layerHeight = Math.max(90, Math.min(150, (available - gap * (count - 1)) / count));
  const top = 250;
  const left = (CANVAS.width - panelWidth) / 2;

  return (
    <SceneShell title={payload.title} subtitle={payload.subtitle}>
      {layers.map((layer, index) => {
        const tone = resolveTone(layer.tone ?? (index === 0 ? "gold" : index % 2 === 0 ? "blue" : "cyan"));
        const y = top + index * (layerHeight + gap);
        return (
          <Entered key={`${layer.label}-${index}`} delay={6 + index * 5}>
            {(enter) => (
              <div
                style={{
                  position: "absolute",
                  left,
                  top: y,
                  width: panelWidth,
                  height: layerHeight,
                  display: "flex",
                  alignItems: "center",
                  gap: 28,
                  padding: "0 32px",
                  boxSizing: "border-box",
                  borderRadius: 16,
                  background: rgba(tone.rgb, 0.16),
                  border: `1.5px solid ${rgba(tone.rgb, 0.55)}`,
                  opacity: enter,
                  transform: `translateX(${(1 - enter) * -24}px)`,
                }}
              >
                <div
                  style={{
                    minWidth: 240,
                    fontSize: 28,
                    fontWeight: 700,
                    color: BASE_COLORS.text,
                    borderRight: `1.5px solid ${rgba(tone.rgb, 0.4)}`,
                    paddingRight: 24,
                  }}
                >
                  {layer.label}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                  {layer.items.map((item) => (
                    <div
                      key={item}
                      style={{
                        fontSize: 20,
                        color: BASE_COLORS.text2,
                        background: rgba(tone.rgb, 0.12),
                        border: `1px solid ${rgba(tone.rgb, 0.32)}`,
                        borderRadius: 999,
                        padding: "6px 16px",
                      }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Entered>
        );
      })}
      {payload.footnote ? (
        <div style={{ position: "absolute", left, bottom: 90, width: panelWidth, textAlign: "center", fontSize: 20, color: BASE_COLORS.text2 }}>
          {payload.footnote}
        </div>
      ) : null}
    </SceneShell>
  );
};
