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
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Entered, SceneShell } from "./shared";
import { BASE_COLORS, resolveTone, rgba } from "../tokens/colorCard";
import { highlightPulseScale, linearProgress, springEnter } from "../tokens/motionPresets";
import type { ExamQuizPayload, ResolvedCuePoint } from "../../../contracts/visual-props.schema";

export const ExamQuizCard: React.FC<{
  payload: ExamQuizPayload;
  cues?: ResolvedCuePoint[];
  /** 右侧副栏（如「同一考点另一问法」的小题卡）；给出时主卡收窄到 1140 */
  rightSlot?: React.ReactNode;
}> = ({ payload, cues = [], rightSlot }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const negative = payload.polarity === "negative";
  const answerKey = negative ? payload.options.find((o) => !o.isCorrect)?.key : undefined;

  const revealCues = cues.filter((c) => c.action === "reveal-answer");
  const eliminateCues = cues.filter((c) => c.action === "eliminate-option");
  const tipCue = cues.find((c) => c.action === "show-tip");
  const thinkingCue = cues.find((c) => c.action === "thinking-pause");

  /**
   * 没有排错 cue 时，划除必须与揭示同时发生——否则会出现
   * "旁白还在念选项、画面已经把错误项划掉"的答案泄漏。
   */
  const eliminateFrame = eliminateCues.length
    ? eliminateCues[0].localFrame
    : revealCues.length
      ? revealCues[0].localFrame
      : Math.floor(durationInFrames * 0.42);
  const revealFrame = revealCues.length ? revealCues[0].localFrame : Math.floor(durationInFrames * 0.58);
  /**
   * 逐项判卷模式：只要出现「带 targetId 的排错cue」或「多条排错cue」，就按题面逐项推进；
   * 否则完全沿用旧的"一次性划掉所有错误项"行为（老课件渲染结果不变）。
   */
  const stepwise = eliminateCues.length > 1 || eliminateCues.some((c) => Boolean(c.targetId));

  /** 提示条是结论：有 reveal cue 的题，结论条与揭示同步出现；无 cue 的老课件仍按 72% 落。 */
  const tipFrame = tipCue
    ? tipCue.localFrame
    : revealCues.length
      ? revealFrame
      : Math.floor(durationInFrames * 0.72);

  const isEliminated = frame >= eliminateFrame;
  const isRevealed = frame >= revealFrame;
  const showTip = frame >= tipFrame;

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

  // 思考倒计时环（仅有 thinking-pause cue 时出现）
  const thinkingFrame = thinkingCue ? thinkingCue.localFrame : null;
  const thinkingEnd = thinkingCue
    ? Math.min(
        eliminateFrame > thinkingCue.localFrame ? eliminateFrame : thinkingCue.localFrame + 60,
        thinkingCue.localFrame + 90,
      )
    : 0;
  const thinkingSpan = Math.max(1, thinkingEnd - (thinkingFrame ?? 0));
  const thinkingProgress =
    thinkingFrame === null ? 0 : Math.max(0, Math.min(1, (frame - thinkingFrame) / thinkingSpan));
  const thinkingLeft = Math.max(0, Math.ceil((thinkingSpan - (frame - (thinkingFrame ?? 0))) / fps));
  const showRing = thinkingFrame !== null && frame >= thinkingFrame && thinkingProgress < 1;

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
  const mainWidth = hasSiblings || rightSlot ? 1140 : 1680;

  return (
    <SceneShell title={payload.title} subtitle={payload.subtitle} eyebrow={`历年真题实战 · ${payload.examMeta}`}>
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 195,
          width: mainWidth,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* 题干容器 */}
        <Entered delay={4}>
          {(enter) => (
            <div
              style={{
                position: "relative",
                padding: "20px 28px",
                borderRadius: 16,
                background: "rgba(8, 19, 41, 0.86)",
                border: `1.5px solid ${rgba(resolveTone("cyan").rgb, 0.55)}`,
                opacity: enter,
                transform: `translateY(${(1 - enter) * 16}px)`,
              }}
            >
              {showRing ? (
                <div
                  style={{
                    position: "absolute",
                    right: 22,
                    top: 18,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div style={{ fontSize: 18, color: BASE_COLORS.text2 }}>先自己选</div>
                  <div style={{ position: "relative", width: 64, height: 64 }}>
                    <svg width={64} height={64} style={{ transform: "rotate(-90deg)" }}>
                      <circle cx={32} cy={32} r={26} fill="none" stroke="rgba(143,184,217,0.22)" strokeWidth={5} />
                      <circle
                        cx={32}
                        cy={32}
                        r={26}
                        fill="none"
                        stroke={resolveTone("gold").hex}
                        strokeWidth={5}
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 26}
                        strokeDashoffset={2 * Math.PI * 26 * thinkingProgress}
                      />
                    </svg>
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 20,
                        fontWeight: 800,
                        color: resolveTone("gold").hex,
                      }}
                    >
                      {thinkingLeft}s
                    </div>
                  </div>
                </div>
              ) : null}
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
                <span
                  style={{
                    padding: "4px 14px",
                    borderRadius: 999,
                    background: rgba(resolveTone("gold").rgb, 0.2),
                    border: `1px solid ${resolveTone("gold").hex}`,
                    color: resolveTone("gold").hex,
                    fontSize: 18,
                    fontWeight: 700,
                  }}
                >
                  {payload.examMeta}
                </span>
                <span style={{ fontSize: 18, color: BASE_COLORS.text2 }}>
                  {isRevealed ? "✓ 已揭晓标准答案与设坑点" : "⏱ 审题抓题眼"}
                </span>
              </div>
              <div style={{ fontSize: 25, fontWeight: 700, color: BASE_COLORS.text, lineHeight: 1.48 }}>
                {payload.stem}
              </div>

              {/* 组合题编号项（如 ①②③④⑤） */}
              {payload.numberedStatements && payload.numberedStatements.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 14 }}>
                  {payload.numberedStatements.map((stmt) => {
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
          )}
        </Entered>

        {/* ABCD 四个选项 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {payload.options.map((opt, idx) => {
            const enter = springEnter(frame, fps, 8 + idx * 4);
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
                      fontSize: 22,
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {opt.key}
                  </div>
                  <div
                    style={{
                      fontSize: 22,
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
      </div>

      {/* 右侧自定义副栏（如「同一考点另一问法」的小题卡） */}
      {!hasSiblings && rightSlot ? <>{rightSlot}</> : null}

      {/* 右侧同源题连斩副栏（一题带多题） */}
      {hasSiblings && payload.siblingQuestions ? (
        <div
          style={{
            position: "absolute",
            right: 120,
            top: 195,
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
      {payload.tipBanner ? (
        <div
          style={{
            position: "absolute",
            left: 120,
            right: 120,
            top: 790,
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
    </SceneShell>
  );
};
