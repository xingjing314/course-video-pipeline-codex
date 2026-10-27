import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { TechNetwork } from "../../visual/backgrounds/tech-network/TechNetwork";
import { techNetworkSchema } from "../../visual/backgrounds/tech-network/schema";
import {L01Header as HeaderBreadcrumb, L01Audio as Audio} from "./L01FullPlayback";
import {L01Captions as CaptionsOverlay} from "./L01FullPlayback";
import audio from "../../../workspaces/ch06-L01-quiz69/audio-timeline.json";
import timing from "./l01-quiz69-timing.json";

const cyan = "#46D6E3", gold = "#E6B65F", green = "#7BD9B5", red = "#FFAA92", muted = "#9BB6CA";
const bg = techNetworkSchema.parse({ type: "tech-network", ganttEnabled: false, linkOpacity: 0.04, nodeOpacity: 0.07 });
const options = [
  ["项目组合管理负责统筹协调各组件，", "以确保整体行动与组织战略目标保持一致"],
  ["战略规划属于高层管理范畴，与负责具体交付的", "项目管理分属两条独立的汇报主线"],
  ["项目组合、项目集和项目在管理职责上相互独立，", "分别对齐不同层级的业务目标"],
  ["项目管理通过严格控制范围与成本基准，", "直接决定组织战略目标的最终成败"],
];
const trapWords = ["", "两条独立的汇报主线", "相互独立", "直接决定"];
const FocusText: React.FC<{ text: string; word: string; active: boolean }> = ({ text, word, active }) => {
  if (!active || !word || !text.includes(word)) return <>{text}</>;
  const [before, after] = text.split(word);
  return <>{before}<span style={{ color: red, borderBottom: `3px solid ${red}` }}>{word}</span>{after}</>;
};
const Node: React.FC<{ children: React.ReactNode; color?: string; small?: boolean }> = ({ children, color = cyan, small = false }) => <div style={{ padding: small ? "16px 10px" : "22px 14px", textAlign: "center", border: `1.5px solid ${color}85`, borderRadius: 15, background: `${color}0D`, color, fontSize: small ? 28 : 32, fontWeight: 650, lineHeight: 1.5 }}>{children}</div>;
const Down = () => <svg width="100%" height="56" viewBox="0 0 400 56"><path d="M200 4 V47 M190 37 L200 47 L210 37" fill="none" stroke={cyan} strokeWidth="3" /></svg>;

export const CH06_QUIZ69_FRAMES = Math.ceil(audio.totalDurationMs / 1000 * 30) + 30;
export const Ch06L01Quiz69: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const ms = frame / fps * 1000;
  const countFrame = frame - timing.countdownStartFrame;
  const counting = countFrame >= 0 && countFrame < 3 * fps;
  const current = audio.scenes.find(s => ms >= s.startMs && ms < s.endMs) ?? audio.scenes[audio.scenes.length - 1];
  const section = current.sceneId.replace("Q69-", "");
  const active = section === "A" || section === "bridge" ? 0 : section === "B" ? 1 : section === "C" ? 2 : section === "D" ? 3 : -1;
  const answer = ms >= timing.answerAtMs;
  const judged = [ms >= timing.correctAtMs, ms >= timing.bErrorAtMs, ms >= timing.cErrorAtMs, ms >= timing.dErrorAtMs];
  const summary = section === "summary";
  const step = section === "read" ? (countFrame >= 0 ? 2 : 1) : section === "A" ? 3 : section === "bridge" ? 4 : section === "B" ? 5 : section === "C" ? 6 : section === "D" ? 7 : 8;
  const titles = ["读题", "独立作答", "分析 A 项", "其余选项", "分析 B 项", "分析 C 项", "分析 D 项", "归纳"];
  const show = (at: number) => interpolate(ms, [at, at + 350], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ background: "#081426", color: "#E6F1FA", fontFamily: '"Noto Sans CJK SC", sans-serif' }}>
    <TechNetwork {...bg} />
    <Audio src={staticFile("audio/ch06-L01-quiz69/narration.wav")} />
    <HeaderBreadcrumb lessonId="ch06-L01" lessonTitle="第 6 章 项目管理概论 · L01" sceneId={`Q69-${step}`} sceneOrder={step} totalScenes={8} segmentTitle={`真题③ · ${titles[step - 1]}`} />
    <div style={{ position: "absolute", left: 96, right: 96, top: 48 }}>
      <div style={{ fontSize: 20, lineHeight: 1.5, letterSpacing: 3, color: "#8FB8D9", marginBottom: 10 }}>2026 年 5 月 · 第 1 批次 · 第 69 题（回忆版）</div>
      <div style={{ fontSize: 46, lineHeight: 1.3, fontWeight: 700, letterSpacing: 1.2 }}>关于组织战略管理与项目管理的对应关系，正确的是：（　）</div>
    </div>
    <div style={{ position: "absolute", left: 96, top: 228, width: 1200, display: "flex", flexDirection: "column", gap: 18 }}>
      {options.map((lines, i) => {
        const color = judged[i] ? i === 0 ? green : red : active === i ? cyan : "#526D86";
        return <div key={i} style={{ position: "relative", height: 146, boxSizing: "border-box", padding: "21px 22px", display: "flex", alignItems: "center", gap: 20, border: `1.5px solid ${color}B3`, borderRadius: 18, background: active === i ? "#102C3C99" : "#10213480" }}>
          <div style={{ width: 52, height: 52, flexShrink: 0, display: "grid", placeItems: "center", borderRadius: 12, background: `${color}20`, color: judged[i] || active === i ? color : "#C5D4E1", fontSize: 31, fontWeight: 750 }}>{"ABCD"[i]}</div>
          <div style={{ fontSize: 30, lineHeight: 1.65, flex: 1 }}>{lines.map((text,j)=><React.Fragment key={j}>{j>0&&<br />}<FocusText text={text} word={trapWords[i]} active={judged[i]} /></React.Fragment>)}</div>
          <div style={{ width: 42, textAlign: "center", flexShrink: 0, fontSize: 36, color }}>{judged[i] ? i === 0 ? "✓" : "×" : ""}</div>
        </div>;
      })}
    </div>
    <div style={{ position: "absolute", left: 1340, top: 228, width: 484, height: 638, boxSizing: "border-box", padding: "27px 30px", border: "1px solid #36556D99", borderRadius: 20, background: "#0E213380" }}>
      {section === "read" ? <>
        <div style={{ fontSize: 28, color: muted, textAlign: "center", marginTop: 25 }}>{counting ? "思考时间" : countFrame >= 3 * fps ? "进入解析" : "请先独立作答"}</div>
        <div style={{ position: "relative", width: 220, height: 220, margin: "58px auto 36px" }}>
          <svg width="220" height="220" viewBox="0 0 220 220"><circle cx="110" cy="110" r="98" fill="none" stroke="#253D52" strokeWidth="6" />{counting && <circle cx="110" cy="110" r="98" fill="none" stroke={cyan} strokeWidth="6" strokeDasharray={Math.PI * 196} strokeDashoffset={Math.PI * 196 * countFrame / (3 * fps)} transform="rotate(-90 110 110)" />}</svg>
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 100, fontWeight: 700, color: cyan }}>{counting ? 3 - Math.floor(countFrame / fps) : countFrame >= 3 * fps ? "—" : "?"}</div>
        </div>
        <div style={{ textAlign: "center", fontSize: 26, color: muted, lineHeight: 1.8 }}>阅读四个选项<br />选择正确的一项</div>
      </> : <>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 44, marginBottom: 24 }}>
          <span style={{ fontSize: 27, color: muted }}>{summary ? "回到管理关系" : active === 0 ? "对照战略目标" : `解析 ${"ABCD"[active]} 项`}</span>
          {answer && <span style={{ color: gold, border: `1px solid ${gold}80`, padding: "5px 14px", borderRadius: 9, fontSize: 25 }}>答案 A</span>}
        </div>
        {(section === "A" || section === "bridge") && <div style={{ opacity: show(timing.correctAtMs) }}>
          <Node color={gold}>组织战略目标</Node><Down /><Node>项目组合管理</Node>
          <div style={{ textAlign: "center", marginTop: 32, fontSize: 30, lineHeight: 1.8, color: green }}>统筹协调各组件<br />整体行动与战略一致</div>
          {section === "bridge" && <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid #36556D", textAlign: "center", color: muted, fontSize: 26 }}>继续辨析 B、C、D</div>}
        </div>}
        {section === "B" && <>
          <div style={{ color: red, fontSize: 27, lineHeight: 1.7, opacity: show(timing.bErrorAtMs), marginBottom: 24 }}>问题词：<br />“两条独立的汇报主线”</div>
          <div style={{ opacity: show(timing.bLinkAtMs) }}><Node color={gold}>组织战略</Node><Down /><Node>项目管理与交付</Node><div style={{ textAlign: "center", color: green, fontSize: 29, marginTop: 26 }}>需要衔接，服务战略</div></div>
        </>}
        {section === "C" && <>
          <div style={{ color: red, fontSize: 27, lineHeight: 1.7, opacity: show(timing.cErrorAtMs), marginBottom: 24 }}>问题词：“相互独立”</div>
          <div style={{ opacity: show(timing.cLinkAtMs) }}><Node color={gold}>共同支撑组织战略</Node><Down /><div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{["项目组合", "项目集", "项目"].map(label=><Node key={label} small>{label}</Node>)}</div><div style={{ fontSize: 27, textAlign: "center", color: green, marginTop: 20 }}>职责有分工，目标需衔接</div></div>
        </>}
        {section === "D" && <>
          <div style={{ color: red, fontSize: 28, lineHeight: 1.7, opacity: show(timing.dErrorAtMs), marginBottom: 28 }}>问题词：“直接决定”</div>
          <div style={{ opacity: show(timing.dLinkAtMs) }}><Node>项目管理</Node><div style={{ textAlign: "center", fontSize: 25, color: green, margin: "24px 0 18px" }}>支撑战略落地</div><Node color={gold}>组织战略目标</Node><div style={{ color: muted, fontSize: 27, lineHeight: 1.9, marginTop: 30, opacity: show(timing.dLimitAtMs) }}>范围与成本控制<br /><span style={{ color: red }}>不能单独决定</span>战略成败</div></div>
        </>}
        {summary && <>
          <Node color={gold}>组织战略</Node><Down />
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}><Node color={gold} small>项目组合<span style={{ opacity: show(timing.summaryPortfolioAtMs) }}> · 做正确的事</span></Node><Node small>项目集<span style={{ opacity: show(timing.summaryProgramAtMs) }}> · 协调依赖</span></Node><Node color={green} small>项目 · 完成具体目标</Node></div>
        </>}
      </>}
    </div>
    <CaptionsOverlay captions={audio.captions} />
  </AbsoluteFill>;
};
