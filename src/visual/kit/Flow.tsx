/**
 * Flow · 节点 + 箭头。
 *
 * 提炼自 A5 四关轨道的"门 + 轨道箭头"，以及 L03 的六步评估程序、
 * 第 8 章之后的过程链（业务流 / 变更流 / 状态流转）。
 *
 * 只画链条与当前节点，不承载章节语义。
 */
import React from "react";
import { BASE_COLORS, resolveTone, rgba } from "../tokens/colorCard";

export type FlowStep = {
  /** 角标：章节号或序号，如 "7.1" / "①" */
  code?: string;
  label: string;
  sub?: string;
  tone?: string;
};

export type FlowProps = {
  steps: FlowStep[];
  left: number;
  top: number;
  nodeWidth?: number;
  nodeHeight?: number;
  gap?: number;
  /** 当前节点下标；-1 表示全部普通 */
  activeIndex?: number;
  /** 多个节点同时点亮（如「第二、三关同亮」）；给出时优先于 activeIndex */
  activeIndices?: number[];
  /** 已走过的节点用实心箭头 */
  doneThrough?: number;
};

export const Flow: React.FC<FlowProps> = ({
  steps,
  left,
  top,
  nodeWidth = 220,
  nodeHeight = 96,
  gap = 48,
  activeIndex = -1,
  activeIndices,
  doneThrough = -1,
}) => {
  const activeSet = new Set(activeIndices ?? (activeIndex >= 0 ? [activeIndex] : []));
  return (
    <div style={{ position: "absolute", left, top, display: "flex", alignItems: "center" }}>
      {steps.map((s, i) => {
        const tone = resolveTone(s.tone ?? "cyan");
        const active = activeSet.has(i);
        return (
          <React.Fragment key={`${s.label}-${i}`}>
            <div
              style={{
                width: nodeWidth,
                minHeight: nodeHeight,
                padding: "14px 18px",
                boxSizing: "border-box",
                borderRadius: 14,
                border: `1.5px solid ${rgba(tone.rgb, active ? 0.95 : 0.45)}`,
                background: active ? rgba(tone.rgb, 0.16) : "rgba(8,19,41,0.78)",
                boxShadow: active ? `0 0 28px ${rgba(tone.rgb, 0.35)}` : undefined,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 6,
              }}
            >
              {s.code ? (
                <div style={{ fontSize: 16, color: active ? tone.hex : BASE_COLORS.text2, fontWeight: 700, letterSpacing: 1 }}>
                  {s.code}
                </div>
              ) : null}
              <div style={{ fontSize: 24, fontWeight: active ? 800 : 600, color: BASE_COLORS.text, lineHeight: 1.3 }}>
                {s.label}
              </div>
              {s.sub ? <div style={{ fontSize: 17, color: BASE_COLORS.text2 }}>{s.sub}</div> : null}
            </div>

            {i < steps.length - 1 ? (
              <div style={{ width: gap, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ position: "relative", width: gap - 20, height: 2, background: rgba(tone.rgb, i <= doneThrough ? 0.8 : 0.35) }}>
                  <div
                    style={{
                      position: "absolute",
                      right: -2,
                      top: -5,
                      width: 0,
                      height: 0,
                      borderTop: "6px solid transparent",
                      borderBottom: "6px solid transparent",
                      borderLeft: `11px solid ${rgba(tone.rgb, i <= doneThrough ? 0.9 : 0.45)}`,
                    }}
                  />
                </div>
              </div>
            ) : null}
          </React.Fragment>
        );
      })}
    </div>
  );
};
