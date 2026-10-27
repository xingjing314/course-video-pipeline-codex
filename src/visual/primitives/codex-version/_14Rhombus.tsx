import React from 'react';
export type Rhombus14Config = {
  canvas: {width: number; height: number};
  rhombus: {
    center: [number, number];
    diagonalWidth: number;
    diagonalHeight: number;
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

export type Rhombus14Timeline = {
  startFrame: number;
  loopDurationInFrames: number;
  loop: boolean;
};

type Rhombus14Props = {config: Rhombus14Config; localFrame: number};

const easeInOut = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

const progressAt = (frame: number, start: number, duration: number) =>
  easeInOut(Math.min(1, Math.max(0, (frame - start) / duration)));

export const Rhombus14: React.FC<Rhombus14Props> = ({config, localFrame}) => {
  const __uid = React.useId().replace(/:/g, '');
  const {canvas, rhombus, animation} = config;
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
  const [cx, cy] = rhombus.center;
  const halfWidth = rhombus.diagonalWidth / 2;
  const halfHeight = rhombus.diagonalHeight / 2;
  const points = [
    [cx - halfWidth, cy],
    [cx, cy - halfHeight],
    [cx + halfWidth, cy],
    [cx, cy + halfHeight],
  ]
    .map(([x, y]) => `${x},${y}`)
    .join(' ');
  const path = `M ${cx - halfWidth} ${cy} L ${cx} ${cy - halfHeight} L ${cx + halfWidth} ${cy} L ${cx} ${cy + halfHeight} Z`;

  return (
    <g>
        <defs>
          <mask
            id={`rhombus14-outline-reveal-${__uid}`}
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
              strokeWidth={rhombus.strokeWidth + 10}
              strokeLinejoin={rhombus.linejoin}
              pathLength={1}
              strokeDasharray={`${outlineProgress} 1`}
            />
          </mask>
        </defs>
        <polygon
          points={points}
          fill={rhombus.fill}
          fillOpacity={fillProgress}
          stroke={rhombus.stroke}
          strokeWidth={rhombus.strokeWidth}
          strokeLinejoin={rhombus.linejoin}
          mask={`url(#rhombus14-outline-reveal-${__uid})`}
        />
      </g>
  );
};
