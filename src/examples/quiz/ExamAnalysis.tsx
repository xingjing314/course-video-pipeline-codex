import React from "react";
import { interpolateColors, useCurrentFrame, useVideoConfig } from "remotion";
import { BASE_COLORS, resolveTone, rgba } from "../../visual/tokens/colorCard";
import { quizFade } from "../../visual/templates/quiz-presentation";
import { examAnchors, examEvidence, examTiming } from "./data";

const cyan = resolveTone("cyan");
const red = resolveTone("red");
const green = resolveTone("green");
const gold = resolveTone("gold");
const panel: React.CSSProperties = { background: "rgba(8, 19, 41, 0.9)", borderRadius: 14, padding: "16px 22px",
  display: "flex", flexDirection: "column", justifyContent: "space-between", boxSizing: "border-box" };
const tag = (tone: ReturnType<typeof resolveTone>): React.CSSProperties => ({ padding: "3px 10px", borderRadius: 6,
  background: rgba(tone.rgb, 0.2), color: tone.hex, fontSize: 14, fontWeight: 700, flexShrink: 0 });

/** 本题专用教材与概念对照，复用公共题卡的 analysisSlot；不是另一套题卡。 */
export const ExamAnalysis: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const duration = Math.round(fps * 0.2);
  const progress = (from: number) => quizFade(frame, from, duration);
  const allABC = frame >= examAnchors.explainC;
  const reveal = progress(examTiming.revealFrame);
  return <div style={{ height: 340, display: "grid", gridTemplateColumns: "780px 860px", gap: 40 }}>
    <div data-exam-evidence style={{ ...panel, border: `1.5px solid ${rgba(cyan.rgb, 0.4)}` }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <span style={tag(cyan)}>教材对应</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: BASE_COLORS.text }}>
            {allABC ? "前三项全部对应进度管理计划标准特征" : "进度管理计划标准特征"}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {examEvidence.map((item) => <div key={item.key} style={{ padding: "8px 12px", borderRadius: 8, minHeight: 58,
            boxSizing: "border-box", opacity: progress(item.from), background: rgba(cyan.rgb, 0.12), borderLeft: `4px solid ${cyan.hex}` }}>
            <span style={{ fontWeight: 700, color: cyan.hex }}>{item.key} 选项：</span>
            <span style={{ fontSize: 15.5, color: BASE_COLORS.text, lineHeight: 1.4 }}>{item.text}</span>
          </div>)}
        </div>
      </div>
      <div style={{ fontSize: 14, color: BASE_COLORS.text2, opacity: progress(examAnchors.explainC) }}>
        💡 题干问的是“不正确的是”，因此符合教材正文的 A、B、C 均为排除项！
      </div>
    </div>
    {frame >= examAnchors.explainD ? <div data-exam-comparison style={{ ...panel,
      opacity: progress(examAnchors.explainD),
      border: `2px solid ${interpolateColors(reveal, [0, 1], [rgba(red.rgb, 0.5), rgba(green.rgb, 0.7)])}` }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={tag(red)}>命题陷阱</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: BASE_COLORS.text }}>张冠李戴：进度管理计划 vs 范围管理计划</span>
          </div>
          {frame >= examTiming.revealFrame ? <span style={{ padding: "4px 14px", borderRadius: 999,
            opacity: reveal, background: rgba(green.rgb, 0.25), border: `1.5px solid ${green.hex}`, color: green.hex,
            fontSize: 15, fontWeight: 800, flexShrink: 0 }}>✓ 锁定正确答案：D</span> : null}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(56, 189, 248, 0.08)", border: `1px solid ${rgba(cyan.rgb, 0.4)}` }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: cyan.hex, marginBottom: 6 }}>进度管理计划 管什么？</div>
            <div style={{ fontSize: 14.5, color: BASE_COLORS.text, lineHeight: 1.4 }}>
              管的是【时间安排的规矩】：如何编制、监督和控制进度，建立活动准则与绩效规则。
            </div>
          </div>
          <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(248, 113, 113, 0.1)", border: `1px solid ${rgba(red.rgb, 0.5)}` }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: red.hex, marginBottom: 6 }}>范围管理计划 管什么？</div>
            <div style={{ fontSize: 14.5, color: "#FCA5A5", lineHeight: 1.4 }}>
              管的是【项目的产出边界】：如何定义、制定、监督、控制和确认项目范围。
            </div>
          </div>
        </div>
        <div style={{ padding: "8px 14px", borderRadius: 8, background: rgba(gold.rgb, 0.12), border: `1px solid ${rgba(gold.rgb, 0.35)}`,
          fontSize: 14.5, color: gold.hex, lineHeight: 1.4 }}>
          ★ 破题真诀：出题人故意把【范围管理计划】的定义原封不动安在【进度管理计划】头上！审题抓核心宾语“范围”即可秒杀！
        </div>
      </div>
    </div> : null}
  </div>;
};
