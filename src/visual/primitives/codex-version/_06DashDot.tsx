import React from 'react';
export type DashDot06Config = {
  canvas: {width: number; height: number};
  style: {stroke: string; strokeWidth: number};
  lines: Array<{
    id: string;
    points: Array<[number, number]>;
    dashArray: number[];
    linecap: 'butt' | 'round' | 'square';
    startFrame: number;
  }>;
  animation: {durationInFrames: number};
};

type DashDot06Props = {config: DashDot06Config; localFrame: number};

const easeInOut = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

export const DashDot06: React.FC<DashDot06Props> = ({config, localFrame}) => {
  const __uid = React.useId().replace(/:/g, '');
  const {canvas, style, lines, animation} = config;

  return (
    <g>
        <defs>
          {lines.map((line) => {
            const rawProgress = Math.min(
              1,
              Math.max(0, (localFrame - line.startFrame) / animation.durationInFrames),
            );
            const progress = easeInOut(rawProgress);
            const d = `M ${line.points.map(([x, y]) => `${x} ${y}`).join(' L ')}`;

            return (
              <mask
                key={line.id}
                id={`line06-style-reveal-${line.id}-${__uid}`}
                maskUnits="userSpaceOnUse"
                x={0}
                y={0}
                width={canvas.width}
                height={canvas.height}
              >
                <rect x={0} y={0} width={canvas.width} height={canvas.height} fill="black" />
                <path
                  d={d}
                  fill="none"
                  stroke="white"
                  strokeWidth={style.strokeWidth + 10}
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray={`${progress} 1`}
                />
              </mask>
            );
          })}
        </defs>
        {lines.map((line) => (
          <line
            key={line.id}
            x1={line.points[0][0]}
            y1={line.points[0][1]}
            x2={line.points[1][0]}
            y2={line.points[1][1]}
            fill="none"
            stroke={style.stroke}
            strokeWidth={style.strokeWidth}
            strokeDasharray={line.dashArray.join(' ')}
            strokeLinecap={line.linecap}
            mask={`url(#line06-style-reveal-${line.id}-${__uid})`}
          />
        ))}
      </g>
  );
};
