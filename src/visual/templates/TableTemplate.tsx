import React from "react";
import { CANVAS, Entered, SceneShell } from "./shared";
import { BASE_COLORS, resolveTone, rgba } from "../tokens/colorCard";
import type { TablePayload } from "../../../contracts/visual-props.schema";

/** 表格：表头与单元格文字属于教学内容，不随字幕开关隐藏。 */
export const TableTemplate: React.FC<{ payload: TablePayload }> = ({ payload }) => {
  const columnCount = payload.headers.length;
  const tableWidth = 1560;
  const left = (CANVAS.width - tableWidth) / 2;
  const rowHeight = Math.max(70, Math.min(110, Math.floor(560 / (payload.rows.length + 1))));
  const top = 250;
  const cellWidth = tableWidth / columnCount;
  const tone = resolveTone("cyan");

  return (
    <SceneShell title={payload.title} subtitle={payload.subtitle}>
      <div
        style={{
          position: "absolute",
          left,
          top,
          width: tableWidth,
          borderRadius: 14,
          overflow: "hidden",
          border: `1.5px solid ${rgba(tone.rgb, 0.35)}`,
          background: "rgba(6, 14, 31, 0.72)",
        }}
      >
        <div style={{ display: "flex", height: rowHeight, background: rgba(tone.rgb, 0.2) }}>
          {payload.headers.map((header) => (
            <div
              key={header}
              style={{
                width: cellWidth,
                padding: "0 22px",
                display: "flex",
                alignItems: "center",
                fontSize: 26,
                fontWeight: 700,
                color: BASE_COLORS.text,
                borderRight: `1px solid ${rgba(tone.rgb, 0.2)}`,
                boxSizing: "border-box",
              }}
            >
              {header}
            </div>
          ))}
        </div>
        {payload.rows.map((row, rowIndex) => (
          <Entered key={`row-${rowIndex}`} delay={8 + rowIndex * 4}>
            {(enter) => (
              <div
                style={{
                  display: "flex",
                  height: rowHeight,
                  opacity: enter,
                  transform: `translateY(${(1 - enter) * 10}px)`,
                  borderTop: `1px solid ${rgba(tone.rgb, 0.14)}`,
                }}
              >
                {row.map((cell, cellIndex) => (
                  <div
                    key={`${rowIndex}-${cellIndex}`}
                    style={{
                      width: cellWidth,
                      padding: "0 22px",
                      display: "flex",
                      alignItems: "center",
                      fontSize: 22,
                      color: cellIndex === 0 ? BASE_COLORS.text : BASE_COLORS.text2,
                      fontWeight: cellIndex === 0 ? 600 : 400,
                      borderRight: `1px solid ${rgba(tone.rgb, 0.12)}`,
                      boxSizing: "border-box",
                    }}
                  >
                    {cell}
                  </div>
                ))}
              </div>
            )}
          </Entered>
        ))}
      </div>
      {payload.caption ? (
        <div style={{ position: "absolute", left, top: top + rowHeight * (payload.rows.length + 1) + 28, width: tableWidth, textAlign: "center", fontSize: 20, color: BASE_COLORS.text2 }}>
          {payload.caption}
        </div>
      ) : null}
    </SceneShell>
  );
};
