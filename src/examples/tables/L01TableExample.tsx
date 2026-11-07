import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { TechNetwork } from "../../visual/backgrounds/tech-network/TechNetwork";
import { techNetworkSchema } from "../../visual/backgrounds/tech-network/schema";
import { HeaderBreadcrumb } from "../../visual/shell/HeaderBreadcrumb";

const cyan = "#46D6E3";
const gold = "#E6B65F";
const text = "#E6F1FA";
const muted = "#8FB8D9";
const background = techNetworkSchema.parse({
  type: "tech-network", ganttEnabled: false, linkOpacity: 0.035,
  nodeOpacity: 0.06, highlightCoreOpacity: 0.1, highlightGlowOpacity: 0.06,
});

// 示例内容由 L01 口播提炼，非教材表 6-3 的逐字复刻。
const headings = ["管理层次", "管理对象", "主要关注", "口播中的例子"];
const rows = [
  ["项目", "单个项目", "完成明确的项目目标", "核心交易系统建设"],
  ["项目集", "相互关联的项目和活动", "协调依赖，获得分别管理\n无法获得的收益和控制", "卫星研制、地面测控站建设\n与火箭发射"],
  ["项目组合", "项目、项目集、\n子项目组合和运营", "排优先级、做投资决策、\n分配资源，服务组织战略", "芯片研发与物业地产\n共同支撑组织战略"],
];
const widths = [240, 450, 534, 504];
const lefts = [0, 240, 690, 1224];
const headerHeight = 82;
const rowHeight = 146;
const tableHeight = headerHeight + rows.length * rowHeight;
const stages = [
  { label: "整体对照", title: "三个层次，分别关注什么？", lead: "先建立共同参照", note: "沿同一行认识一种管理，沿同一列比较它们的区别。" },
  { label: "项目集", title: "项目集：把相互依赖的工作协调起来", lead: "把一行连起来读", note: "相互关联的项目和活动 → 协调依赖 → 获得整体收益与控制。" },
  { label: "关注点对照", title: "比较管理重点，分清三者的职责", lead: "沿同一维度比较", note: "完成项目目标、协调项目间依赖、服务组织战略，各有关注点。" },
  { label: "组合管理", title: "项目组合：围绕战略作出选择", lead: "回到具体判断依据", note: "资源有限时，要决定优先做什么，以及把资源分配给谁。" },
];

export const L01TableExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const stage = Math.min(3, Math.floor(seconds / 7));
  const easing = Easing.bezier(0.22, 1, 0.36, 1);
  const ramp = (start: number) => interpolate(seconds, [start, start + 0.55], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing,
  });
  // 强调对象的改变采用交接式淡入淡出；基础文字始终保持可读。
  const rowFocus = ramp(7) * (1 - ramp(14));
  const columnFocus = ramp(14) * (1 - ramp(21));
  const cellFocus = ramp(21);
  const appear = ramp(0);

  return <AbsoluteFill style={{ background: "#081426", color: text, fontFamily: '"Noto Sans CJK SC", sans-serif' }}>
    <TechNetwork {...background} />
    <HeaderBreadcrumb lessonId="ch06-l01" lessonTitle="第 6 章 项目管理概论 · 表格案例"
      sceneId={`T${stage + 1}`} sceneOrder={stage + 1} totalScenes={4} segmentTitle={stages[stage].label} />
    <div style={{ position: "absolute", left: 96, right: 96, top: 48 }}>
      <div style={{ fontSize: 20, lineHeight: 1.5, letterSpacing: 3, color: muted, marginBottom: 10 }}>6.2.4 · 项目、项目集与项目组合</div>
      <div style={{ position: "relative", height: 65 }}>
        {stages.map((s, i) => <div key={s.label} style={{ position: "absolute", inset: 0,
          opacity: ramp(i * 7) * (i === 3 ? 1 : 1 - ramp((i + 1) * 7)),
          fontSize: 46, lineHeight: 1.3, fontWeight: 700, letterSpacing: 1.2 }}>{s.title}</div>)}
      </div>
    </div>

    <div style={{ position: "absolute", left: 96, top: 205, fontSize: 26, color: muted, opacity: appear }}>
      管理对象不同，关注点也不同
    </div>

    <div role="table" aria-label="项目、项目集与项目组合对照" style={{ position: "absolute", left: 96, top: 266,
      width: 1728, height: tableHeight, opacity: appear, translate: `0 ${12 * (1 - appear)}px`,
      border: "1.5px solid #46D6E34D", borderRadius: 20, overflow: "hidden", boxSizing: "border-box",
      background: "#10213466" }}>
      <div style={{ position: "absolute", inset: "0 0 auto", height: headerHeight, background: "#46D6E310" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: headerHeight + rowHeight, height: rowHeight,
        background: "#46D6E316", opacity: rowFocus, borderTop: "1px solid #46D6E3A0", borderBottom: "1px solid #46D6E3A0", boxSizing: "border-box" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 5, background: cyan }} />
      </div>
      <div style={{ position: "absolute", left: lefts[2], top: 0, width: widths[2], bottom: 0,
        background: "#E6B65F12", opacity: columnFocus, borderLeft: "1px solid #E6B65F99", borderRight: "1px solid #E6B65F99" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 4, background: gold }} />
      </div>
      <div style={{ position: "absolute", left: lefts[2] + 8, top: headerHeight + rowHeight * 2 + 8,
        width: widths[2] - 16, height: rowHeight - 16, borderRadius: 12, background: "#E6B65F16",
        border: `2px solid ${gold}`, boxSizing: "border-box", opacity: cellFocus }} />

      <div role="row" style={{ display: "grid", gridTemplateColumns: widths.map(w => `${w}px`).join(" "), height: headerHeight, position: "relative" }}>
        {headings.map((h, c) => <div role="columnheader" key={h} style={{ padding: "0 28px", display: "flex", alignItems: "center",
          fontSize: 28, fontWeight: 650, color: c === 2 && stage >= 2 ? gold : cyan,
          borderRight: c < 3 ? "1px solid #8FB8D92A" : undefined }}>{h}</div>)}
      </div>
      {rows.map((row, r) => <div role="row" key={row[0]} style={{ display: "grid", gridTemplateColumns: widths.map(w => `${w}px`).join(" "), height: rowHeight,
        position: "relative", borderTop: "1px solid #8FB8D92A", boxSizing: "border-box" }}>
        {row.map((value, c) => <div role="cell" key={c} style={{ display: "flex", alignItems: "center", padding: "0 28px",
          borderRight: c < 3 ? "1px solid #8FB8D92A" : undefined, whiteSpace: "pre-line",
          fontSize: c === 0 ? 34 : 28, fontWeight: c === 0 ? 650 : 400, lineHeight: 1.65,
          color: c === 0 ? cyan : text }}>{value}</div>)}
      </div>)}
    </div>

    <div style={{ position: "absolute", left: 96, right: 96, top: 822, height: 66 }}>
      {stages.map((s, i) => <div key={s.label} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: 28,
        opacity: ramp(i * 7 + 0.45) * (i === 3 ? 1 : 1 - ramp((i + 1) * 7)),
        borderLeft: `3px solid ${i > 1 ? gold : cyan}`, paddingLeft: 24 }}>
        <span style={{ fontSize: 26, color: i > 1 ? gold : cyan, flexShrink: 0 }}>{s.lead}</span>
        <span style={{ fontSize: 27, color: text }}>{s.note}</span>
      </div>)}
    </div>
  </AbsoluteFill>;
};
