import React from 'react';
import type {SolidCircle04Config} from './_04SolidCircleConfig';

type SolidCircle04Props = {
  config: SolidCircle04Config;
  localFrame: number;
};

const easeInOut = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

const easeOut = (value: number) => 1 - Math.pow(1 - value, 3);

const progress = (frame: number, start: number, duration: number, easing: (t: number) => number) => {
  const value = Math.min(1, Math.max(0, (frame - start) / duration));
  return easing(value);
};

export const SolidCircle04: React.FC<SolidCircle04Props> = ({config, localFrame}) => {
  const {canvas, circle, animation} = config;
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

  // 严格遵守色卡 v1.1 内缩描边规则：外轮廓尺寸严格等于 2 × radius
  const sw = circle.strokeWidth ?? 1.5;
  const sr = Math.max(0, circle.radius - (sw > 0 ? sw / 2 : 0));

  return (
    <g>
        <circle
          cx={circle.cx}
          cy={circle.cy}
          r={circle.radius}
          fill={circle.fill}
          opacity={fillOpacity}
          filter={`drop-shadow(${circle.shadow.x}px ${circle.shadow.y}px ${circle.shadow.blur}px ${circle.shadow.color})`}
        />
        {sw > 0 && circle.stroke !== 'none' && (
          <circle
            cx={circle.cx}
            cy={circle.cy}
            r={sr}
            fill="none"
            stroke={circle.stroke}
            strokeWidth={sw}
            pathLength={1}
            strokeDasharray={`${outlineProgress} 1`}
            transform={`rotate(-90 ${circle.cx} ${circle.cy})`}
          />
        )}
      </g>
  );
};
