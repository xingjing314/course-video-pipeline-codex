import React from 'react';
export type SquareBracket22Config = {
  canvas: {width: number; height: number};
  bracket: {
    x: number;
    y: number;
    width: number;
    height: number;
    stroke: string;
    strokeWidth: number;
    linecap: 'butt' | 'round' | 'square';
    linejoin: 'miter' | 'round' | 'bevel';
  };
  animation: {
    outlineStartFrame: number;
    outlineDurationInFrames: number;
  };
};

export type SquareBracket22Timeline = {
  startFrame: number;
  loopDurationInFrames: number;
  loop: boolean;
};

type SquareBracket22Props = {config: SquareBracket22Config; localFrame: number};

const easeInOut = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

const progressAt = (frame: number, start: number, duration: number) =>
  easeInOut(Math.min(1, Math.max(0, (frame - start) / duration)));

export const SquareBracket22: React.FC<SquareBracket22Props> = ({config, localFrame}) => {
  const {canvas, bracket, animation} = config;
  const outlineProgress = progressAt(
    localFrame,
    animation.outlineStartFrame,
    animation.outlineDurationInFrames,
  );
  const {x, y, width, height} = bracket;
  const path = `M ${x + width} ${y} L ${x} ${y} L ${x} ${y + height} L ${x + width} ${y + height}`;

  return (
    <g>
        <path
          d={path}
          fill="none"
          stroke={bracket.stroke}
          strokeWidth={bracket.strokeWidth}
          strokeLinecap={bracket.linecap}
          strokeLinejoin={bracket.linejoin}
          pathLength={1}
          strokeDasharray={`${outlineProgress} 1`}
        />
      </g>
  );
};
