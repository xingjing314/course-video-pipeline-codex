import React from "react";
import { AbsoluteFill } from "remotion";
import { TechNetwork } from "../../visual/backgrounds/tech-network/TechNetwork";
import { techNetworkSchema } from "../../visual/backgrounds/tech-network/schema";
import { HeaderBreadcrumb } from "../../visual/shell/HeaderBreadcrumb";

const bg = techNetworkSchema.parse({ type: "tech-network", ganttEnabled: false, linkOpacity: 0.035, nodeOpacity: 0.06 });
const cyan = "#46D6E3", gold = "#E6B65F", green = "#7BD9B5", blue = "#93B8E6";
const Frame: React.FC<{ title: string; source: string; order: number; children: React.ReactNode }> = ({title, source, order, children}) => <AbsoluteFill style={{ background: "#081426", color: "#EAF2FA", fontFamily: '"Noto Sans CJK SC", sans-serif' }}>
  <TechNetwork {...bg} />
  <HeaderBreadcrumb lessonId="ch06-L01" lessonTitle="第 6 章 项目管理概论 · L01" sceneId={`R0${order}`} sceneOrder={order} totalScenes={2} segmentTitle={order === 1 ? "组件关系" : "组织级项目管理"} />
  <div style={{ position: "absolute", left: 96, right: 96, top: 48 }}>
    <div style={{ fontSize: 20, lineHeight: 1.5, letterSpacing: 3, marginBottom: 10, color: "#8FB8D9" }}>{source}</div>
    <div style={{ fontSize: 46, lineHeight: 1.3, letterSpacing: 1.2, fontWeight: 700, color: "#E6F1FA" }}>{title}</div>
  </div>
  {children}
</AbsoluteFill>;

const Box: React.FC<{ x: number; y: number; w: number; label: string; color?: string; h?: number; font?: number }> = ({x,y,w,label,color=blue,h=64,font=27}) => <g>
  <rect x={x} y={y} width={w} height={h} rx={12} fill="#112438" stroke={color} strokeWidth={2} />
  <text x={x+w/2} y={y+h/2} dominantBaseline="central" textAnchor="middle" fill={color} fontSize={font} fontWeight={650}>{label}</text>
</g>;
const Line: React.FC<{d: string; color?: string; both?: boolean; dashed?: boolean}> = ({d,color="#7895AC",both=true,dashed=false}) => <path d={d} fill="none" stroke={color} strokeWidth={2.5} strokeDasharray={dashed ? "7 7" : undefined} markerEnd="url(#arrow)" markerStart={both ? "url(#arrowStart)" : undefined} />;
const Markers = () => <defs>
  <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto-start-reverse"><path d="M1 1 L7 4 L1 7" fill="none" stroke="#91B4C8" strokeWidth="1.5" /></marker>
  <marker id="arrowStart" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto-start-reverse"><path d="M1 1 L7 4 L1 7" fill="none" stroke="#91B4C8" strokeWidth="1.5" /></marker>
</defs>;

export const L01StructureGraphic: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, translate: "0 -100px", ...style }}>
    <Markers />
    <Box x={770} y={291} w={380} h={58} label="组织战略" color={gold} />
    <Line d="M960 351 V386" both={false} color={gold} />
    <Box x={142} y={390} w={1636} h={64} label="项目组合示例" color={gold} />
    <Line d="M212 457 V784" />
    <Line d="M446 457 V509" />
    <Line d="M825 457 V509" />
    <Line d="M1340 457 V509" />
    <Line d="M1708 457 V784" />
    <Box x={306} y={513} w={280} label="项目集 A" color={cyan} />
    <Box x={665} y={513} w={320} label="项目集 B" color={cyan} />
    <Box x={1140} y={513} w={400} label="子项目组合 A" color={gold} />
    <Line d="M390 580 V741 H335 V784" />
    <Line d="M502 580 V741 H535 V784" />
    <Line d="M760 580 V632" />
    <Line d="M935 580 V741 H1010 V784" />
    <Box x={650} y={636} w={220} label="子项目集 B1" color={cyan} font={25} />
    <Line d="M710 703 V742 H715 V784" />
    <Line d="M810 703 V742 H875 V784" />
    <Line d="M1212 580 V784" />
    <Line d="M1430 580 V632" />
    <Box x={1320} y={636} w={220} label="项目集 C" color={cyan} />
    <Line d="M1380 703 V742 H1370 V784" />
    <Line d="M1480 703 V742 H1530 V784" />
    {[[212,"项目 1"],[335,"项目 2"],[535,"项目 3"],[715,"项目 4"],[875,"项目 5"],[1010,"项目 6"],[1212,"项目 7"],[1370,"项目 8"],[1530,"项目 9"]].map(([x,label]) => <Box key={label} x={Number(x)-56} y={788} w={112} label={String(label)} font={25} />)}
    <Box x={1638} y={788} w={140} label="运营" color={green} />
    <path d="M212 855 V888 H1708 V855" stroke="#526D86" fill="none" strokeWidth={2} strokeDasharray="6 6" />
    {[335,535,715,875,1010,1212,1370,1530].map(x=><path key={x} d={`M${x} 855 V888`} stroke="#526D86" strokeWidth={2} strokeDasharray="6 6" />)}
    <rect x={649} y={870} width={622} height={43} rx={12} fill="#14283A" />
    <text x={960} y={898} fill="#A6BECE" fontSize={25} textAnchor="middle">共享资源和相关方之间的关系</text>
  </svg>
);

export const Ch06L01Structure: React.FC = () => <Frame title="项目组合，统筹战略下的各类组件" source="图 6-2　项目组合、项目集、项目和运营" order={1}>
  <L01StructureGraphic />
  <div style={{ position: "absolute", left: 96, right: 96, top: 844, textAlign: "center", color: "#A6BECE", fontSize: 24, lineHeight: 1.5 }}>项目可以直接归入项目组合；项目集、子项目组合也可以继续包含其他组件。</div>
</Frame>;

export const L01ValueGraphic: React.FC<{ style?: React.CSSProperties; feedbackProgress?: number }> = ({ style, feedbackProgress = 3 }) => (
  <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, translate: "0 -100px", ...style }}>
    <Markers />
    <rect x={112} y={320} width={1696} height={612} rx={28} fill="#10203488" stroke="#36536C" strokeWidth={2} />
    <text x={152} y={363} fontSize={24} fill="#91ADC2">组织环境</text>
    <g opacity={Math.min(1, Math.max(0, feedbackProgress))}>
    <Line d="M740 508 V410 Q740 394 756 394 H1124 Q1140 394 1140 410 V508" both={false} color={gold} />
    <rect x={795} y={373} width={290} height={42} rx={10} fill="#102034" />
    <text x={940} y={403} fontSize={25} textAnchor="middle" fill={gold}>项目组合审查和调整</text>
    </g>
    <Line d="M501 596 H577" both={false} />
    <Line d="M901 596 H977" both={false} />
    <Line d="M1301 596 H1377" both={false} />
    {[
      {x:180,title:"战略",sub:"确定方向",color:gold},
      {x:580,title:"项目组合",sub:"价值决策",color:gold},
      {x:980,title:"项目集与项目",sub:"成果交付",color:cyan},
      {x:1380,title:"运营",sub:"商业价值实现",color:green},
    ].map(n=><g key={n.title}>
      <rect x={n.x} y={512} width={320} height={168} rx={18} fill="#122B3D" stroke={n.color} strokeWidth={2.5} />
      <text x={n.x+160} y={572} textAnchor="middle" fill={n.color} fontSize={35} fontWeight={750}>{n.title}</text>
      <text x={n.x+160} y={634} textAnchor="middle" fill="#D5E4EF" fontSize={29}>{n.sub}</text>
    </g>)}
    <g opacity={Math.min(1, Math.max(0, feedbackProgress - 1))}>
    <Line d="M1140 683 V742 Q1140 758 1124 758 H756 Q740 758 740 742 V683" both={false} color={cyan} />
    <rect x={840} y={738} width={200} height={42} rx={10} fill="#102034" />
    <text x={940} y={767} textAnchor="middle" fill={cyan} fontSize={25}>业务影响分析</text>
    </g>
    <g opacity={Math.min(1, Math.max(0, feedbackProgress - 2))}>
    <Line d="M1540 683 V847 Q1540 865 1522 865 H358 Q340 865 340 847 V683" both={false} color={green} />
    <rect x={840} y={844} width={200} height={42} rx={10} fill="#102034" />
    <text x={940} y={874} textAnchor="middle" fill={green} fontSize={25}>价值绩效分析</text>
    </g>
  </svg>
);

export const Ch06L01ValueLoop: React.FC = () => <Frame title="从战略到价值实现，还要让反馈回到决策" source="图 6-3　组织级项目管理" order={2}>
  <L01ValueGraphic />
  <div style={{ position: "absolute", left: 96, right: 96, top: 854, textAlign: "center", color: "#A6BECE", fontSize: 24, lineHeight: 1.5 }}>主线向右：交付并实现价值　　反馈回流：支持审查与调整</div>
</Frame>;
