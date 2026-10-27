import React from 'react';
export type StraightLine06Config = {
  canvas: {width: number; height: number};
  line: {
    from: [number, number];
    to: [number, number];
    stroke: string;
    strokeWidth: number;
    linecap: 'butt' | 'round' | 'square';
  };
  animation: {startFrame: number; durationInFrames: number};
};

export type Line06Timeline = {
  startFrame: number;
  loopDurationInFrames: number;
  loop: boolean;
};

type StraightLine06Props = {config: StraightLine06Config; localFrame: number};

const easeInOut = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

export const StraightLine06: React.FC<StraightLine06Props> = ({config, localFrame}) => {
  const maskId = `line06-straight-reveal-${React.useId().replace(/:/g, '')}`;
  const {canvas, line, animation} = config;
  const rawProgress = Math.min(
    1,
    Math.max(0, (localFrame - animation.startFrame) / animation.durationInFrames),
  );
  const progress = easeInOut(rawProgress);
  const d = `M ${line.from[0]} ${line.from[1]} L ${line.to[0]} ${line.to[1]}`;

  return (
    <g>
        <defs>
          <mask id={maskId} maskUnits="userSpaceOnUse" x={0} y={0} width={canvas.width} height={canvas.height}>
            <rect x={0} y={0} width={canvas.width} height={canvas.height} fill="black" />
            <path
              d={d}
              fill="none"
              stroke="white"
              strokeWidth={line.strokeWidth + 10}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={`${progress} 1`}
            />
          </mask>
        </defs>
        <line
          x1={line.from[0]}
          y1={line.from[1]}
          x2={line.to[0]}
          y2={line.to[1]}
          stroke={line.stroke}
          strokeWidth={line.strokeWidth}
          strokeLinecap={line.linecap}
          mask={`url(#${maskId})`}
        />
      </g>
  );
};
