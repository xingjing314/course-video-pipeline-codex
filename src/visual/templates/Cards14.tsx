/**
 * A1–A4 · L01 四张静态卡（考情 / 全周期时间轴 / 四笔账 / 三件事）
 *
 * 四张都没有状态机，只有一层入场与"跟着口播逐步亮"的错峰，所以放在一个文件里，
 * 共用同一套头部语言（kicker + 主标题 + 一句话注解）。
 *
 * 每个组件吃自己的 payload（契约见 contracts/visual-props.schema.ts 的
 * exam-stats / chapter-timeline / four-accounts / three-steps），
 * 由 SceneRouter 调度；本文件同时导出 L01 的默认 payload 供 Lab 与冒烟测试复用。
 *
 * 背景不在这里画：正式片由 MasterCanvas 统一挂 TechNetwork。
 */
import React from "react";
import { AbsoluteFill, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BASE_COLORS, resolveTone, rgba } from "../tokens/colorCard";
import { SceneShell } from "./shared";
import { CardGrid } from "../kit/CardGrid";
import type {
  ChapterTimelinePayload,
  ExamStatsPayload,
  FourAccountsPayload,
  ThreeStepsPayload,
} from "../../../contracts/visual-props.schema";

const CYAN = resolveTone("cyan");
const GOLD = resolveTone("gold");
const NEUTRAL = resolveTone("neutral");

const ease = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

/* ───────────────────────────── 公共头部 ───────────────────────────── */

const useEnter = (delay = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping: 20, mass: 0.8, stiffness: 115 } });
};

/* ───────────────────────────── A1 考情速览卡 ───────────────────────────── */

export const A1ExamStats: React.FC<{ payload: ExamStatsPayload }> = ({ payload }) => {
  const enter = useEnter(2);
  return (
    <SceneShell eyebrow={payload.kicker ?? "考情速览"} title={payload.title} subtitle={payload.subtitle}>

      <div
        style={{
          position: "absolute",
          left: 96,
          right: 96,
          top: 320,
          height: 300,
          borderRadius: 20,
          background: "rgba(8, 19, 41, 0.82)",
          border: `1.5px solid ${rgba(CYAN.rgb, 0.28)}`,
          display: "flex",
          alignItems: "center",
          transform: `translateY(${(1 - enter) * 16}px)`,
          opacity: enter,
        }}
      >
        {payload.stats.map((d, i) => (
          <React.Fragment key={d.label}>
            {i > 0 ? <div style={{ width: 1, height: 150, background: rgba(NEUTRAL.rgb, 0.18) }} /> : null}
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 6 }}>
                <div
                  style={{
                    fontSize: 92,
                    fontWeight: 800,
                    color: d.emphasis ? GOLD.hex : BASE_COLORS.text,
                    lineHeight: 1,
                  }}
                >
                  {d.value}
                </div>
                {d.unit ? <div style={{ fontSize: 30, color: BASE_COLORS.text2 }}>{d.unit}</div> : null}
              </div>
              <div style={{ marginTop: 14, fontSize: 21, color: BASE_COLORS.text2 }}>{d.label}</div>
            </div>
          </React.Fragment>
        ))}
      </div>

      {payload.tags && payload.tags.length > 0 ? (
        <div style={{ position: "absolute", left: 96, top: 660, display: "flex", gap: 18 }}>
          {payload.tags.map((t) => {
            const tone = resolveTone(t.tone ?? "cyan");
            return (
              <div
                key={t.text}
                style={{
                  padding: "12px 24px",
                  borderRadius: 999,
                  border: `1.5px solid ${rgba(tone.rgb, t.solid ? 1 : 0.5)}`,
                  background: t.solid ? rgba(tone.rgb, 0.14) : "transparent",
                  color: t.solid ? tone.hex : BASE_COLORS.text,
                  fontSize: 24,
                  fontWeight: t.solid ? 800 : 600,
                  letterSpacing: t.solid ? 1 : 0,
                }}
              >
                {t.text}
              </div>
            );
          })}
        </div>
      ) : null}

      {payload.footnote ? (
        <div style={{ position: "absolute", left: 96, top: 852, fontSize: 18, color: BASE_COLORS.text2 }}>
          {payload.footnote}
        </div>
      ) : null}
    </SceneShell>
  );
};

/* ─────────────────────────── A2 全生命周期时间轴 ─────────────────────────── */

export const A2Timeline: React.FC<{ payload: ChapterTimelinePayload }> = ({ payload }) => {
  const frame = useCurrentFrame();
  const enter = useEnter(2);
  const grow = ease(frame / 30);
  const { before, after } = payload;

  return (
    <SceneShell eyebrow="全书坐标" title={payload.title} subtitle={payload.subtitle}>

      <div
        style={{
          position: "absolute",
          left: 200,
          top: 372,
          width: 460,
          padding: "22px 24px",
          borderRadius: 14,
          border: `2px solid ${GOLD.hex}`,
          background: "#13243A",
          boxShadow: `0 0 40px ${rgba(GOLD.rgb, 0.25)}`,
          opacity: enter,
        }}
      >
        <div style={{ fontSize: 19, color: GOLD.hex, letterSpacing: 2, marginBottom: 6 }}>{before.kicker}</div>
        <div style={{ fontSize: 30, fontWeight: 800, color: BASE_COLORS.text }}>{before.title}</div>
        <div style={{ fontSize: 20, color: BASE_COLORS.text2, marginTop: 6 }}>{before.note}</div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 680,
          top: 392,
          width: 1040,
          padding: "22px 24px",
          borderRadius: 14,
          border: `1.5px solid ${rgba(NEUTRAL.rgb, 0.35)}`,
          background: "#0E1B30",
          opacity: enter,
        }}
      >
        <div style={{ fontSize: 19, color: BASE_COLORS.text2, letterSpacing: 2, marginBottom: 6 }}>{after.kicker}</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: rgba(NEUTRAL.rgb, 0.95) }}>{after.title}</div>
        <div style={{ fontSize: 20, color: BASE_COLORS.text2, marginTop: 6 }}>{after.note}</div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 662,
          top: 352,
          height: 214,
          width: 0,
          borderLeft: `2px dashed ${rgba(CYAN.rgb, 0.55)}`,
          opacity: enter,
        }}
      />

      {/* 时间轴：置于两块之下，避免穿过卡片文字 */}
      <div
        style={{
          position: "absolute",
          left: 200,
          top: 596,
          width: 1500 * grow,
          height: 3,
          background: rgba(NEUTRAL.rgb, 0.4),
          borderRadius: 2,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 200 + 1486 * grow,
          top: 589,
          width: 0,
          height: 0,
          borderTop: "8px solid transparent",
          borderBottom: "8px solid transparent",
          borderLeft: `16px solid ${rgba(NEUTRAL.rgb, 0.55)}`,
          opacity: grow,
        }}
      />
      {payload.axisLabel ? (
        <div
          style={{
            position: "absolute",
            left: 1710,
            top: 556,
            fontSize: 18,
            color: BASE_COLORS.text2,
            letterSpacing: 2,
            opacity: grow,
          }}
        >
          {payload.axisLabel}
        </div>
      ) : null}
      <div style={{ position: "absolute", left: 428, top: 528, width: 2, height: 68, background: rgba(GOLD.rgb, 0.5) }} />
      <div
        style={{ position: "absolute", left: 1198, top: 528, width: 2, height: 68, background: rgba(NEUTRAL.rgb, 0.35) }}
      />

      {payload.questions && payload.questions.length > 0 ? (
        <div style={{ position: "absolute", left: 200, top: 672, display: "flex", flexDirection: "column", gap: 14 }}>
          {payload.questions.map((q) => (
            <div key={q} style={{ fontSize: 30, fontWeight: 700, color: BASE_COLORS.text }}>
              {q}
            </div>
          ))}
          {payload.conclusion ? (
            <div
              style={{
                marginTop: 8,
                padding: "10px 18px",
                borderRadius: 10,
                border: `1.5px solid ${rgba(CYAN.rgb, 0.5)}`,
                background: rgba(CYAN.rgb, 0.1),
                fontSize: 22,
                color: BASE_COLORS.text,
                width: "fit-content",
              }}
            >
              → {payload.conclusion}
            </div>
          ) : null}
        </div>
      ) : null}
    </SceneShell>
  );
};

/* ───────────────────────────── A3 四笔账 ───────────────────────────── */

export const A3FourAccounts: React.FC<{ payload: FourAccountsPayload }> = ({ payload }) => {
  const enter = useEnter(2);
  const stamp = useEnter(26);

  return (
    <SceneShell eyebrow="四笔账" title={payload.title} subtitle={payload.subtitle}>

      <CardGrid
        items={payload.items.map((it) => ({ name: it.name, line: it.line, tone: it.tone }))}
        left={350}
        top={292}
        columns={2}
        cardWidth={540}
        cardHeight={210}
        gap={140}
        enter={enter}
      />

      {payload.stamp ? (
        <div
          style={{
            position: "absolute",
            left: 895,
            top: 520,
            width: 130,
            height: 130,
            borderRadius: "50%",
            border: `3px solid ${GOLD.hex}`,
            background: "rgba(11,26,51,0.96)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 30,
            fontWeight: 800,
            letterSpacing: 3,
            color: GOLD.hex,
            transform: `scale(${1.3 - 0.3 * stamp}) rotate(-6deg)`,
            opacity: stamp,
            boxShadow: `0 0 36px ${rgba(GOLD.rgb, 0.3)}`,
          }}
        >
          {payload.stamp}
        </div>
      ) : null}
    </SceneShell>
  );
};

/* ───────────────────────────── A4 三件事 ───────────────────────────── */

export const A4ThreeSteps: React.FC<{ payload: ThreeStepsPayload }> = ({ payload }) => {
  const enter = useEnter(2);
  return (
    <SceneShell eyebrow="全章骨架" title={payload.title} subtitle={payload.subtitle}>

      <div style={{ position: "absolute", left: 180, top: 372, display: "flex", alignItems: "center" }}>
        {payload.steps.map((s, i) => {
          const tone = resolveTone(s.tone ?? "cyan");
          return (
            <React.Fragment key={s.code}>
              <div
                style={{
                  width: 460,
                  height: 300,
                  borderRadius: 18,
                  background: "rgba(8, 19, 41, 0.84)",
                  border: `1.5px solid ${rgba(tone.rgb, 0.6)}`,
                  boxShadow: `0 0 30px ${rgba(tone.rgb, 0.18)}`,
                  padding: "28px 30px",
                  boxSizing: "border-box",
                  opacity: enter,
                  transform: `translateY(${(1 - enter) * 18}px)`,
                }}
              >
                <div
                  style={{
                    display: "inline-block",
                    padding: "4px 12px",
                    borderRadius: 6,
                    border: `1px solid ${rgba(tone.rgb, 0.7)}`,
                    color: tone.hex,
                    fontSize: 19,
                    fontWeight: 700,
                    letterSpacing: 1,
                  }}
                >
                  {s.code}
                </div>
                <div style={{ marginTop: 18, fontSize: 40, fontWeight: 800, color: BASE_COLORS.text }}>{s.verb}</div>
                <div style={{ marginTop: 10, fontSize: 23, color: BASE_COLORS.text2, lineHeight: 1.4 }}>{s.full}</div>
                <div
                  style={{
                    marginTop: 22,
                    paddingTop: 16,
                    borderTop: `1px solid ${rgba(NEUTRAL.rgb, 0.2)}`,
                    fontSize: 21,
                    color: tone.hex,
                    fontWeight: 700,
                  }}
                >
                  {s.output}
                </div>
              </div>

              {i < payload.steps.length - 1 ? (
                <div style={{ width: 90, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ position: "relative", width: 64, height: 2, background: rgba(CYAN.rgb, 0.55) }}>
                    <div
                      style={{
                        position: "absolute",
                        right: -2,
                        top: -6,
                        width: 0,
                        height: 0,
                        borderTop: "7px solid transparent",
                        borderBottom: "7px solid transparent",
                        borderLeft: `13px solid ${rgba(CYAN.rgb, 0.75)}`,
                      }}
                    />
                  </div>
                </div>
              ) : null}
            </React.Fragment>
          );
        })}
      </div>

      {payload.footnote ? (
        <div style={{ position: "absolute", left: 180, top: 760, fontSize: 22, color: BASE_COLORS.text2 }}>
          {payload.footnote}
        </div>
      ) : null}
    </SceneShell>
  );
};

/* ───────────────────────── L01 默认 payload（Lab 与冒烟测试共用） ───────────────────────── */

export const L01_EXAM_STATS: ExamStatsPayload = {
  kicker: "考情速览",
  title: "第 7 章 项目立项管理",
  subtitle: "2023—2026 · 11 套卷",
  stats: [
    { value: "22", unit: "题", label: "10 套卷命中（共 11 套）" },
    { value: "≈2", unit: "分", label: "本章平均分值" },
    { value: "≈2.68", unit: "%", label: "全卷占比", emphasis: true },
    { value: "2 / 1", unit: "题", label: "2026 两个批次" },
  ],
  tags: [
    { text: "纯记忆送分题", tone: "gold", solid: true },
    { text: "图谱速记 · 不念书", tone: "cyan" },
  ],
  footnote: "样本：2023.5—2026.5 共 11 套卷 ｜ 本章命中 10 套（2025 年 5 月第 2 批次未命中）",
};

export const L01_TIMELINE: ChapterTimelinePayload = {
  title: "项目是怎么来的：建之前，还是建之后",
  before: { kicker: "建项目之前", title: "第 7 章 项目立项管理", note: "论证价值 + 走完审批" },
  after: {
    kicker: "建项目之后",
    title: "第 6、8—19 章：十大知识领域 · 绩效域 · 配置变更",
    note: "项目经理进场以后，怎么把项目建好、管好",
  },
  questions: ["项目建设是否有价值？", "为什么要掏几百万、几千万？"],
  conclusion: "立项所必需的 论证文档 与 审批过程",
  axisLabel: "时间",
};

export const L01_FOUR_ACCOUNTS: FourAccountsPayload = {
  title: "立项之前，先把这四笔账算清楚",
  subtitle: "教材 7.0 导言",
  items: [
    { name: "技术", line: "适不适用 · 先不先进", tone: "cyan" },
    { name: "经济", line: "合不合理 · 有没有效益", tone: "gold" },
    { name: "实施", line: "有没有可能 · 风险大不大", tone: "blue" },
    { name: "社会价值", line: "有没有效果 · 能不能持续", tone: "green" },
  ],
  stamp: "算账",
};

export const L01_THREE_STEPS: ThreeStepsPayload = {
  title: "立项管理就三件事",
  subtitle: "后面每一页都挂在这条线上",
  steps: [
    { code: "7.1", verb: "提申请", full: "项目建议与立项申请", output: "《项目建议书》", tone: "cyan" },
    { code: "7.2", verb: "做论证", full: "项目可行性研究", output: "《可行性研究报告》", tone: "blue" },
    { code: "7.3", verb: "拍板定案", full: "项目评估与决策", output: "《项目评估报告》", tone: "gold" },
  ],
  footnote: "提申请 → 做论证 → 拍板定案：顺序不能反，每一步都有对应的一份文件",
};
