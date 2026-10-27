import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import {L01Header as HeaderBreadcrumb, L01Audio as Audio} from "./L01FullPlayback";
import {L01Captions as CaptionsOverlay} from "./L01FullPlayback";
import { TechNetwork } from "../../visual/backgrounds/tech-network/TechNetwork";
import { techNetworkSchema } from "../../visual/backgrounds/tech-network/schema";
import audio from "../../../workspaces/ch06-L01-environment/audio-timeline.json";

const cyan = "#46D6E3", green = "#7BD9B5", gold = "#E6B65F", muted = "#9BB6CA";
const bg = techNetworkSchema.parse({ type: "tech-network", ganttEnabled: false, linkOpacity: 0.035, nodeOpacity: 0.06, highlightCoreOpacity: 0.1, highlightGlowOpacity: 0.06 });
const norm = (s: string) => s.replace(/[^\u4e00-\u9fa5A-Za-z0-9]/g, "").toUpperCase();
const cue = (id: string, phrase: string) => {
  const scene = audio.scenes.find(s => s.sceneId === `E-${id}`)!;
  const chars = scene.tokens.flatMap(t => [...norm(t.text)].map(ch => ({ ch, start: t.startMs })));
  const i = chars.map(c => c.ch).join("").indexOf(norm(phrase));
  if (i < 0) throw new Error(`E-${id}: 找不到口播提示词 ${phrase}`);
  return chars[i].start;
};
const Panel: React.FC<{ x: number; y: number; w: number; h: number; color?: string; active?: boolean; opacity?: number; children?: React.ReactNode }> = ({ x, y, w, h, color = cyan, active = false, opacity = 1, children }) => <div style={{ position: "absolute", left: x, top: y, width: w, height: h, boxSizing: "border-box", border: `1.5px solid ${color}${active ? "A6" : "4D"}`, borderRadius: 20, background: active ? "#102C3C80" : "#10213466", opacity }}>{children}</div>;
const Item: React.FC<{ y: number; text: string; color: string; opacity: number }> = ({ y, text, color, opacity }) => <div style={{ position: "absolute", left: 30, right: 24, top: y, display: "flex", gap: 16, alignItems: "center", opacity }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: color, flexShrink: 0 }} /><span style={{ fontSize: 29, lineHeight: 1.7 }}>{text}</span></div>;

export const CH06_ENVIRONMENT_FRAMES = Math.ceil(audio.totalDurationMs / 1000 * 30) + 45;
export const Ch06L01Environment: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const ms = frame / fps * 1000;
  const index = audio.scenes.findIndex(s => ms >= s.startMs && ms < s.endMs);
  const shot = index < 0 ? audio.scenes.length - 1 : index;
  const fade = (id: string, phrase: string) => interpolate(ms, [cue(id, phrase), cue(id, phrase) + 400], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titles = ["项目在什么环境中运行？", "先找区分 OPA 与 EEF 的线索", "OPA：组织沉淀的可复用资产", "EEF：团队需要面对的环境因素", "内部 EEF：两类容易混淆的因素", "外部 EEF：来自组织之外的环境"];
  const labels = ["运行环境导入", "区分线索", "组织过程资产", "事业环境因素", "内部 EEF", "外部 EEF"];
  const eefVisible = fade("eef", "事业环境因素");
  const splitVisible = fade("eef", "内部和外部");
  const eefStart = audio.scenes[3].startMs;
  const opaX = interpolate(ms, [eefStart, eefStart + 700], [688, 96], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ background: "#081426", color: "#E6F1FA", fontFamily: '"Noto Sans CJK SC", sans-serif' }}>
    <TechNetwork {...bg} /><Audio src={staticFile("audio/ch06-L01-environment/narration.wav")} />
    <HeaderBreadcrumb lessonId="ch06-L01" lessonTitle="第 6 章 项目管理概论 · L01" sceneId={`E${String(shot + 1).padStart(2, "0")}`} sceneOrder={shot + 1} totalScenes={6} segmentTitle={labels[shot]} />
    <div style={{ position: "absolute", left: 96, right: 96, top: 48 }}>
      <div style={{ fontSize: 20, lineHeight: 1.5, letterSpacing: 3, color: "#8FB8D9", marginBottom: 10 }}>6.2.5 · 项目运行环境</div>
      <div style={{ fontSize: 46, lineHeight: 1.3, fontWeight: 700, letterSpacing: 1.2 }}>{titles[shot]}</div>
    </div>
    {shot === 0 && <>
      <div style={{ position: "absolute", left: 96, right: 96, top: 240, textAlign: "center", fontSize: 38, color: muted }}>从管理关系，走向项目运行的环境</div>
      {[["6.2.5", "运行环境", "运行环境"], ["6.2.6", "组织系统", "6.2.6"], ["6.2.7", "产品管理", "6.2.7"]].map(([num, title, phrase], i) => <Panel key={num} x={96 + i * 592} y={385} w={544} h={290} color={i === 0 ? green : cyan} active={i === 0} opacity={fade("intro", phrase)}><div style={{ padding: "40px 36px" }}><div style={{ fontSize: 29, color: muted }}>{num}</div><div style={{ fontSize: 52, color: i === 0 ? green : cyan, fontWeight: 700, marginTop: 35 }}>{title}</div></div></Panel>)}
      <div style={{ position: "absolute", left: 96, top: 735, width: 544, textAlign: "center", color: green, fontSize: 28, opacity: fade("intro", "运行环境") }}>本段：组织资产与内外部环境</div>
    </>}
    {shot === 1 && <>
      {[{ x: 140, abbr: "OPA", title: "组织过程资产", color: green }, { x: 1040, abbr: "EEF", title: "事业环境因素", color: cyan }].map(p => <Panel key={p.abbr} x={p.x} y={280} w={740} h={300} color={p.color} active opacity={fade("boundary", p.title)}><div style={{ textAlign: "center", paddingTop: 42 }}><div style={{ fontSize: 68, fontWeight: 750, color: p.color }}>{p.abbr}</div><div style={{ marginTop: 24, fontSize: 40 }}>{p.title}</div></div></Panel>)}
      <div style={{ position: "absolute", left: 96, right: 96, top: 655, textAlign: "center", opacity: fade("boundary", "分界线") }}><div style={{ color: muted, fontSize: 27, marginBottom: 22 }}>从项目团队的角度判断</div><div style={{ fontSize: 45, color: gold, fontWeight: 650, opacity: fade("boundary", "能否自主修改和裁剪") }}>能否自主修改和裁剪？</div></div>
    </>}
    {shot >= 2 && <>
      <div style={{ position: "absolute", left: opaX, top: 194, width: 544, textAlign: "center", color: green, fontSize: 26 }}>OPA · 组织过程资产</div>
      <div style={{ position: "absolute", left: 688, top: 171, width: 1136, textAlign: "center", color: cyan, fontSize: 28, opacity: eefVisible }}>EEF · 事业环境因素<div style={{ fontSize: 23, color: muted, marginTop: 8, opacity: fade("eef", "无法随意改变") }}>无法随意改变 · 主动适应</div></div>
      <Panel x={opaX} y={260} w={544} h={610} color={green} active={shot === 2}>
        <div style={{ margin: "26px 30px 0", color: green, fontSize: 37, fontWeight: 700 }}>组织内部的积累</div>
        <div style={{ margin: "15px 30px 0", color: muted, fontSize: 25, opacity: fade("opa", "家底和武功秘籍") }}>家底与武功秘籍</div>
        <div style={{ position: "absolute", left: 30, right: 30, top: 132, height: 1, background: `${green}40` }} />
        {["开发工具", "标准模板", "历史数据库", "经验教训库", "请假与采购政策流程"].map((text,i) => <Item key={text} text={text} y={155+i*64} color={green} opacity={fade("opa",text)} />)}
        <div style={{ position: "absolute", left: 30, right: 30, top: 530, padding: "12px 0", textAlign: "center", borderTop: `1px solid ${green}55`, color: green, fontSize: 27, opacity: fade("opa", "可复用") }}>可复用 · 可补充 · 可修改</div>
      </Panel>
      <Panel x={688} y={260} w={544} h={610} color={cyan} active={shot === 4} opacity={splitVisible}>
        <div style={{ margin: "26px 30px 0", color: cyan, fontSize: 37, fontWeight: 700 }}>内部 EEF</div>
        <div style={{ margin: "15px 30px 0", color: muted, fontSize: 25 }}>公司大门内</div>
        <div style={{ position: "absolute", left: 30, right: 30, top: 132, height: 1, background: `${cyan}40` }} />
        <Item y={150} text="组织的文化结构" color={cyan} opacity={fade("internal","文化结构")} />
        <Item y={214} text="办公基础设施" color={cyan} opacity={fade("internal","办公基础设施")} />
        <div style={{ position: "absolute", left: 22, right: 22, top: 294, height: 148, boxSizing: "border-box", padding: "12px 20px", lineHeight: 1.35, border: `1.5px solid ${gold}85`, borderRadius: 14, background: `${gold}0B`, opacity: fade("internal", "设施和资源的物理分布") }}><div style={{ color: gold, fontSize: 29, fontWeight: 650 }}>设施和资源的物理分布</div><div style={{ marginTop: 8, fontSize: 23, color: muted, opacity: fade("internal","不同时区") }}>不同时区<span style={{ opacity: fade("internal","虚拟办公") }}> · 虚拟办公</span></div><div style={{ marginTop: 2, fontSize: 23, color: cyan, opacity: fade("internal","客观物理限制") }}>客观物理限制</div></div>
        <div style={{ position: "absolute", left: 22, right: 22, top: 450, height: 124, boxSizing: "border-box", padding: "17px 20px", border: `1.5px solid ${gold}85`, borderRadius: 14, background: `${gold}0B`, opacity: fade("internal", "员工现有的技能水平和能力") }}><div style={{ color: gold, fontSize: 29, fontWeight: 650 }}>员工现有的技能与能力</div><div style={{ marginTop: 17, fontSize: 24, color: cyan, opacity: fade("internal","存量客观状态") }}>存量客观状态</div></div>
      </Panel>
      <Panel x={1280} y={260} w={544} h={610} color={gold} active={shot === 5} opacity={splitVisible}>
        <div style={{ margin: "26px 30px 0", color: gold, fontSize: 37, fontWeight: 700 }}>外部 EEF</div>
        <div style={{ margin: "15px 30px 0", color: muted, fontSize: 25 }}>公司大门外</div>
        <div style={{ position: "absolute", left: 30, right: 30, top: 132, height: 1, background: `${gold}40` }} />
        {["市场条件", "国家法律法规", "行业标准", "商业数据库", "汇率利率等财务环境"].map((text,i) => <Item key={text} text={text} y={155+i*74} color={gold} opacity={fade("external",text)} />)}
      </Panel>
      {shot === 3 && <div style={{ position: "absolute", left: 735, top: 460, width: 1040, textAlign: "center", opacity: eefVisible * (1-splitVisible) }}><div style={{ fontSize: 47, color: cyan, fontWeight: 650, opacity: fade("eef","客观水土和外部天候") }}>项目团队面对的客观环境</div><div style={{ marginTop: 44, fontSize: 36, color: gold, opacity: fade("eef","主动适应") }}>主动适应</div></div>}
    </>}
    <CaptionsOverlay captions={audio.captions} />
  </AbsoluteFill>;
};
