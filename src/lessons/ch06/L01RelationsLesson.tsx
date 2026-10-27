import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import {L01Header as HeaderBreadcrumb, L01Audio as Audio} from "./L01FullPlayback";
import {L01Captions as CaptionsOverlay} from "./L01FullPlayback";
import { TechNetwork } from "../../visual/backgrounds/tech-network/TechNetwork";
import { techNetworkSchema } from "../../visual/backgrounds/tech-network/schema";
import { L01StructureGraphic, L01ValueGraphic } from "./L01RelationsPreview";
import audio from "../../../workspaces/ch06-L01-relations/audio-timeline.json";

const cyan = "#46D6E3", gold = "#E6B65F", green = "#7BD9B5", muted = "#9BB6CA";
const bg = techNetworkSchema.parse({ type: "tech-network", ganttEnabled: false, linkOpacity: 0.035, nodeOpacity: 0.06, highlightCoreOpacity: 0.1, highlightGlowOpacity: 0.06 });
type Scene = typeof audio.scenes[number];
type ShotProps = { scene: Scene; ms: number };
const norm = (s: string) => s.replace(/[^\u4e00-\u9fa5A-Za-z0-9]/g, "").toUpperCase();
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// This lesson's visual cues follow the existing aligned narration, including seeks.
const track = (scene: Scene, ms: number) => {
  const chars = scene.tokens.flatMap(t => [...norm(t.text)].map(ch => ({ ch, start: t.startMs })));
  const text = chars.map(t => t.ch).join("");
  const at = (phrase: string) => {
    const i = text.indexOf(norm(phrase));
    if (i < 0) throw new Error(`${scene.sceneId}: 找不到口播提示词 ${phrase}`);
    return chars[i].start;
  };
  const fade = (phrase: string, delay = 0) => interpolate(ms, [at(phrase) + delay, at(phrase) + delay + 420], [0, 1], clamp);
  return { at, fade, seen: (phrase: string) => ms >= at(phrase), elapsed: ms - scene.startMs };
};

const Panel: React.FC<{ x: number; y: number; w: number; h: number; color?: string; opacity?: number; children: React.ReactNode }> = ({ x, y, w, h, color = cyan, opacity = 1, children }) => <div style={{ position: "absolute", left: x, top: y, width: w, height: h, boxSizing: "border-box", padding: "28px 32px", borderRadius: 22, border: `1.5px solid ${color}80`, background: "#102439EE", opacity }}>{children}</div>;
const Pill: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = cyan }) => <span style={{ display: "inline-block", fontSize: 27, padding: "10px 23px", border: `1px solid ${color}70`, borderRadius: 12, background: `${color}14`, color }}>{children}</span>;
const Arrow: React.FC<{ d: string; color?: string; opacity?: number; progress?: number; both?: boolean }> = ({ d, color = cyan, opacity = 1, progress = 1, both = false }) => <path d={d} fill="none" stroke={color} strokeWidth={4} opacity={opacity} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progress} markerEnd={progress > 0.98 ? (both ? "url(#relation-small-arrow)" : "url(#relation-arrow)") : undefined} markerStart={both && progress > 0.98 ? "url(#relation-small-arrow)" : undefined} />;
const ArrowHead = () => <defs><marker id="relation-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto-start-reverse"><path d="M1 1 L7 4 L1 7" fill="none" stroke="context-stroke" strokeWidth="1.5" /></marker><marker id="relation-small-arrow" markerUnits="userSpaceOnUse" markerWidth="12" markerHeight="12" viewBox="0 0 8 8" refX="7" refY="4" orient="auto-start-reverse"><path d="M1 1 L7 4 L1 7" fill="none" stroke="context-stroke" strokeWidth="1.5" /></marker></defs>;

const Overview: React.FC<ShotProps> = ({ scene, ms }) => {
  const t = track(scene, ms);
  return <>
    <L01ValueGraphic style={{ opacity: t.fade("宏观治理体系"), translate: "0 -115px" }} feedbackProgress={interpolate(ms, [t.at("图6-3"), t.at("图6-3") + 2700], [0, 3], clamp)} />
    <div style={{ position: "absolute", left: 96, top: 166, fontSize: 23, color: muted, opacity: t.fade("图6-3") }}>图 6-3 · 组织级项目管理</div>
    <div style={{ position: "absolute", left: 310, top: 834, width: 620, textAlign: "center", opacity: t.fade("做正确的事") }}><Pill color={gold}>做正确的事 · 战略选择</Pill></div>
    <div style={{ position: "absolute", left: 990, top: 834, width: 620, textAlign: "center", opacity: t.fade("正确地做事") }}><Pill>正确地做事 · 组织交付</Pill></div>
  </>;
};

const Choose: React.FC<ShotProps> = ({ scene, ms }) => {
  const t = track(scene, ms);
  return <>
    <Panel x={96} y={240} w={750} h={550} color={gold}>
      <div style={{ fontSize: 25, color: muted }}>企业必须作出的选择</div>
      <div style={{ marginTop: 32, fontSize: 58, fontWeight: 750, color: gold, opacity: t.fade("有限的资金和资源") }}>资源有限</div>
      <div style={{ marginTop: 50, fontSize: 48, fontWeight: 650, opacity: t.fade("钱投给谁") }}>钱投给谁？</div>
      <div style={{ marginTop: 24, fontSize: 34, lineHeight: 1.7, opacity: t.fade("哪些板块该上") }}>哪些板块该上？<br />哪些板块该砍？</div>
    </Panel>
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
      <ArrowHead /><Arrow d="M1370 348 V446" color={gold} progress={t.fade("高层首先要决定")} />
      <Arrow d="M1370 618 V682 H1090 V716" color={gold} opacity={t.fade("项目组合")} />
      <Arrow d="M1370 618 V716" color={gold} opacity={t.fade("项目组合")} />
      <Arrow d="M1370 682 H1650 V716" color={gold} opacity={t.fade("项目组合")} />
    </svg>
    <Panel x={1030} y={240} w={680} h={108} color={gold} opacity={t.fade("组织战略")}><div style={{ fontSize: 35, textAlign: "center", fontWeight: 700 }}>组织战略</div></Panel>
    <Panel x={1030} y={450} w={680} h={168} color={gold} opacity={t.fade("项目组合")}><div style={{ fontSize: 52, textAlign: "center", fontWeight: 750, color: gold }}>项目组合</div><div style={{ fontSize: 27, textAlign: "center", color: muted, marginTop: 8, opacity: t.fade("Portfolio") }}>Portfolio</div></Panel>
    {["投资方向 A", "投资方向 B", "投资方向 C"].map((label, i) => <Panel key={label} x={980+i*280} y={720} w={220} h={90} color={gold} opacity={t.fade("项目组合", i*160)}><div style={{ textAlign: "center", fontSize: 26 }}>{label}</div></Panel>)}
  </>;
};

const Components: React.FC<ShotProps> = ({ scene, ms }) => {
  const t = track(scene, ms);
  const focus = t.seen("集中管理") ? [] : t.seen("运营") ? [[1638,688,140,64]] : t.seen("子项目组合") ? [[1140,413,400,64]] : t.seen("项目集") ? [[306,413,280,64],[665,413,320,64]] : t.seen("把项目") ? [[156,688,112,64]] : [];
  return <>
    <L01StructureGraphic style={{ opacity: t.fade("组织的战略目标") }} />
    <div style={{ position: "absolute", left: 96, top: 160, fontSize: 23, color: muted }}>图 6-2 · 项目组合、项目集、项目和运营</div>
    <div style={{ position: "absolute", left: 1160, top: 196, color: gold, fontSize: 33, fontWeight: 650, opacity: t.fade("做正确的事") }}>做正确的事</div>
    <div style={{ position: "absolute", left: 142, top: 290, width: 1636, height: 64, boxSizing: "border-box", border: "3px solid #E6B65F", borderRadius: 12, boxShadow: "0 0 25px #E6B65F22", opacity: t.fade("集中管理") }} />
    {focus.map(([x,y,w,h])=><div key={x} style={{ position: "absolute", left:x, top:y, width:w, height:h, boxSizing:"border-box", border:"4px solid #E6F1FA", borderRadius:12, boxShadow:"0 0 28px #46D6E360" }} />)}
    <div style={{ position: "absolute", left: 96, right: 96, top: 848, textAlign: "center", fontSize: 29, color: gold, opacity: t.fade("集中管理") }}>共同服务于组织的战略目标</div>
  </>;
};

const PortfolioPoints: React.FC<ShotProps> = ({ scene, ms }) => {
  const t = track(scene, ms);
  const points = [
    { at: "战略目标", n: "01", heading: "目标对齐", body: "组织战略目标", color: gold },
    { at: "排优先级", n: "02", heading: "核心手段", body: "排优先级 · 投资决策 · 分配资源", color: cyan },
    { at: "不一定存在", n: "03", heading: "组件关系", body: "不一定相互依赖或直接相关", color: green },
  ];
  return <>
    {points.map((p,i)=><Panel key={p.n} x={96} y={230+i*205} w={800} h={180} color={p.color} opacity={t.fade(p.at)}>
      <div style={{ display: "flex", gap: 24, alignItems: "center" }}><span style={{ fontSize: 28, color: p.color }}>{p.n}</span><span style={{ fontSize: 29, color: muted }}>{p.heading}</span></div>
      <div style={{ fontSize: i===1 ? 31 : 36, marginTop: 24, fontWeight: 650, color: p.color }}>{p.body}</div>
      {i===0 && <div style={{ position: "absolute", right: 32, top: 30, fontSize: 24, color: "#FFAA92", opacity: t.fade("必错") }}><span style={{ textDecoration: "line-through" }}>项目目标</span>　×</div>}
    </Panel>)}
    <Panel x={990} y={230} w={820} h={118} color={gold} opacity={t.fade("战略目标")}><div style={{ textAlign: "center", fontSize: 38, fontWeight: 700, color: gold }}>共同支撑组织战略</div></Panel>
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}><ArrowHead />
      <Arrow d="M1400 350 V440 H1180 V504" color={gold} opacity={t.fade("芯片研发")} />
      <Arrow d="M1400 440 H1620 V504" color={gold} opacity={t.fade("物业地产")} />
      <path d="M1360 600 H1440" stroke={muted} strokeWidth={2} strokeDasharray="7 8" opacity={t.fade("只要它们共同支撑战略")} />
    </svg>
    <Panel x={1000} y={508} w={360} h={170} color={cyan} opacity={t.fade("芯片研发")}><div style={{ fontSize: 47, textAlign: "center", fontWeight: 700, marginTop: 22 }}>芯片研发</div></Panel>
    <Panel x={1440} y={508} w={360} h={170} color={green} opacity={t.fade("物业地产")}><div style={{ fontSize: 47, textAlign: "center", fontWeight: 700, marginTop: 22 }}>物业地产</div></Panel>
    <div style={{ position: "absolute", left: 990, top: 720, width: 820, textAlign: "center", fontSize: 30, color: green, opacity: t.fade("只要它们共同支撑战略") }}>可以没有直接依赖</div>
    <div style={{ position: "absolute", left: 990, top: 785, width: 820, textAlign: "center", fontSize: 31, color: gold, opacity: t.fade("投资回报") }}>共同支撑战略，追求投资回报</div>
  </>;
};

const Execute: React.FC<ShotProps> = ({ scene, ms }) => {
  const t = track(scene, ms);
  return <>
    <div style={{ position: "absolute", left: 96, right: 96, top: 230, fontSize: 66, textAlign: "center", fontWeight: 750, color: cyan, opacity: t.fade("正确地做事") }}>正确地做事</div>
    <Panel x={220} y={400} w={650} h={340} color={cyan} opacity={t.fade("项目集")}><div style={{ fontSize: 56, fontWeight: 700, color: cyan }}>项目集</div><div style={{ marginTop: 56, fontSize: 34, color: muted }}>组织相互关联的项目与活动</div></Panel>
    <Panel x={1050} y={400} w={650} h={340} color={green} opacity={t.fade("项目集和项目", 400)}><div style={{ fontSize: 56, fontWeight: 700, color: green }}>项目</div><div style={{ marginTop: 56, fontSize: 34, color: muted }}>完成具体目标与交付</div></Panel>
  </>;
};

const Program: React.FC<ShotProps> = ({ scene, ms }) => {
  const t = track(scene, ms);
  const example = t.seen("通信卫星系统");
  const rows = ["卫星研制", "地面测控站建设", "火箭发射"];
  return <>
    <Panel x={96} y={235} w={740} h={540} color={cyan}>
      <div style={{ color: cyan, fontSize: 58, fontWeight: 750 }}>协调依赖</div>
      <div style={{ marginTop: 30, fontSize: 33, lineHeight: 1.7, opacity: t.fade("相互关联") }}>一组相互关联的项目和活动<br />统一协调管理</div>
      <div style={{ marginTop: 48, paddingTop: 32, borderTop: "1px solid #386375", fontSize: 34, lineHeight: 1.8, opacity: t.fade("分别管理所无法获得") }}>获得分别管理无法获得的<br /><strong style={{ fontSize: 45, color: gold }}>收益和控制</strong></div>
    </Panel>
    <div style={{ position: "absolute", left: 946, top: 230, width: 878, textAlign: "center", fontSize: 30, color: muted, opacity: t.fade("相互关联") }}>{example ? "通信卫星系统" : "相互关联的项目与活动"}</div>
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}><ArrowHead />
      {[1090,1380,1670].map((x,i)=><Arrow key={x} d={`M1380 395 V460 H${x} V530`} opacity={example ? t.fade(rows[i]) : t.fade("协调管理")} />)}
      <Arrow d="M1220 615 H1248" both opacity={t.fade("彼此高度耦合")} />
      <Arrow d="M1510 615 H1538" both opacity={t.fade("彼此高度耦合")} />
    </svg>
    <Panel x={1090} y={300} w={580} h={96} color={cyan} opacity={t.fade("协调管理")}><div style={{ textAlign: "center", fontSize: 31 }}>项目集 · 统一协调</div></Panel>
    {rows.map((label,i)=><Panel key={label} x={960+i*290} y={534} w={260} h={168} color={i===1 ? gold : cyan} opacity={example ? t.fade(label) : t.fade("相互关联", i*160)}><div style={{ fontSize: 29, lineHeight: 1.5, textAlign: "center", fontWeight: 650, paddingTop: 14 }}>{example ? i===1 ? <>地面测控站<br />建设</> : label : `相关项目 ${"ABC"[i]}`}</div></Panel>)}
    <div style={{ position: "absolute", left: 946, top: 745, width: 878, fontSize: 32, textAlign: "center", color: gold, opacity: t.fade("合在一起管") }}>共同协调，获得整体收益</div>
    <div style={{ position: "absolute", left: 96, right: 96, top: 830, textAlign: "center", opacity: t.fade("不是单纯规模很大的大项目") }}><Pill color={gold}>项目集 ≠ 单纯规模很大的单个项目</Pill></div>
  </>;
};

const Project: React.FC<ShotProps> = ({ scene, ms }) => {
  const t = track(scene, ms);
  const detail = t.fade("信息增多");
  return <>
    <Panel x={96} y={245} w={700} h={450} color={green}>
      <div style={{ fontSize: 27, color: muted }}>单个项目</div>
      <div style={{ marginTop: 40, fontSize: 57, fontWeight: 750, color: green, opacity: t.fade("目标明确") }}>目标明确</div>
      <div style={{ marginTop: 54, fontSize: 45, fontWeight: 650, opacity: t.fade("渐进明晰") }}>范围渐进明晰</div>
      <div style={{ marginTop: 22, color: muted, fontSize: 28, opacity: detail }}>伴随信息增多，逐步细化</div>
    </Panel>
    <div style={{ position: "absolute", left: 920, top: 245, width: 880, fontSize: 30, color: muted, opacity: t.fade("渐进明晰") }}>范围随生命周期逐步清晰</div>
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}><ArrowHead />
      <Arrow d="M1180 488 H1235" color={green} opacity={detail} /><Arrow d="M1490 488 H1545" color={green} opacity={detail} />
    </svg>
    {["初步范围", "信息增多", "逐步细化"].map((label,i)=><Panel key={label} x={930+i*310} y={335} w={250} h={305} color={green} opacity={i===0 ? t.fade("渐进明晰") : t.fade("信息增多",i*220)}>
      <div style={{ fontSize: 29, color: green, fontWeight: 650 }}>{label}</div>
      {Array.from({length:2+i*2},(_,j)=><div key={j} style={{ marginTop: 20, width: `${90-j%3*16}%`, height: i===0 ? 8 : 5, borderRadius: 4, background: i===0 ? "#58798A" : "#7BD9B5", opacity: 0.45+j*0.07 }} />)}
    </Panel>)}
    <div style={{ position: "absolute", left: 96, right: 96, top: 745, textAlign: "center", opacity: t.fade("绝不代表") }}><Pill color={gold}>渐进明晰 ≠ 必须采用敏捷开发</Pill></div>
    <div style={{ position: "absolute", left: 96, right: 96, top: 833, textAlign: "center", fontSize: 27, color: muted, opacity: t.fade("PMBOK第六版") }}>PMBOK 第六版 · 五大过程组与十大知识领域，同样强调“渐进明细”</div>
  </>;
};

const Operations: React.FC<ShotProps> = ({ scene, ms }) => {
  const t = track(scene, ms);
  const handover = t.fade("会与项目产生交集");
  const rotation = (t.elapsed / 7000) * Math.PI * 2;
  return <>
    <Panel x={96} y={230} w={680} h={565} color={green}>
      <div style={{ color: green, fontSize: 52, fontWeight: 750 }}>运营管理</div>
      <div style={{ marginTop: 26, color: muted, fontSize: 31, opacity: t.fade("日常持续生产和服务") }}>日常持续生产与服务</div>
      <svg width="350" height="250" viewBox="0 0 350 250" style={{ marginLeft: 120, marginTop: 20 }}>
        <circle cx="175" cy="125" r="90" fill="none" stroke="#2B5D57" strokeWidth="3" />
        <path d="M175 35 A90 90 0 1 1 85 125" fill="none" stroke={green} strokeWidth="5" />
        <circle cx={175+90*Math.cos(rotation)} cy={125+90*Math.sin(rotation)} r="9" fill={green} />
        <text x="175" y="136" textAnchor="middle" fill={green} fontSize="32">持续运行</text>
      </svg>
      <div style={{ fontSize: 28, color: gold, marginTop: 14, opacity: t.fade("不属于项目管理") }}>不属于项目管理</div>
    </Panel>
    <Panel x={1100} y={230} w={724} h={565} color={cyan}>
      <div style={{ color: cyan, fontSize: 52, fontWeight: 750 }}>项目</div>
      <div style={{ marginTop: 44, display: "flex", flexDirection: "column", gap: 28, fontSize: 35 }}>
        {["新产品开发", "系统升级", "每个阶段收尾"].map(label=><div key={label} style={{ padding: "15px 23px", borderLeft: "4px solid #46D6E3", background: "#46D6E310", opacity: t.fade(label) }}>{label === "每个阶段收尾" ? "项目阶段收尾" : label}</div>)}
      </div>
    </Panel>
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}><ArrowHead />
      <Arrow d="M792 455 H1084" color={cyan} progress={handover} />
      <Arrow d="M1084 565 H792" color={green} progress={handover} />
    </svg>
    <div style={{ position: "absolute", left: 792, top: 485, width: 292, textAlign: "center", color: "#E6F1FA", fontSize: 29, opacity: t.fade("交接成果和资源") }}>成果与资源</div>
    <div style={{ position: "absolute", left: 96, right: 96, top: 842, textAlign: "center", fontSize: 31, color: green, opacity: handover }}>管理职责不同，在交集处相互交接</div>
  </>;
};

const shots = [Overview, Choose, Components, PortfolioPoints, Execute, Program, Project, Operations];
const titles = ["组织如何把战略转化为价值？", "项目组合：先决定钱投向哪里", "项目组合：集中管理，共同支撑战略", "项目组合，要抓住这三个要点", "从战略选择，进入组织交付", "项目集：把依赖关系协调起来", "项目：目标明确，范围渐进明晰", "运营持续运行，项目与运营相互交接"];
const segments = ["宏观治理总览", "项目组合 · 资源选择", "项目组合 · 组件关系", "项目组合 · 三个要点", "正确地做事", "项目集 · 协调依赖", "项目 · 渐进明晰", "项目与运营"];
export const CH06_RELATIONS_FRAMES = Math.ceil(audio.totalDurationMs * 30 / 1000) + 45;

export const Ch06L01Relations: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = frame / fps * 1000;
  let index = audio.scenes.findIndex(s => ms >= s.startMs && ms < s.endMs);
  if (index < 0) index = audio.scenes.length - 1;
  const Shot = shots[index];
  return <AbsoluteFill style={{ background: "#081426", color: "#E6F1FA", fontFamily: '"Noto Sans CJK SC", sans-serif' }}>
    <TechNetwork {...bg} />
    <Audio src={staticFile("audio/ch06-L01-relations/narration.wav")} />
    <HeaderBreadcrumb lessonId="ch06-L01" lessonTitle="第 6 章 项目管理概论 · L01" sceneId={audio.scenes[index].sceneId} sceneOrder={index+1} totalScenes={shots.length} segmentTitle={segments[index]} />
    <div style={{ position: "absolute", left: 96, right: 96, top: 48 }}>
      <div style={{ fontSize: 20, lineHeight: 1.5, letterSpacing: 3, marginBottom: 10, color: "#8FB8D9" }}>6.2.4 · 项目、项目集、项目组合与运营</div>
      <div style={{ fontSize: 46, lineHeight: 1.3, fontWeight: 700, letterSpacing: 1.2 }}>{titles[index]}</div>
    </div>
    <Shot key={index} scene={audio.scenes[index]} ms={ms} />
    <CaptionsOverlay captions={audio.captions} />
  </AbsoluteFill>;
};
