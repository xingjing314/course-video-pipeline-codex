import React from 'react';
export type Cross24Config = {
  canvas: {width: number; height: number};
  cross: {
    center: [number, number];
    armLength: number;
    rotationDegrees: number;
    stroke: string;
    strokeWidth: number;
    linecap: 'butt' | 'round' | 'square';
  };
  animation: {
    firstLineStartFrame: number;
    firstLineDurationInFrames: number;
    secondLineStartFrame: number;
    secondLineDurationInFrames: number;
  };
};

export type Cross24Timeline = {
  startFrame: number;
  loopDurationInFrames: number;
  loop: boolean;
};

type Cross24Props = {config: Cross24Config; localFrame: number};

const easeInOut = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

const progressAt = (frame: number, start: number, duration: number) =>
  easeInOut(Math.min(1, Math.max(0, (frame - start) / duration)));

export const Cross24: React.FC<Cross24Props> = ({config, localFrame}) => {
  const __uid = React.useId().replace(/:/g, '');
  const {canvas, cross, animation} = config;
  const firstProgress = progressAt(
    localFrame,
    animation.firstLineStartFrame,
    animation.firstLineDurationInFrames,
  );
  const secondProgress = progressAt(
    localFrame,
    animation.secondLineStartFrame,
    animation.secondLineDurationInFrames,
  );
  const [cx, cy] = cross.center;
  const angle = (cross.rotationDegrees * Math.PI) / 180;
  const vectors = [
    [Math.cos(angle), Math.sin(angle)],
    [-Math.sin(angle), Math.cos(angle)],
  ] as const;
  const endpoints = vectors.map(([vx, vy]) => [
    [cx - cross.armLength * vx, cy - cross.armLength * vy],
    [cx + cross.armLength * vx, cy + cross.armLength * vy],
  ]);
  const [first, second] = endpoints;
  const firstPath = `M ${first[0][0]} ${first[0][1]} L ${first[1][0]} ${first[1][1]}`;
  const secondPath = `M ${second[0][0]} ${second[0][1]} L ${second[1][0]} ${second[1][1]}`;

  return (
    <g>
        <defs>
          <mask
            id={`cross24-first-line-reveal-${__uid}`}
            maskUnits="userSpaceOnUse"
            x={0}
            y={0}
            width={canvas.width}
            height={canvas.height}
          >
            <rect x={0} y={0} width={canvas.width} height={canvas.height} fill="black" />
            <path
              d={firstPath}
              fill="none"
              stroke="white"
              strokeWidth={cross.strokeWidth + 10}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={`${firstProgress} 1`}
              opacity={firstProgress > 0 ? 1 : 0}
            />
          </mask>
          <mask
            id={`cross24-second-line-reveal-${__uid}`}
            maskUnits="userSpaceOnUse"
            x={0}
            y={0}
            width={canvas.width}
            height={canvas.height}
          >
            <rect x={0} y={0} width={canvas.width} height={canvas.height} fill="black" />
            <path
              d={secondPath}
              fill="none"
              stroke="white"
              strokeWidth={cross.strokeWidth + 10}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={`${secondProgress} 1`}
              opacity={secondProgress > 0 ? 1 : 0}
            />
          </mask>
        </defs>
        <line
          x1={first[0][0]}
          y1={first[0][1]}
          x2={first[1][0]}
          y2={first[1][1]}
          stroke={cross.stroke}
          strokeWidth={cross.strokeWidth}
          strokeLinecap={cross.linecap}
          mask={`url(#cross24-first-line-reveal-${__uid})`}
        />
        <line
          x1={second[0][0]}
          y1={second[0][1]}
          x2={second[1][0]}
          y2={second[1][1]}
          stroke={cross.stroke}
          strokeWidth={cross.strokeWidth}
          strokeLinecap={cross.linecap}
          mask={`url(#cross24-second-line-reveal-${__uid})`}
        />
      </g>
  );
};
