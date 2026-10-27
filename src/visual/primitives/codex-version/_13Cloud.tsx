import React from 'react';
export type Cloud13Config = {
  canvas: {width: number; height: number};
  cloud: {
    origin: {x: number; y: number};
    scale: number;
    base: {x: number; y: number; width: number; height: number; radius: number};
    circles: Array<{x: number; y: number; radius: number}>;
    fill: string;
    stroke: string;
    strokeWidth: number;
  };
  animation: {
    solidStartFrame: number;
    solidDurationInFrames: number;
  };
};

export type Cloud13Timeline = {
  startFrame: number;
  loopDurationInFrames: number;
  loop: boolean;
};

type Cloud13Props = {config: Cloud13Config; localFrame: number};

const easeInOut = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

const progressAt = (frame: number, start: number, duration: number) =>
  easeInOut(Math.min(1, Math.max(0, (frame - start) / duration)));

export const Cloud13: React.FC<Cloud13Props> = ({config, localFrame}) => {
  const {canvas, cloud, animation} = config;
  const opacity = progressAt(
    localFrame,
    animation.solidStartFrame,
    animation.solidDurationInFrames,
  );

  return (
    <g>
        <g
          transform={`translate(${cloud.origin.x} ${cloud.origin.y}) scale(${cloud.scale})`}
          opacity={opacity}
        >
          {/* Match the original: draw dark shapes, then paper fills to hide overlaps. */}
          <g fill={cloud.stroke} stroke={cloud.stroke} strokeWidth={cloud.strokeWidth}>
            <rect
              x={cloud.base.x}
              y={cloud.base.y}
              width={cloud.base.width}
              height={cloud.base.height}
              rx={cloud.base.radius}
            />
            {cloud.circles.map((circle, index) => (
              <circle key={`outline-${index}`} cx={circle.x} cy={circle.y} r={circle.radius} />
            ))}
          </g>
          <g fill={cloud.fill}>
            <rect
              x={cloud.base.x}
              y={cloud.base.y}
              width={cloud.base.width}
              height={cloud.base.height}
              rx={cloud.base.radius}
            />
            {cloud.circles.map((circle, index) => (
              <circle key={`cover-${index}`} cx={circle.x} cy={circle.y} r={circle.radius} />
            ))}
          </g>
        </g>
      </g>
  );
};
