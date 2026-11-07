/**
 * 软考历年真题互动解析卡（ExamQuizCard）。
 *
 * 支持语音锚点（Cue-Points）驱动的四阶段动效：
 * 1. 题面与选项顺序入场
 * 2. 思考倒计时指示（thinking-pause）
 * 3. 干扰项排错划叉 + 错误批注弹出（eliminate-option）
 * 4. 正确选项高亮打勾 + 同源题对比卡 + 底部应试提示横幅（reveal-answer / show-tip）
 */
import React from "react";
import { QuizOptionRow, QuizExplanation, quizFade, type QuizPresentation } from "./quiz-presentation";
import { interpolateColors, useCurrentFrame, useVideoConfig } from "remotion";
import { Entered, SceneShell } from "./shared";
import { BASE_COLORS, resolveTone, rgba } from "../tokens/colorCard";
import { highlightPulseScale, linearProgress, springEnter } from "../tokens/motionPresets";
import { Countdown, type CountdownAppearance } from "../kit/Countdown";
import { getQuizSchedule, type QuizTiming } from "./quiz-timing";
import type { ExamQuizPayload, ResolvedCuePoint } from "../../../contracts/visual-props.schema";

export type ExamQuizCardProps = {
  payload: ExamQuizPayload;
  cues?: ResolvedCuePoint[];
  timing?: QuizTiming;
  countdown?: CountdownAppearance | false;
  /** 公共配色、逐项讲解与帧过渡；省略时保留原有课时表现。 */
  presentation?: QuizPresentation;
  /** paper 将题干和选项合为上部题面卡，下方可接实际解析。 */
  variant?: "stacked" | "paper";
  height?: number;
  analysisSlot?: React.ReactNode;
  analysisFromFrame?: number;
  analysisTop?: number;
  left?: number;
  top?: number;
  width?: number;
  columns?: 1 | 2;
  bodySize?: number;
  optionSize?: number;
  tone?: string;
  style?: React.CSSProperties;
  withShell?: boolean;
  tipTop?: number;
  /** 课时需要独立的逐项判断时，仅替换选项行，仍复用题干、布局与倒计时。 */
  renderOption?: (option: ExamQuizPayload['options'][number], index: number) => React.ReactNode;
  /** 组合题材料需独立字号、跟读焦点时，保留题干外壳和计时位置。 */
  renderStatement?: (statement: NonNullable<ExamQuizPayload['numberedStatements']>[number], index: number) => React.ReactNode;
  statusText?: string | false;
  /** 右侧副栏（如「同一考点另一问法」的小题卡）；给出时主卡收窄到 1140 */
  rightSlot?: React.ReactNode;
};

export const ExamQuizCard: React.FC<ExamQuizCardProps> = ({
  payload, cues = [], timing, countdown = {}, rightSlot, variant = "stacked", height = 400,
  analysisSlot, analysisFromFrame, analysisTop, left = 120, top = variant === "paper" ? 125 : 195, width,
  columns = 1, bodySize = variant === "paper" ? 20 : 25, optionSize = variant === "paper" ? 17 : 22, tone = "cyan", style, withShell = true, tipTop = 790,
  renderOption, renderStatement, statusText, presentation,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const negative = payload.polarity === "negative";
  const answerKey = negative ? payload.options.find((o) => !o.isCorrect)?.key : undefined;

  const schedule = getQuizSchedule(cues, fps, timing);
  const { thinking, revealCues, eliminateCues, eliminateFrame, revealFrame, tipFrame } = schedule;
  // 带 targetId 的排错按选项推进；未指定目标的事件才作用于全部干扰项。
  const stepwise = eliminateCues.length > 1 || eliminateCues.some((c) => Boolean(c.targetId));

  const isEliminated = frame >= eliminateFrame;
  const isRevealed = frame >= revealFrame;
  const showTip = frame >= tipFrame;
  const paper = variant === "paper";
  const inThinking = thinking && frame >= thinking.startFrame && frame < thinking.endFrame;
  const transitionFrames = Math.max(1, Math.round((presentation?.transitionSeconds ?? 0.2) * fps));
  const answerProgress = quizFade(frame, revealFrame, transitionFrames);
  const answerKeys = payload.options.filter((option) => negative ? !option.isCorrect : option.isCorrect).map((option) => option.key).join("、");
  const analysisAt = Math.max(analysisFromFrame ?? revealFrame, thinking?.endFrame ?? 0);

  const judgeEvents = [...eliminateCues, ...revealCues]
    .filter((c) => c.localFrame <= frame)
    .sort((a, b) => a.localFrame - b.localFrame);
  const lastEvent = judgeEvents[judgeEvents.length - 1];
  const focusActive =
    stepwise &&
    lastEvent &&
    lastEvent.action === "eliminate-option" &&
    payload.options.some((o) => o.key === lastEvent.targetId)
      ? frame - lastEvent.localFrame < 78
      : false;
  const focusKey = lastEvent ? lastEvent.targetId : undefined;

  const renderWithHighlight = (text: string, hl?: string) => {
    if (!hl) return text;
    const idx = text.indexOf(hl);
    if (idx < 0) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span
          style={{
            color: "#FCA5A5",
            textDecoration: "underline",
            textDecorationColor: resolveTone("red").hex,
            textDecorationThickness: 3,
            textUnderlineOffset: 6,
          }}
        >
          {hl}
        </span>
        {text.slice(idx + hl.length)}
      </>
    );
  };

  const hasSiblings = Boolean(payload.siblingQuestions && payload.siblingQuestions.length > 0);
  const mainWidth = width ?? (hasSiblings || rightSlot ? 1140 : 1680);

  const content = (
    <div data-quiz-card="exam" style={{ fontFamily: '"Noto Sans CJK SC", sans-serif' }}>
      <div
        style={{
          position: "absolute",
          left,
          top,
          width: mainWidth,
          display: "flex",
          flexDirection: "column",
          gap: paper ? 0 : 16,
          ...(paper ? { height, padding: "16px 24px", borderRadius: 16, boxSizing: "border-box" as const,
            background: "rgba(8, 19, 41, 0.94)",
            border: `2px solid ${interpolateColors(answerProgress, [0, 1], [rgba(resolveTone(tone).rgb, 0.55), rgba(resolveTone("green").rgb, 0.85)])}`,
            boxShadow: "0 8px 32px rgba(0,0,0,0.45)", justifyContent: "flex-start" } : {}),
          ...style,
        }}
      >
        {/* 题干容器 */}
        <Entered delay={4}>
          {(entered) => {
            // 公共表现的选项从首帧可见，题干同步显示，避免先有选项后有题干。
            const enter = paper || presentation || (thinking && frame >= thinking.startFrame) ? 1 : entered;
            return (
            <div
              style={{
                position: "relative",
                padding: paper ? 0 : "20px 28px",
                borderRadius: 16,
                background: paper ? undefined : "rgba(8, 19, 41, 0.86)",
                border: paper ? undefined : `1.5px solid ${rgba(resolveTone(tone).rgb, 0.55)}`,
                opacity: enter,
                transform: `translateY(${(1 - enter) * 16}px)`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10,
                minHeight: paper ? Math.max(38, thinking && countdown !== false ? (countdown.size ?? 40) : 0) : thinking && countdown !== false ? (countdown.size ?? 64) : undefined }}>
                <span
                  style={{
                    padding: "4px 14px",
                    borderRadius: 999,
                    background: rgba(resolveTone("gold").rgb, paper ? 0.22 : 0.2),
                    border: `${paper ? 1.5 : 1}px solid ${resolveTone("gold").hex}`,
                    color: resolveTone("gold").hex,
                    fontSize: paper ? 16 : 18,
                    fontWeight: 700,
                  }}
                >
                  {payload.examMeta}
                </span>
                {statusText !== false && <span style={{ fontSize: paper ? 15 : 18, fontWeight: paper ? 600 : undefined,
                  opacity: paper && isRevealed ? answerProgress : 1,
                  color: paper && isRevealed ? resolveTone("green").hex : paper && inThinking ? resolveTone("gold").hex : BASE_COLORS.text2 }}>
                  {statusText ?? (paper ? isRevealed ? `✓ 正确选项：${answerKeys}` : inThinking ? "⏱ 独立思考倒计时 (3秒)" : ""
                    : isRevealed ? "✓ 已揭晓标准答案与设坑点" : "⏱ 审题抓题眼")}
                </span>}
                {thinking && countdown !== false ? (
                  <div style={{ marginLeft: "auto" }}><Countdown {...thinking} {...(paper ? {
                    size: 40, strokeWidth: 4.5, ringInset: 2.25, numberSize: 16.8, showUnit: false,
                  } : {})} {...countdown} /></div>
                ) : null}
              </div>
              <div style={{ fontSize: bodySize, fontWeight: 700, color: BASE_COLORS.text, lineHeight: paper ? 1.4 : 1.48, marginBottom: paper ? 10 : undefined }}> 
                {payload.stem}
              </div>

              {/* 组合题编号项（如 ①②③④⑤） */}
              {payload.numberedStatements && payload.numberedStatements.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 14 }}>
                  {payload.numberedStatements.map((stmt, idx) => {
                    if (renderStatement) return <React.Fragment key={stmt.id}>{renderStatement(stmt, idx)}</React.Fragment>;
                    const stmtCue = eliminateCues.find((c) => c.targetId === stmt.id);
                    const strike = stmtCue
                      ? frame >= stmtCue.localFrame
                      : isEliminated && stmt.eliminated;
                    return (
                      <div
                        key={stmt.id}
                        style={{
                          padding: "6px 16px",
                          borderRadius: 10,
                          background: strike
                            ? rgba(resolveTone("red").rgb, 0.22)
                            : "rgba(18, 34, 64, 0.85)",
                          border: `1.5px solid ${
                            strike ? resolveTone("red").hex : rgba(resolveTone("blue").rgb, 0.45)
                          }`,
                          color: strike ? "#FCA5A5" : BASE_COLORS.text,
                          fontSize: 20,
                          fontWeight: 600,
                          textDecoration: strike ? "line-through" : "none",
                        }}
                      >
                        {stmt.id} {stmt.text} {strike ? "❌" : ""}
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          ); }}
        </Entered>

        {/* ABCD 四个选项 */}
        <div style={{ display: "grid", gridTemplateColumns: columns === 2 ? "1fr 1fr" : "1fr", gap: paper ? 8 : 12 }}>
          {payload.options.map((opt, idx) => {
            if (renderOption) return <React.Fragment key={opt.key}>{renderOption(opt, idx)}</React.Fragment>;
            if (presentation || paper) return <QuizOptionRow key={opt.key} option={opt} negative={negative}
              schedule={schedule} presentation={presentation ?? {}} fontSize={optionSize} density={paper ? "paper" : "normal"} />;
            const enter = thinking && frame >= thinking.startFrame ? 1 : springEnter(frame, fps, 8 + idx * 4);
            const elimCue = eliminateCues.find((c) => c.targetId === opt.key);
            const elimAt = stepwise && elimCue ? elimCue.localFrame : eliminateFrame;
            const revCue = revealCues.find((c) => !c.targetId || c.targetId === opt.key);
            const revAt = revCue ? revCue.localFrame : Infinity;
            /**
             * 负向题（polarity="negative"）：`isCorrect` 表示“这句表述本身正确”，
             * 答案是 `isCorrect === false` 的那一项。揭示前它先被标成“表述错误”，
             * 揭示后翻成绿色答案；其余三项打“表述正确”。
             * 正向题 / 缺省 payload 的走法与历史完全一致。
             */
            const activeCorrect = negative
              ? frame >= revealFrame && opt.key === answerKey
              : frame >= revAt && opt.isCorrect;
            const trueStatement = negative && frame >= revealFrame && opt.isCorrect;
            const dimmedWrong = negative
              ? frame >= elimAt && opt.key === answerKey && frame < revealFrame
              : frame >= elimAt && !opt.isCorrect;
            const strikeProgress = dimmedWrong ? linearProgress(frame, elimAt, 12) : 0;
            const scale = activeCorrect ? highlightPulseScale(frame, negative ? revealFrame : revAt) : 1;
            const focusDim = focusActive && focusKey !== opt.key ? 0.28 : 1;
            const allowStrike = !negative && !(stepwise && (payload.numberedStatements?.length ?? 0) > 0);

            const borderTone = activeCorrect
              ? resolveTone("green")
              : dimmedWrong && opt.critiqueNote
                ? resolveTone("red")
                : resolveTone("blue");

            return (
              <div
                key={opt.key}
                data-option-key={opt.key}
                data-answer-revealed={activeCorrect || undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 24px",
                  borderRadius: 14,
                  background: activeCorrect
                    ? rgba(resolveTone("green").rgb, 0.2)
                    : "rgba(6, 14, 31, 0.78)",
                  border: `2px solid ${rgba(borderTone.rgb, activeCorrect ? 0.95 : 0.42)}`,
                  boxShadow: activeCorrect ? `0 0 26px ${rgba(resolveTone("green").rgb, 0.35)}` : undefined,
                  opacity: enter * (dimmedWrong && !opt.critiqueNote ? 0.48 : 0.98) * focusDim,
                  transform: `translateX(${(1 - enter) * 20}px) scale(${scale})`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 18, flex: 1 }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 10,
                      background: activeCorrect
                        ? resolveTone("green").hex
                        : dimmedWrong
                          ? rgba(resolveTone("red").rgb, 0.25)
                          : rgba(resolveTone("cyan").rgb, 0.2),
                      color: activeCorrect ? "#04131A" : BASE_COLORS.text,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: optionSize,
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {opt.key}
                  </div>
                  <div
                    style={{
                      fontSize: optionSize,
                      color: activeCorrect ? "#ECFDF5" : BASE_COLORS.text,
                      fontWeight: activeCorrect ? 700 : 500,
                      textDecoration: strikeProgress > 0.6 && allowStrike && !opt.critiqueNote ? "line-through" : "none",
                    }}
                  >
                    {renderWithHighlight(opt.text, dimmedWrong ? opt.errorHighlight : undefined)}
                  </div>
                </div>

                {/* 排错批注或正确打勾 */}
                {activeCorrect ? (
                  <div
                    style={{
                      padding: "6px 16px",
                      borderRadius: 999,
                      background: resolveTone("green").hex,
                      color: "#04131A",
                      fontSize: 19,
                      fontWeight: 800,
                      marginLeft: 16,
                      flexShrink: 0,
                    }}
                  >
                    ✓ 正确答案
                  </div>
                ) : dimmedWrong && opt.critiqueNote ? (
                  <div
                    style={{
                      padding: "6px 14px",
                      borderRadius: 8,
                      background: rgba(resolveTone("red").rgb, 0.22),
                      border: `1px solid ${resolveTone("red").hex}`,
                      color: "#FCA5A5",
                      fontSize: 18,
                      fontWeight: 700,
                      marginLeft: 16,
                      flexShrink: 0,
                    }}
                  >
                    ❌ {opt.critiqueNote}
                  </div>
                ) : trueStatement ? (
                  <div
                    style={{
                      padding: "4px 12px",
                      borderRadius: 999,
                      border: `1px solid ${rgba(resolveTone("cyan").rgb, 0.6)}`,
                      color: resolveTone("cyan").hex,
                      fontSize: 16,
                      fontWeight: 700,
                      marginLeft: 16,
                      flexShrink: 0,
                    }}
                  >
                    ✓ 表述正确
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
        {!paper && <QuizExplanation presentation={presentation} schedule={schedule} fontSize={optionSize} />}
      </div>

      {analysisSlot && frame >= analysisAt ? <div data-quiz-explanation style={{ position: "absolute", left,
        top: analysisTop ?? top + height + 20, width: mainWidth, opacity: quizFade(frame, analysisAt, transitionFrames) }}>
        {analysisSlot}
      </div> : paper && presentation?.explanations?.length ? <div style={{ position: "absolute", left,
        top: analysisTop ?? top + height + 20, width: mainWidth }}>
        <QuizExplanation presentation={presentation} schedule={schedule} fontSize={optionSize} />
      </div> : null}

      {/* 右侧自定义副栏（如「同一考点另一问法」的小题卡） */}
      {!hasSiblings && rightSlot ? <>{rightSlot}</> : null}

      {/* 右侧同源题连斩副栏（一题带多题） */}
      {hasSiblings && payload.siblingQuestions && isRevealed ? (
        <div
          style={{
            position: "absolute",
            left: left + mainWidth + 30,
            top,
            width: 510,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div
            style={{
              padding: "12px 20px",
              borderRadius: 12,
              background: rgba(resolveTone("gold").rgb, 0.18),
              border: `1.5px solid ${resolveTone("gold").hex}`,
              color: resolveTone("gold").hex,
              fontSize: 21,
              fontWeight: 700,
            }}
          >
            🔥 同源真题连斩（换汤不换药）
          </div>
          {payload.siblingQuestions.map((sib, sIdx) => {
            const sibEnter = springEnter(frame, fps, revealFrame + sIdx * 6);
            return (
              <div
                key={`${sib.examMeta}-${sIdx}`}
                style={{
                  padding: "20px 22px",
                  borderRadius: 14,
                  background: "rgba(8, 19, 41, 0.86)",
                  border: `1.5px solid ${rgba(resolveTone("purple").rgb, 0.55)}`,
                  opacity: Math.max(0.25, sibEnter),
                  transform: `translateX(${(1 - sibEnter) * 24}px)`,
                }}
              >
                <div style={{ fontSize: 19, fontWeight: 700, color: resolveTone("cyan").hex, marginBottom: 8 }}>
                  {sib.examMeta}
                </div>
                <div style={{ fontSize: 20, color: BASE_COLORS.text, lineHeight: 1.45 }}>{sib.trapNote}</div>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* 底部实务 vs 应试提示条 */}
      {payload.tipBanner && showTip ? (
        <div
          style={{
            position: "absolute",
            left,
            width: width ?? 1680,
            boxSizing: "border-box",
            top: tipTop,
            padding: "14px 26px",
            borderRadius: 12,
            background: rgba(resolveTone("cyan").rgb, 0.16),
            border: `1.5px solid ${resolveTone("cyan").hex}`,
            color: BASE_COLORS.text,
            fontSize: 20,
            fontWeight: 600,
            // 提示条 = 结论，必须在揭示之后才出现；提前显示等于泄题。
            opacity: showTip ? springEnter(frame, fps, tipFrame) : 0,
          }}
        >
          {payload.tipBanner}
        </div>
      ) : null}
    </div>
  );

  return withShell
    ? <SceneShell title={payload.title} subtitle={payload.subtitle} eyebrow={`历年真题实战 · ${payload.examMeta}`}>{content}</SceneShell>
    : content;
};
