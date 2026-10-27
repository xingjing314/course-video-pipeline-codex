/**
 * Scale · 刻度 / 阶梯。
 *
 * 提炼自 A8 身份证里的"深度刻度尺"（当前位 + 断层 + 三个路标），
 * 也用于 L03 的估算精度阶梯（±30% / ±20% / ±10% / ±5%）。
 *
 * 只画刻度与标注，不解释语义。
 */
import React from "react";
import { BASE_COLORS, resolveTone, rgba } from "../tokens/colorCard";

export type ScaleMark = {
  /** 0–1 的位置 */
  at: number;
  label: string;
  /** 当前所在位置用金色并加光晕 */
  active?: boolean;
  tone?: string;
};

export type ScaleProps = {
  marks: ScaleMark[];
  left: number;
  top: number;
  width: number;
  /** 已到达的比例（画金色实线），默认取 active 标的位置 */
  fillTo?: number;
  /** 断层线位置（0–1），不给则不画 */
  breakAt?: number;
  breakLabel?: string;
};

export const Scale: React.FC<ScaleProps> = ({
  marks,
  left,
  top,
  width,
  fillTo,
  breakAt,
  breakLabel,
}) => {
  const activeAt = marks.find((m) => m.active)?.at ?? 0;
  const fill = fillTo ?? activeAt;
  const GOLD = resolveTone("gold");
  const RED = resolveTone("red");

  return (
    <div style={{ position: "absolute", left, top, width, height: 96 }}>
      {/* 基线 */}
      <div style={{ position: "absolute", left: 0, top: 40, width, height: 2, background: "rgba(143,184,217,0.28)" }} />
      {/* 已到达段 */}
      <div style={{ position: "absolute", left: 0, top: 40, width: width * fill, height: 2, background: GOLD.hex }} />

      {breakAt !== undefined ? (
        <>
          <div
            style={{
              position: "absolute",
              left: width * breakAt,
              top: 16,
              height: 52,
              width: 0,
              borderLeft: `2px dashed ${rgba(RED.rgb, 0.9)}`,
            }}
          />
          {breakLabel ? (
            <div
              style={{
                position: "absolute",
                left: width * breakAt + 12,
                top: 18,
                fontSize: 18,
                color: RED.hex,
                fontWeight: 700,
              }}
            >
              {breakLabel}
            </div>
          ) : null}
        </>
      ) : null}

      {marks.map((m) => {
        const tone = resolveTone(m.tone ?? (m.active ? "gold" : "neutral"));
        return (
          <React.Fragment key={m.label}>
            <div
              style={{
                position: "absolute",
                left: width * m.at - 9,
                top: 31,
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: m.active ? tone.hex : "rgba(143,184,217,0.35)",
                border: m.active ? `3px solid ${rgba(tone.rgb, 0.5)}` : "none",
                boxShadow: m.active ? `0 0 18px ${rgba(tone.rgb, 0.6)}` : undefined,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: width * m.at - 90,
                top: 60,
                width: 180,
                textAlign: "center",
                fontSize: 19,
                fontWeight: m.active ? 700 : 500,
                color: m.active ? tone.hex : BASE_COLORS.text2,
              }}
            >
              {m.label}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};
