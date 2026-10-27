import React from "react";
import { Entered, SceneShell } from "./shared";
import { BASE_COLORS, resolveTone, rgba } from "../tokens/colorCard";
import type { TitleCardPayload } from "../../../contracts/visual-props.schema";

/** 标题卡：大标题 + 副标题 + 可选要点，纯透明覆盖在全局背景之上。 */
export const TitleCard: React.FC<{ payload: TitleCardPayload }> = ({ payload }) => {
  const tone = resolveTone("gold");
  return (
    <SceneShell title={payload.title} subtitle={payload.subtitle} eyebrow={payload.eyebrow}>
      <div style={{ position: "absolute", left: 96, top: 250, width: 1728 }}>
        <Entered delay={4}>
          {(enter) => (
            <div style={{ width: 120, height: 6, borderRadius: 3, background: tone.hex, opacity: enter, transform: `scaleX(${enter})`, transformOrigin: "left" }} />
          )}
        </Entered>
      </div>
      <div style={{ position: "absolute", left: 96, top: 310, width: 1500, display: "flex", flexDirection: "column", gap: 18 }}>
        {payload.bullets.map((bullet, index) => (
          <Entered key={`${bullet}-${index}`} delay={10 + index * 6}>
            {(enter) => (
              <div
                style={{
                  display: "flex",
                  gap: 18,
                  alignItems: "flex-start",
                  opacity: enter,
                  transform: `translateX(${(1 - enter) * -18}px)`,
                  background: rgba(tone.rgb, 0.08),
                  border: `1px solid ${rgba(tone.rgb, 0.28)}`,
                  borderRadius: 12,
                  padding: "18px 26px",
                  boxSizing: "border-box",
                }}
              >
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: tone.hex, marginTop: 12, flex: "0 0 auto" }} />
                <div style={{ fontSize: 28, color: BASE_COLORS.text, lineHeight: 1.45 }}>{bullet}</div>
              </div>
            )}
          </Entered>
        ))}
      </div>
    </SceneShell>
  );
};
