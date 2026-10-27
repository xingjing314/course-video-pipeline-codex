/**
 * A7 · 历年真题卡（ExamQuizCard）判卷语法原型
 *
 * 三道具题按真实口播节奏串成一条评审片，用来验证四件事：
 *   1. 题面/选项入场 → 思考倒计时环 → 逐项判卷 → 揭示答案 + 同源小卡 + 应试提示
 *   2. 逐项判卷的焦点推进（当前被判选项 1.0，其余 0.28）
 *   3. 错误短语下划线（errorHighlight）能否替代整行删除线
 *   4. 一题带 n 题（siblingQuestions）在右侧副栏的表现
 *
 * 所有时间点取自《第七章-L01-画面分镜方案V0.1》S14–S30 的实际镜长，
 * 因此这里的"静音"就是正式片里讲师说话的位置。
 */
import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { ExamQuizCard } from "../templates/ExamQuizCard";
import { BASE_COLORS, resolveTone, rgba } from "../tokens/colorCard";
import { TechNetwork } from "../backgrounds/tech-network/TechNetwork";
import { techNetworkSchema } from "../backgrounds/tech-network/schema";
import type { ExamQuizPayload, ResolvedCuePoint } from "../../../contracts/visual-props.schema";

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

/* ───────────────────────── 真题 1 · 23下3批 T21 ───────────────────────── */

export const Q1: ExamQuizPayload = {
  title: "投资前时期的四个阶段",
  subtitle: "教材四阶段里没有「机会可行性研究」，见到直接排除",
  examMeta: "2023年11月 · 第3批次 · 第21题",
  stem: "项目投资前时期的四个阶段包括（  ）。",
  stemHighlights: [],
  numberedStatements: [
    { id: "①", text: "项目建议与立项申请", eliminated: false },
    { id: "②", text: "机会可行性研究", eliminated: false },
    { id: "③", text: "初步可行性研究", eliminated: false },
    { id: "④", text: "详细可行性研究", eliminated: false },
    { id: "⑤", text: "评估与决策", eliminated: false },
  ],
  options: [
    { key: "A", text: "①②③④", isCorrect: false },
    { key: "B", text: "①②④⑤", isCorrect: false },
    { key: "C", text: "①③④⑤", isCorrect: true },
    { key: "D", text: "①②③⑤", isCorrect: false },
  ],
  tipBanner:
    "实际项目中立项阶段常以「项目建议书 + 可行性研究报告 + 初步设计」为核心交付成果；做题请以教材四阶段为准。",
};

export const Q1_CUES: ResolvedCuePoint[] = [
  cue("q1-think", "thinking-pause", 720),
  cue("q1-elim", "eliminate-option", 840, "②"),
  cue("q1-reveal", "reveal-answer", 1020, "C"),
  cue("q1-tip", "show-tip", 1320),
];

/* ───────────────────────── 真题 2 · 26上1批 T42 ───────────────────────── */

export const Q2: ExamQuizPayload = {
  title: "项目建议书与立项申请",
  subtitle: "三处偷换：深度、接收方、核心内容",
  examMeta: "2026年5月 · 第1批次 · 第42题",
  stem: "关于项目建议书与立项申请的相关描述，正确的是（  ）。",
  stemHighlights: [],
  options: [
    {
      key: "A",
      text: "立项申请是项目建设的筹建单位针对拟建项目提出的实施计划和方案",
      isCorrect: false,
      errorHighlight: "实施计划和方案",
      critiqueNote: "应为：框架性总体设想",
    },
    {
      key: "B",
      text: "项目建议书是国家或上级主管部门选择项目的依据，也是可行性研究的依据",
      isCorrect: true,
    },
    {
      key: "C",
      text: "立项申请是项目建设单位根据需要向国家监管部门提交的文件",
      isCorrect: false,
      errorHighlight: "国家监管部门",
      critiqueNote: "应为：上级主管部门",
    },
    {
      key: "D",
      text: "项目建议书中不包括项目建设必需的条件、项目的必要性",
      isCorrect: false,
      errorHighlight: "不包括",
      critiqueNote: "说反了：这两项正是核心内容",
    },
  ],
  tipBanner: "建议书只写框架性设想：一必要、两市场、一条件。",
};

export const Q2_CUES: ResolvedCuePoint[] = [
  cue("q2-think", "thinking-pause", 360),
  cue("q2-elim-a", "eliminate-option", 510, "A"),
  cue("q2-reveal-b", "reveal-answer", 870, "B"),
  cue("q2-elim-c", "eliminate-option", 1050, "C"),
  cue("q2-elim-d", "eliminate-option", 1200, "D"),
];

/* ───────────────────────── 真题 3 · 24上2批 T18 ───────────────────────── */

export const Q3: ExamQuizPayload = {
  title: "建议书核心内容四件套",
  subtitle: "换汤不换药：认口诀，不认字母",
  examMeta: "2024年5月 · 第2批次 · 第18题",
  stem: "项目建议书的核心内容不包括（  ）。",
  stemHighlights: [],
  options: [
    { key: "A", text: "项目的必要性", isCorrect: false },
    { key: "B", text: "项目建设的必需条件", isCorrect: false },
    { key: "C", text: "项目可行性研究认证", isCorrect: true },
    { key: "D", text: "项目预期成果的市场预测", isCorrect: false },
  ],
  siblingQuestions: [
    { examMeta: "2023年11月 · 第4批次 · 第21题", trapNote: "干扰项：初步可行性研究" },
    { examMeta: "2023年11月 · 第1批次 · 第27题", trapNote: "干扰项：技术创新" },
  ],
  tipBanner: "三考同一句话：一必要、两市场、一条件。",
};

export const Q3_CUES: ResolvedCuePoint[] = [
  cue("q3-think", "thinking-pause", 450),
  cue("q3-elim", "eliminate-option", 480, "A"),
  cue("q3-reveal", "reveal-answer", 540, "C"),
];

/* ────────────────────────────── 编排 ────────────────────────────── */

const SCENES = [
  { id: "Q1", from: 0, dur: 1710, payload: Q1, cues: Q1_CUES },
  { id: "Q2", from: 1710, dur: 1590, payload: Q2, cues: Q2_CUES },
  { id: "Q3", from: 3300, dur: 1170, payload: Q3, cues: Q3_CUES },
] as const;

export const A7_TOTAL_FRAMES = 4470;

const BG = techNetworkSchema.parse({ type: "tech-network" });

export const A7ExamQuizLab: React.FC = () => (
  <AbsoluteFill style={{ background: "#0B1A33" }}>
      <TechNetwork {...BG} />
    {SCENES.map((sc) => (
      <Sequence key={sc.id} from={sc.from} durationInFrames={sc.dur} name={`A7-${sc.id}`}>
        <ExamQuizCard payload={sc.payload} cues={sc.cues as ResolvedCuePoint[]} />
      </Sequence>
    ))}

    {/* 评审用角标 */}
    <div
      style={{
        position: "absolute",
        right: 40,
        bottom: 22,
        padding: "6px 14px",
        borderRadius: 8,
        border: `1px solid ${rgba(resolveTone("gold").rgb, 0.45)}`,
        background: "rgba(224,176,80,0.08)",
        color: resolveTone("gold").hex,
        fontSize: 16,
        letterSpacing: 2,
      }}
    >
      A7 · 真题卡判卷语法原型 · 静音
    </div>
    <div style={{ position: "absolute", left: 40, bottom: 22, fontSize: 14, color: BASE_COLORS.text2 }}>
      题 1 = 23下3批T21 ｜ 题 2 = 26上1批T42 ｜ 题 3 = 24上2批T18
    </div>
  </AbsoluteFill>
);
