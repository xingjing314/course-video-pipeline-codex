/**
 * A5 / A8 / A9 冒烟测试：验证状态机资产能被契约接受、并由 SceneRouter 正确分发。
 *
 * 与 A14Smoke 同一套做法：payload 先过 CompiledSceneSchema.parse()，再交给路由。
 * 这里每个场景取一个"有内容的中间状态"，确保组件不是渲染空壳。
 */
import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { CompiledSceneSchema, type CompiledScene } from "../../../contracts/compiled-lesson.schema";
import { SceneRouter } from "../templates/SceneRouter";

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
    segmentTitle: "冒烟测试 · 状态机资产",
    sceneTitle: `${visualType} 冒烟`,
    order,
    startMs: Math.round(fromFrame * (1000 / 30)),
    endMs: Math.round((fromFrame + dur) * (1000 / 30)),
    durationMs: Math.round(dur * (1000 / 30)),
    fromFrame,
    durationInFrames: dur,
    narration: "冒烟测试用占位口播",
    narrationSha256: ZERO_SHA,
    pedagogicalIntent: "验证 gate-track / id-card / mnemonic-card 能被契约接受并由 SceneRouter 分发",
    cues: [],
    visualType,
    payload,
  } as unknown as CompiledScene);

/** 演示用的"章节组件"：证明 chapter-local 能挂进来渲染。 */
const DemoChapterCard: React.FC<{ payload: unknown }> = ({ payload }) => {
  const data = (payload ?? {}) as { title?: string; bullets?: string[] };
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 18 }}>
      <div style={{ fontSize: 56, fontWeight: 800, color: "#F2F5FA" }}>{data.title ?? "章节组件"}</div>
      {(data.bullets ?? []).map((b) => (
        <div key={b} style={{ fontSize: 28, color: "#8FB8D9" }}>
          · {b}
        </div>
      ))}
    </AbsoluteFill>
  );
};

const DEMO_CHAPTER = {
  lessonId: "demo",
  components: { "demo-card": DemoChapterCard },
};

export const A59_SMOKE_SCENES: CompiledScene[] = [
  makeScene(1, "gate-track", { stage: 4, beatFrames: 48 }, 0, 180),
  makeScene(2, "id-card", { stage: 2 }, 180, 180),
  makeScene(3, "mnemonic-card", { stage: 4 }, 360, 180),
  makeScene(4, "gate-track", { stage: 6 }, 540, 180),
  makeScene(
    5,
    "chapter-local",
    { key: "demo-card", data: { title: "章节组件 · 走的是两级查找", bullets: ["通用 20 类先查", "查不到再查本章表"] } },
    720,
    180,
  ),
];

export const A59Smoke: React.FC = () => (
  <AbsoluteFill style={{ background: "#0B1A33" }}>
    {A59_SMOKE_SCENES.map((scene) => (
      <Sequence
        key={scene.id}
        from={scene.fromFrame}
        durationInFrames={scene.durationInFrames}
        name={`${scene.visualType} · ${scene.id}`}
      >
        <SceneRouter scene={scene} chapter={DEMO_CHAPTER} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
