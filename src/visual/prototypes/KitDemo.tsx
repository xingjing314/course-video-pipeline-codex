/**
 * kit 能力演示：三张图，全部只用 kit 原语拼装，不开新组件文件。
 *
 * 这三张对应 L02/L03 真实会用的形态：
 *   1. 五顶帽子（CardGrid，3 列 + 5 项）
 *   2. 评估六步（Flow，6 节点单行）
 *   3. 估算精度阶梯（Scale，4 个刻度 + 断层）
 *
 * 目的不是做 L02/L03，而是证明"新图 = 30 行组合，不写新组件"。
 */
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { SceneShell } from "../templates/shared";
import { CardGrid } from "../kit/CardGrid";
import { Flow } from "../kit/Flow";
import { Scale } from "../kit/Scale";
import { Stagger } from "../kit/Reveal";
import { BASE_COLORS, resolveTone, rgba } from "../tokens/colorCard";

const GOLD = resolveTone("gold");
const CYAN = resolveTone("cyan");

const Hats: React.FC = () => {
  const frame = useCurrentFrame();
  const items = [
    { name: "技术可行性", line: "能不能按期造出来", tone: "cyan" },
    { name: "经济可行性", line: "投入产出划不划算", tone: "gold" },
    { name: "社会效益", line: "对院内与市民的无形价值", tone: "green" },
    { name: "运行环境", line: "搬到医院现场跑不跑得起来", tone: "blue" },
    { name: "其他可行性", line: "版权 · 开源协议 · 政策法规", tone: "purple" },
  ];
  return (
    <SceneShell eyebrow="kit 演示 ①" title="五顶帽子：卡片组 + 逐张入场" subtitle="CardGrid（3 列 / 5 项）">
      <CardGrid items={items} left={200} top={300} columns={3} cardWidth={480} cardHeight={190} gap={40} enter={Math.min(1, frame / 20)} />
    </SceneShell>
  );
};

const Steps: React.FC = () => {
  const frame = useCurrentFrame();
  const active = Math.min(5, Math.floor(frame / 18));
  return (
    <SceneShell eyebrow="kit 演示 ②" title="评估六步：节点链 + 当前节点高亮" subtitle="Flow（6 节点单行，activeIndex 跟随时间）">
      <Flow
        left={96}
        top={360}
        nodeWidth={250}
        nodeHeight={120}
        gap={40}
        activeIndex={active}
        doneThrough={active - 1}
        steps={[
          { code: "1", label: "成立小组" },
          { code: "2", label: "调查研究" },
          { code: "3", label: "分析评估" },
          { code: "4", label: "编写报告" },
          { code: "5", label: "专家论证" },
          { code: "6", label: "定稿发布" },
        ]}
      />
    </SceneShell>
  );
};

const Ladder: React.FC = () => {
  return (
    <SceneShell eyebrow="kit 演示 ③" title="估算精度：四个刻度 + 断层" subtitle="Scale（毛估 ±30% → 设计开发 ±5%）">
      <Scale
        left={300}
        top={380}
        width={1280}
        breakAt={0.30}
        breakLabel="精度要求逐级收紧"
        marks={[
          { at: 0.06, label: "毛估 / 粗估 ±30%", tone: "neutral" },
          { at: 0.42, label: "初步可研 ±20%", tone: "cyan" },
          { at: 0.72, label: "详细可研 ±10%", active: true, tone: "gold" },
          { at: 0.94, label: "设计开发 ±5%", tone: "neutral" },
        ]}
      />
    </SceneShell>
  );
};

export const KIT_STAGES = [
  { key: "hats", label: "卡片组", dur: 240 },
  { key: "steps", label: "节点链", dur: 240 },
  { key: "ladder", label: "刻度", dur: 240 },
] as const;

export const KitDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const idx = Math.min(2, Math.floor(frame / 240));
  const cur = KIT_STAGES[idx];
  return (
    <AbsoluteFill style={{ background: "#0B1A33" }}>
      <Sequence from={0} durationInFrames={240} name="hats">
        <Hats />
      </Sequence>
      <Sequence from={240} durationInFrames={240} name="steps">
        <Steps />
      </Sequence>
      <Sequence from={480} durationInFrames={240} name="ladder">
        <Ladder />
      </Sequence>
      <div
        style={{
          position: "absolute",
          right: 96,
          top: 40,
          padding: "8px 16px",
          borderRadius: 8,
          border: `1px solid ${rgba(GOLD.rgb, 0.5)}`,
          background: "rgba(224,176,80,0.10)",
          color: GOLD.hex,
          fontSize: 18,
          fontWeight: 700,
        }}
      >
        kit 演示 · {cur.label}
      </div>
      <div style={{ position: "absolute", left: 96, bottom: 40, fontSize: 16, color: BASE_COLORS.text2 }}>
        全部由 CardGrid / Flow / Scale / Stagger 拼装，未新增组件文件
      </div>
    </AbsoluteFill>
  );
};
