/**
 * 视觉 Payload 与语音锚点（Cue-Points）同源 Zod 契约。
 *
 * 覆盖 9 类继承基础模板 + 2 类软考高项真题专属模板（exam-quiz / dual-quiz-battle）。
 * 严禁在 Payload 中直接传入任意十六进制色值或绝对像素偏移，统一使用语义 Tone 与预设结构。
 */
import { z } from "zod";
import { AtomicShapeItemSchema } from "./primitives.schema.ts";

export const ToneSchema = z.enum([
  "cyan",
  "blue",
  "green",
  "gold",
  "orange",
  "red",
  "purple",
  "neutral",
]);
export type ToneName = z.infer<typeof ToneSchema>;

const TitleSchema = z.string().min(1).max(160);
const ShortTextSchema = z.string().min(1).max(240);
const BodyTextSchema = z.string().min(1).max(800);

/* ----------------------- 语音锚点（Cue-Points）契约 ----------------------- */

export const CueActionTypeSchema = z.enum([
  "thinking-pause",
  "eliminate-option",
  "reveal-answer",
  "show-tip",
  "highlight-item",
  "step-advance",
]);

export const CuePointSpecSchema = z.object({
  id: z.string().min(1),
  action: CueActionTypeSchema,
  targetId: z.string().optional(),
  matchPhrase: z.string().min(1),
  fallbackRatio: z.number().min(0).max(1).default(0.5),
});
export type CuePointSpec = z.infer<typeof CuePointSpecSchema>;

export const ResolvedCuePointSchema = CuePointSpecSchema.extend({
  triggerMs: z.number().nonnegative(),
  localFrame: z.number().int().nonnegative(),
  matchedBy: z.enum(["token-exact", "token-fuzzy", "fallback-ratio"]),
});
export type ResolvedCuePoint = z.infer<typeof ResolvedCuePointSchema>;

/* -------------------------- 9 类既有基础视觉模板 -------------------------- */

export const AtomicComboPayloadSchema = z.object({
  title: TitleSchema,
  subtitle: z.string().max(260).optional(),
  items: z.array(AtomicShapeItemSchema).min(1),
  labels: z
    .array(
      z.object({
        text: z.string().min(1).max(80),
        x: z.number(),
        y: z.number(),
        tone: ToneSchema.optional(),
        fontSize: z.number().positive().max(96).optional(),
      }),
    )
    .max(12)
    .optional()
    .default([]),
});

export const ProcessTimelinePayloadSchema = z.object({
  title: TitleSchema,
  subtitle: z.string().max(260).optional(),
  steps: z
    .array(
      z.object({
        label: ShortTextSchema,
        description: z.string().max(320).optional(),
        emphasis: z.boolean().optional().default(false),
        stampText: z.string().max(60).optional(),
      }),
    )
    .min(2)
    .max(8),
  orientation: z.enum(["horizontal", "vertical"]).optional().default("horizontal"),
  warningBanner: z.string().max(260).optional(),
  comparisonRails: z
    .array(
      z.object({
        label: ShortTextSchema,
        rule: BodyTextSchema,
        tone: ToneSchema.optional(),
      }),
    )
    .max(5)
    .optional(),
});

export const LayeredArchitecturePayloadSchema = z.object({
  title: TitleSchema,
  subtitle: z.string().max(260).optional(),
  layers: z
    .array(
      z.object({
        label: ShortTextSchema,
        items: z.array(ShortTextSchema).max(8).default([]),
        tone: ToneSchema.optional(),
        note: z.string().max(260).optional(),
      }),
    )
    .min(2)
    .max(6),
  footnote: z.string().max(260).optional(),
  warningBanner: z.string().max(260).optional(),
});

export const TablePayloadSchema = z.object({
  title: TitleSchema,
  subtitle: z.string().max(260).optional(),
  headers: z.array(ShortTextSchema).min(2).max(6),
  rows: z.array(z.array(BodyTextSchema).min(2).max(6)).min(1).max(10),
  highlightRowIndices: z.array(z.number().int().nonnegative()).optional().default([]),
  caption: z.string().max(260).optional(),
  footerBanner: z.string().max(260).optional(),
});

export const TitleCardPayloadSchema = z.object({
  title: TitleSchema,
  subtitle: BodyTextSchema.optional(),
  eyebrow: ShortTextSchema.optional(),
  bullets: z.array(ShortTextSchema).max(6).optional().default([]),
  badges: z.array(ShortTextSchema).max(6).optional().default([]),
});

export const MultiCardsPayloadSchema = z.object({
  title: TitleSchema,
  subtitle: z.string().max(260).optional(),
  cards: z
    .array(
      z.object({
        heading: ShortTextSchema,
        body: BodyTextSchema,
        tone: ToneSchema.optional(),
        badge: z.string().max(60).optional(),
        warningNote: z.string().max(200).optional(),
      }),
    )
    .min(2)
    .max(6),
  warningBanner: z.string().max(260).optional(),
  footerBanner: z.string().max(260).optional(),
});

export const FormulaCardPayloadSchema = z.object({
  title: TitleSchema,
  subtitle: z.string().max(260).optional(),
  formula: ShortTextSchema,
  variables: z
    .array(
      z.object({
        symbol: z.string().min(1).max(40),
        meaning: ShortTextSchema,
      }),
    )
    .max(6)
    .default([]),
  note: BodyTextSchema.optional(),
  takeaway: BodyTextSchema.optional(),
});

export const BarChartPayloadSchema = z.object({
  title: TitleSchema,
  subtitle: z.string().max(260).optional(),
  unit: z.string().max(32).optional(),
  series: z
    .array(
      z.object({
        label: ShortTextSchema,
        value: z.number().finite(),
        tone: z.string().max(24).optional(),
      }),
    )
    .min(2)
    .max(8),
  maxValue: z.number().finite().positive().optional(),
  caption: z.string().max(260).optional(),
});

export const ChapterMapPayloadSchema = z.object({
  title: TitleSchema,
  subtitle: z.string().max(260).optional(),
  chapters: z
    .array(
      z.object({
        index: z.number().int().positive(),
        title: ShortTextSchema,
        summary: BodyTextSchema.optional(),
      }),
    )
    .min(2)
    .max(9),
  activeIndex: z.number().int().positive().optional(),
});

export const RoadmapSummaryPayloadSchema = z.object({
  title: TitleSchema,
  subtitle: z.string().max(260).optional(),
  phases: z
    .array(
      z.object({
        period: z.string().min(1).max(40),
        title: ShortTextSchema,
        items: z.array(ShortTextSchema).min(1).max(4),
        tone: ToneSchema.optional(),
      }),
    )
    .min(2)
    .max(4),
});

/* ----------------------- 2 类新增软考真题专属视觉模板 ----------------------- */

export const QuizOptionSchema = z.object({
  key: z.enum(["A", "B", "C", "D"]),
  text: BodyTextSchema,
  isCorrect: z.boolean(),
  errorHighlight: z.string().max(120).optional(),
  critiqueNote: z.string().max(200).optional(),
});
export type QuizOption = z.infer<typeof QuizOptionSchema>;

export const ExamQuizPayloadSchema = z.object({
  title: TitleSchema,
  subtitle: z.string().max(260).optional(),
  examMeta: ShortTextSchema,
  stem: BodyTextSchema,
  stemHighlights: z.array(z.string().min(1)).optional().default([]),
  numberedStatements: z
    .array(
      z.object({
        id: z.string().min(1).max(16),
        text: ShortTextSchema,
        eliminated: z.boolean().optional().default(false),
      }),
    )
    .max(8)
    .optional(),
  options: z.array(QuizOptionSchema).length(4),
  /**
   * 题干极性，缺省 positive（选“正确项”）。
   * negative = 选“错误项”：此时 `isCorrect` 表示“该表述本身是否正确”，
   * 真正的答案是 `isCorrect === false` 的那一项；判卷时把它高亮成答案，
   * 而不是当作被排错项划掉。缺省值保持历史行为（L01/L02 输出不变）。
   */
  polarity: z.enum(["positive", "negative"]).optional(),
  siblingQuestions: z
    .array(
      z.object({
        examMeta: ShortTextSchema,
        trapNote: BodyTextSchema,
      }),
    )
    .max(4)
    .optional(),
  tipBanner: BodyTextSchema.optional(),
});

export const DualQuizBattlePayloadSchema = z.object({
  title: TitleSchema,
  subtitle: z.string().max(260).optional(),
  topComparisonTable: z
    .object({
      headers: z.array(ShortTextSchema).min(2).max(4),
      rows: z.array(z.array(ShortTextSchema).min(2).max(4)).min(1).max(6),
    })
    .optional(),
  leftQuiz: z.object({
    examMeta: ShortTextSchema,
    stem: BodyTextSchema,
    options: z.array(QuizOptionSchema).length(4),
  }),
  rightQuiz: z.object({
    examMeta: ShortTextSchema,
    stem: BodyTextSchema,
    options: z.array(QuizOptionSchema).length(4),
    extraNote: ShortTextSchema.optional(),
  }),
});

export type AtomicComboPayload = z.infer<typeof AtomicComboPayloadSchema>;
export type ProcessTimelinePayload = z.infer<typeof ProcessTimelinePayloadSchema>;
export type LayeredArchitecturePayload = z.infer<typeof LayeredArchitecturePayloadSchema>;
export type TablePayload = z.infer<typeof TablePayloadSchema>;
export type TitleCardPayload = z.infer<typeof TitleCardPayloadSchema>;
export type MultiCardsPayload = z.infer<typeof MultiCardsPayloadSchema>;
export type FormulaCardPayload = z.infer<typeof FormulaCardPayloadSchema>;
export type BarChartPayload = z.infer<typeof BarChartPayloadSchema>;
export type ChapterMapPayload = z.infer<typeof ChapterMapPayloadSchema>;
export type RoadmapSummaryPayload = z.infer<typeof RoadmapSummaryPayloadSchema>;
/* ---------------- 第 7 章 L01 专用：A1–A4 四张静态卡 ---------------- */

/** A1 考情速览卡：一排数据块 + 标签 + 口径注脚。 */
export const ExamStatsPayloadSchema = z.object({
  title: TitleSchema,
  subtitle: z.string().max(260).optional(),
  kicker: z.string().min(1).max(40).optional(),
  stats: z
    .array(
      z.object({
        value: z.string().min(1).max(12),
        unit: z.string().min(1).max(8).optional(),
        label: ShortTextSchema,
        emphasis: z.boolean().optional(),
      }),
    )
    .min(2)
    .max(4),
  tags: z
    .array(
      z.object({
        text: ShortTextSchema,
        tone: ToneSchema.optional(),
        solid: z.boolean().optional(),
      }),
    )
    .max(3)
    .optional(),
  footnote: z.string().max(200).optional(),
});

/** A2 全书坐标时间轴：「建之前 / 建之后」两块 + 轴线 + 追问。 */
export const ChapterTimelinePayloadSchema = z.object({
  title: TitleSchema,
  subtitle: z.string().max(260).optional(),
  before: z.object({ kicker: ShortTextSchema, title: ShortTextSchema, note: ShortTextSchema }),
  after: z.object({ kicker: ShortTextSchema, title: ShortTextSchema, note: ShortTextSchema }),
  questions: z.array(ShortTextSchema).max(3).optional(),
  conclusion: ShortTextSchema.optional(),
  axisLabel: z.string().min(1).max(12).optional(),
});

/** A3 四笔账面板：固定 2×2 四格 + 中央印章。 */
export const FourAccountsPayloadSchema = z.object({
  title: TitleSchema,
  subtitle: z.string().max(260).optional(),
  items: z
    .array(
      z.object({
        name: ShortTextSchema,
        line: ShortTextSchema,
        tone: ToneSchema.optional(),
      }),
    )
    .length(4),
  stamp: z.string().min(1).max(8).optional(),
});

/** A4 三件事主线卡：串行步骤 + 每步交付物。 */
export const ThreeStepsPayloadSchema = z.object({
  title: TitleSchema,
  subtitle: z.string().max(260).optional(),
  steps: z
    .array(
      z.object({
        code: z.string().min(1).max(12),
        verb: ShortTextSchema,
        full: ShortTextSchema,
        output: ShortTextSchema,
        tone: ToneSchema.optional(),
      }),
    )
    .min(2)
    .max(4),
  footnote: z.string().max(200).optional(),
});

/* ------------- 状态机型资产：四关轨道 / 身份证 / 口诀卡 ------------- */

/** A5 四关轨道：按 stage 渲染累计状态（0 建立 → 6 交棒）。 */
export const GateTrackPayloadSchema = z.object({
  stage: z.number().int().min(0).max(6),
  beatFrames: z.number().int().positive().max(600).optional(),
  eyebrow: ShortTextSchema.optional(),
  title: TitleSchema.optional(),
  subtitle: z.string().max(260).optional(),
});

/** A8 建议书身份证：三行逐行点亮（0/1/2）。 */
export const IdCardPayloadSchema = z.object({
  stage: z.number().int().min(0).max(2),
  eyebrow: ShortTextSchema.optional(),
  title: TitleSchema.optional(),
  subtitle: z.string().max(260).optional(),
});

/** A9 口诀卡：五段（0 口诀入场 → 4 四卡全亮）。 */
export const MnemonicCardPayloadSchema = z.object({
  stage: z.number().int().min(0).max(4),
  /** 段内状态切换帧（相对场景起点）；给了就按它推进 stage，忽略 stage。 */
  cuts: z.array(z.number().int().nonnegative()).max(8).optional(),
  eyebrow: ShortTextSchema.optional(),
  title: TitleSchema.optional(),
  subtitle: z.string().max(260).optional(),
});

/**
 * 章节本地组件入口。
 *
 * 通用 19 类不够用时，章节可以把自制组件挂到 `src/lessons/<lessonId>/components.tsx`，
 * 数据侧只写 `{ key, data }`——`key` 是章节组件表里的键。
 *
 * `data` 故意不做校验：章节组件的 payload 由章节自己负责（在组件内 parse）。
 * 这是"卡片各章自制"的逃生口，不是通用模板的替代品。
 */
export const ChapterLocalPayloadSchema = z.object({
  key: z.string().min(1).max(64),
  data: z.unknown().optional(),
});

export type ChapterLocalPayload = z.infer<typeof ChapterLocalPayloadSchema>;

export type GateTrackPayload = z.infer<typeof GateTrackPayloadSchema>;
export type IdCardPayload = z.infer<typeof IdCardPayloadSchema>;
export type MnemonicCardPayload = z.infer<typeof MnemonicCardPayloadSchema>;

export type ExamStatsPayload = z.infer<typeof ExamStatsPayloadSchema>;
export type ChapterTimelinePayload = z.infer<typeof ChapterTimelinePayloadSchema>;
export type FourAccountsPayload = z.infer<typeof FourAccountsPayloadSchema>;
export type ThreeStepsPayload = z.infer<typeof ThreeStepsPayloadSchema>;

export type ExamQuizPayload = z.infer<typeof ExamQuizPayloadSchema>;
export type DualQuizBattlePayload = z.infer<typeof DualQuizBattlePayloadSchema>;

export const VisualSpecUnionSchema = z.discriminatedUnion("visualType", [
  z.object({ visualType: z.literal("atomic-combo"), payload: AtomicComboPayloadSchema }),
  z.object({ visualType: z.literal("process-timeline"), payload: ProcessTimelinePayloadSchema }),
  z.object({ visualType: z.literal("layered-architecture"), payload: LayeredArchitecturePayloadSchema }),
  z.object({ visualType: z.literal("table"), payload: TablePayloadSchema }),
  z.object({ visualType: z.literal("title-card"), payload: TitleCardPayloadSchema }),
  z.object({ visualType: z.literal("multi-cards"), payload: MultiCardsPayloadSchema }),
  z.object({ visualType: z.literal("formula-card"), payload: FormulaCardPayloadSchema }),
  z.object({ visualType: z.literal("bar-chart"), payload: BarChartPayloadSchema }),
  z.object({ visualType: z.literal("chapter-map"), payload: ChapterMapPayloadSchema }),
  z.object({ visualType: z.literal("roadmap-summary"), payload: RoadmapSummaryPayloadSchema }),
  z.object({ visualType: z.literal("exam-quiz"), payload: ExamQuizPayloadSchema }),
  z.object({ visualType: z.literal("dual-quiz-battle"), payload: DualQuizBattlePayloadSchema }),
  z.object({ visualType: z.literal("exam-stats"), payload: ExamStatsPayloadSchema }),
  z.object({ visualType: z.literal("chapter-timeline"), payload: ChapterTimelinePayloadSchema }),
  z.object({ visualType: z.literal("four-accounts"), payload: FourAccountsPayloadSchema }),
  z.object({ visualType: z.literal("three-steps"), payload: ThreeStepsPayloadSchema }),
  z.object({ visualType: z.literal("gate-track"), payload: GateTrackPayloadSchema }),
  z.object({ visualType: z.literal("id-card"), payload: IdCardPayloadSchema }),
  z.object({ visualType: z.literal("mnemonic-card"), payload: MnemonicCardPayloadSchema }),
  z.object({ visualType: z.literal("chapter-local"), payload: ChapterLocalPayloadSchema }),
]);
export type VisualSpecUnion = z.infer<typeof VisualSpecUnionSchema>;
export type VisualType = VisualSpecUnion["visualType"];
