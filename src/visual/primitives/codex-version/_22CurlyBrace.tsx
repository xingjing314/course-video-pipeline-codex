import React from 'react';
export type CurlyBrace22Config = {
  canvas: {width: number; height: number};
  brace: {
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

export type CurlyBrace22Timeline = {
  startFrame: number;
  loopDurationInFrames: number;
  loop: boolean;
};

type CurlyBrace22Props = {config: CurlyBrace22Config; localFrame: number};

const easeInOut = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

const progressAt = (frame: number, start: number, duration: number) =>
  easeInOut(Math.min(1, Math.max(0, (frame - start) / duration)));

export const CurlyBrace22: React.FC<CurlyBrace22Props> = ({config, localFrame}) => {
  const {canvas, brace, animation} = config;
  const outlineProgress = progressAt(
    localFrame,
    animation.outlineStartFrame,
    animation.outlineDurationInFrames,
  );
  const {x, y, width, height} = brace;
  const path = [
    `M ${x + width} ${y}`,
    `C ${x + width * 0.575} ${y + height * 0.005} ${x + width * 0.45} ${y + height * 0.075} ${x + width * 0.45} ${y + height * 0.17}`,
    `L ${x + width * 0.45} ${y + height * 0.345}`,
    `C ${x + width * 0.45} ${y + height * 0.435} ${x + width * 0.325} ${y + height * 0.48} ${x} ${y + height * 0.5}`,
    `C ${x + width * 0.325} ${y + height * 0.52} ${x + width * 0.45} ${y + height * 0.565} ${x + width * 0.45} ${y + height * 0.655}`,
    `L ${x + width * 0.45} ${y + height * 0.83}`,
    `C ${x + width * 0.45} ${y + height * 0.925} ${x + width * 0.575} ${y + height * 0.995} ${x + width} ${y + height}`,
  ].join(' ');

  return (
    <g>
        <path
          d={path}
          fill="none"
          stroke={brace.stroke}
          strokeWidth={brace.strokeWidth}
          strokeLinecap={brace.linecap}
          pathLength={1}
          strokeDasharray={`${outlineProgress} 1`}
        />
      </g>
  );
};
