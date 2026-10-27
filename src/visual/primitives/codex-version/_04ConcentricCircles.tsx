import React from 'react';
import type {ConcentricCircles04Config} from './_04ConcentricCirclesConfig';

type ConcentricCircles04Props = {
  config: ConcentricCircles04Config;
  localFrame: number;
};

const easeInOut = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

export const ConcentricCircles04: React.FC<ConcentricCircles04Props> = ({config, localFrame}) => {
  const {canvas, center, circles, style, animation} = config;

  return (
    <g>
        {circles.map((circle, index) => {
          const start = animation.outlineStartFrame + index * animation.staggerFrames;
          const progress = Math.min(
            1,
            Math.max(0, (localFrame - start) / animation.outlineDurationInFrames),
          );
          const outlineProgress = easeInOut(progress);
          const sw = circle.strokeWidth ?? 1.5;
          const sr = Math.max(0, circle.radius - (sw > 0 ? sw / 2 : 0));

          return (
            <circle
              key={circle.radius}
              cx={center.cx}
              cy={center.cy}
              r={sr}
              fill="none"
              stroke={style.stroke}
              strokeWidth={sw}
              filter={`drop-shadow(${style.shadow.x}px ${style.shadow.y}px ${style.shadow.blur}px ${style.shadow.color})`}
              pathLength={1}
              strokeDasharray={`${outlineProgress} 1`}
              transform={`rotate(-90 ${center.cx} ${center.cy})`}
            />
          );
        })}
      </g>
  );
};
