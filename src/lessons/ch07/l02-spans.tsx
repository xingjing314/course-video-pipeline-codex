/**
 * L02 段组件（先做三镜：S05 五顶帽子 / S13 技术四因素 / S35 终极防坑表）。
 *
 * 全部由 kit 原语 + SceneShell 拼装，不新增 visualType、不改公共代码。
 */
import React from "react";
import { useCurrentFrame } from "remotion";
import { AbsoluteFill } from "remotion";
import { SceneShell } from "../../visual/templates/shared";
import { HeaderBreadcrumb } from "../../visual/shell/HeaderBreadcrumb";
import { L02_SHOTS, l02ShotAt } from "./l02-shot-table";
import { CardGrid, type CardItem } from "../../visual/kit/CardGrid";
import { BASE_COLORS, resolveTone, rgba } from "../../visual/tokens/colorCard";

const GOLD = resolveTone("gold");
const CYAN = resolveTone("cyan");
const GREEN = resolveTone("green");
const PURPLE = resolveTone("purple");
const NEUTRAL = resolveTone("neutral");

/* ───────────────────── S05 · A11 五顶帽子 ───────────────────── */

const HATS: CardItem[] = [
  { name: "技术可行性", line: "能不能在规定时间内造出来？", tone: "cyan", tag: "考场核心" },
  { name: "经济可行性", line: "投入多少钱、能省多少钱？", tone: "gold", tag: "考场核心" },
  { name: "社会效益", line: "对院内能力、对市民有什么无形价值？", tone: "green" },
  { name: "运行环境", line: "搬到医院现场，跑不跑得起来？", tone: "purple", tag: "一票否决" },
  { name: "其他可行性", line: "版权、开源协议、政策法规合不合规？", tone: "neutral", tag: "一票否决" },
];

export const HatsSpan: React.FC = () => {
  const frame = useCurrentFrame();
  const bar = Math.min(1, Math.max(0, (frame - 60) / 18));

  return (
    <SceneShell
      eyebrow="7.2.1 五大可行性维度"
      title="五顶帽子：同一件事，从五个方向审视"
      subtitle="微场景：医院 AI 智能导诊系统"
    >
      <CardGrid
        items={HATS}
        left={96}
        top={330}
        columns={3}
        cardWidth={520}
        cardHeight={190}
        gap={40}
        stagger
      />

      {/* 底部对比条：实务一票否决 vs 考场分值核心 */}
      <div
        style={{
          position: "absolute",
          left: 96,
          top: 900,
          width: 1728,
          height: 74,
          borderRadius: 12,
          border: `1px solid ${rgba(GOLD.rgb, 0.45)}`,
          background: "rgba(224,176,80,0.08)",
          display: "flex",
          alignItems: "center",
          padding: "0 28px",
          boxSizing: "border-box",
          opacity: bar,
          transform: `translateY(${(1 - bar) * 12}px)`,
          fontSize: 24,
          color: BASE_COLORS.text,
        }}
      >
        <span style={{ color: PURPLE.hex, fontWeight: 700 }}>实务视角</span>
        <span style={{ margin: "0 12px", color: BASE_COLORS.text2 }}>运行环境 / 其他 = 一票否决</span>
        <span style={{ margin: "0 24px", color: BASE_COLORS.text2 }}>|</span>
        <span style={{ color: CYAN.hex, fontWeight: 700 }}>考场视角</span>
        <span style={{ marginLeft: 12 }}>技术 / 经济 = 分值核心</span>
      </div>
    </SceneShell>
  );
};

/* ───────────────────── S13 · A12 技术四因素 ───────────────────── */

const FACTORS: CardItem[] = [
  { name: "① 项目开发的风险", line: "给定范围与期限内，能否做出预期系统、实现必需功能与性能", tone: "cyan" },
  { name: "② 人力资源的有效性", line: "技术队伍能否建立？能否社会招聘或培训获得熟练技术人员", tone: "gold", tag: "★★★" },
  { name: "③ 技术能力的可能性", line: "技术趋势与现有技术、开发环境、平台工具是否支持", tone: "cyan" },
  { name: "④ 物资（产品）的可用性", line: "有没有可用的设备，以及可行的替代产品", tone: "cyan" },
];

export const TechFactorsSpan: React.FC = () => (
  <SceneShell
    eyebrow="第一顶 · 技术可行性"
    title="技术可行性分析要看的四个因素"
    subtitle="第②项是全章头号陷阱：招聘 / 培训人员，属于技术可行性"
  >
    <CardGrid
      items={FACTORS}
      left={96}
      top={330}
      columns={2}
      cardWidth={840}
      cardHeight={200}
      gap={40}
      stagger
    />
  </SceneShell>
);

/* ───────────────────── S35 · A16 终极防坑表 ───────────────────── */

const PITFALLS = [
  { ask: "人力资源的有效性（能否招到或培训出技术人员）", to: "技术可行性", tone: CYAN },
  { ask: "人员提升收益（做项目锻炼了队伍、培养了骨干）", to: "社会效益", tone: GREEN },
  { ask: "技术能力的可能性（现有技术与工具支不支持开发）", to: "技术可行性", tone: CYAN },
  { ask: "技术创新效益（攻克难点，积累技术能力与创新）", to: "社会效益", tone: GREEN },
];

export const PitfallTableSpan: React.FC = () => {
  const frame = useCurrentFrame();
  const rowW = 1440;
  const rowH = 118;

  return (
    <SceneShell
      eyebrow="终极防坑表"
      title="题干看到“人”和“技术”，到底选哪个维度"
      subtitle="同一组词，换个说法就换一个维度——这四行必须背下来"
    >
      <div style={{ position: "absolute", left: 240, top: 330, width: rowW }}>
        <div style={{ display: "flex", height: 70, alignItems: "center", fontSize: 24, fontWeight: 700 }}>
          <div style={{ width: rowW * 0.6, color: BASE_COLORS.text2, paddingLeft: 24, boxSizing: "border-box" }}>题干问法</div>
          <div style={{ width: rowW * 0.4, color: BASE_COLORS.text2, paddingLeft: 24, boxSizing: "border-box" }}>归属维度</div>
        </div>

        {PITFALLS.map((row, i) => {
          const at = 20 + i * 22;
          const enter = Math.min(1, Math.max(0, (frame - at) / 14));
          return (
            <div
              key={row.ask}
              style={{
                display: "flex",
                height: rowH,
                alignItems: "center",
                borderRadius: 12,
                marginBottom: 12,
                background: "rgba(8,19,41,0.82)",
                border: `1.5px solid ${rgba(row.tone.rgb, 0.45)}`,
                opacity: enter,
                transform: `translateY(${(1 - enter) * 10}px)`,
              }}
            >
              <div style={{ width: rowW * 0.6, paddingLeft: 24, paddingRight: 24, boxSizing: "border-box", fontSize: 26, color: BASE_COLORS.text, lineHeight: 1.35 }}>
                {row.ask}
              </div>
              <div style={{ width: rowW * 0.4, paddingLeft: 24, boxSizing: "border-box", fontSize: 30, fontWeight: 800, color: row.tone.hex }}>
                {row.to}
              </div>
            </div>
          );
        })}
      </div>
    </SceneShell>
  );
};


/* ───────────────────── 通用：两栏清单面板 ───────────────────── */

const rgbCss = (rgb: [number, number, number], a = 1) => `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${a})`;

const ColumnPanel: React.FC<{
  left: number;
  top: number;
  width: number;
  height: number;
  title: string;
  note?: string;
  items: string[];
  tone: { rgb: [number, number, number]; hex: string };
  startFrame: number;
}> = ({ left, top, width, height, title, note, items, tone, startFrame }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width,
        height,
        borderRadius: 16,
        background: "rgba(8,19,41,0.82)",
        border: `1.5px solid ${rgba(tone.rgb, 0.5)}`,
        padding: "26px 30px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ fontSize: 32, fontWeight: 800, color: tone.hex }}>{title}</div>
      {note ? <div style={{ marginTop: 8, fontSize: 19, color: BASE_COLORS.text2 }}>{note}</div> : null}
      <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 12 }}>
        {items.map((it, i) => {
          const at = startFrame + i * 7;
          const enter = Math.min(1, Math.max(0, (frame - at) / 10));
          return (
            <div
              key={it}
              style={{
                fontSize: 24,
                color: BASE_COLORS.text,
                opacity: enter,
                transform: `translateX(${(1 - enter) * -10}px)`,
                display: "flex",
                alignItems: "baseline",
                gap: 10,
              }}
            >
              <span style={{ color: rgbCss(tone.rgb, 0.9), fontSize: 18 }}>▪</span>
              <span>{it}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ───────────────────── S18 · A13 经济四笔账 ───────────────────── */

const ACCOUNTS: CardItem[] = [
  { name: "① 支出分析", line: "一次性 vs 非一次性，别混", tone: "gold" },
  { name: "② 收益分析", line: "直接 / 间接 / 其他", tone: "gold" },
  { name: "③ 收益投资比 · 回收期", line: "算比值、算回本时间", tone: "cyan" },
  { name: "④ 敏感性分析", line: "关键因素变了，影响多大", tone: "cyan" },
];

export const EconomyAccountsSpan: React.FC = () => (
  <SceneShell
    eyebrow="第二顶 · 经济可行性"
    title="经济可行性：对整个项目算四笔账"
    subtitle="考点集中在第一笔（支出分类），四笔账的顺序与名称要背下来"
  >
    <CardGrid items={ACCOUNTS} left={96} top={330} columns={2} cardWidth={840} cardHeight={200} gap={40} stagger />
  </SceneShell>
);

/* ───────────────────── S19–S21 · A14 收支对照 ───────────────────── */

export const SpendSplitSpan: React.FC = () => (
  <SceneShell
    eyebrow="第一笔账 · 支出分析"
    title="一次性支出 与 非一次性支出"
    subtitle="命题人最爱把“软硬件租金”塞进一次性支出里"
  >
    <ColumnPanel
      left={96}
      top={330}
      width={830}
      height={380}
      title="一次性支出"
      note="建项目时一次性掏出去的钱"
      tone={GOLD}
      startFrame={10}
      items={["开发费", "培训费", "差旅费", "初始数据录入", "设备购置费"]}
    />
    <ColumnPanel
      left={974}
      top={330}
      width={830}
      height={380}
      title="非一次性支出"
      note="运行期间周期性、持续掏的钱"
      tone={CYAN}
      startFrame={45}
      items={["软、硬件租金", "人员工资及福利", "水电等公用设施使用费", "其他消耗品支出"]}
    />
  </SceneShell>
);

/* ───────────────────── S31–S33 · A15 社会效益 2×5 ───────────────────── */

export const SocialBenefitSpan: React.FC = () => (
  <SceneShell
    eyebrow="第三顶 · 社会效益可行性"
    title="社会效益：对组织内部 5 项，对社会发展 5 项"
    subtitle="左边讲“组织自己变强”，右边讲“对社会有贡献”"
  >
    <ColumnPanel
      left={96}
      top={330}
      width={830}
      height={420}
      title="对组织内部"
      note="知识经验沉淀"
      tone={GREEN}
      startFrame={10}
      items={[
        "品牌效益：提升知名度",
        "竞争力效益：获得行业竞争优势",
        "技术创新效益：攻克难点、积累技术能力",
        "人员提升收益：锻炼队伍、培养骨干",
        "管理提升效益：过程管控带来管理水平提升",
      ]}
    />
    <ColumnPanel
      left={974}
      top={330}
      width={830}
      height={420}
      title="对社会发展"
      note="公共服务领域的关注重点"
      tone={GREEN}
      startFrame={55}
      items={[
        "公共效益：信息惠民、居民健康",
        "文化效益：精神文明、网络文明",
        "环境效益：保护自然与生态",
        "社会责任感效益",
        "其他收益：提高国防能力、保障国家安全",
      ]}
    />
  </SceneShell>
);

/* ───────────────────── S38–S39 · A17 运行环境 / 其他 ───────────────────── */

export const RuntimeOtherSpan: React.FC = () => (
  <SceneShell
    eyebrow="第四、五顶 · 运行环境 与 其他"
    title="系统能不能在现场跑起来，以及合不合规"
    subtitle="运行环境既有硬环境，更有软环境——软环境才是考点"
  >
    <ColumnPanel
      left={96}
      top={330}
      width={830}
      height={420}
      title="运行环境可行性"
      note="硬环境 + 软环境"
      tone={PURPLE}
      startFrame={10}
      items={[
        "硬环境：基础软硬件平台",
        "软环境：用户的管理体制、管理方法",
        "软环境：规章制度、工作习惯",
        "软环境：人员素质（含心理承受力、学习积极性）",
        "数据资源积累",
      ]}
    />
    <ColumnPanel
      left={974}
      top={330}
      width={830}
      height={420}
      title="其他（法律 / 政策）可行性"
      note="合同、知识产权与合规"
      tone={NEUTRAL}
      startFrame={45}
      items={[
        "法律可行性",
        "政策可行性",
        "合同责任与知识产权",
        "软件版权（工具版权、开源协议）",
        "对社会环境、自然环境的影响",
      ]}
    />
  </SceneShell>
);

import { QuizT21Span, QuizEconomySpan, DualBattleSpan, QuizT58Span } from "./l02-quizzes";
import {
  OpeningSpan,
  DefinitionSpan,
  FeaturesSpan,
  EightQuestionsSpan,
  AdvanceVsFitSpan,
  CasesSpan,
  FocusTechSpan,
  SocialTitleSpan,
  PitfallSkeletonSpan,
  ClosingSpan,
  TechDefSpan,
  IncomeSpan,
  RatioSpan,
  SensitivitySpan,
} from "./l02-extra";

export const L02_SPANS: Record<string, React.FC> = {
  S01: OpeningSpan,
  S02: DefinitionSpan,
  S03: FeaturesSpan,
  S04: EightQuestionsSpan,
  S05: HatsSpan,
  S12: TechDefSpan,
  S13: TechFactorsSpan,
  S08: AdvanceVsFitSpan,
  "S09-S10": CasesSpan,
  S11: FocusTechSpan,
  S18: EconomyAccountsSpan,
  "S19-S21": SpendSplitSpan,
  S23: IncomeSpan,
  S24: RatioSpan,
  S25: SensitivitySpan,
  S30: SocialTitleSpan,
  "S31-S33": SocialBenefitSpan,
  S34: PitfallSkeletonSpan,
  S35: PitfallTableSpan,
  "S38-S39": RuntimeOtherSpan,
  "S15-S17": QuizT21Span,
  "S26-S29": QuizEconomySpan,
  "S36-S37": DualBattleSpan,
  "S40-S41": QuizT58Span,
  S42: ClosingSpan,
};

/* ───────────────────── 段包装：渲染顶部导航 ───────────────────── */

export type L02SpanPayload = { span: string; offset: number };

/**
 * L02 的段容器：先画 header，再画段组件。
 *
 * header 由段组件自己渲染（`headerMode: "chapter"`），因为它要在跨镜段内随帧推进：
 * 例如 S19–S21 这三镜共用一个段组件，但镜号要从 S19 走到 S21。
 */
export const L02Span: React.FC<{ payload: unknown }> = ({ payload }) => {
  const { span, offset } = payload as L02SpanPayload;
  const frame = useCurrentFrame();
  const { shot, order } = l02ShotAt(offset + frame);
  const Span = L02_SPANS[span];

  if (!Span) {
    throw new Error(`L02Span: 未知段键「${span}」，可选值：${Object.keys(L02_SPANS).join(", ")}`);
  }

  return (
    <AbsoluteFill>
      <HeaderBreadcrumb
        lessonId="ch07-L02"
        lessonTitle="第 7 章 项目立项管理 · L02"
        sceneId={shot.id}
        sceneOrder={order}
        totalScenes={L02_SHOTS.length}
        segmentTitle={shot.segment}
      />
      <Span />
    </AbsoluteFill>
  );
};
