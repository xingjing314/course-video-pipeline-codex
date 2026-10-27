import React from 'react';
export type Triangle16Config = {
  canvas: {width: number; height: number};
  triangle: {
    points: [[number, number], [number, number], [number, number]];
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

export type Triangle16Timeline = {
  startFrame: number;
  loopDurationInFrames: number;
  loop: boolean;
};

type Triangle16Props = {config: Triangle16Config; localFrame: number};

const easeInOut = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

const progressAt = (frame: number, start: number, duration: number) =>
  easeInOut(Math.min(1, Math.max(0, (frame - start) / duration)));

export const Triangle16: React.FC<Triangle16Props> = ({config, localFrame}) => {
  const maskId = `triangle16-outline-reveal-${React.useId().replace(/:/g, '')}`;
  const {canvas, triangle, animation} = config;
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
  const polygonPoints = triangle.points.map(([x, y]) => `${x},${y}`).join(' ');
  const path = `M ${triangle.points.map(([x, y]) => `${x} ${y}`).join(' L ')} Z`;

  return (
    <g>
        <defs>
          <mask
            id={maskId}
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
              strokeWidth={triangle.strokeWidth + 10}
              strokeLinejoin={triangle.linejoin}
              pathLength={1}
              strokeDasharray={`${outlineProgress} 1`}
            />
          </mask>
        </defs>
        <polygon
          points={polygonPoints}
          fill={triangle.fill}
          fillOpacity={fillProgress}
          stroke={triangle.stroke}
          strokeWidth={triangle.strokeWidth}
          strokeLinejoin={triangle.linejoin}
          mask={`url(#${maskId})`}
        />
      </g>
  );
};
