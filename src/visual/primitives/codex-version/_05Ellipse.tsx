import React from 'react';
import type {Ellipse05Config} from './_05EllipseConfig';

type Ellipse05Props = {
  config: Ellipse05Config;
  localFrame: number;
};

const easeInOut = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

const easeOut = (value: number) => 1 - Math.pow(1 - value, 3);

const progress = (frame: number, start: number, duration: number, easing: (t: number) => number) => {
  const value = Math.min(1, Math.max(0, (frame - start) / duration));
  return easing(value);
};

export const Ellipse05: React.FC<Ellipse05Props> = ({config, localFrame}) => {
  const {canvas, ellipse, animation} = config;
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
  const sw = ellipse.strokeWidth ?? 1.5;
  const srx = Math.max(0, ellipse.radiusX - (sw > 0 ? sw / 2 : 0));
  const sry = Math.max(0, ellipse.radiusY - (sw > 0 ? sw / 2 : 0));

  return (
    <g>
        <ellipse
          cx={ellipse.cx}
          cy={ellipse.cy}
          rx={ellipse.radiusX}
          ry={ellipse.radiusY}
          fill={ellipse.fill}
          opacity={fillOpacity}
          filter={`drop-shadow(${ellipse.shadow.x}px ${ellipse.shadow.y}px ${ellipse.shadow.blur}px ${ellipse.shadow.color})`}
        />
        {sw > 0 && ellipse.stroke !== 'none' && (
          <ellipse
            cx={ellipse.cx}
            cy={ellipse.cy}
            rx={srx}
            ry={sry}
            fill="none"
            stroke={ellipse.stroke}
            strokeWidth={sw}
            pathLength={1}
            strokeDasharray={`${outlineProgress} 1`}
          />
        )}
      </g>
  );
};
