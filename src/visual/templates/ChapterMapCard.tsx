import React from "react";
import { CANVAS, Entered, SceneShell } from "./shared";
import { BASE_COLORS, resolveTone, rgba } from "../tokens/colorCard";
import type { ChapterMapPayload } from "../../../contracts/visual-props.schema";

/** 章节地图：章节序号、标题与摘要均为教学文字，当前章高亮。 */
export const ChapterMapCard: React.FC<{ payload: ChapterMapPayload }> = ({ payload }) => {
  const chapters = payload.chapters;
  const columns = chapters.length <= 3 ? chapters.length : chapters.length <= 6 ? 3 : 4;
  const rows = Math.ceil(chapters.length / columns);
  const gap = 26;
  const totalWidth = 1620;
  const cardWidth = (totalWidth - gap * (columns - 1)) / columns;
  const cardHeight = Math.min(200, (600 - gap * (rows - 1)) / rows);
  const left = (CANVAS.width - totalWidth) / 2;
  const top = 280;

  return (
    <SceneShell title={payload.title} subtitle={payload.subtitle}>
      {chapters.map((chapter, index) => {
        const active = payload.activeIndex === chapter.index;
        const tone = resolveTone(active ? "gold" : index % 2 === 0 ? "cyan" : "blue");
        const column = index % columns;
        const row = Math.floor(index / columns);
        return (
          <Entered key={`${chapter.index}-${chapter.title}`} delay={6 + index * 4}>
            {(enter) => (
              <div
                style={{
                  position: "absolute",
                  left: left + column * (cardWidth + gap),
                  top: top + row * (cardHeight + gap),
                  width: cardWidth,
                  height: cardHeight,
                  borderRadius: 16,
                  background: active ? rgba(tone.rgb, 0.2) : "rgba(6, 14, 31, 0.66)",
                  border: `1.5px solid ${rgba(tone.rgb, active ? 0.8 : 0.32)}`,
                  padding: 24,
                  boxSizing: "border-box",
                  opacity: enter,
                  transform: `translateY(${(1 - enter) * 20}px)`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: "50%",
                      background: rgba(tone.rgb, 0.9),
                      color: BASE_COLORS.textOnSolid,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 22,
                    }}
                  >
                    {chapter.index}
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: BASE_COLORS.text }}>{chapter.title}</div>
                </div>
                {chapter.summary ? (
                  <div style={{ fontSize: 20, color: BASE_COLORS.text2, lineHeight: 1.45 }}>{chapter.summary}</div>
                ) : null}
              </div>
            )}
          </Entered>
        );
      })}
    </SceneShell>
  );
};
