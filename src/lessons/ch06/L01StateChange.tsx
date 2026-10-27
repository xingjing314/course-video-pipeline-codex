import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import timing from "./l01-preview-timing.json";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Organization: React.FC<{ future?: boolean }> = ({ future = false }) => (
  <svg width="252" height="145" viewBox="0 0 252 145" fill="none">
    <path d="M12 135H240" stroke="currentColor" strokeWidth="3" opacity="0.6" />
    <path d={future ? "M78 135V20L132 6L174 20V135" : "M78 135V32H174V135"} fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
    <path d="M24 135V70H78M174 58H222V135" stroke="currentColor" strokeWidth="3" />
    {[50, 74, 98].map(y => <path key={y} d={`M96 ${y}H111M138 ${y}H153`} stroke="currentColor" strokeWidth="5" opacity="0.75" />)}
    <path d="M116 135V114H137V135M40 88H59M40 108H59M188 78H207M188 99H207" stroke="currentColor" strokeWidth="4" />
    {future && <path d="M183 34L197 20L211 34M197 20V49" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />}
  </svg>
);

export const L01StateChange: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = timing.change;
  const reveal = (at: number, seconds = 0.6) => interpolate(frame, [at, at + fps * seconds], [0, 1], clamp);
  const diagram = reveal(t.diagram);
  const future = reveal(t.future);
  const crossing = reveal(t.future + fps * 0.3, 3.1);
  const project = reveal(t.transition);
  const label = reveal(t.project, 0.25);
  const loop = Math.max(0, frame - t.operations) / (fps * 6) * Math.PI * 2;

  return (
    <>
      <div style={{ position: "absolute", left: 96, right: 96, top: 48 }}>
        <div style={{ fontSize: 20, lineHeight: 1.5, color: "#8FB8D9", letterSpacing: 3, marginBottom: 10 }}>6.2.1 · 项目与组织改变</div>
        <div style={{ fontSize: 46, lineHeight: 1.3, fontWeight: 700, letterSpacing: 1.2, color: "#E6F1FA" }}>项目，让组织走向将来</div>
      </div>

      <div style={{ position: "absolute", inset: 0, translate: "0 -65px" }}>
      <div style={{ position: "absolute", inset: "383px 112px auto", textAlign: "center", opacity: 1 - diagram, translate: `0 ${-24 * diagram}px` }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 70 }}>
          <div style={{ fontSize: 104, fontWeight: 800, color: "#46D6E3" }}>独特</div>
          <div style={{ width: 1, height: 100, background: "#365069" }} />
          <div style={{ fontSize: 104, fontWeight: 800, color: "#E6B65F" }}>临时</div>
        </div>
        <div style={{ marginTop: 48, fontSize: 38, color: "#BED0E0" }}>两个关键词，背后是怎样的管理常识？</div>
      </div>

      <div style={{ position: "absolute", inset: 0, opacity: diagram }}>
        <div style={{ position: "absolute", top: 319, left: 480, display: "flex", gap: 22 }}>
          {[{ label: "市场竞争加剧", at: t.competition }, { label: "技术革新", at: t.technology }, { label: "新法规出台", at: t.regulations }].map((item, i) => (
            <div key={item.label} style={{ width: 292, height: 69, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 14, fontSize: 30, fontWeight: 650, color: "#E6B65F", background: "rgba(92,69,29,0.26)", border: "1px solid #71603C", opacity: reveal(item.at), translate: `0 ${12 * (1 - reveal(item.at))}px` }}>
              <span style={{ fontSize: 21, opacity: 0.65 }}>0{i + 1}</span>{item.label}
            </div>
          ))}
        </div>

        <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
          <defs>
            <linearGradient id="ch06-bridge" x1="518" y1="625" x2="1400" y2="507" gradientUnits="userSpaceOnUse"><stop stopColor="#46D6E3" /><stop offset="1" stopColor="#7BD9B5" /></linearGradient>
          </defs>
          <path d="M518 625C700 625 715 578 830 578M1090 578C1200 578 1245 507 1398 507" stroke="#31516A" strokeWidth="3" strokeDasharray="7 10" fill="none" opacity={future * 0.75} />
          <path d="M518 625C700 625 715 578 830 578M1090 578C1200 578 1245 507 1385 507" stroke="url(#ch06-bridge)" strokeWidth="5" fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - crossing} opacity={future} />
          <path d="M1379 495L1394 507L1379 519" stroke="#7BD9B5" strokeWidth="5" fill="none" opacity={crossing} />
          <path d="M960 405V447" stroke="#E6B65F" strokeWidth="2" strokeDasharray="5 8" opacity={reveal(t.regulations)} />
        </svg>

        <div style={{ position: "absolute", left: 128, top: 447, width: 390, height: 348, borderRadius: 24, background: "linear-gradient(145deg,#152B43,#0C1B30)", border: "1.5px solid #416079", textAlign: "center", color: "#B2CDE1", boxShadow: "0 20px 60px #0003", translate: `0 ${16 * (1 - diagram)}px` }}>
          <div style={{ fontSize: 46, fontWeight: 750, marginTop: 25, color: "#E2EFF9" }}>当前状态</div>
          <div style={{ marginTop: 16 }}><Organization /></div>
          <div style={{ position: "absolute", left: 31, right: 31, bottom: 24, borderTop: "1px solid #304C65", paddingTop: 15, fontSize: 27, opacity: reveal(t.operations) }}>日常运营 · 维持运行</div>
          <svg width="68" height="68" viewBox="0 0 68 68" style={{ position: "absolute", right: 21, top: 123, opacity: reveal(t.operations) }}>
            <circle cx="34" cy="34" r="27" stroke="#698EA9" strokeWidth="2" fill="none" strokeDasharray="6 6" />
            <circle cx={34 + 27 * Math.cos(loop)} cy={34 + 27 * Math.sin(loop)} r="5" fill="#B2CDE1" />
          </svg>
        </div>

        <div style={{ position: "absolute", left: 1400, top: 427, width: 390, height: 348, borderRadius: 24, background: "linear-gradient(145deg,#123535,#0C202C)", border: "1.5px solid #4B9C88", textAlign: "center", color: "#7BD9B5", boxShadow: "0 20px 60px #0003", opacity: future, translate: `0 ${20 * (1 - future)}px` }}>
          <div style={{ fontSize: 46, fontWeight: 750, marginTop: 25, color: "#D8F4E9" }}>将来状态</div>
          <div style={{ marginTop: 16 }}><Organization future /></div>
          <div style={{ position: "absolute", left: 31, right: 31, bottom: 24, borderTop: "1px solid #2B5E56", paddingTop: 15, fontSize: 27 }}>更有竞争力</div>
        </div>

        <div style={{ position: "absolute", left: 830, top: 490, width: 260, height: 176, borderRadius: 24, background: `linear-gradient(145deg,rgba(24,80,87,${0.3 + project * 0.65}),#0B2031)`, border: `2px solid ${project > 0 ? "#46D6E3" : "#3A6577"}`, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", opacity: future, boxShadow: `0 0 ${48 * project}px rgba(57,202,221,0.16)` }}>
          <div style={{ fontSize: 34, color: "#A0BDCF", opacity: 1 - label }}>如何实现<br /><span style={{ fontSize: 48, fontWeight: 750, color: "#D7EAF5" }}>跨越？</span></div>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 76, fontWeight: 800, color: "#46D6E3", opacity: label, scale: 0.92 + label * 0.08 }}>项目</div>
        </div>
        <div style={{ position: "absolute", left: 620, top: 714, width: 680, textAlign: "center", fontSize: 35, fontWeight: 600, color: "#BFE7DE", opacity: reveal(t.change) }}>
          {frame < t.transition ? "要实现跨越，就必须做出改变" : <><span style={{ color: "#46D6E3" }}>状态转换</span><span style={{ margin: "0 22px", color: "#577385" }}>→</span><span style={{ opacity: reveal(t.value), color: "#7BD9B5" }}>创造业务价值</span></>}
        </div>

        <div style={{ position: "absolute", left: 128, right: 130, top: 836, height: 2, background: "linear-gradient(90deg,#41607955,#46D6E355,#7BD9B555)", opacity: future }} />
      </div>
      </div>
    </>
  );
};
