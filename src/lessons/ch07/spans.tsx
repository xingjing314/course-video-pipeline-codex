/**
 * 第 7 章 L01 的 17 个渲染段组件。
 *
 * 分段不是"一镜一段"，而是"一个资产一段"：A5 四关跨 S08–S13、
 * A7 真题卡跨 S14–S17，因为它们的 cue 本来就落在镜头交界上。
 *
 * 这些组件从 `prototypes/L01Film.tsx` 原样搬来，**渲染逻辑一行未改**，
 * 目的是让「数据驱动的 compiled-lesson」和「手搭的 L01Film」用同一份实现，
 * 从而能逐帧比对。
 */
import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BASE_COLORS, resolveTone, rgba } from "../../visual/tokens/colorCard";
import { SceneShell } from "../../visual/templates/shared";
import { GateTrack } from "../../visual/templates/GateTrack";
import { IdCard } from "../../visual/templates/IdCard";
import { MnemonicCard } from "../../visual/templates/Mnemonic";
import { ExamQuizCard } from "../../visual/templates/ExamQuizCard";
import {
  A1ExamStats,
  A2Timeline,
  A3FourAccounts,
  A4ThreeSteps,
  L01_EXAM_STATS,
  L01_FOUR_ACCOUNTS,
  L01_THREE_STEPS,
  L01_TIMELINE,
} from "../../visual/templates/Cards14";
import { Q1, Q2, Q3 } from "../../visual/prototypes/ExamQuizLab";
import { SHOTS, A5_BEAT_FRAMES, A9_CUTS, QUIZ_CUES, type Shot } from "../../visual/prototypes/l01-generated";
import { L01_SPAN_IDS, L01_SPAN_TABLE } from "./span-timeline";
import type { ResolvedCuePoint } from "../../../contracts/visual-props.schema";

const CYAN = resolveTone("cyan");
const GOLD = resolveTone("gold");
const RED = resolveTone("red");
const NEUTRAL = resolveTone("neutral");

const SHOT_BY_ID = new Map(SHOTS.map((s2) => [s2.id, s2]));
const startOf = (id: string) => SHOT_BY_ID.get(id)!.from;
const cutsFrom = (ids: string[]) => ids.map((id) => startOf(id) - startOf(ids[0]));

const cue = (
  id: string,
  action: ResolvedCuePoint["action"],
  localFrame: number,
  targetId?: string,
): ResolvedCuePoint => ({
  id,
  action,
  targetId,
  matchPhrase: id,
  fallbackRatio: 0,
  triggerMs: Math.round((localFrame / 30) * 1000),
  localFrame,
  matchedBy: "token-exact",
});

const Q1_CUES: ResolvedCuePoint[] = [
  cue("q1-think", "thinking-pause", QUIZ_CUES.q1.think),
  cue("q1-elim", "eliminate-option", QUIZ_CUES.q1.elim, "②"),
  cue("q1-reveal", "reveal-answer", QUIZ_CUES.q1.reveal, "C"),
  cue("q1-tip", "show-tip", QUIZ_CUES.q1.tip),
];

const Q2_CUES: ResolvedCuePoint[] = [
  cue("q2-think", "thinking-pause", QUIZ_CUES.q2.think),
  cue("q2-elim-a", "eliminate-option", QUIZ_CUES.q2.elimA, "A"),
  cue("q2-reveal-b", "reveal-answer", QUIZ_CUES.q2.revealB, "B"),
  cue("q2-elim-c", "eliminate-option", QUIZ_CUES.q2.elimC, "C"),
  cue("q2-elim-d", "eliminate-option", QUIZ_CUES.q2.elimD, "D"),
];

const Q3_CUES: ResolvedCuePoint[] = [cue("q3-reveal", "reveal-answer", QUIZ_CUES.q3.reveal, "C")];

/** 段内多状态：cuts 是状态切换点（相对段起点），stages 是对应状态号。 */
const useStage = (cuts: readonly number[], stages: readonly number[]) => {
  const frame = useCurrentFrame();
  let i = 0;
  while (i + 1 < cuts.length && frame >= cuts[i + 1]) i++;
  return { stage: stages[i], local: frame - cuts[i] };
};

/* ───────────────────── S01 标题帧 ───────────────────── */

const TitleFrame: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 20, mass: 0.9, stiffness: 90 } });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ textAlign: "center", opacity: enter, transform: `translateY(${(1 - enter) * 22}px)` }}>
        <div style={{ fontSize: 24, letterSpacing: 6, color: BASE_COLORS.text2, marginBottom: 22 }}>
          项目管理核心模块 · 第一站
        </div>
        <div style={{ fontSize: 96, fontWeight: 800, color: BASE_COLORS.text, letterSpacing: 2 }}>第 7 章 项目立项管理</div>
        <div style={{ width: 120, height: 3, background: GOLD.hex, margin: "34px auto 26px" }} />
        <div style={{ fontSize: 26, color: BASE_COLORS.text2, letterSpacing: 2 }}>7.0 导言 ｜ 7.1 项目建议与立项申请</div>
      </div>
    </AbsoluteFill>
  );
};

/* ───────────────────── S03 学法对照卡 ───────────────────── */

const StudyMethodCard: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = spring({ frame: frame - 6, fps: 30, config: { damping: 20, mass: 0.8, stiffness: 110 } });
  return (
    <SceneShell eyebrow="本章怎么学" title="图谱速记：不念书，只抓会考的那句话" subtitle="课上不逐句朗读，只讲教材核心观点">
      <div style={{ position: "absolute", left: 160, top: 300, display: "flex", gap: 40, opacity: enter }}>
        <div
          style={{
            width: 720,
            padding: "30px 34px",
            borderRadius: 18,
            border: `1.5px solid ${rgba(NEUTRAL.rgb, 0.3)}`,
            background: "rgba(8,19,41,0.75)",
            opacity: 0.55,
          }}
        >
          <div style={{ fontSize: 26, fontWeight: 700, color: BASE_COLORS.text2, marginBottom: 18 }}>✕ 逐句念书</div>
          {[86, 92, 74].map((w, i) => (
            <div key={i} style={{ height: 12, width: `${w}%`, background: "rgba(143,184,217,0.22)", marginBottom: 14 }} />
          ))}
          <div style={{ fontSize: 19, color: BASE_COLORS.text2 }}>念完什么也记不住，考场也用不上</div>
        </div>

        <div
          style={{
            width: 720,
            padding: "30px 34px",
            borderRadius: 18,
            border: `2px solid ${GOLD.hex}`,
            background: rgba(GOLD.rgb, 0.1),
            boxShadow: `0 0 40px ${rgba(GOLD.rgb, 0.22)}`,
          }}
        >
          <div style={{ fontSize: 26, fontWeight: 800, color: GOLD.hex, marginBottom: 18 }}>✓ 图谱速记</div>
          <div style={{ fontSize: 24, color: BASE_COLORS.text, lineHeight: 1.6 }}>
            抓教材核心观点
            <br />
            把考点画成一张图
            <br />
            只记命题人会挖的那个坑
          </div>
        </div>
      </div>
    </SceneShell>
  );
};

/* ───────────────────── S04 为什么先讲第 7 章 ───────────────────── */

const ChapterChips: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = spring({ frame: frame - 4, fps: 30, config: { damping: 20, mass: 0.8, stiffness: 110 } });
  const chips = [
    { t: "第 6 章 概论", active: false },
    { t: "第 8—19 章 十大领域 · 绩效域 · 配置变更", active: false },
    { t: "第 7 章 项目立项管理", active: true },
  ];
  return (
    <SceneShell eyebrow="全书顺序" title="为什么不按顺序讲，先切入第 7 章？" subtitle="第 6 章是概论，8—19 章是十大知识领域">
      <div style={{ position: "absolute", left: 160, top: 320, display: "flex", flexDirection: "column", gap: 22, opacity: enter }}>
        {chips.map((c) => (
          <div
            key={c.t}
            style={{
              padding: "18px 28px",
              borderRadius: 12,
              border: `1.5px solid ${c.active ? GOLD.hex : rgba(NEUTRAL.rgb, 0.35)}`,
              background: c.active ? rgba(GOLD.rgb, 0.16) : "rgba(8,19,41,0.7)",
              color: c.active ? GOLD.hex : BASE_COLORS.text2,
              fontSize: 28,
              fontWeight: c.active ? 800 : 500,
              width: "fit-content",
            }}
          >
            {c.t}
            {c.active ? <span style={{ marginLeft: 16, color: BASE_COLORS.text }}>← 就是它</span> : null}
          </div>
        ))}
        <div style={{ marginTop: 12, fontSize: 26, color: BASE_COLORS.text }}>
          建项目之前，还有一个更源头的问题：
          <span style={{ color: GOLD.hex, fontWeight: 800 }}>这个项目值不值得建？</span>
        </div>
      </div>
    </SceneShell>
  );
};

/* ───────────────────── S26 三张同源小卡 ───────────────────── */

const SIBLINGS = [
  { meta: "2023年11月 · 第4批次 · 第21题", trap: "干扰项：初步可行性研究" },
  { meta: "2023年11月 · 第1批次 · 第27题", trap: "干扰项：技术创新" },
  { meta: "2024年5月 · 第2批次 · 第18题", trap: "干扰项：项目可行性研究认证" },
];

const SiblingCards: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <SceneShell eyebrow="7.1.2 只有一句话" title="同一句话，连考了三次" subtitle="换汤不换药：问「核心内容不包括」">
      <div style={{ position: "absolute", left: 160, top: 300, display: "flex", gap: 28 }}>
        {SIBLINGS.map((s, i) => {
          const enter = spring({ frame: frame - 8 - i * 7, fps: 30, config: { damping: 20, mass: 0.8, stiffness: 110 } });
          return (
            <div
              key={s.meta}
              style={{
                width: 500,
                padding: "26px 28px",
                borderRadius: 16,
                background: "rgba(8,19,41,0.82)",
                border: `1.5px solid ${rgba(CYAN.rgb, 0.4)}`,
                opacity: enter,
                transform: `translateY(${(1 - enter) * 16}px)`,
              }}
            >
              <div style={{ fontSize: 20, color: CYAN.hex, fontWeight: 700, marginBottom: 12 }}>{s.meta}</div>
              <div style={{ fontSize: 24, color: BASE_COLORS.text }}>{s.trap}</div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          right: 160,
          top: 262,
          width: 96,
          height: 96,
          borderRadius: "50%",
          border: `3px solid ${GOLD.hex}`,
          background: "rgba(11,26,51,0.95)",
          color: GOLD.hex,
          fontSize: 36,
          fontWeight: 800,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        ×3
      </div>
    </SceneShell>
  );
};

/* ───────────────────── S28 命题套路拆解 ───────────────────── */

const TRAPS = ["初步可行性研究", "项目可行性研究认证", "技术创新"];

const TrapAnatomy: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = spring({ frame: frame - 6, fps: 30, config: { damping: 20, mass: 0.8, stiffness: 110 } });
  return (
    <SceneShell eyebrow="命题套路" title="「核心内容不包括」题，坑都挖在同一处" subtitle="打建议书时可行性研究还没开始，怎么可能写进去">
      <div style={{ position: "absolute", left: 160, top: 300, width: 780, opacity: enter }}>
        <div
          style={{
            padding: "26px 30px",
            borderRadius: 16,
            background: "rgba(8,19,41,0.82)",
            border: `1.5px solid ${rgba(CYAN.rgb, 0.4)}`,
            fontSize: 26,
            color: BASE_COLORS.text,
            lineHeight: 1.6,
          }}
        >
          项目建议书的核心内容
          <span style={{ color: RED.hex, fontWeight: 800 }}> 不包括 </span>
          （ ）
        </div>
        <div
          style={{
            marginTop: 26,
            display: "flex",
            alignItems: "center",
            gap: 18,
            fontSize: 22,
            color: BASE_COLORS.text2,
          }}
        >
          <div style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${rgba(GOLD.rgb, 0.6)}`, color: GOLD.hex }}>
            建议书
          </div>
          <div style={{ width: 120, height: 2, background: rgba(NEUTRAL.rgb, 0.5) }} />
          <div style={{ color: RED.hex, fontWeight: 700 }}>此刻可研还没开始</div>
          <div style={{ width: 120, height: 2, background: rgba(NEUTRAL.rgb, 0.5) }} />
          <div style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${rgba(NEUTRAL.rgb, 0.45)}` }}>
            可行性研究
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", right: 160, top: 300, width: 620 }}>
        <div style={{ fontSize: 22, color: BASE_COLORS.text2, marginBottom: 16 }}>命题人塞进选项的三个"可研类"干扰项</div>
        {TRAPS.map((t, i) => {
          const e = spring({ frame: frame - 20 - i * 10, fps: 30, config: { damping: 18, mass: 0.8, stiffness: 120 } });
          return (
            <div
              key={t}
              style={{
                marginBottom: 16,
                padding: "18px 22px",
                borderRadius: 12,
                border: `1.5px solid ${rgba(RED.rgb, 0.7)}`,
                background: rgba(RED.rgb, 0.1),
                color: "#FCA5A5",
                fontSize: 24,
                textDecoration: "line-through",
                opacity: e,
                transform: `translateX(${(1 - e) * 24}px)`,
              }}
            >
              ✕ {t}
            </div>
          );
        })}
      </div>
    </SceneShell>
  );
};

/* ───────────────────── 多状态资产的段内驱动 ───────────────────── */

const A5_RUN = {
  cuts: cutsFrom(["S08", "S09", "S10", "S11", "S12", "S13"]),
  stages: [0, 1, 2, 2, 3, 4],
};

/** S09 有 27 s 讲四步，每座门约 6.7 s（200 帧），不能用评审片的 48 帧节奏。 */
const A5_BEAT = A5_BEAT_FRAMES;

const A5Run: React.FC = () => {
  const { stage, local } = useStage(A5_RUN.cuts, A5_RUN.stages);
  return <GateTrack stage={stage} f={local} beatFrames={A5_BEAT} />;
};

const A8_RUN = { cuts: cutsFrom(["S19", "S20", "S21"]), stages: [0, 1, 2] };

const A8Run: React.FC = () => {
  const { stage, local } = useStage(A8_RUN.cuts, A8_RUN.stages);
  return <IdCard stage={stage} f={local} />;
};

/** 推镜段落：用本地帧推进，让相机真的动起来。 */
const GateHold: React.FC<{ stage: number }> = ({ stage }) => {
  const f = useCurrentFrame();
  return <GateTrack stage={stage} f={Math.min(f, 120)} />;
};

const A9_RUN = { cuts: A9_CUTS, stages: [0, 1, 2, 3, 4] };

const A9Run: React.FC = () => {
  const { stage, local } = useStage(A9_RUN.cuts, A9_RUN.stages);
  return <MnemonicCard stage={stage} f={local} />;
};


/* ───────────────────── 真题段 ───────────────────── */

const Quiz1: React.FC = () => <ExamQuizCard payload={Q1} cues={Q1_CUES} />;
const Quiz2: React.FC = () => <ExamQuizCard payload={Q2} cues={Q2_CUES} />;
const Quiz3: React.FC = () => <ExamQuizCard payload={Q3} cues={Q3_CUES} />;

const ExamStatsSpan: React.FC = () => <A1ExamStats payload={L01_EXAM_STATS} />;
const TimelineSpan: React.FC = () => <A2Timeline payload={L01_TIMELINE} />;
const FourAccountsSpan: React.FC = () => <A3FourAccounts payload={L01_FOUR_ACCOUNTS} />;
const ThreeStepsSpan: React.FC = () => <A4ThreeSteps payload={L01_THREE_STEPS} />;
const GateHold5: React.FC = () => <GateHold stage={5} />;
const GateHold6: React.FC = () => <GateHold stage={6} />;

/* ───────────────────── 段表 ───────────────────── */

/** 17 个渲染段：key → 组件。键与分镜镜号一致（合并段用 "S08-S13" 这种写法）。 */
export const L01_SPANS: Record<string, React.FC> = {
  S01: TitleFrame,
  S02: ExamStatsSpan,
  S03: StudyMethodCard,
  S04: ChapterChips,
  S05: TimelineSpan,
  S06: FourAccountsSpan,
  S07: ThreeStepsSpan,
  "S08-S13": A5Run,
  "S14-S17": Quiz1,
  S18: GateHold5,
  "S19-S21": A8Run,
  "S22-S25": Quiz2,
  S26: SiblingCards,
  S27: A9Run,
  S28: TrapAnatomy,
  "S29-S30": Quiz3,
  S31: GateHold6,
};

/** 某一镜在整片里的序号（1-based）与元数据。 */
export const shotInfo = (frame: number): { shot: Shot; order: number } => {
  for (let i = 0; i < SHOTS.length; i++) {
    if (frame < SHOTS[i].to) return { shot: SHOTS[i], order: i + 1 };
  }
  return { shot: SHOTS[SHOTS.length - 1], order: SHOTS.length };
};

export { SHOTS, L01_SPAN_IDS, L01_SPAN_TABLE };
