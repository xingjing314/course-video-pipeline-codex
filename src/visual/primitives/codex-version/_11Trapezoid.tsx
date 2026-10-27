import React from 'react';
export type Trapezoid11Config = {
  canvas: {width: number; height: number};
  trapezoid: {
    x: number;
    y: number;
    bottomWidth: number;
    topWidth: number;
    topOffset: number;
    height: number;
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

export type Trapezoid11Timeline = {
  startFrame: number;
  loopDurationInFrames: number;
  loop: boolean;
};

type Trapezoid11Props = {config: Trapezoid11Config; localFrame: number};

const easeInOut = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

const progressAt = (frame: number, start: number, duration: number) =>
  easeInOut(Math.min(1, Math.max(0, (frame - start) / duration)));

export const Trapezoid11: React.FC<Trapezoid11Props> = ({config, localFrame}) => {
  const maskId = `trapezoid11-outline-reveal-${React.useId().replace(/:/g, '')}`;
  const {canvas, trapezoid, animation} = config;
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
  const {x, y, bottomWidth, topWidth, topOffset, height} = trapezoid;
  const path = `M ${x + topOffset} ${y} L ${x + topOffset + topWidth} ${y} L ${x + bottomWidth} ${y + height} L ${x} ${y + height} Z`;

  return (
    <g>
        <defs>
          <mask
            id={maskId}
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
              strokeWidth={trapezoid.strokeWidth + 10}
              strokeLinejoin={trapezoid.linejoin}
              pathLength={1}
              strokeDasharray={`${outlineProgress} 1`}
            />
          </mask>
        </defs>
        <path
          d={path}
          fill={trapezoid.fill}
          fillOpacity={fillProgress}
          stroke={trapezoid.stroke}
          strokeWidth={trapezoid.strokeWidth}
          strokeLinejoin={trapezoid.linejoin}
          mask={`url(#${maskId})`}
        />
      </g>
  );
};
