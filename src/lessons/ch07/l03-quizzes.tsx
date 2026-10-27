/**
 * L03 真题段（含 7 处 3 秒倒计时）。
 *
 * 时间点一律来自 `l03-cues.json`（token 定位）；组件里不出现手写帧号。
 * 题卡一律「读题不泄题」：答案、批注、结论条全部绑定 reveal cue。
 */
import React from "react";
import { useCurrentFrame } from "remotion";
import { ExamQuizCard } from "../../visual/templates/ExamQuizCard";
import { SceneShell } from "../../visual/templates/shared";
import { L03_SHOTS } from "./l03-shot-table";
import { cuesFor, cueFrame } from "./l03-cues";
import { CompactQuizCard, BriefQuizCard } from "./l03-quiz-card";
import type { ExamQuizPayload } from "../../../contracts/visual-props.schema";
import { BASE_COLORS, resolveTone, rgba } from "../../visual/tokens/colorCard";

const CYAN = resolveTone("cyan");
const GOLD = resolveTone("gold");
const GREEN = resolveTone("green");
const RED = resolveTone("red");

const at = (id: string) => L03_SHOTS.find((s) => s.id === id)!;

/* ───────────── S06–S11 · 双题：24上1 T17 + 24上2 T19 ───────────── */

const Q_T17: ExamQuizPayload = {
  title: "关于可行性研究的描述，正确的是",
  subtitle: "两个批次放一起，左边这题选“正确的”",
  examMeta: "2024 年 5 月 第 1 批次 · 第 17 题",
  stem: "关于可行性研究的描述，正确的是（　）。",
  stemHighlights: [],
  options: [
    { key: "A", text: "试验室和中间工厂的试验是初步可行性研究的主要内容", isCorrect: false, critiqueNote: "属辅助研究" },
    { key: "B", text: "详细可行性研究一般是在调查后对项目进行的初步评估", isCorrect: false, critiqueNote: "初步评估属初步可研" },
    { key: "C", text: "初步与详细可研在占有资源和研究细节方面是相同的", isCorrect: false, critiqueNote: "说反了" },
    { key: "D", text: "初步可研可初步估计必须进行的辅助研究，并判断支持条件", isCorrect: true },
  ],
};

const Q_T19: ExamQuizPayload = {
  title: "关于可行性研究的描述，不正确的是",
  subtitle: "右边这题反过来问“错误的”",
  examMeta: "2024 年 5 月 第 2 批次 · 第 19 题",
  stem: "关于项目可行性研究的描述不正确的是（　）。",
  stemHighlights: [],
  polarity: "negative",
  options: [
    { key: "A", text: "初步可行性研究报告，必须包含项目的主要投资支出", isCorrect: true },
    { key: "B", text: "初步可行性研究报告可作为正式文件，支持项目决策", isCorrect: true },
    { key: "C", text: "初步可研报告的核心内容不包括项目进度安排", isCorrect: false, critiqueNote: "6 项里明明有进度安排" },
    { key: "D", text: "初步可行性研究是详细可行性研究的基础", isCorrect: true },
  ],
};

export const DualPreStudySpan: React.FC = () => {
  const frame = useCurrentFrame();
  // 左题讲完 = S09 的起点（场景边界，不是手写帧号）
  const leftDur = at("S09").from - at("S06").from;

  const all = cuesFor("S06-S11");
  const leftCues = all.filter((c) => c.localFrame < leftDur);
  const rightCues = all.filter((c) => c.localFrame >= leftDur);
  const leftActive = frame < leftDur;
  const rightReveal = rightCues.find((c) => c.action === "reveal-answer")?.localFrame ?? null;
  const summary = rightReveal !== null && frame >= rightReveal + 20;

  return (
    <SceneShell
      eyebrow="历年真题实战 · 同一考点，两种问法"
      title="两道真题并排看：一个问“正确”，一个问“不正确”"
      subtitle="左题先做，右题反过来再考一次——同一段话，正反两面"
    >
      <CompactQuizCard payload={Q_T17} cues={leftCues} left={96} top={214} width={830} active={leftActive} />
      <CompactQuizCard payload={Q_T19} cues={rightCues} left={994} top={214} width={830} active={!leftActive} />
      {summary && (
        <div style={{ position: "absolute", left: 96, top: 640, width: 1728, display: "flex", gap: 24 }}>
          <div style={{ flex: 1, padding: "14px 22px", borderRadius: 12, border: `1.5px solid ${rgba(GREEN.rgb, 0.6)}`, background: rgba(GREEN.rgb, 0.1), fontSize: 21, color: BASE_COLORS.text }}>
            左题问“正确的是” → 选 <b style={{ color: GREEN.hex }}>D</b>
          </div>
          <div style={{ flex: 1, padding: "14px 22px", borderRadius: 12, border: `1.5px solid ${rgba(GOLD.rgb, 0.6)}`, background: rgba(GOLD.rgb, 0.1), fontSize: 21, color: BASE_COLORS.text }}>
            右题问“不正确的是” → 选 <b style={{ color: GOLD.hex }}>C</b>
          </div>
        </div>
      )}
    </SceneShell>
  );
};

/* ───────────── S24 · 四宫格导入（四张题面缩略卡） ───────────── */

export const QuadIntroSpan: React.FC = () => (
  <SceneShell eyebrow="四道真题" title="两组考点，四道题" subtitle="上面考铁三角，下面考评估依据">
    <BriefQuizCard payload={Q_T18} left={96} top={300} width={840} height={196} tag="铁三角" bodySize={14.5} optionSize={13.5} />
    <BriefQuizCard payload={Q_T33} left={984} top={300} width={840} height={196} tag="铁三角" bodySize={14.5} optionSize={13.5} />
    <BriefQuizCard payload={Q_T22} left={96} top={520} width={840} height={196} tag="评估依据" bodySize={14.5} optionSize={13.5} />
    <BriefQuizCard payload={Q_T46} left={984} top={520} width={840} height={196} tag="评估依据" bodySize={14.5} optionSize={13.5} />
    <div style={{ position: "absolute", left: 96, top: 760, fontSize: 22, color: BASE_COLORS.text2 }}>
      先看清题面——接下来逐题拆：前两道考铁三角，后两道考评估依据
    </div>
  </SceneShell>
);

/* ───────────── S25–S27 · T18（两空）+ 23下3 T23 迷你卡 ───────────── */

const Q_T18: ExamQuizPayload = {
  title: "项目评估：在什么基础上，由谁来做",
  subtitle: "两个空，分别对应铁三角的前两条",
  examMeta: "2024 年 5 月 第 1 批次 · 第 18 题",
  stem: "项目评估指在（　）的基础上，由（　）根据国家颁布的政策、法规、方法、参数和条例等进行评价、分析和论证。",
  stemHighlights: ["在（　）的基础上", "由（　）"],
  options: [
    { key: "A", text: "项目立项申请；项目承建方", isCorrect: false },
    { key: "B", text: "项目可行性研究；项目建设方", isCorrect: false },
    { key: "C", text: "项目立项申请；第三方", isCorrect: false },
    { key: "D", text: "项目可行性研究；第三方", isCorrect: true },
  ],
  tipBanner: "第一空＝可行性研究，第二空＝第三方",
};

/** 23下3 T23：原题（2023 年 11 月第 3 批次第 23 题，答案 D）。 */
const Q_T23_B3: ExamQuizPayload = {
  title: "项目评估的主体",
  examMeta: "2023 年 11 月 第 3 批次 · 第 23 题",
  stemHighlights: [],
  stem: "项目评估指在项目可行性研究的基础上，由（　）根据国家颁布的政策、法规、方法、参数和条例等，从国民经济与社会、组织业务等角度出发，对拟建项目建设的必要性、建设条件、生产条件、市场需求、工程技术、经济效益和社会效益等进行评价、分析和论证，进而判断其是否可行的一个评估过程。",
  options: [
    { key: "A", text: "建设单位", isCorrect: false },
    { key: "B", text: "合作单位", isCorrect: false },
    { key: "C", text: "承建单位", isCorrect: false },
    { key: "D", text: "第三方", isCorrect: true },
  ],
};

export const T18Span: React.FC = () => {
  const revealAt = cueFrame("S25-S27", "D");
  const enterAt = cuesFor("S25-S27").find((c) => c.action === "thinking-pause")?.localFrame ?? null;
  return (
    <ExamQuizCard
      payload={Q_T18}
      cues={cuesFor("S25-S27")}
      rightSlot={
        <BriefQuizCard
          payload={Q_T23_B3}
          left={1290}
          top={195}
          width={510}
          revealAt={revealAt}
          enterAt={enterAt}
          tag="同一考点·换个问法"
          bodySize={14.5}
          optionSize={13.5}
        />
      }
    />
  );
};

/* ───────────── S28–S30 · T33 ───────────── */

const Q_T33: ExamQuizPayload = {
  title: "审查可研的可靠性、___",
  subtitle: "三个性质是一组口诀",
  examMeta: "2025 年 5 月 第 1 批次 · 第 33 题",
  stem: "项目评估与决策过程的目的是审查项目可行性研究的可靠性、____。",
  stemHighlights: ["可靠性"],
  options: [
    { key: "A", text: "真实性、客观性", isCorrect: true },
    { key: "B", text: "经济性、安全性", isCorrect: false },
    { key: "C", text: "客观性、安全性", isCorrect: false },
    { key: "D", text: "真实性、安全性", isCorrect: false },
  ],
  tipBanner: "口诀：可靠 · 真实 · 客观",
};

export const T33Span: React.FC = () => <ExamQuizCard payload={Q_T33} cues={cuesFor("S28-S30")} />;

/* ───────────── S31–S33 · T22 ───────────── */

const Q_T22: ExamQuizPayload = {
  title: "不可作为项目评估依据的是",
  subtitle: "四个选项里有一个“第 8 章才出现”",
  examMeta: "2023 年 5 月 · 第 22 题",
  stem: "不可作为项目评估依据的是（　）。",
  stemHighlights: [],
  options: [
    { key: "A", text: "建议书及其批准文件", isCorrect: true },
    { key: "B", text: "可行性研究报告", isCorrect: true },
    { key: "C", text: "协议文件", isCorrect: true },
    { key: "D", text: "项目章程", isCorrect: false, critiqueNote: "第 8 章才签发" },
  ],
  tipBanner: "评估依据里，永远没有《项目章程》",
};

export const T22Span: React.FC = () => <ExamQuizCard payload={Q_T22} cues={cuesFor("S31-S33")} />;

/* ───────────── S34–S36 · T46 + 23下4 T23 挖空卡 ───────────── */

const Q_T46: ExamQuizPayload = {
  title: "哪一项不属于项目评估的依据",
  subtitle: "同构题：换了个问法，答案还是它",
  examMeta: "2023 年 11 月 第 1 批次 · 第 46 题",
  stem: "（　）不属于项目评估的依据。",
  stemHighlights: [],
  options: [
    { key: "A", text: "项目建议书及其批准文件", isCorrect: true },
    { key: "B", text: "项目可行性研究报告", isCorrect: true },
    { key: "C", text: "报送组织的申请报告及主管部门的初审意见", isCorrect: true },
    { key: "D", text: "项目章程", isCorrect: false, critiqueNote: "不是评估依据" },
  ],
  tipBanner: "23下4 T23 把“可行性研究报告”挖空，让你把 B 填回来",
};

/** 23下4 T23：原题（2023 年 11 月第 4 批次第 23 题，答案 D）。 */
const Q_T23_B4: ExamQuizPayload = {
  title: "项目评估的依据",
  examMeta: "2023 年 11 月 第 4 批次 · 第 23 题",
  stemHighlights: [],
  stem: "项目评估的依据主要包括：项目建议书及其批准文件、（　）报送组织的申请报告及主管部门的初审意见、项目关键建设条件和工程等的协议文件、必需的其他文件和资料等。",
  options: [
    { key: "A", text: "需求调研报告", isCorrect: false },
    { key: "B", text: "绩效测量报告", isCorrect: false },
    { key: "C", text: "成本预测报告", isCorrect: false },
    { key: "D", text: "项目可行性研究报告", isCorrect: true },
  ],
};

export const T46Span: React.FC = () => {
  const fillAt = cueFrame("S34-S36", "mini-fill");
  const enterAt = cueFrame("S34-S36", "mini-show");
  return (
    <ExamQuizCard
      payload={Q_T46}
      cues={cuesFor("S34-S36")}
      rightSlot={
        <BriefQuizCard
          payload={Q_T23_B4}
          left={1290}
          top={195}
          width={510}
          columns={1}
          revealAt={fillAt}
          enterAt={enterAt}
          fillText="项目可行性研究报告"
          tag="同一考点·挖空版"
          bodySize={14.5}
          optionSize={13.5}
        />
      }
    />
  );
};

/* ───────────── S40–S43 · T27（嫁接型陷阱） ───────────── */

const Q_T27: ExamQuizPayload = {
  title: "关于项目评估内容，不正确的是",
  examMeta: "2026 年 5 月 第 1 批次 · 第 27 题",
  stem: "关于项目评估内容的相关描述，不正确的是（　）。",
  stemHighlights: [],
  options: [
    { key: "A", text: "财务效益评估：数据可靠、指标参数正确、方案最佳", isCorrect: true },
    { key: "B", text: "项目风险评估：含盈亏平衡分析、敏感性分析等", isCorrect: true },
    { key: "C", text: "国民经济效益评估：核查费用与效益范围及数值调整", isCorrect: true },
    {
      key: "D",
      text: "建设必要性评估：含是否符合产业政策，标准与规范是否先进合理",
      isCorrect: false,
      critiqueNote: "后半句属安装工程标准评估",
    },
  ],
  tipBanner: "必要性看“要不要建”，安装标准看“合不合规”",
};

export const T27Span: React.FC = () => {
  const frame = useCurrentFrame();
  const chip1 = cueFrame("S40-S43", "necessity");
  const chip2 = cueFrame("S40-S43", "install-standard");
  const show1 = chip1 !== null && frame >= chip1;
  const show2 = chip2 !== null && frame >= chip2;

  return (
    <>
      <ExamQuizCard payload={Q_T27} cues={cuesFor("S40-S43")} />
      {/* 嫁接拆解：D 的后半句被拽到「安装工程标准评估」——出现时刻来自 cue */}
      <div style={{ position: "absolute", left: 96, top: 700, display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ opacity: show1 ? 1 : 0, transform: `translateY(${show1 ? 0 : 8}px)` }}>
          <div
            style={{
              padding: "8px 16px",
              borderRadius: 10,
              border: `1.5px solid ${rgba(CYAN.rgb, 0.55)}`,
              background: rgba(CYAN.rgb, 0.12),
              color: BASE_COLORS.text,
              fontSize: 20,
              whiteSpace: "nowrap",
            }}
          >
            前半句 → 建设必要性评估 ✓
          </div>
        </div>
        <div style={{ fontSize: 22, color: RED.hex, opacity: show1 ? 1 : 0 }}>✂</div>
        <div style={{ opacity: show2 ? 1 : 0, transform: `translateY(${show2 ? 0 : 8}px)` }}>
          <div
            style={{
              padding: "8px 16px",
              borderRadius: 10,
              border: `1.5px solid ${rgba(RED.rgb, 0.65)}`,
              background: rgba(RED.rgb, 0.14),
              color: BASE_COLORS.text,
              fontSize: 20,
              whiteSpace: "nowrap",
            }}
          >
            后半句 → 安装工程标准评估
          </div>
        </div>
      </div>
    </>
  );
};
