import React from 'react';
export type Parallelogram15Config = {
  canvas: {width: number; height: number};
  parallelogram: {
    x: number;
    y: number;
    width: number;
    height: number;
    skew: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
    linejoin: 'miter' | 'round' | 'bevel';
  };
  animation: {
    outlineStartFrame: number;
    outlineDurationInFrames: number;
    fillStartFrame: number;
    fillDurationInFrames: number;
  };
};

export type Parallelogram15Timeline = {
  startFrame: number;
  loopDurationInFrames: number;
  loop: boolean;
};

type Parallelogram15Props = {
  config: Parallelogram15Config;
  localFrame: number;
};

const easeInOut = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

const progressAt = (frame: number, start: number, duration: number) =>
  easeInOut(Math.min(1, Math.max(0, (frame - start) / duration)));

export const Parallelogram15: React.FC<Parallelogram15Props> = ({config, localFrame}) => {
  const __uid = React.useId().replace(/:/g, '');
  const {canvas, parallelogram, animation} = config;
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
  const {x, y, width, height, skew} = parallelogram;
  const points = [
    [x + skew, y],
    [x + width, y],
    [x + width - skew, y + height],
    [x, y + height],
  ];
  const polygonPoints = points.map(([px, py]) => `${px},${py}`).join(' ');
  const path = `M ${points.map(([px, py]) => `${px} ${py}`).join(' L ')} Z`;

  return (
    <g>
        <defs>
          <mask
            id={`parallelogram15-outline-reveal-${__uid}`}
            maskUnits="userSpaceOnUse"
            x={0}
            y={0}
            width={canvas.width}
            height={canvas.height}
          >
            <rect x={0} y={0} width={canvas.width} height={canvas.height} fill="black" />
            <path
              d={path}
              fill="none"
              stroke="white"
              strokeWidth={parallelogram.strokeWidth + 10}
              strokeLinejoin={parallelogram.linejoin}
              pathLength={1}
              strokeDasharray={`${outlineProgress} 1`}
            />
          </mask>
        </defs>
        <polygon
          points={polygonPoints}
          fill={parallelogram.fill}
          fillOpacity={fillProgress}
          stroke={parallelogram.stroke}
          strokeWidth={parallelogram.strokeWidth}
          strokeLinejoin={parallelogram.linejoin}
          mask={`url(#parallelogram15-outline-reveal-${__uid})`}
        />
      </g>
  );
};
