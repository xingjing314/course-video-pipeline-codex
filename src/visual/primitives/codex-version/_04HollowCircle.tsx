import React from 'react';
import type {HollowCircle04Config} from './_04HollowCircleConfig';

type HollowCircle04Props = {
  config: HollowCircle04Config;
  localFrame: number;
};

const easeInOut = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

export const HollowCircle04: React.FC<HollowCircle04Props> = ({config, localFrame}) => {
  const {canvas, circle, animation} = config;
  const progress = Math.min(
    1,
    Math.max(0, (localFrame - animation.outlineStartFrame) / animation.outlineDurationInFrames),
  );
  const outlineProgress = easeInOut(progress);

  // 严格遵守色卡 v1.1 内缩描边规则：外轮廓尺寸严格等于 2 × radius
  const sw = circle.strokeWidth ?? 1.5;
  const sr = Math.max(0, circle.radius - (sw > 0 ? sw / 2 : 0));

  return (
    <g>
        <circle
          cx={circle.cx}
          cy={circle.cy}
          r={sr}
          fill="none"
          stroke={circle.stroke}
          strokeWidth={sw}
          filter={`drop-shadow(${circle.shadow.x}px ${circle.shadow.y}px ${circle.shadow.blur}px ${circle.shadow.color})`}
          pathLength={1}
          strokeDasharray={`${outlineProgress} 1`}
          transform={`rotate(-90 ${circle.cx} ${circle.cy})`}
        />
      </g>
  );
};
