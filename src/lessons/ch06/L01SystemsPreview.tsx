import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import {L01Header as HeaderBreadcrumb, L01Audio as Audio} from "./L01FullPlayback";
import {L01Captions as CaptionsOverlay} from "./L01FullPlayback";
import { TechNetwork } from "../../visual/backgrounds/tech-network/TechNetwork";
import { techNetworkSchema } from "../../visual/backgrounds/tech-network/schema";
import audio from "../../../workspaces/ch06-L01-systems/audio-timeline.json";

const cyan = "#46D6E3", green = "#7BD9B5", gold = "#E6B65F", muted = "#9BB6CA";
const bg = techNetworkSchema.parse({ type: "tech-network", ganttEnabled: false, linkOpacity: 0.035, nodeOpacity: 0.06, highlightCoreOpacity: 0.1, highlightGlowOpacity: 0.06 });
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const norm = (s: string) => s.replace(/[^\u4e00-\u9fa5A-Za-z0-9]/g, "").toUpperCase();
const at = (scene: string, phrase: string, end = false) => {
  const s = audio.scenes.find(s => s.sceneId === `S-${scene}`)!;
  const cc = s.tokens.flatMap(t => [...norm(t.text)].map(ch => ({ ch, start: t.startMs, end: t.endMs })));
  const p = norm(phrase), i = cc.map(c => c.ch).join("").indexOf(p);
  if (i < 0) throw new Error(`S-${scene}: 找不到 ${phrase}`);
  return cc[i + (end ? p.length - 1 : 0)][end ? "end" : "start"];
};
const Box: React.FC<{ x: number; y: number; w: number; h: number; color?: string; opacity?: number; children: React.ReactNode }> = ({ x, y, w, h, color = cyan, opacity = 1, children }) => <div style={{ position: "absolute", left: x, top: y, width: w, height: h, boxSizing: "border-box", border: `1.5px solid ${color}85`, borderRadius: 20, background: "#10213480", opacity }}>{children}</div>;
const Arrow: React.FC<{ y: number; color?: string; opacity?: number }> = ({ y, color = cyan, opacity = 1 }) => <svg width="1728" height="34" style={{ position: "absolute", left: 96, top: y, opacity }} viewBox="0 0 1728 34"><path d="M20 17 H1703 M1689 5 L1703 17 L1689 29" fill="none" stroke={color} strokeWidth="3" /></svg>;

const Structure: React.FC<{ ms: number }> = ({ ms }) => {
  const fade = (phrase: string) => interpolate(ms, [at("structure", phrase), at("structure", phrase) + 380], [0, 1], clamp);
  const types = ["职能型", "弱矩阵", "均衡矩阵", "强矩阵", "项目导向型"];
  const levels = ["极少或无", "低", "低到中", "中到高", "高到几乎全部"];
  const colors = [muted, cyan, cyan, green, gold];
  return <>
    <Box x={286} y={204} w={520} h={116} opacity={fade("职能经理")}><div style={{ textAlign: "center", fontSize: 38, paddingTop: 28 }}>职能经理</div></Box>
    <div style={{ position: "absolute", left: 820, top: 242, width: 280, textAlign: "center", color: muted, fontSize: 27, opacity: fade("权责划分") }}>明确权责划分</div>
    <Box x={1114} y={204} w={520} h={116} color={gold} opacity={fade("项目经理")}><div style={{ textAlign: "center", fontSize: 38, paddingTop: 28 }}>项目经理</div></Box>
    <div style={{ position: "absolute", left: 96, top: 365, color: muted, fontSize: 24, opacity: fade("表6-4") }}>表 6-4 · 组织结构对项目的影响</div>
    {types.map((type, i) => <React.Fragment key={type}>
      <Box x={96+i*352} y={420} w={320} h={370} color={colors[i]} opacity={fade(type)}>
        <div style={{ textAlign: "center", marginTop: 28, fontSize: 35, fontWeight: 700, color: colors[i] }}>{type}</div>
        <div style={{ position: "absolute", left: 58, bottom: 89, width: 204, height: 60+i*30, borderRadius: "10px 10px 0 0", background: `${colors[i]}26`, borderTop: `3px solid ${colors[i]}` }} />
        <div style={{ position: "absolute", bottom: 30, left: 10, right: 10, fontSize: 28, textAlign: "center", color: colors[i], opacity: fade("逐步递增") }}>{levels[i]}</div>
      </Box>
    </React.Fragment>)}
    <Arrow y={816} color={gold} opacity={fade("逐步递增")} />
    <div style={{ position: "absolute", left: 96, right: 96, top: 852, textAlign: "center", color: gold, fontSize: 28, opacity: fade("项目经理的职权和资源控制力") }}>项目经理职权与资源控制力逐步增强</div>
  </>;
};

const Pmo: React.FC<{ ms: number }> = ({ ms }) => {
  const fade = (phrase: string) => interpolate(ms, [at("pmo", phrase), at("pmo", phrase) + 380], [0, 1], clamp);
  const specs = [
    { name: "支持型", color: green, action: "顾问与支持", cue: "支持型只当顾问", lines: ["担当顾问", "提供模板"], cues: ["只当顾问", "提供模板"], level: "很低", levelCue: "控制力很低" },
    { name: "控制型", color: cyan, action: "要求合规", cue: "控制型要求项目合规服从", lines: ["要求项目合规服从"], cues: ["要求项目合规服从"], level: "中等", levelCue: "控制力中等" },
    { name: "指令型", color: gold, action: "直接管理", cue: "指令型则直接接管", lines: ["直接接管和控制项目", "指派项目经理"], cues: ["直接接管和控制项目", "指派项目经理"], level: "很高", levelCue: "控制力很高" },
  ];
  return <>
    <div style={{ position: "absolute", left: 96, top: 203, right: 96, textAlign: "center", fontSize: 30, color: muted }}>项目管理办公室 · PMO</div>
    {specs.map((s,i) => <Box key={s.name} x={96+i*592} y={300} w={544} h={485} color={s.color} opacity={fade(s.name)}>
      <div style={{ padding: "30px 34px" }}><div style={{ color: s.color, fontSize: 48, fontWeight: 700 }}>{s.name}</div><div style={{ color: muted, fontSize: 28, marginTop: 15, opacity: fade(s.cue) }}>{s.action}</div><div style={{ marginTop: 35, borderTop: `1px solid ${s.color}40`, paddingTop: 28 }}>{s.lines.map((line,j)=><div key={line} style={{ fontSize: 30, lineHeight: 1.65, marginBottom: 20, opacity: fade(s.cues[j]) }}>{line}</div>)}</div></div>
      <div style={{ position: "absolute", left: 34, right: 34, bottom: 30, padding: "16px 20px", color: s.color, fontSize: 31, border: `1px solid ${s.color}60`, borderRadius: 13, background: `${s.color}0D`, opacity: fade(s.levelCue) }}>控制力：<strong>{s.level}</strong></div>
    </Box>)}
    <Arrow y={812} color={gold} opacity={fade("由弱到强")} />
    <div style={{ position: "absolute", left: 96, right: 96, top: 852, textAlign: "center", color: gold, fontSize: 28, opacity: fade("由弱到强") }}>对项目的控制程度：由弱到强</div>
  </>;
};

const Lifecycle: React.FC<{ ms: number }> = ({ ms }) => {
  const fade = (phrase: string, delay = 0) => interpolate(ms, [at("lifecycle", phrase)+delay, at("lifecycle", phrase)+delay+350], [0,1], clamp);
  const phases = [{name:"引入",x:240,w:340},{name:"成长",x:580,w:380},{name:"成熟",x:960,w:420},{name:"衰退",x:1380,w:370}];
  const progress = interpolate(ms, phases.map(p=>at("lifecycle",p.name)), [0.22,0.48,0.76,1], clamp);
  const projects = [
    {x:280,y:680,name:"项目1",detail:"初始创建"},{x:620,y:682,name:"项目2",detail:"更多特性"},{x:785,y:510,name:"项目3",detail:"添加内容"},
    {x:1020,y:455,name:"项目4",detail:"修订"},{x:1140,y:555,name:"项目5",detail:"修订"},{x:1260,y:650,name:"项目6",detail:"修订"},{x:1465,y:725,name:"项目7",detail:"衰退"},
  ];
  return <>
    <div style={{ position: "absolute", left: 96, top: 168, fontSize: 24, color: muted }}>图 6-4 · 产品生命周期</div>
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
      <g opacity={fade("产品生命周期")}>
        <path d="M235 814 V382 M225 394 L235 382 L245 394 M235 814 H1778 M1766 804 L1778 814 L1766 824" fill="none" stroke={muted} strokeWidth="2" />
        <text x="168" y="604" textAnchor="middle" transform="rotate(-90 168 604)" fill={muted} fontSize="25">项目使用、销售、影响</text>
        <text x="1790" y="819" fill={muted} fontSize="25">时间</text>
        {[580,960,1380].map(x=><path key={x} d={`M${x} 375 V814`} stroke="#46677D" strokeWidth="1.5" strokeDasharray="7 8" />)}
      </g>
      <path d="M240 802 C380 783 460 760 580 691 C720 610 810 439 960 407 C1130 353 1260 387 1380 446 C1490 500 1580 602 1645 735" fill="none" stroke={cyan} strokeWidth="5" pathLength="1" strokeDasharray="1" strokeDashoffset={1-progress} opacity={fade("引入")} />
      {phases.map(p=><g key={p.name} opacity={fade(p.name)}><rect x={p.x} y="836" width={p.w-4} height="45" rx="9" fill="#102C3C80" stroke={`${cyan}70`} /><text x={p.x+p.w/2} y="867" textAnchor="middle" fill={cyan} fontSize="28">{p.name}</text></g>)}
      <g opacity={fade("项目集")}>
        <rect x="240" y="224" width="1510" height="46" rx="10" fill="#E6B65F12" stroke={`${gold}90`} /><text x="995" y="256" textAnchor="middle" fill={gold} fontSize="28">项目组合治理</text>
        <rect x="240" y="292" width="714" height="48" rx="10" fill="#7BD9B512" stroke={`${green}90`} /><text x="597" y="325" textAnchor="middle" fill={green} fontSize="28">项目集 A</text>
        <rect x="966" y="292" width="784" height="48" rx="10" fill="#7BD9B512" stroke={`${green}90`} /><text x="1358" y="325" textAnchor="middle" fill={green} fontSize="28">项目集 B</text>
      </g>
      {projects.map((p,i)=><g key={p.name} opacity={fade("单个项目",i*65)}><rect x={p.x} y={p.y} width="160" height="76" rx="12" fill="#102C3C99" stroke={`${cyan}85`} /><text x={p.x+80} y={p.y+30} textAnchor="middle" fill="#E6F1FA" fontSize="27">{p.name}</text><text x={p.x+80} y={p.y+59} textAnchor="middle" fill={muted} fontSize="23">{p.detail}</text></g>)}
    </svg>
  </>;
};

export const CH06_SYSTEMS_FRAMES = Math.ceil(audio.totalDurationMs / 1000 * 30) + 45;
export const Ch06L01Systems: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const ms = frame / fps * 1000;
  const index = audio.scenes.findIndex(s=>ms>=s.startMs && ms<s.endMs);
  const shot = index<0 ? 2 : index;
  const titles = ["组织结构：项目经理职权如何变化？", "三类 PMO：对项目的控制程度不同", "产品生命周期：项目可以在不同节点启动"];
  return <AbsoluteFill style={{ background:"#081426", color:"#E6F1FA", fontFamily:'"Noto Sans CJK SC", sans-serif' }}>
    <TechNetwork {...bg}/><Audio src={staticFile("audio/ch06-L01-systems/narration.wav")}/>
    <HeaderBreadcrumb lessonId="ch06-L01" lessonTitle="第 6 章 项目管理概论 · L01" sceneId={`OS${shot+1}`} sceneOrder={shot+1} totalScenes={3} segmentTitle={["组织结构","PMO","产品生命周期"][shot]}/>
    <div style={{position:"absolute",left:96,right:96,top:48}}><div style={{fontSize:20,lineHeight:1.5,letterSpacing:3,color:"#8FB8D9",marginBottom:10}}>{shot===2 ? "6.2.7 · 项目管理和产品管理" : "6.2.6 · 组织系统"}</div><div style={{fontSize:46,lineHeight:1.3,fontWeight:700,letterSpacing:1.2}}>{titles[shot]}</div></div>
    {shot===0 ? <Structure ms={ms}/> : shot===1 ? <Pmo ms={ms}/> : <Lifecycle ms={ms}/>}
    <CaptionsOverlay captions={audio.captions}/>
  </AbsoluteFill>;
};
