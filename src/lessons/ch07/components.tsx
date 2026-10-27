/**
 * 第 7 章 L01 的章节本地组件。
 *
 * 只有一个 `L01Span`：按 payload 里的段键（"S08-S13" 这种）取出对应的渲染段，
 * 并**自己渲染面包屑**——因为跨多镜的段需要镜号随帧推进，
 * 而 MasterCanvas 默认是"一场景一个镜号"。
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { HeaderBreadcrumb } from "../../visual/shell/HeaderBreadcrumb";
import { L01_SPANS, SHOTS, shotInfo } from "./spans";

export type L01SpanPayload = { span: string; offset: number };

export const L01Span: React.FC<{ payload: unknown }> = ({ payload }) => {
  const { span, offset } = payload as L01SpanPayload;
  const frame = useCurrentFrame();
  const { shot, order } = shotInfo(offset + frame);
  const Span = L01_SPANS[span];

  if (!Span) {
    throw new Error(`L01Span: 未知段键「${span}」，可选值：${Object.keys(L01_SPANS).join(", ")}`);
  }

  return (
    <AbsoluteFill>
      <HeaderBreadcrumb
        lessonId="ch07-L01"
        lessonTitle="第 7 章 项目立项管理 · L01"
        sceneId={shot.id}
        sceneOrder={order}
        totalScenes={SHOTS.length}
        segmentTitle={shot.segment}
      />
      <Span />
    </AbsoluteFill>
  );
};
