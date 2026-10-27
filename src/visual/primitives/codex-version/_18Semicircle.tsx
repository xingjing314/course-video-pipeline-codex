import React from 'react';
export type Semicircle18Config = {
  canvas: {width: number; height: number};
  semicircle: {
    center: [number, number];
    radius: number;
    rotationDegrees: number;
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

export type Semicircle18Timeline = {
  startFrame: number;
  loopDurationInFrames: number;
  loop: boolean;
};

type Semicircle18Props = {config: Semicircle18Config; localFrame: number};

const easeInOut = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

const progressAt = (frame: number, start: number, duration: number) =>
  easeInOut(Math.min(1, Math.max(0, (frame - start) / duration)));

export const Semicircle18: React.FC<Semicircle18Props> = ({config, localFrame}) => {
  const __uid = React.useId().replace(/:/g, '');
  const {canvas, semicircle, animation} = config;
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
  const [cx, cy] = semicircle.center;
  const {radius} = semicircle;
  const rotation = `rotate(${semicircle.rotationDegrees} ${cx} ${cy})`;
  const path = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy} Z`;

  return (
    <g>
        <defs>
          <mask
            id={`semicircle18-outline-reveal-${__uid}`}
            maskUnits="userSpaceOnUse"
            x={0}
            y={0}
            width={canvas.width}
            height={canvas.height}
          >
            <rect x={0} y={0} width={canvas.width} height={canvas.height} fill="black" />
            <path
              d={path}
              transform={rotation}
              fill="none"
              stroke="white"
              strokeWidth={semicircle.strokeWidth + 10}
              strokeLinejoin={semicircle.linejoin}
              pathLength={1}
              strokeDasharray={`${outlineProgress} 1`}
            />
          </mask>
        </defs>
        <path
          d={path}
          transform={rotation}
          fill={semicircle.fill}
          fillOpacity={fillProgress}
          stroke={semicircle.stroke}
          strokeWidth={semicircle.strokeWidth}
          strokeLinejoin={semicircle.linejoin}
          mask={`url(#semicircle18-outline-reveal-${__uid})`}
        />
      </g>
  );
};
