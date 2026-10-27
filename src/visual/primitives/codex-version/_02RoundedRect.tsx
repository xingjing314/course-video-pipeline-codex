import React from 'react';
import type {RoundedRect02Config} from './_02RoundedRectConfig';

type RoundedRect02Props = {
  config: RoundedRect02Config;
  localFrame: number;
};

const easeInOut = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

const easeOut = (value: number) => 1 - Math.pow(1 - value, 3);

const progress = (frame: number, start: number, duration: number, easing: (t: number) => number) => {
  const value = Math.min(1, Math.max(0, (frame - start) / duration));
  return easing(value);
};

export const RoundedRect02: React.FC<RoundedRect02Props> = ({config, localFrame}) => {
  const {canvas, rect, animation} = config;
  const outlineProgress = progress(
    localFrame,
    animation.outlineStartFrame,
    animation.outlineDurationInFrames,
    easeInOut,
  );
  const fillOpacity = progress(
    localFrame,
    animation.fillStartFrame,
    animation.fillDurationInFrames,
    easeOut,
  );

  // 严格遵守色卡 v1.1 内缩描边规则：外轮廓尺寸严格等于 w × h
  const sw = rect.strokeWidth ?? 1.5;
  const inset = sw > 0 ? sw / 2 : 0;
  const sx = rect.x + inset;
  const sy = rect.y + inset;
  const swidth = Math.max(0, rect.width - sw);
  const sheight = Math.max(0, rect.height - sw);

  return (
    <g>
        <rect
          x={rect.x}
          y={rect.y}
          width={rect.width}
          height={rect.height}
          rx={rect.radius}
          fill={rect.fill}
          opacity={fillOpacity}
          filter={`drop-shadow(${rect.shadow.x}px ${rect.shadow.y}px ${rect.shadow.blur}px ${rect.shadow.color})`}
        />
        {sw > 0 && rect.stroke !== 'none' && (
          <rect
            x={sx}
            y={sy}
            width={swidth}
            height={sheight}
            rx={Math.max(0, rect.radius - inset)}
            fill="none"
            stroke={rect.stroke}
            strokeWidth={sw}
            strokeLinejoin="miter"
            pathLength={1}
            strokeDasharray={`${outlineProgress} 1`}
          />
        )}
      </g>
  );
};
