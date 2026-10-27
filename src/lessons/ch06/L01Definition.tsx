import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import timing from "./l01-preview-timing.json";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const L01Definition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = timing.definition;
  const reveal = (at: number) => interpolate(frame, [at, at + fps * 0.45], [0, 1], clamp);
  const definition = reveal(t.define);
  return (
    <>
      <div style={{ position: "absolute", left: 96, right: 96, top: 48 }}>
        <div style={{ fontSize: 20, lineHeight: 1.5, color: "#8FB8D9", letterSpacing: 3, marginBottom: 10 }}>6.2.1 · 项目的定义</div>
        <div style={{ fontSize: 46, lineHeight: 1.3, fontWeight: 700, letterSpacing: 1.2, color: "#E6F1FA" }}>到底什么是项目？</div>
      </div>

      <div style={{ position: "absolute", inset: "280px 0 auto", textAlign: "center", opacity: 1 - definition }}>
        <div style={{ fontSize: 140, fontWeight: 800, letterSpacing: 14, color: "#EAF6FF" }}>项目<span style={{ color: "#E6B65F" }}>？</span></div>
        <div style={{ width: 160, height: 4, margin: "36px auto", background: "#39CADD" }} />
      </div>

      <div style={{ position: "absolute", left: 96, right: 96, top: 260, padding: "46px 58px 50px", borderRadius: 24, background: "linear-gradient(110deg,rgba(18,39,64,0.96),rgba(9,21,39,0.96))", border: "1px solid #35546E", opacity: definition, translate: `0 ${18 * (1 - definition)}px` }}>
        <div style={{ position: "absolute", left: 0, top: 42, bottom: 42, width: 5, borderRadius: 4, background: "#39CADD" }} />
        <div style={{ fontSize: 25, color: "#8FAFC9", letterSpacing: 2, marginBottom: 20 }}>教材定义</div>
        <div style={{ fontSize: 53, lineHeight: 1.65, fontWeight: 550 }}>
          项目是为创造<span style={{ color: frame >= t.unique ? "#46D6E3" : "inherit", background: frame >= t.unique ? "rgba(57,202,221,0.13)" : "none", borderRadius: 7, padding: "0 5px" }}>独特</span>的产品、服务或成果<br />
          而进行的<span style={{ color: frame >= t.temporary ? "#E6B65F" : "inherit", background: frame >= t.temporary ? "rgba(230,182,95,0.13)" : "none", borderRadius: 7, padding: "0 5px" }}>临时性</span>工作。
        </div>
      </div>

      <div style={{ position: "absolute", left: 96, right: 96, top: 650, display: "flex", gap: 28, opacity: reveal(t.keywords), translate: `0 ${16 * (1 - reveal(t.keywords))}px` }}>
        <div style={{ flex: 1, padding: "20px 32px", borderRadius: 18, border: "1px solid #267C89", background: "rgba(24,76,86,0.24)", display: "flex", alignItems: "center", gap: 34 }}>
          <span style={{ fontSize: 58, color: "#46D6E3", fontWeight: 800 }}>独特</span>
          <span style={{ fontSize: 29, color: "#B5CEDB" }}>产品 · 服务 · 成果</span>
        </div>
        <div style={{ flex: 1, padding: "20px 32px", borderRadius: 18, border: "1px solid #80693C", background: "rgba(98,76,36,0.20)", display: "flex", alignItems: "center", gap: 34 }}>
          <span style={{ fontSize: 58, color: "#E6B65F", fontWeight: 800 }}>临时</span>
          <span style={{ fontSize: 29, color: "#D2C7B0" }}>明确的起点与终点</span>
        </div>
      </div>
    </>
  );
};
