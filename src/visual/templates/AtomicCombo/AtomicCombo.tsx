import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { AtomicComboPayload } from "../../../../contracts/visual-props.schema";
import { BASE_COLORS, resolveTone, rgba } from "../../tokens/colorCard";
import { PRIMITIVE_COMPONENTS } from "../../primitives/registry";

/**
 * 原子图形自由组合（AtomicCombo）。
 *
 * 所有图元组件输出纯 `<g>`，本组件提供唯一外层 svg 画布；同屏多实例的 SVG id
 * 由各组件内部 useId() 隔离。标题、副标题与图形标签属于教学文字，不随字幕开关隐藏。
 */
export const AtomicCombo: React.FC<{ payload: AtomicComboPayload }> = ({ payload }) => {
  const frame = useCurrentFrame();
  // 前 24 帧执行轮廓/填充动画，之后按 velocity 平移；运动只影响图形，不影响教学文字。
  const driveFrames = Math.max(0, frame - 24);
  const canvas = payload.items[0]?.config.canvas ?? { width: 1920, height: 1080 };

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      <div
        style={{
          position: "absolute",
          top: 44,
          left: 96,
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          maxWidth: 1600,
        }}
      >
        <div style={{ fontSize: 46, fontWeight: 700, color: BASE_COLORS.text, letterSpacing: 1.4 }}>{payload.title}</div>
        {payload.subtitle ? (
          <div style={{ fontSize: 23, color: BASE_COLORS.text2, letterSpacing: 0.6 }}>{payload.subtitle}</div>
        ) : null}
      </div>

      <svg
        width={canvas.width}
        height={canvas.height}
        viewBox={`0 0 ${canvas.width} ${canvas.height}`}
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        {payload.items.map((item) => {
          const Component = PRIMITIVE_COMPONENTS[item.primitive];
          if (!Component) return null;
          const dx = (item.velocityX ?? 0) * driveFrames;
          const dy = (item.velocityY ?? 0) * driveFrames;
          return (
            <g key={item.id} transform={`translate(${dx} ${dy})`} data-primitive={item.primitive} data-instance={item.id}>
              <Component config={item.config as never} localFrame={frame} />
            </g>
          );
        })}
      </svg>

      {payload.labels.map((label, index) => {
        const tone = resolveTone(label.tone);
        return (
          <div
            key={`${label.text}-${index}`}
            style={{
              position: "absolute",
              // 标签按内容自适应宽度并以 x 居中（r412：固定 180px 使“修复成本越低”被折行）。
              left: label.x,
              top: label.y,
              transform: "translateX(-50%)",
              minWidth: 120,
              maxWidth: 640,
              whiteSpace: "nowrap",
              textAlign: "center",
              fontSize: label.fontSize ?? 26,
              fontWeight: 600,
              color: BASE_COLORS.text,
              background: rgba(tone.rgb, 0.12),
              border: `1px solid ${rgba(tone.rgb, 0.38)}`,
              borderRadius: 10,
              padding: "6px 18px",
              boxSizing: "border-box",
            }}
          >
            {label.text}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
