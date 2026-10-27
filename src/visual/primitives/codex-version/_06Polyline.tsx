import React from 'react';
export type Polyline06Config = {
  canvas: {width: number; height: number};
  polyline: {
    points: Array<[number, number]>;
    stroke: string;
    strokeWidth: number;
    linecap: 'butt' | 'round' | 'square';
    linejoin: 'miter' | 'round' | 'bevel';
  };
  animation: {startFrame: number; durationInFrames: number};
};

type Polyline06Props = {config: Polyline06Config; localFrame: number};

const easeInOut = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

export const Polyline06: React.FC<Polyline06Props> = ({config, localFrame}) => {
  const __uid = React.useId().replace(/:/g, '');
  const {canvas, polyline, animation} = config;
  const rawProgress = Math.min(
    1,
    Math.max(0, (localFrame - animation.startFrame) / animation.durationInFrames),
  );
  const progress = easeInOut(rawProgress);
  const points = polyline.points.map(([x, y]) => `${x},${y}`).join(' ');
  const d = `M ${polyline.points.map(([x, y]) => `${x} ${y}`).join(' L ')}`;

  return (
    <g>
        <defs>
          <mask id={`line06-polyline-reveal-${__uid}`} maskUnits="userSpaceOnUse" x={0} y={0} width={canvas.width} height={canvas.height}>
            <rect x={0} y={0} width={canvas.width} height={canvas.height} fill="black" />
            <path
              d={d}
              fill="none"
              stroke="white"
              strokeWidth={polyline.strokeWidth + 10}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray={`${progress} 1`}
            />
          </mask>
        </defs>
        <polyline
          points={points}
          fill="none"
          stroke={polyline.stroke}
          strokeWidth={polyline.strokeWidth}
          strokeLinecap={polyline.linecap}
          strokeLinejoin={polyline.linejoin}
          mask={`url(#line06-polyline-reveal-${__uid})`}
        />
      </g>
  );
};
