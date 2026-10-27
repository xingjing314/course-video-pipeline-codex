import React from 'react';
export type RoundBracket22Config = {
  canvas: {width: number; height: number};
  roundBracket: {
    x: number;
    y: number;
    width: number;
    height: number;
    stroke: string;
    strokeWidth: number;
    linecap: 'butt' | 'round' | 'square';
  };
  animation: {
    outlineStartFrame: number;
    outlineDurationInFrames: number;
  };
};

export type RoundBracket22Timeline = {
  startFrame: number;
  loopDurationInFrames: number;
  loop: boolean;
};

type RoundBracket22Props = {config: RoundBracket22Config; localFrame: number};

const easeInOut = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

const progressAt = (frame: number, start: number, duration: number) =>
  easeInOut(Math.min(1, Math.max(0, (frame - start) / duration)));

export const RoundBracket22: React.FC<RoundBracket22Props> = ({config, localFrame}) => {
  const {canvas, roundBracket, animation} = config;
  const outlineProgress = progressAt(
    localFrame,
    animation.outlineStartFrame,
    animation.outlineDurationInFrames,
  );
  const {x, y, width, height} = roundBracket;
  const path = `M ${x + width} ${y} C ${x} ${y + height * 0.18} ${x} ${y + height * 0.82} ${x + width} ${y + height}`;

  return (
    <g>
        <path
          d={path}
          fill="none"
          stroke={roundBracket.stroke}
          strokeWidth={roundBracket.strokeWidth}
          strokeLinecap={roundBracket.linecap}
          pathLength={1}
          strokeDasharray={`${outlineProgress} 1`}
        />
      </g>
  );
};
