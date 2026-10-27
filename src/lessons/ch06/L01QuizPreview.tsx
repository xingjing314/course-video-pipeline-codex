import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { TechNetwork } from "../../visual/backgrounds/tech-network/TechNetwork";
import { techNetworkSchema } from "../../visual/backgrounds/tech-network/schema";
import {L01Header as HeaderBreadcrumb, L01Audio as Audio} from "./L01FullPlayback";
import {L01Captions as CaptionsOverlay} from "./L01FullPlayback";
import timing from "./l01-quiz-timing.json";
import audio from "../../../workspaces/ch06-L01-quiz/audio-timeline.json";

const bg = techNetworkSchema.parse({ type: "tech-network", ganttEnabled: false, linkOpacity: 0.04, nodeOpacity: 0.07 });
const options = [
  "项目的需求不复存在，是项目宣告结束的情况之一",
  "实现项目目标可能会产生一个或多个可交付成果",
  "可交付成果可能会在项目终止后依然存在",
  "项目是为创造独特的产品、服务或成果而进行的周期性工作",
];
export const CH06_QUIZ_FRAMES = timing.totalFrames;
export const Ch06L01Quiz: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = frame / fps * 1000;
  const countFrame = frame - timing.countdownStartFrame;
  const counting = countFrame >= 0 && countFrame < timing.countdownFrames;
  const active = ms < timing.scenes[1].startMs ? -1 : ms < timing.scenes[2].startMs ? 0 : ms < timing.scenes[3].startMs ? 1 : ms < timing.scenes[4].startMs ? 2 : 3;
  const trap = ms >= timing.trapAtMs;
  const answer = ms >= timing.answerAtMs;
  const shot = ms >= timing.scenes[5].startMs ? 7 : active >= 0 ? active + 3 : frame >= timing.countdownStartFrame ? 2 : 1;
  const shotTitles = ["读题", "独立作答", "分析 A 项", "分析 B 项", "分析 C 项", "分析 D 项", "解析"];
  return <AbsoluteFill style={{ background: "#081426", color: "#EAF2FA", fontFamily: '"Noto Sans CJK SC", sans-serif' }}>
    <TechNetwork {...bg} />
    <Audio src={staticFile("audio/ch06-L01-quiz/narration.wav")} />
    <HeaderBreadcrumb lessonId="ch06-L01" lessonTitle="第 6 章 项目管理概论 · L01" sceneId={`Q17-${shot}`} sceneOrder={shot} totalScenes={7} segmentTitle={`真题① · ${shotTitles[shot - 1]}`} />
    <div style={{ position: "absolute", left: 96, right: 96, top: 48 }}>
      <div style={{ fontSize: 20, lineHeight: 1.5, letterSpacing: 3, color: "#8FB8D9", marginBottom: 10 }}>2023 年 11 月 · 第 4 批次 · 第 17 题</div>
      <div style={{ fontSize: 46, lineHeight: 1.3, fontWeight: 700, letterSpacing: 1.2, color: "#E6F1FA" }}>关于项目的描述，不正确的是：（　）</div>
    </div>
    <div style={{ position: "absolute", left: 96, top: 248, width: 1386, display: "flex", flexDirection: "column", gap: 18 }}>
      {options.map((text, i) => {
        const judged = i < 3 && ms >= timing.correctAtMs[i];
        const selected = i === 3 && answer;
        const color = selected ? "#E6B65F" : judged ? "#7BD9B5" : active === i ? "#46D6E3" : "#526D86";
        return <div key={text} style={{ position: "relative", minHeight: i === 3 ? 142 : 110, display: "flex", alignItems: "center", padding: "18px 26px", gap: 24, boxSizing: "border-box", border: `2px solid ${color}`, borderRadius: 18, background: selected ? "#30291C" : active === i ? "#102C3C" : "#102134" }}>
          <div style={{ width: 52, height: 52, flexShrink: 0, display: "grid", placeItems: "center", borderRadius: 12, background: `${color}20`, color: active === i || judged || selected ? color : "#C5D4E1", fontSize: 31, fontWeight: 750 }}>{"ABCD"[i]}</div>
          <div style={{ fontSize: 33, lineHeight: 1.65, flex: 1 }}>
            {i === 3 ? <>项目是为创造独特的产品、<br />服务或成果而进行的<span style={{ color: trap ? "#FFAA92" : undefined, borderBottom: trap ? "3px solid #FFAA92" : undefined }}>周期性</span>工作</> : text}
          </div>
          <div style={{ width: 132, flexShrink: 0, textAlign: "right", color: selected ? "#E6B65F" : "#7BD9B5", fontSize: 24 }}>{judged ? "表述正确" : selected ? "本题答案" : ""}</div>
        </div>;
      })}
    </div>
    <div style={{ position: "absolute", left: 1540, top: 270, width: 268, textAlign: "center" }}>
      <div style={{ color: "#9EB9CE", fontSize: 25 }}>{counting ? "思考时间" : answer ? "本题选择" : active < 0 ? "请先独立作答" : "逐项分析"}</div>
      {counting ? <div style={{ position: "relative", marginTop: 38, height: 200 }}>
        <svg width="200" height="200" viewBox="0 0 200 200"><circle cx="100" cy="100" r="88" fill="none" stroke="#253D52" strokeWidth="6" /><circle cx="100" cy="100" r="88" fill="none" stroke="#46D6E3" strokeWidth="6" strokeDasharray={Math.PI * 176} strokeDashoffset={Math.PI * 176 * countFrame / 90} transform="rotate(-90 100 100)" /></svg>
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 94, fontWeight: 700 }}>{3 - Math.floor(countFrame / 30)}</div>
      </div> : answer ? <div style={{ color: "#E6B65F", fontSize: 124, fontWeight: 800, marginTop: 24 }}>D</div> : <div style={{ width: 52, height: 3, background: "#42647E", margin: "45px auto" }} />}
      {trap && <div style={{ marginTop: 30, borderTop: "1px solid #3B4C56", paddingTop: 26, fontSize: 29, lineHeight: 1.9 }}><span style={{ color: "#FFAA92" }}>周期性</span><div style={{ fontSize: 20, color: "#9EB9CE" }}>应为</div><span style={{ color: "#7BD9B5", fontWeight: 750 }}>临时性</span>{ms >= timing.englishAtMs && <div style={{ fontSize: 25, color: "#7BD9B5" }}>Temporary</div>}</div>}
    </div>
    <CaptionsOverlay captions={audio.captions} />
  </AbsoluteFill>;
};
