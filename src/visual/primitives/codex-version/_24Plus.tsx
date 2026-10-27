import React from 'react';
export type Plus24Config = {
  canvas: {width: number; height: number};
  plus: {
    center: [number, number];
    armLength: number;
    stroke: string;
    strokeWidth: number;
    linecap: 'butt' | 'round' | 'square';
  };
  animation: {
    horizontalStartFrame: number;
    horizontalDurationInFrames: number;
    verticalStartFrame: number;
    verticalDurationInFrames: number;
  };
};

export type Plus24Timeline = {
  startFrame: number;
  loopDurationInFrames: number;
  loop: boolean;
};

type Plus24Props = {config: Plus24Config; localFrame: number};

const easeInOut = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

const progressAt = (frame: number, start: number, duration: number) =>
  easeInOut(Math.min(1, Math.max(0, (frame - start) / duration)));

export const Plus24: React.FC<Plus24Props> = ({config, localFrame}) => {
  const __uid = React.useId().replace(/:/g, '');
  const {canvas, plus, animation} = config;
  const horizontalProgress = progressAt(
    localFrame,
    animation.horizontalStartFrame,
    animation.horizontalDurationInFrames,
  );
  const verticalProgress = progressAt(
    localFrame,
    animation.verticalStartFrame,
    animation.verticalDurationInFrames,
  );
  const [cx, cy] = plus.center;
  const horizontalPath = `M ${cx - plus.armLength} ${cy} L ${cx + plus.armLength} ${cy}`;
  const verticalPath = `M ${cx} ${cy - plus.armLength} L ${cx} ${cy + plus.armLength}`;

  return (
    <g>
        <defs>
          <mask
            id={`plus24-horizontal-reveal-${__uid}`}
            maskUnits="userSpaceOnUse"
            x={0}
            y={0}
            width={canvas.width}
            height={canvas.height}
          >
            <rect x={0} y={0} width={canvas.width} height={canvas.height} fill="black" />
            <path
              d={horizontalPath}
              fill="none"
              stroke="white"
              strokeWidth={plus.strokeWidth + 10}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={`${horizontalProgress} 1`}
              opacity={horizontalProgress > 0 ? 1 : 0}
            />
          </mask>
          <mask
            id={`plus24-vertical-reveal-${__uid}`}
            maskUnits="userSpaceOnUse"
            x={0}
            y={0}
            width={canvas.width}
            height={canvas.height}
          >
            <rect x={0} y={0} width={canvas.width} height={canvas.height} fill="black" />
            <path
              d={verticalPath}
              fill="none"
              stroke="white"
              strokeWidth={plus.strokeWidth + 10}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={`${verticalProgress} 1`}
              opacity={verticalProgress > 0 ? 1 : 0}
            />
          </mask>
        </defs>
        <line
          x1={cx - plus.armLength}
          y1={cy}
          x2={cx + plus.armLength}
          y2={cy}
          stroke={plus.stroke}
          strokeWidth={plus.strokeWidth}
          strokeLinecap={plus.linecap}
          mask={`url(#plus24-horizontal-reveal-${__uid})`}
        />
        <line
          x1={cx}
          y1={cy - plus.armLength}
          x2={cx}
          y2={cy + plus.armLength}
          stroke={plus.stroke}
          strokeWidth={plus.strokeWidth}
          strokeLinecap={plus.linecap}
          mask={`url(#plus24-vertical-reveal-${__uid})`}
        />
      </g>
  );
};
