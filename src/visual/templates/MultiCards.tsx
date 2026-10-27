import React from "react";
import { CANVAS, Entered, SceneShell } from "./shared";
import { BASE_COLORS, resolveTone, rgba } from "../tokens/colorCard";
import type { MultiCardsPayload } from "../../../contracts/visual-props.schema";

/** 多卡片：支持并列或双排宫格、卡片徽章、防坑红字提示与底部总结横幅。 */
export const MultiCards: React.FC<{ payload: MultiCardsPayload }> = ({ payload }) => {
  const cards = payload.cards;
  const isGrid = cards.length >= 4;
  const cols = isGrid ? (cards.length === 4 ? 2 : 3) : cards.length;
  const gap = 26;
  const totalWidth = 1680;
  const cardWidth = (totalWidth - gap * (cols - 1)) / cols;
  const left = (CANVAS.width - totalWidth) / 2;
  const rowHeight = isGrid ? 255 : 390;

  return (
    <SceneShell title={payload.title} subtitle={payload.subtitle}>
      {payload.warningBanner ? (
        <Entered delay={12}>
          {(enter) => (
            <div
              style={{
                position: "absolute",
                top: 54,
                right: 96,
                maxWidth: 680,
                padding: "10px 20px",
                borderRadius: 12,
                background: rgba(resolveTone("red").rgb, 0.18),
                border: `1.5px solid ${resolveTone("red").hex}`,
                color: BASE_COLORS.text,
                fontSize: 20,
                fontWeight: 700,
                opacity: enter,
              }}
            >
              {payload.warningBanner}
            </div>
          )}
        </Entered>
      ) : null}

      {cards.map((card, index) => {
        const tone = resolveTone(card.tone ?? (index % 2 === 0 ? "cyan" : "blue"));
        const colIdx = index % cols;
        const rowIdx = Math.floor(index / cols);
        return (
          <Entered key={`${card.heading}-${index}`} delay={6 + index * 5}>
            {(enter) => (
              <div
                style={{
                  position: "absolute",
                  left: left + colIdx * (cardWidth + gap),
                  top: 230 + rowIdx * (rowHeight + 22),
                  width: cardWidth,
                  height: rowHeight,
                  borderRadius: 16,
                  background: "rgba(6, 14, 31, 0.76)",
                  border: `1.5px solid ${rgba(tone.rgb, 0.5)}`,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.28)",
                  padding: "22px 26px",
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  opacity: enter,
                  transform: `translateY(${(1 - enter) * 22}px)`,
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ width: 48, height: 6, borderRadius: 3, background: tone.hex }} />
                    {card.badge ? (
                      <span
                        style={{
                          padding: "3px 10px",
                          borderRadius: 999,
                          background: rgba(tone.rgb, 0.2),
                          border: `1px solid ${tone.hex}`,
                          color: tone.hex,
                          fontSize: 16,
                          fontWeight: 700,
                        }}
                      >
                        {card.badge}
                      </span>
                    ) : null}
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: BASE_COLORS.text, marginBottom: 10 }}>
                    {card.heading}
                  </div>
                  <div style={{ fontSize: 20, color: BASE_COLORS.text2, lineHeight: 1.5 }}>{card.body}</div>
                </div>
                {card.warningNote ? (
                  <div
                    style={{
                      marginTop: 10,
                      padding: "6px 12px",
                      borderRadius: 8,
                      background: rgba(resolveTone("red").rgb, 0.16),
                      borderLeft: `3px solid ${resolveTone("red").hex}`,
                      color: "#FCA5A5",
                      fontSize: 17,
                      fontWeight: 600,
                    }}
                  >
                    {card.warningNote}
                  </div>
                ) : null}
              </div>
            )}
          </Entered>
        );
      })}

      {payload.footerBanner ? (
        <Entered delay={22}>
          {(enter) => (
            <div
              style={{
                position: "absolute",
                left: left,
                right: left,
                top: 785,
                padding: "14px 26px",
                borderRadius: 12,
                background: rgba(resolveTone("gold").rgb, 0.16),
                border: `1.5px solid ${resolveTone("gold").hex}`,
                color: BASE_COLORS.text,
                fontSize: 21,
                fontWeight: 700,
                textAlign: "center",
                opacity: enter,
              }}
            >
              {payload.footerBanner}
            </div>
          )}
        </Entered>
      ) : null}
    </SceneShell>
  );
};
