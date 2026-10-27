/**
 * A1–A4 冒烟测试：验证「契约 → 路由 → 组件」这条链路真的通。
 *
 * 四张卡的 payload 先过 CompiledSceneSchema.parse()（不是手写对象直接塞给组件），
 * 再交给 SceneRouter 分发——只要这里能出图，就说明：
 *   1. visual-props.schema.ts 的新增四种 payload 合法；
 *   2. CompiledScene 的判别联合接受这四个 visualType；
 *   3. SceneRouter 的 switch 命中正确分支。
 *
 * 正式片里这四张卡由 Stage 3 编译产物驱动，这里只是把编译产物手工造出来。
 */
import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { CompiledSceneSchema, type CompiledScene } from "../../../contracts/compiled-lesson.schema";
import { SceneRouter } from "../templates/SceneRouter";
import { A14_STAGES } from "./A14CardsLab";
import {
  L01_EXAM_STATS,
  L01_FOUR_ACCOUNTS,
  L01_THREE_STEPS,
  L01_TIMELINE,
} from "../templates/Cards14";

const ZERO_SHA = "0".repeat(64);

const makeScene = (
  order: number,
  visualType: string,
  payload: unknown,
  fromFrame: number,
  dur: number,
): CompiledScene =>
  CompiledSceneSchema.parse({
    id: `S0${order}-${visualType}`,
    parentSceneId: `S0${order}`,
    segmentTitle: "冒烟测试 · 第 7 章 L01",
    sceneTitle: `${visualType} 冒烟`,
    order,
    startMs: fromFrame * (1000 / 30),
    endMs: (fromFrame + dur) * (1000 / 30),
    durationMs: dur * (1000 / 30),
    fromFrame,
    durationInFrames: dur,
    narration: "冒烟测试用占位口播",
    narrationSha256: ZERO_SHA,
    pedagogicalIntent: "验证新增 visualType 能被契约接受并由 SceneRouter 正确分发",
    cues: [],
    visualType,
    payload,
  } as unknown as CompiledScene);

export const A14_SMOKE_SCENES: CompiledScene[] = [
  makeScene(1, "exam-stats", L01_EXAM_STATS, 0, 180),
  makeScene(2, "chapter-timeline", L01_TIMELINE, 180, 180),
  makeScene(3, "four-accounts", L01_FOUR_ACCOUNTS, 360, 180),
  makeScene(4, "three-steps", L01_THREE_STEPS, 540, 180),
];

export const A14Smoke: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#0B1A33" }}>
      {A14_SMOKE_SCENES.map((scene, i) => (
        <Sequence
          key={scene.id}
          from={scene.fromFrame}
          durationInFrames={scene.durationInFrames}
          name={`${scene.visualType} · ${A14_STAGES[i].label}`}
        >
          <SceneRouter scene={scene} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
