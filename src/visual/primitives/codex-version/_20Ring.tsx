import React from 'react';
export type Ring20Config = {
  canvas: {width: number; height: number};
  ring: {
    center: [number, number];
    outerRadius: number;
    thickness: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
  };
  animation: {
    outlineStartFrame: number;
    outlineDurationInFrames: number;
    fillStartFrame: number;
    fillDurationInFrames: number;
  };
};

export type Ring20Timeline = {
  startFrame: number;
  loopDurationInFrames: number;
  loop: boolean;
};

type Ring20Props = {config: Ring20Config; localFrame: number};

const easeInOut = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

const progressAt = (frame: number, start: number, duration: number) =>
  easeInOut(Math.min(1, Math.max(0, (frame - start) / duration)));

const circlePath = (cx: number, cy: number, radius: number) =>
  `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 1 ${cx} ${cy + radius} A ${radius} ${radius} 0 1 1 ${cx} ${cy - radius} Z`;

export const Ring20: React.FC<Ring20Props> = ({config, localFrame}) => {
  const {canvas, ring, animation} = config;
  const outlineProgress = progressAt(
    localFrame,
    animation.outlineStartFrame,
    animation.outlineDurationInFrames,
  );
  const fillProgress = progressAt(
    localFrame,
    animation.fillStartFrame,
    animation.fillDurationInFrames,
  );
  const [cx, cy] = ring.center;
  const innerRadius = ring.outerRadius - ring.thickness;
  const outerPath = circlePath(cx, cy, ring.outerRadius);
  const innerPath = circlePath(cx, cy, innerRadius);

  return (
    <g>
        <path
          d={`${outerPath} ${innerPath}`}
          fill={ring.fill}
          fillRule="evenodd"
          fillOpacity={fillProgress}
        />
        <path
          d={outerPath}
          fill="none"
          stroke={ring.stroke}
          strokeWidth={ring.strokeWidth}
          pathLength={1}
          strokeDasharray={`${outlineProgress} 1`}
        />
        <path
          d={innerPath}
          fill="none"
          stroke={ring.stroke}
          strokeWidth={ring.strokeWidth}
          pathLength={1}
          strokeDasharray={`${outlineProgress} 1`}
        />
      </g>
  );
};
