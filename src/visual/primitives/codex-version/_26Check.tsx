import React from 'react';
export type Check26Config = {
  canvas: {width: number; height: number};
  check: {
    center: [number, number];
    points: [[number, number], [number, number], [number, number]];
    stroke: string;
    strokeWidth: number;
    linecap: 'butt' | 'round' | 'square';
    linejoin: 'miter' | 'round' | 'bevel';
  };
  animation: {startFrame: number; durationInFrames: number};
};

export type Check26Timeline = {
  startFrame: number;
  loopDurationInFrames: number;
  loop: boolean;
};

type Check26Props = {config: Check26Config; localFrame: number};

const easeInOut = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

export const Check26: React.FC<Check26Props> = ({config, localFrame}) => {
  const __uid = React.useId().replace(/:/g, '');
  const {canvas, check, animation} = config;
  const progress = easeInOut(
    Math.min(1, Math.max(0, (localFrame - animation.startFrame) / animation.durationInFrames)),
  );
  const [cx, cy] = check.center;
  const points = check.points.map(([x, y]) => [cx + x, cy + y]);
  const path = `M ${points.map(([x, y]) => `${x} ${y}`).join(' L ')}`;

  return (
    <g>
        <defs>
          <mask
            id={`check26-stroke-reveal-${__uid}`}
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
              strokeWidth={check.strokeWidth + 10}
              strokeLinecap={check.linecap}
              strokeLinejoin={check.linejoin}
              pathLength={1}
              strokeDasharray={`${progress} 1`}
              opacity={progress > 0 ? 1 : 0}
            />
          </mask>
        </defs>
        <path
          d={path}
          fill="none"
          stroke={check.stroke}
          strokeWidth={check.strokeWidth}
          strokeLinecap={check.linecap}
          strokeLinejoin={check.linejoin}
          mask={`url(#check26-stroke-reveal-${__uid})`}
        />
      </g>
  );
};
