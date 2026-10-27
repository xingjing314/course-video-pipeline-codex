/**
 * L03 知识段组件（S01–S05 / S12–S23 / S37–S39 / S44–S46）。
 *
 * 全部由 kit 原语 + SceneShell 拼装，不新增 visualType、不改公共代码。
 */
import React from "react";
import { useCurrentFrame } from "remotion";
import { SceneShell } from "../../visual/templates/shared";
import { GateTrack } from "../../visual/templates/GateTrack";
import { CardGrid, type CardItem } from "../../visual/kit/CardGrid";
import { Flow, type FlowStep } from "../../visual/kit/Flow";
import { useStepper, cueCuts } from "../../visual/kit/Stepper";
import { Scale } from "../../visual/kit/Scale";
import { cuesFor, cueFrame } from "./l03-cues";
import { BASE_COLORS, resolveTone, rgba } from "../../visual/tokens/colorCard";

const CYAN = resolveTone("cyan");
const GOLD = resolveTone("gold");
const PURPLE = resolveTone("purple");
const GREEN = resolveTone("green");
const RED = resolveTone("red");

const rgbCss = (rgb: [number, number, number], a = 1) => `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${a})`;

/* ───────────── 通用小组件 ───────────── */

const Chip: React.FC<{ text: string; tone?: { rgb: [number, number, number]; hex: string }; dim?: boolean }> = ({
  text,
  tone = CYAN,
  dim = false,
}) => (
  <div
    style={{
      padding: "10px 18px",
      borderRadius: 10,
      border: `1.5px solid ${rgba(tone.rgb, dim ? 0.25 : 0.55)}`,
      background: rgba(tone.rgb, dim ? 0.05 : 0.12),
      color: dim ? BASE_COLORS.text2 : BASE_COLORS.text,
      fontSize: 22,
      whiteSpace: "nowrap",
    }}
  >
    {text}
  </div>
);

const Line: React.FC<{ text: string; at: number; tone?: string; size?: number }> = ({ text, at, tone, size = 26 }) => {
  const frame = useCurrentFrame();
  const enter = Math.min(1, Math.max(0, (frame - at) / 12));
  return (
    <div
      style={{
        fontSize: size,
        color: tone ? tone : BASE_COLORS.text,
        opacity: enter,
        transform: `translateY(${(1 - enter) * 10}px)`,
        lineHeight: 1.5,
      }}
    >
      {text}
    </div>
  );
};

/* ───────────── S01 · 交棒：② 门拆台阶 ───────────── */

export const OpeningSpan: React.FC = () => {
  const frame = useCurrentFrame();
  const mark = Math.min(1, Math.max(0, (frame - 10) / 14));
  return (
    <>
      <GateTrack
        stage={1}
        eyebrow="7.2.2 初步可行性研究"
        title="第三关之前，先把第二关拆成两级台阶"
        subtitle="大型项目一上来就全方位深挖，既费时又费钱——先粗筛，再深挖"
      />
      <div
        style={{
          position: "absolute",
          left: 560,
          top: 238,
          display: "flex",
          gap: 10,
          opacity: mark,
        }}
      >
        <Chip text="②a 初步可研（粗筛）" tone={CYAN} />
        <Chip text="②b 详细可研（深挖）" tone={GOLD} dim />
      </div>
    </>
  );
};

/* ───────────── S02 · 初可研三件事 ───────────── */

export const PreStudyThreeSpan: React.FC = () => (
  <SceneShell
    eyebrow="7.2.2 初步可行性研究"
    title="初步可研，主要用来衡量三件事"
    subtitle="它是「对市场或客户情况调查之后」做的初步评估"
  >
    <div style={{ position: "absolute", left: 96, top: 340, width: 1500, display: "flex", flexDirection: "column", gap: 22 }}>
      <Line at={8} text="① 分析项目前途——值不值得继续深入做详细研究" />
      <Line at={26} text="② 初步估计项目里的关键技术及核心问题" />
      <Line at={44} text="③ 初步估计必须进行的辅助研究，并判断有没有技术、实验、人力条件支持" />
    </div>
  </SceneShell>
);

/* ───────────── S03 · 初可研报告三细节 ───────────── */

const SIX_ITEMS = ["需求与市场预测", "设备与资源投入分析", "空间布局", "项目设计", "项目进度安排", "项目投资与成本估算"];

export const PreStudyDetailsSpan: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <SceneShell
      eyebrow="初步可行性研究报告"
      title="三个考场高频细节"
      subtitle="它和详细可研「结果与内容基本相同」，差别在占有的资源与研究细节"
    >
      <div style={{ position: "absolute", left: 96, top: 300, width: 1728, display: "flex", flexDirection: "column", gap: 18 }}>
        <Line at={6} text="① 结果和主要内容与详细可研基本相同，差异在资源与细节" size={26} />
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 6 }}>
          <div style={{ fontSize: 26, color: BASE_COLORS.text, minWidth: 300 }}>② 主要内容一共 6 项：</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, maxWidth: 1380 }}>
            {SIX_ITEMS.map((t, i) => {
              const enter = Math.min(1, Math.max(0, (frame - (20 + i * 8)) / 10));
              return (
                <div key={t} style={{ opacity: enter }}>
                  <Chip text={t} tone={GOLD} />
                </div>
              );
            })}
          </div>
        </div>
        <Line at={78} text="③ 可作为正式文献供决策参考，也是进一步做详细可研的基础" size={26} />
      </div>
    </SceneShell>
  );
};

/* ───────────── S04 · 辅助研究定义 ───────────── */

export const AssistDefineSpan: React.FC = () => (
  <SceneShell
    eyebrow="辅助（功能）研究"
    title="它只研究一个或几个方面"
    subtitle="所以只能作为初步可研、详细可研和大规模投资建议的前提或辅助"
  >
    <div style={{ position: "absolute", left: 96, top: 360, display: "flex", gap: 40 }}>
      <Chip text="只覆盖一个 / 几个方面" tone={CYAN} />
      <Chip text="不是所有方面" tone={CYAN} dim />
      <Chip text="费用与可研费用一并考虑" tone={GOLD} />
    </div>
  </SceneShell>
);

/* ───────────── S05 · 辅助研究 6 分类 ───────────── */

const ASSIST6: CardItem[] = [
  { name: "① 产品的市场研究", line: "", tone: "neutral" },
  { name: "② 配件和投入物资研究", line: "", tone: "neutral" },
  { name: "③ 试验室和中间工厂的试验", line: "考题最爱张冠李戴", tone: "gold", tag: "重点" },
  { name: "④ 网络物理布局设计", line: "", tone: "neutral" },
  { name: "⑤ 规模的经济性研究", line: "", tone: "neutral" },
  { name: "⑥ 设备选择研究", line: "", tone: "neutral" },
];

export const AssistSixSpan: React.FC = () => (
  <SceneShell
    eyebrow="辅助研究的 6 种分类"
    title="不用背解释，认准名字"
    subtitle="尤其第三条——它常被塞进「初步可研的主要内容」里骗你"
  >
    <CardGrid items={ASSIST6} left={96} top={340} columns={3} cardWidth={520} cardHeight={150} gap={32} stagger />
  </SceneShell>
);

/* ───────────── S12 · 进入详细可研 ───────────── */

export const DetailEnterSpan: React.FC = () => (
  <GateTrack
    stage={2}
    eyebrow="7.2.3 详细可行性研究"
    title="绝对不能省的一步"
    subtitle="它提交的《可行性研究报告》直接成为项目评估与决策的依据"
  />
);

/* ───────────── S13 · 四考点导航 + 依据与三原则 ───────────── */

const PRINCIPLES: CardItem[] = [
  { name: "科学性", line: "数据真实、有科学依据", tone: "cyan" },
  { name: "客观性", line: "实事求是、排除主观臆断", tone: "cyan" },
  { name: "公正性", line: "国家人民利益首位、不偏不倚", tone: "cyan" },
];

export const FourPointsSpan: React.FC = () => (
  <SceneShell eyebrow="详细可研 · 四个硬核考点" title="第一：依据与三原则" subtitle="依据 7 项，三原则 3 条">
    <div style={{ position: "absolute", left: 96, top: 290, display: "flex", gap: 12 }}>
      {["① 依据与三原则", "② 两个核心方法", "③ 精度阶梯", "④ 经济评价"].map((t, i) => (
        <Chip key={t} text={t} tone={i === 0 ? GOLD : CYAN} dim={i !== 0} />
      ))}
    </div>
    <div style={{ position: "absolute", left: 96, top: 360, width: 1728 }}>
      <div style={{ fontSize: 22, color: BASE_COLORS.text2, marginBottom: 10 }}>依据 7 项</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {["国家规划", "政策法规", "批复", "项目建议书/意向协议", "信息化规划标准", "市场调研报告", "技术资料"].map((t) => (
          <Chip key={t} text={t} tone={CYAN} />
        ))}
      </div>
    </div>
    <div style={{ position: "absolute", left: 96, top: 560, width: 1728 }}>
      <CardGrid items={PRINCIPLES} left={0} top={0} columns={3} cardWidth={540} cardHeight={150} gap={30} stagger />
    </div>
  </SceneShell>
);

/* ───────────── S14 · 两个核心方法 ───────────── */

const METHODS: CardItem[] = [
  { name: "投资估算法", line: "数量性/比例、研究性、预算性、投标估算", tone: "cyan" },
  { name: "增量净效益法", line: "又叫「有无比较法」——重点圈出来", tone: "gold", tag: "重点" },
];

export const TwoMethodsSpan: React.FC = () => (
  <SceneShell eyebrow="详细可研 · 两个核心方法" title="一个算投资，一个算差值" subtitle="考试更爱考第二个的别名">
    <CardGrid items={METHODS} left={96} top={380} columns={2} cardWidth={840} cardHeight={200} gap={40} stagger />
  </SceneShell>
);

/* ───────────── S15 · 有无比较法 ───────────── */

export const WithWithoutSpan: React.FC = () => (
  <SceneShell
    eyebrow="什么叫「有无比较法」"
    title="有项目时的成本/效益，减掉无项目时的"
    subtitle="差值就是「增量」——它比「前后比较法」更科学"
  >
    <Flow
      left={120}
      top={380}
      nodeWidth={420}
      nodeHeight={140}
      gap={70}
      steps={[
        { code: "有项目", label: "成本 / 效益", sub: "上项目之后的样子", tone: "cyan" },
        { code: "无项目", label: "成本 / 效益", sub: "不上项目，组织也会变", tone: "neutral" },
        { code: "差值", label: "增量净效益", sub: "这才是项目带来的", tone: "gold" },
      ]}
    />
    <div style={{ position: "absolute", left: 120, top: 640, fontSize: 22, color: BASE_COLORS.text2 }}>
      前后比较法只比"上项目前 vs 上项目后"，忽略了组织本身的变化，容易夸大或低估
    </div>
  </SceneShell>
);

/* ───────────── S16 · 精度阶梯 ───────────── */

export const PrecisionSpan: React.FC = () => (
  <SceneShell eyebrow="详细可研 · 估算精度阶梯" title="越往后，要求越准" subtitle="±30% → ±20% → ±10% → ±5%">
    <Scale
      left={300}
      top={400}
      width={1280}
      breakAt={0.36}
      breakLabel="初步可研之后逐级收紧"
      marks={[
        { at: 0.06, label: "毛估 / 粗估 ±30%", tone: "neutral" },
        { at: 0.38, label: "初步可研 ±20%", tone: "cyan" },
        { at: 0.68, label: "详细可研 ±10%", tone: "gold" },
        { at: 0.94, label: "设计开发 ±5%", tone: "neutral" },
      ]}
    />
  </SceneShell>
);

/* ───────────── S17 · 财务常识（顺带） ───────────── */

export const FinanceSpan: React.FC = () => (
  <SceneShell eyebrow="顺带记住" title="几个财务常识" subtitle="不考推导，只考这些等式">
    <div style={{ position: "absolute", left: 96, top: 370, display: "flex", gap: 26 }}>
      {[
        { t: "投资费用", d: "固定资本 + 净周转资金" },
        { t: "自筹与贷款", d: "一般各半；贷款限额 50%–80%" },
        { t: "经营成本", d: "研发 + 管理 + 销售分销" },
      ].map((x) => (
        <div
          key={x.t}
          style={{
            width: 540,
            padding: "22px 26px",
            borderRadius: 14,
            border: `1px solid ${rgba(resolveTone("neutral").rgb, 0.3)}`,
            background: "rgba(8,19,41,0.55)",
            opacity: 0.75,
          }}
        >
          <div style={{ fontSize: 24, color: BASE_COLORS.text2 }}>{x.t}</div>
          <div style={{ marginTop: 8, fontSize: 22, color: BASE_COLORS.text }}>{x.d}</div>
        </div>
      ))}
    </div>
  </SceneShell>
);

/* ───────────── S18 · 组织 vs 国民经济评价 ───────────── */

export const EconCompareSpan: React.FC = () => (
  <SceneShell eyebrow="详细可研 · 组织经济评价 vs 国民经济评价" title="一个站企业角度，一个站国家角度" subtitle="差在「把什么算成收益」">
    <div style={{ position: "absolute", left: 96, top: 340, width: 1728, display: "flex", gap: 40 }}>
      {[
        { t: "组织经济评价", d: ["站企业角度算盈利", "静态：投资收益率、回收期", "动态：NPV、IRR 等，考虑资金时间价值"], tone: CYAN },
        { t: "国民经济评价", d: ["站国家和社会全局", "工资、利息、税金算作国家收益", "用社会价格与社会贴现率"], tone: PURPLE },
      ].map((p) => (
        <div
          key={p.t}
          style={{
            flex: 1,
            borderRadius: 16,
            border: `1.5px solid ${rgba(p.tone.rgb, 0.55)}`,
            background: "rgba(8,19,41,0.82)",
            padding: "28px 32px",
          }}
        >
          <div style={{ fontSize: 32, fontWeight: 800, color: p.tone.hex }}>{p.t}</div>
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            {p.d.map((x) => (
              <div key={x} style={{ fontSize: 22, color: BASE_COLORS.text }}>
                · {x}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </SceneShell>
);

/* ───────────── S19 · 表 7-1 迷你卡 ───────────── */

export const Table71Span: React.FC = () => (
  <SceneShell eyebrow="表 7-1 · 详细可研报告结构示例" title="它视项目规模和性质，有简有繁" subtitle="只需知道这一点">
    <div style={{ position: "absolute", left: 96, top: 380, display: "flex", gap: 16 }}>
      {["背景", "目标与结论", "技术与方案", "投资与进度", "人员与风险", "经济社会效益"].map((t) => (
        <Chip key={t} text={t} tone={CYAN} dim />
      ))}
    </div>
  </SceneShell>
);

/* ───────────── S20 · 为什么必须第三方 ───────────── */

export const EvalWhySpan: React.FC = () => (
  <SceneShell
    eyebrow="7.3 项目评估与决策"
    title="可研是自己写的，能不能直接拿去领钱开工？"
    subtitle="王婆卖瓜，难免有水分——所以必须有人替你把关"
  >
    <div style={{ position: "absolute", left: 200, top: 400, display: "flex", alignItems: "center", gap: 60 }}>
      <div style={{ width: 520, padding: "28px 32px", borderRadius: 16, border: `1.5px solid ${rgba(resolveTone("neutral").rgb, 0.4)}`, background: "rgba(8,19,41,0.7)" }}>
        <div style={{ fontSize: 30, color: BASE_COLORS.text2 }}>建设单位自己写的可研</div>
        <div style={{ marginTop: 10, fontSize: 22, color: BASE_COLORS.text2 }}>「王婆卖瓜」</div>
      </div>
      <div style={{ fontSize: 56, color: BASE_COLORS.text2 }}>？</div>
      <div style={{ width: 520, padding: "28px 32px", borderRadius: 16, border: `1.5px solid ${rgba(PURPLE.rgb, 0.7)}`, background: rgba(PURPLE.rgb, 0.12) }}>
        <div style={{ fontSize: 30, fontWeight: 800, color: PURPLE.hex }}>第三方来评估</div>
        <div style={{ marginTop: 10, fontSize: 22, color: BASE_COLORS.text }}>国家、银行或有关机构</div>
      </div>
    </div>
  </SceneShell>
);

/* ───────────── S21 · 评估铁三角 ───────────── */

const TRIANGLE = [
  { no: "①", x: 796, y: 260, t: "在什么基础上？", v: "项目可行性研究", warn: "不是立项申请", tone: CYAN },
  { no: "②", x: 396, y: 520, t: "由谁来做？", v: "第三方", warn: "不是建设单位，也不是承建方", tone: PURPLE },
  { no: "③", x: 1276, y: 520, t: "审查什么目的？", v: "可靠性 · 真实性 · 客观性", warn: "不是只看安全性", tone: GOLD },
];

export const IronTriangleSpan: React.FC = () => {
  const steps = useStepper(cueCuts(cuesFor("S21")));
  return (
    <SceneShell eyebrow="7.3 · 评估铁三角" title="三个灵魂关键词" subtitle="过去 11 套卷考了 3 次填空">
      {TRIANGLE.map((p, i) => {
        const state = steps.stateOf(i);
        const future = state === "future";
        const current = state === "current";
        return (
          <div
            key={p.t}
            style={{
              position: "absolute",
              left: p.x,
              top: p.y,
              width: 420,
              opacity: future ? 0.4 : 1,
            }}
          >
            <div
              style={{
                boxSizing: "border-box",
                height: 110,
                padding: "18px 24px",
                borderRadius: 14,
                border: `1.5px solid ${rgba(p.tone.rgb, current ? 0.95 : 0.55)}`,
                background: current ? rgba(p.tone.rgb, 0.16) : rgba(p.tone.rgb, 0.08),
                boxShadow: current ? `0 0 30px ${rgba(p.tone.rgb, 0.32)}` : undefined,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <div style={{ fontSize: 20, color: BASE_COLORS.text2 }}>
                <span style={{ color: p.tone.hex, fontWeight: 800, marginRight: 8 }}>{p.no}</span>
                {p.t}
              </div>
              <div style={{ fontSize: 27, fontWeight: 800, color: p.tone.hex, lineHeight: 1.25 }}>{p.v}</div>
            </div>
            <div style={{ marginTop: 6, fontSize: 18, lineHeight: 1.35, color: RED.hex, maxWidth: 380 }}>
              ⚠ {p.warn}
            </div>
          </div>
        );
      })}
    </SceneShell>
  );
};

/* ───────────── S22 · 评估依据 5 项 ───────────── */

const BASIS5 = [
  "项目建议书及其批准文件",
  "项目可行性研究报告",
  "报送组织的申请报告及主管部门的初审意见",
  "项目关键建设条件和工程等的协议文件",
  "必需的其他文件和资料",
];

export const EvalBasisSpan: React.FC = () => {
  const steps = useStepper(cueCuts(cuesFor("S22")));
  return (
    <SceneShell eyebrow="7.3.1 评估依据" title="项目评估的依据一共 5 项" subtitle="注意看：这里面有没有《项目章程》？">
      <div style={{ position: "absolute", left: 200, top: 330, width: 1500, display: "flex", flexDirection: "column", gap: 14 }}>
        {BASIS5.map((t, i) => {
          const state = steps.stateOf(i);
          const future = state === "future";
          const current = state === "current";
          return (
            <div
              key={t}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "10px 18px",
                borderRadius: 12,
                border: `1.5px solid ${rgba(current ? GOLD.rgb : CYAN.rgb, current ? 0.9 : future ? 0.18 : 0.32)}`,
                background: current ? rgba(GOLD.rgb, 0.12) : "rgba(8,19,41,0.55)",
                opacity: future ? 0.4 : 1,
              }}
            >
              <span
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 17,
                  fontWeight: 800,
                  background: current ? GOLD.hex : rgba(CYAN.rgb, 0.16),
                  color: current ? "#04131A" : BASE_COLORS.text2,
                }}
              >
                {i + 1}
              </span>
              <span style={{ fontSize: 25, color: current ? GOLD.hex : BASE_COLORS.text }}>{t}</span>
            </div>
          );
        })}
      </div>
    </SceneShell>
  );
};

/* ───────────── S23 · 章程坑（时间线） ───────────── */

export const CharterTrapSpan: React.FC = () => (
  <SceneShell
    eyebrow="全章最经典的跨章大坑"
    title="评估的时候，《项目章程》还没生出来"
    subtitle="它在第 8 章才签发——所以绝不可能是评估依据"
  >
    <Flow
      left={150}
      top={380}
      nodeWidth={330}
      nodeHeight={130}
      gap={50}
      steps={[
        { code: "7.1", label: "立项申请", tone: "cyan" },
        { code: "7.2", label: "可行性研究", tone: "cyan" },
        { code: "7.3", label: "评估与决策", tone: "purple" },
        { code: "第 8 章", label: "项目章程（还不存在）", tone: "neutral" },
      ]}
    />
  </SceneShell>
);

/* ───────────── S37 · 评估程序 6 步 ───────────── */

const SIX_STEPS: FlowStep[] = [
  { code: "1", label: "成立小组", sub: "制订评估计划" },
  { code: "2", label: "调查研究", sub: "核数据、补数据" },
  { code: "3", label: "分析评估", sub: "逐项评估" },
  { code: "4", label: "编写报告", sub: "讨论修改" },
  { code: "5", label: "专家论证", sub: "开论证会" },
  { code: "6", label: "定稿发布", sub: "正式出具" },
];

export const ProgramSixSpan: React.FC = () => {
  const steps = useStepper(cueCuts(cuesFor("S37")));
  return (
    <SceneShell eyebrow="7.3 · 评估程序" title="六步，按顺序留个印象" subtitle="组队 → 调查 → 分析 → 写报告 → 论证 → 发布">
      <Flow
        left={96}
        top={380}
        nodeWidth={250}
        nodeHeight={120}
        gap={40}
        steps={SIX_STEPS}
        activeIndex={steps.current}
        doneThrough={steps.current - 1}
      />
    </SceneShell>
  );
};

/* ───────────── S38 · 15 项内容，重点 5 项 ───────────── */

const FOCUS5: CardItem[] = [
  { name: "建设必要性", line: "看是否符合产业政策、规划、市场需求（要不要建）", tone: "cyan" },
  { name: "安装工程标准", line: "标准与规范是否先进、合理、合规", tone: "cyan" },
  { name: "财务效益", line: "数据是否可靠、指标与参数是否正确、方案是否最佳", tone: "cyan" },
  { name: "国民经济效益", line: "核查费用与效益的范围及数值调整是否正确", tone: "cyan" },
  { name: "项目风险", line: "盈亏平衡、敏感性、风险因素与处置方案", tone: "gold", tag: "易混" },
];

export const EvalContentSpan: React.FC = () => (
  <SceneShell eyebrow="7.3 · 评估内容" title="15 项不用背，只分清这 5 项" subtitle="最新真题就考这 5 个易混项">
    <div style={{ position: "absolute", left: 96, top: 300, width: 240, opacity: 0.35 }}>
      {Array.from({ length: 15 }, (_, i) => (
        <div key={i} style={{ fontSize: 15, color: BASE_COLORS.text2, lineHeight: 1.5 }}>
          第 {i + 1} 项
        </div>
      ))}
    </div>
    <CardGrid items={FOCUS5} left={380} top={300} columns={2} cardWidth={660} cardHeight={140} gap={24} stagger />
  </SceneShell>
);

/* ───────────── S39 · 报告大纲三块 ───────────── */

const OUTLINE3: CardItem[] = [
  { name: "一、项目概况", line: "含是否批准 / 可否贷款的结论性意见", tone: "cyan" },
  { name: "二、详细评估意见", line: "逐项评估结论", tone: "cyan" },
  { name: "三、总结和建议", line: "重大问题、潜在风险、建议", tone: "cyan" },
];

export const OutlineSpan: React.FC = () => {
  const steps = useStepper(cueCuts(cuesFor("S39")));
  return (
    <SceneShell eyebrow="7.3 · 评估报告大纲" title="只包含三大块" subtitle="别把 15 项内容和报告大纲搞混">
      <CardGrid items={OUTLINE3} left={96} top={380} columns={3} cardWidth={540} cardHeight={180} gap={40} states={steps.states} />
    </SceneShell>
  );
};

/* ───────────── S44a–S44e · 章末总图（常驻四关细轨） ───────────── */

const GATES: FlowStep[] = [
  { code: "7.1 第一关", label: "提申请", sub: "《项目建议书》", tone: "cyan" },
  { code: "7.2 第二关", label: "初可研", sub: "精度 ±20%", tone: "cyan" },
  { code: "7.2 第三关", label: "详可研", sub: "精度 ±10%", tone: "gold" },
  { code: "7.3 第四关", label: "拍板评估", sub: "第三方审查", tone: "purple" },
];

/** 常驻细轨：五镜同一位置、同一尺寸，只换点亮项，切镜时视觉无缝。 */
const GateRail: React.FC<{ active: number[] }> = ({ active }) => (
  <Flow left={196} top={300} nodeWidth={340} nodeHeight={92} gap={56} steps={GATES} activeIndices={active} />
);

/** S44a · 总图：四关全暗，只立骨架。 */
export const ChapterMapSpan: React.FC = () => (
  <SceneShell eyebrow="第 7 章 · 立项闯关与交接总图" title="四关走完，一个项目才算被批准" subtitle="7.1 提申请 → 7.2 做可研 → 7.3 拍板评估">
    <div style={{ position: "absolute", inset: 0, opacity: 0.62 }}>
      <Flow
        left={124}
        top={380}
        nodeWidth={400}
        nodeHeight={170}
        gap={44}
        steps={GATES}
        activeIndices={[]}
      />
    </div>
    <div style={{ position: "absolute", left: 124, top: 620, fontSize: 21, color: BASE_COLORS.text2 }}>
      接下来逐关过一遍，每关只记一句话
    </div>
  </SceneShell>
);

/** S44b · 第一关放大：框架性设想 + 口诀 + 交给谁。 */
export const Gate1Span: React.FC = () => (
  <SceneShell eyebrow="第 7 章 · 立项闯关与交接总图" title="第一关：提申请" subtitle="《项目建议书》只是框架性总体设想，不是详细方案">
    <GateRail active={[0]} />
    <div
      style={{
        position: "absolute",
        left: 360,
        top: 450,
        width: 1200,
        padding: "24px 34px",
        borderRadius: 16,
        border: `1.5px solid ${rgba(CYAN.rgb, 0.6)}`,
        background: "rgba(8,19,41,0.86)",
      }}
    >
      {[
        { k: "写什么", v: "框架性总体设想 —— 不是详细方案" },
        { k: "口诀", v: "一必要 · 两市场 · 一条件" },
        { k: "交给谁", v: "上级主管部门（立项审批）" },
      ].map((row, i) => (
        <div key={row.k} style={{ display: "flex", alignItems: "baseline", gap: 18, marginTop: i === 0 ? 0 : 16 }}>
          <span style={{ width: 96, fontSize: 19, color: BASE_COLORS.text2 }}>{row.k}</span>
          <span style={{ fontSize: 26, fontWeight: 700, color: BASE_COLORS.text }}>{row.v}</span>
        </div>
      ))}
    </div>
  </SceneShell>
);

/** S44c · 第二、三关同亮：±20% / ±10% + 有无比较法。 */
export const PrecisionPairSpan: React.FC = () => (
  <SceneShell eyebrow="第 7 章 · 立项闯关与交接总图" title="第二、三关：做可研" subtitle="先粗筛（±20%），再深挖（±10%）">
    <GateRail active={[1, 2]} />
    <CardGrid
      items={[
        { name: "第二关 · 初步可研 ±20%", line: "评估项目前途，初估辅助研究——先粗筛", tone: "cyan" },
        { name: "第三关 · 详细可研 ±10%", line: "不可缺少的一步，用有无比较法算增量", tone: "gold" },
      ]}
      left={96}
      top={450}
      columns={2}
      cardWidth={830}
      cardHeight={170}
      gap={68}
    />
    <div style={{ position: "absolute", left: 434, top: 656, display: "flex", alignItems: "center", gap: 20 }}>
      {[
        { t: "有项目", s: "上项目后的成本 / 效益", tone: CYAN },
        { t: "−", s: "", tone: null },
        { t: "无项目", s: "不上项目，组织也会变", tone: PURPLE },
        { t: "＝", s: "", tone: null },
        { t: "增量净效益", s: "这才是项目带来的", tone: GOLD },
      ].map((x, i) =>
        x.tone ? (
          <div
            key={i}
            style={{
              width: 300,
              height: 96,
              borderRadius: 12,
              border: `1.5px solid ${rgba(x.tone.rgb, 0.55)}`,
              background: "rgba(8,19,41,0.8)",
              padding: "14px 18px",
              boxSizing: "border-box",
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 800, color: x.tone.hex }}>{x.t}</div>
            <div style={{ marginTop: 4, fontSize: 16, color: BASE_COLORS.text2 }}>{x.s}</div>
          </div>
        ) : (
          <div key={i} style={{ fontSize: 36, color: BASE_COLORS.text2, width: 36, textAlign: "center" }}>
            {x.t}
          </div>
        ),
      )}
    </div>
    <div style={{ position: "absolute", left: 434, top: 782, fontSize: 20, color: BASE_COLORS.text2 }}>
      精度阶梯：±30% → ±20% → ±10% → ±5%
    </div>
  </SceneShell>
);

/** S44d · 算账前戴好五顶帽子，并分清两组易混词。 */
const HATS5: CardItem[] = [
  { name: "技术可行性", line: "能不能按时造出来", tone: "cyan" },
  { name: "经济可行性", line: "投入与产出算得过来吗", tone: "gold" },
  { name: "社会效益", line: "对组织内部、对社会的无形价值", tone: "green" },
  { name: "运行环境", line: "搬到现场跑不跑得起来", tone: "purple" },
  { name: "其他可行性", line: "版权、开源协议、政策合规", tone: "neutral" },
];

export const HatsSpan: React.FC = () => (
  <SceneShell eyebrow="第 7 章 · 立项闯关与交接总图" title="算账时，先戴好五顶帽子" subtitle="再把最容易站错队的两组词分清">
    <GateRail active={[1, 2]} />
    <CardGrid items={HATS5} left={126} top={450} columns={3} cardWidth={540} cardHeight={112} gap={24} />
    <div style={{ position: "absolute", left: 126, top: 724, width: 1668, display: "flex", flexDirection: "column", gap: 10 }}>
      {[
        {
          left: "人力资源有效性 · 技术能力可能性",
          right: "人员提升收益 · 技术创新效益",
          l: "技术可研",
          r: "社会效益（组织内部）",
        },
        { left: "设备购置费", right: "软硬件租金", l: "一次性支出", r: "按年分摊，非一次性" },
      ].map((row) => (
        <div key={row.left} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 20 }}>
          <div style={{ flex: 1, padding: "10px 18px", borderRadius: 10, border: `1px solid ${rgba(CYAN.rgb, 0.45)}`, background: rgba(CYAN.rgb, 0.08) }}>
            <span style={{ color: BASE_COLORS.text }}>{row.left}</span>
            <span style={{ color: CYAN.hex, fontWeight: 800 }}> → {row.l}</span>
          </div>
          <div style={{ width: 60, textAlign: "center", color: BASE_COLORS.text2 }}>｜</div>
          <div style={{ flex: 1, padding: "10px 18px", borderRadius: 10, border: `1px solid ${rgba(GOLD.rgb, 0.45)}`, background: rgba(GOLD.rgb, 0.08) }}>
            <span style={{ color: BASE_COLORS.text }}>{row.right}</span>
            <span style={{ color: GOLD.hex, fontWeight: 800 }}> → {row.r}</span>
          </div>
        </div>
      ))}
    </div>
  </SceneShell>
);

/** S44e · 第四关放大：可研基础 → 第三方 → 三性 → 没有章程。 */
export const Gate4Span: React.FC = () => (
  <SceneShell eyebrow="第 7 章 · 立项闯关与交接总图" title="第四关：拍板评估" subtitle="在可研的基础上，由第三方审查三性">
    <GateRail active={[3]} />
    <Flow
      left={495}
      top={450}
      nodeWidth={420}
      nodeHeight={130}
      gap={90}
      steps={[
        { code: "前提", label: "项目可行性研究", sub: "建设单位自己写的", tone: "cyan" },
        { code: "主体", label: "第三方评审", sub: "国家 / 银行 / 有关机构", tone: "purple" },
      ]}
    />
    <div style={{ position: "absolute", left: 495, top: 618, display: "flex", alignItems: "center", gap: 16 }}>
      <span style={{ fontSize: 20, color: BASE_COLORS.text2 }}>审查三性：</span>
      {[
        { t: "可靠性", tone: CYAN },
        { t: "真实性", tone: CYAN },
        { t: "客观性", tone: CYAN },
      ].map((x) => (
        <div
          key={x.t}
          style={{
            padding: "8px 20px",
            borderRadius: 10,
            border: `1.5px solid ${rgba(x.tone.rgb, 0.6)}`,
            background: rgba(x.tone.rgb, 0.12),
            fontSize: 22,
            fontWeight: 700,
            color: BASE_COLORS.text,
          }}
        >
          {x.t}
        </div>
      ))}
    </div>
    <div
      style={{
        position: "absolute",
        left: 495,
        top: 698,
        width: 930,
        padding: "16px 26px",
        borderRadius: 12,
        border: `1.5px solid ${RED.hex}`,
        background: rgba(RED.rgb, 0.16),
        fontSize: 24,
        fontWeight: 800,
        color: "#FCA5A5",
      }}
    >
      ✕ 评估依据里，绝没有《项目章程》——它在第 8 章才签发
    </div>
  </SceneShell>
);

/* ───────────── S45 · 三份文件化成依据 ───────────── */

export const CrystallizeSpan: React.FC = () => {
  const frame = useCurrentFrame();
  /**
   * 三张卡在段头依次浮出（回答“会发生什么？”）；
   * 只有“三份文件汇成依据文件”这一句结论跟着口播出现（cue），
   * 否则会在口播还没说到时就先把结论亮出来。
   */
  const basisAt = cueFrame("S45", "basis");
  const lift = basisAt === null ? 0 : Math.min(1, Math.max(0, (frame - basisAt) / 20));
  const enter = (i: number) => Math.min(1, Math.max(0, (frame - (6 + i * 9)) / 14));

  return (
    <SceneShell
      eyebrow="第 7 章 · 立项阶段的结晶"
      title="评估通过之后，最后留下什么？"
      subtitle="四关走完，项目正式立项——接下来看这三份文件"
    >
      <div style={{ position: "absolute", left: 96, top: 380, display: "flex", gap: 26 }}>
        {["项目建议书", "可行性研究报告", "项目评估报告"].map((t, i) => (
          <div
            key={t}
            style={{
              width: 500,
              padding: "26px 30px",
              borderRadius: 14,
              border: `1.5px solid ${rgba(CYAN.rgb, 0.55)}`,
              background: "rgba(8,19,41,0.82)",
              transform: `translateY(${-18 * lift}px)`,
              opacity: 0.35 + 0.65 * enter(i),
            }}
          >
            <div style={{ fontSize: 28, fontWeight: 800, color: CYAN.hex }}>{t}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 96, top: 560, fontSize: 26, color: GOLD.hex, opacity: lift }}>
        ↓ 三份文件汇成「项目建设的依据文件」
      </div>
    </SceneShell>
  );
};

/* ───────────── S46 · 收尾与交棒 ───────────── */

export const ClosingSpan: React.FC = () => (
  <SceneShell
    eyebrow="本章收口"
    title="第 7 章 · 项目立项管理，完"
    subtitle="下一章：项目章程签发、正式任命项目经理，进入「如何建设与管理」"
  >
    <div style={{ position: "absolute", left: 96, top: 400, display: "flex", gap: 40 }}>
      {[
        { t: "本章完", d: "四关 · 五顶帽子 · 三份文件", tone: CYAN },
        { t: "下一章", d: "第 8 章 项目整合管理", tone: GOLD },
      ].map((p) => (
        <div
          key={p.t}
          style={{
            width: 840,
            padding: "30px 36px",
            borderRadius: 16,
            border: `1.5px solid ${rgba(p.tone.rgb, 0.55)}`,
            background: "rgba(8,19,41,0.82)",
          }}
        >
          <div style={{ fontSize: 34, fontWeight: 800, color: p.tone.hex }}>{p.t}</div>
          <div style={{ marginTop: 14, fontSize: 26, color: BASE_COLORS.text }}>{p.d}</div>
        </div>
      ))}
    </div>
  </SceneShell>
);
