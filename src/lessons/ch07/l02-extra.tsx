/**
 * L02 的小段（S01/S02/S03/S04/S08/S09–S10/S11/S30/S34/S42）。
 *
 * 都是标题卡与结构卡，不依赖配音时长；先用 kit + 现有模板拼出来，
 * 配音后再统一核对镜长。
 */
import React from "react";
import { useCurrentFrame } from "remotion";
import { SceneShell } from "../../visual/templates/shared";
import { GateTrack } from "../../visual/templates/GateTrack";
import { CardGrid, type CardItem } from "../../visual/kit/CardGrid";
import { Flow } from "../../visual/kit/Flow";
import { BASE_COLORS, resolveTone, rgba } from "../../visual/tokens/colorCard";

const GOLD = resolveTone("gold");
const CYAN = resolveTone("cyan");
const GREEN = resolveTone("green");
const PURPLE = resolveTone("purple");

/* ───────────── S01 · 交棒：四关轨道第二关 ───────────── */

export const OpeningSpan: React.FC = () => {
  const frame = useCurrentFrame();
  const stamp = Math.min(1, Math.max(0, (frame - 12) / 16));
  return (
    <>
      <GateTrack
        stage={1}
        eyebrow="7.2 项目可行性研究"
        title="第二关：这个项目到底能不能干"
        subtitle="上一节的《项目建议书》已获批，现在进入深入论证"
      />
      {/* 第一关已过：在①门旁补一枚绿章（不改公共模板，只在本章层叠加） */}
      {/* 当前关标记：②门上方一枚「当前」胶囊 + 指向箭头 */}
      <div
        style={{
          position: "absolute",
          left: 616,
          top: 238,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          opacity: stamp,
        }}
      >
        <div
          style={{
            padding: "6px 18px",
            borderRadius: 999,
            border: `1.5px solid ${rgba(CYAN.rgb, 0.9)}`,
            background: rgba(CYAN.rgb, 0.16),
            color: CYAN.hex,
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: 2,
            boxShadow: `0 0 26px ${rgba(CYAN.rgb, 0.45)}`,
          }}
        >
          当前
        </div>
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: "9px solid transparent",
            borderRight: "9px solid transparent",
            borderTop: `12px solid ${rgba(CYAN.rgb, 0.9)}`,
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: 110,
          top: 196,
          width: 150,
          height: 150,
          borderRadius: "50%",
          border: `4px solid ${GREEN.hex}`,
          background: "rgba(11,26,51,0.94)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          fontSize: 26,
          fontWeight: 800,
          letterSpacing: 2,
          color: GREEN.hex,
          opacity: stamp,
          transform: `scale(${1.25 - 0.25 * stamp}) rotate(-7deg)`,
          boxShadow: `0 0 36px ${rgba(GREEN.rgb, 0.35)}`,
        }}
      >
        已批复
      </div>
    </>
  );
};

/* ───────────── S02 · 可研定义三步链 ───────────── */

export const DefinitionSpan: React.FC = () => (
  <SceneShell
    eyebrow="7.2 导言"
    title="什么叫可行性研究"
    subtitle="调查条件 → 论证方案 → 判定可行与否"
  >
    <Flow
      left={96}
      top={380}
      nodeWidth={520}
      nodeHeight={150}
      gap={60}
      steps={[
        { code: "①", label: "建议书获批之后", sub: "立项申请已通过", tone: "neutral" },
        { code: "②", label: "调查技术、经济、社会、人员条件", sub: "对可能的技术方案做论证", tone: "cyan" },
        { code: "③", label: "确定整个项目可不可行", sub: "结论落在“能不能干”", tone: "gold" },
      ]}
    />
  </SceneShell>
);

/* ───────────── S03 · 四个特点 ───────────── */

const FEATURES: CardItem[] = [
  { name: "预见性", line: "看未来", tone: "cyan" },
  { name: "公正性", line: "不偏不倚", tone: "green" },
  { name: "可靠性", line: "数据可信", tone: "gold" },
  { name: "科学性", line: "方法有据", tone: "purple" },
];

export const FeaturesSpan: React.FC = () => (
  <SceneShell
    eyebrow="7.2 导言"
    title="可行性研究的四个特点"
    subtitle="先混个脸熟——下一节讲详细可研的三原则还会呼应"
  >
    <CardGrid items={FEATURES} left={96} top={380} columns={4} cardWidth={400} cardHeight={150} gap={32} stagger />
  </SceneShell>
);

/* ───────────── S04 · 8 道题 ───────────── */

export const EightQuestionsSpan: React.FC = () => {
  const frame = useCurrentFrame();
  const roll = Math.min(1, frame / 15);
  const n = Math.round(roll * 8);
  return (
    <SceneShell eyebrow="7.2.1 五大可行性维度" title="这一小节，全章第一高频区" subtitle="11 套卷里，光 7.2.1 就考了 8 道题">
      <div style={{ position: "absolute", left: 96, top: 340, display: "flex", alignItems: "baseline", gap: 40 }}>
        <div style={{ fontSize: 220, lineHeight: 1, fontWeight: 800, color: GOLD.hex }}>{n}</div>
        <div style={{ fontSize: 46, color: BASE_COLORS.text }}>道题</div>
      </div>
      <div style={{ position: "absolute", left: 100, top: 640, fontSize: 26, color: BASE_COLORS.text2 }}>
        8 道题分布在五大维度上——这也是本课要逐个拆开的原因
      </div>
    </SceneShell>
  );
};

/* ───────────── S08 · 先进 vs 适用可控 ───────────── */

const ADVANCE: CardItem[] = [
  { name: "先进", line: "能力上限有多高", tone: "neutral" },
  { name: "适用 · 可控", line: "能不能用、敢不敢用", tone: "cyan", tag: "本课重点" },
];

export const AdvanceVsFitSpan: React.FC = () => (
  <SceneShell
    eyebrow="技术可行性 · 判断标准"
    title="技术不仅要看先进，更要看适用与可控"
    subtitle="光“能做出来”不够，还得“用得住、风险扛得住”"
  >
    <CardGrid items={ADVANCE} left={96} top={360} columns={2} cardWidth={840} cardHeight={200} gap={40} stagger />
  </SceneShell>
);

/* ───────────── S09–S10 · 两个前沿案例 ───────────── */

export const CasesSpan: React.FC = () => {
  const frame = useCurrentFrame();
  const second = Math.min(1, Math.max(0, (frame - 45) / 14));
  return (
    <SceneShell
      eyebrow="技术可行性 · 现实提醒"
      title="AI 时代，技术风险已经不只是“能不能做出来”"
      subtitle="两个真实案例，说明为什么“可控”比“先进”更要紧"
    >
      <div style={{ position: "absolute", left: 96, top: 320, width: 1728, display: "flex", flexDirection: "column", gap: 24 }}>
        <div
          style={{
            borderRadius: 14,
            border: `1.5px solid ${rgba(CYAN.rgb, 0.5)}`,
            background: "rgba(8,19,41,0.82)",
            padding: "24px 30px",
          }}
        >
          <div style={{ fontSize: 22, color: CYAN.hex, fontWeight: 700, letterSpacing: 1 }}>案例一 · AI 越权访问</div>
          <div style={{ marginTop: 10, fontSize: 26, color: BASE_COLORS.text }}>
            OpenAI 披露：一个内部测试模型在查找资料时，未经授权访问了澳大利亚政府的统计服务
          </div>
        </div>
        <div
          style={{
            borderRadius: 14,
            border: `1.5px solid ${rgba(GOLD.rgb, 0.5)}`,
            background: "rgba(8,19,41,0.82)",
            padding: "24px 30px",
            opacity: second,
            transform: `translateY(${(1 - second) * 14}px)`,
          }}
        >
          <div style={{ fontSize: 22, color: GOLD.hex, fontWeight: 700, letterSpacing: 1 }}>案例二 · 断网也能通信</div>
          <div style={{ marginTop: 10, fontSize: 26, color: BASE_COLORS.text }}>
            研究员 Noam Brown 引用实验：两台已被攻陷、距离很近的计算机，即使没有网络连接，也可能靠发热与温度传感器传递信息
          </div>
        </div>
      </div>
    </SceneShell>
  );
};

/* ───────────── S11 · 收束到第一顶帽子 ───────────── */

export const FocusTechSpan: React.FC = () => {
  const frame = useCurrentFrame();
  const focus = Math.min(1, frame / 18);
  return (
    <SceneShell
      eyebrow="第一顶 · 技术可行性"
      title="先把这顶帽子戴上"
      subtitle="其余四顶暂时压暗——接下来只讲技术可行性"
    >
      <div style={{ position: "absolute", left: 96, top: 380, display: "flex", gap: 40 }}>
        {[
          { name: "技术可行性", tone: CYAN, on: true },
          { name: "经济可行性", tone: GOLD, on: false },
          { name: "社会效益", tone: GREEN, on: false },
          { name: "运行环境", tone: PURPLE, on: false },
          { name: "其他可行性", tone: resolveTone("neutral"), on: false },
        ].map((c) => (
          <div
            key={c.name}
            style={{
              width: 300,
              height: 260,
              borderRadius: 16,
              border: `1.5px solid ${rgba(c.tone.rgb, c.on ? 0.95 : 0.3)}`,
              background: c.on ? rgba(c.tone.rgb, 0.16) : "rgba(8,19,41,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: 20,
              boxSizing: "border-box",
              fontSize: c.on ? 30 : 24,
              fontWeight: c.on ? 800 : 500,
              color: c.on ? c.tone.hex : BASE_COLORS.text2,
              opacity: c.on ? 1 : 0.28 + (1 - focus) * 0.4,
              transform: `scale(${c.on ? 1 + 0.04 * focus : 1})`,
            }}
          >
            {c.name}
          </div>
        ))}
      </div>
    </SceneShell>
  );
};

/* ───────────── S30 · 第三顶帽子标题 ───────────── */

export const SocialTitleSpan: React.FC = () => (
  <SceneShell
    eyebrow="第三顶 · 社会效益可行性"
    title="第三顶帽子：社会效益"
    subtitle="面向公共服务领域的项目，社会效益往往是关注重点"
  >
    <div style={{ position: "absolute", left: 96, top: 400, fontSize: 30, color: BASE_COLORS.text2 }}>
      第四版教材把它分成「对组织内部」与「对社会发展」两大块，每块各 5 项
    </div>
  </SceneShell>
);

/* ───────────── S34 · 防坑表骨架 ───────────── */

export const PitfallSkeletonSpan: React.FC = () => {
  const frame = useCurrentFrame();
  const rowW = 1440;
  const ASKS = [
    "人力资源的有效性（能否招到或培训出技术人员）",
    "人员提升收益（做项目锻炼了队伍、培养了骨干）",
    "技术能力的可能性（现有技术与工具支不支持开发）",
    "技术创新效益（攻克难点，积累技术能力与创新）",
  ];

  return (
    <SceneShell eyebrow="终极防坑表" title="把两组词彻底锁死" subtitle="先把四句“问法”摆出来，归属一列留空——下一镜再填">
      <div style={{ position: "absolute", left: 240, top: 340, width: rowW }}>
        <div style={{ display: "flex", height: 70, alignItems: "center", fontSize: 24, fontWeight: 700 }}>
          <div style={{ width: rowW * 0.6, color: BASE_COLORS.text2, paddingLeft: 24, boxSizing: "border-box" }}>题干问法</div>
          <div style={{ width: rowW * 0.4, color: BASE_COLORS.text2, paddingLeft: 24, boxSizing: "border-box" }}>归属维度</div>
        </div>
        {ASKS.map((ask, i) => {
          const at = 40 + i * 170;
          const enter = Math.min(1, Math.max(0, (frame - at) / 14));
          return (
            <div
              key={ask}
              style={{
                display: "flex",
                height: 110,
                marginBottom: 12,
                alignItems: "center",
                borderRadius: 12,
                border: `1.5px solid ${rgba(CYAN.rgb, 0.32)}`,
                background: "rgba(8,19,41,0.55)",
                opacity: enter,
                transform: `translateY(${(1 - enter) * 8}px)`,
              }}
            >
              <div style={{ width: rowW * 0.6, paddingLeft: 24, paddingRight: 24, boxSizing: "border-box", fontSize: 24, color: BASE_COLORS.text }}>
                {ask}
              </div>
              <div style={{ width: rowW * 0.4, paddingLeft: 24, boxSizing: "border-box", fontSize: 24, color: "rgba(143,184,217,0.45)" }}>
                ？
              </div>
            </div>
          );
        })}
      </div>
    </SceneShell>
  );
};

/* ───────────── S42 · 收尾与交棒 ───────────── */

export const ClosingSpan: React.FC = () => (
  <SceneShell
    eyebrow="本节收口"
    title="五顶帽子，五笔账，全部摸透"
    subtitle="下一节：为什么要分初步可研和详细可研？为什么还要请第三方做评估？"
  >
    <div style={{ position: "absolute", left: 96, top: 380, display: "flex", gap: 40 }}>
      {[
        { t: "本节收口", d: "可研定义 · 五顶帽子 · 四笔账 · 防坑表", tone: CYAN },
        { t: "下一节", d: "7.2.2 初步可研　·　7.3 项目评估", tone: GOLD },
      ].map((p) => (
        <div
          key={p.t}
          style={{
            width: 840,
            height: 260,
            borderRadius: 16,
            border: `1.5px solid ${rgba(p.tone.rgb, 0.55)}`,
            background: "rgba(8,19,41,0.82)",
            padding: "30px 36px",
            boxSizing: "border-box",
          }}
        >
          <div style={{ fontSize: 34, fontWeight: 800, color: p.tone.hex }}>{p.t}</div>
          <div style={{ marginTop: 16, fontSize: 26, color: BASE_COLORS.text, lineHeight: 1.45 }}>{p.d}</div>
        </div>
      ))}
    </div>
  </SceneShell>
);

/* ───────────── S12 · 技术可研的定义 ───────────── */

export const TechDefSpan: React.FC = () => (
  <SceneShell
    eyebrow="第一顶 · 技术可行性"
    title="技术可行性到底在问什么"
    subtitle="一句话：现有的技术、产品、人力，能不能在期限内把系统做出来"
  >
    <div
      style={{
        position: "absolute",
        left: 96,
        top: 340,
        width: 1728,
        borderRadius: 16,
        border: `1.5px solid ${rgba(CYAN.rgb, 0.5)}`,
        background: "rgba(8,19,41,0.82)",
        padding: "30px 36px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ fontSize: 30, color: BASE_COLORS.text, lineHeight: 1.5 }}>
        在当前的技术、产品条件限制下，能否用现在拥有（或可能拥有）的技术能力、产品功能和人力资源，
        在规定的期限内实现项目的目标、功能和性能？
      </div>
    </div>
    <div
      style={{
        position: "absolute",
        left: 96,
        top: 640,
        width: 1728,
        height: 84,
        borderRadius: 12,
        border: `1.5px solid ${rgba(resolveTone("red").rgb, 0.5)}`,
        background: "rgba(224,96,90,0.10)",
        display: "flex",
        alignItems: "center",
        padding: "0 30px",
        boxSizing: "border-box",
        fontSize: 26,
        color: resolveTone("red").hex,
        fontWeight: 700,
      }}
    >
      技术可行性往往决定项目方向——一旦评估错误，会造成项目根本上的失败
    </div>
  </SceneShell>
);

/* ───────────── S23 · 收益三小类 ───────────── */

const INCOMES: CardItem[] = [
  { name: "直接收益", line: "销售项目产品的收入", tone: "gold" },
  { name: "间接收益", line: "通过项目实施降低了成本", tone: "cyan" },
  { name: "其他收益", line: "获得知识产权、软件著作权", tone: "green" },
];

export const IncomeSpan: React.FC = () => (
  <SceneShell
    eyebrow="第二笔账 · 收益分析"
    title="收益分三小类"
    subtitle="考试只考“哪一类”，不考怎么算"
  >
    <CardGrid items={INCOMES} left={96} top={370} columns={3} cardWidth={520} cardHeight={190} gap={40} stagger />
  </SceneShell>
);

/* ───────────── S24 · 收益投资比与回收期 ───────────── */

export const RatioSpan: React.FC = () => (
  <SceneShell
    eyebrow="第三笔账 · 收益投资比与回收期"
    title="把投入和产出放在一起比"
    subtitle="算两个数：每投一块钱能挣多少（比值）、多久回本（回收期）"
  >
    <Flow
      left={200}
      top={400}
      nodeWidth={560}
      nodeHeight={150}
      gap={140}
      steps={[
        { code: "投入", label: "一次性 + 非一次性支出", sub: "整个项目周期的总投入", tone: "neutral" },
        { code: "产出", label: "直接 + 间接 + 其他收益", sub: "整个项目周期的总收益", tone: "cyan" },
      ]}
    />
    <div style={{ position: "absolute", left: 200, top: 640, fontSize: 24, color: BASE_COLORS.text2 }}>
      比值＝产出 ÷ 投入　｜　回收期＝多久能把投入收回来
    </div>
  </SceneShell>
);

/* ───────────── S25 · 敏感性分析 ───────────── */

export const SensitivitySpan: React.FC = () => {
  const frame = useCurrentFrame();
  const wobble = Math.sin(frame / 6) * 10;
  return (
    <SceneShell
      eyebrow="第四笔账 · 敏感性分析"
      title="关键因素一变，支出和收益会怎么变"
      subtitle="不是算一个确定值，而是看“变了会怎样”"
    >
      <div style={{ position: "absolute", left: 96, top: 340, display: "flex", gap: 28 }}>
        {["设备与软件配置", "处理速度要求", "工作负荷类型与负荷量"].map((t) => (
          <div
            key={t}
            style={{
              padding: "14px 22px",
              borderRadius: 10,
              border: `1.5px solid ${rgba(GOLD.rgb, 0.55)}`,
              background: rgba(GOLD.rgb, 0.10),
              fontSize: 24,
              color: BASE_COLORS.text,
            }}
          >
            {t}
          </div>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          left: 96,
          top: 520,
          width: 1200,
          height: 180,
          borderRadius: 14,
          border: `1px solid ${rgba(CYAN.rgb, 0.35)}`,
          background: "rgba(8,19,41,0.6)",
          overflow: "hidden",
        }}
      >
        <svg width="1200" height="180">
          <polyline
            points={Array.from({ length: 60 }, (_, i) => `${i * 20},${90 - Math.sin(i / 5 + frame / 10) * (30 + wobble)}`).join(" ")}
            fill="none"
            stroke={CYAN.hex}
            strokeWidth={3}
          />
        </svg>
      </div>
      <div style={{ position: "absolute", left: 96, top: 730, fontSize: 22, color: BASE_COLORS.text2 }}>
        这三个因素变化时，支出与收益的波动幅度有多大
      </div>
    </SceneShell>
  );
};
