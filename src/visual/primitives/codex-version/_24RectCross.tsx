import React from 'react';
export type RectCross24Config = {
  canvas: {width: number; height: number};
  crossRect: {
    center: [number, number];
    armLength: number;
    armWidth: number;
    rotationDegrees: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
  };
  animation: {
    firstRectStartFrame: number;
    firstRectDurationInFrames: number;
    secondRectStartFrame: number;
    secondRectDurationInFrames: number;
  };
};

export type RectCross24Timeline = {
  startFrame: number;
  loopDurationInFrames: number;
  loop: boolean;
};

type RectCross24Props = {config: RectCross24Config; localFrame: number};

const easeInOut = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

const progressAt = (frame: number, start: number, duration: number) =>
  easeInOut(Math.min(1, Math.max(0, (frame - start) / duration)));

export const RectCross24: React.FC<RectCross24Props> = ({config, localFrame}) => {
  const {canvas, crossRect, animation} = config;
  const [cx, cy] = crossRect.center;
  const firstProgress = progressAt(
    localFrame,
    animation.firstRectStartFrame,
    animation.firstRectDurationInFrames,
  );
  const secondProgress = progressAt(
    localFrame,
    animation.secondRectStartFrame,
    animation.secondRectDurationInFrames,
  );
  const rectX = cx - crossRect.armLength;
  const rectY = cy - crossRect.armWidth / 2;
  const rectWidth = crossRect.armLength * 2;
  const transformFor = (degrees: number) => `rotate(${degrees} ${cx} ${cy})`;

  return (
    <g>
        <rect
          x={rectX}
          y={rectY}
          width={rectWidth}
          height={crossRect.armWidth}
          transform={transformFor(crossRect.rotationDegrees)}
          fill={crossRect.fill}
          stroke={crossRect.stroke}
          strokeWidth={crossRect.strokeWidth}
          opacity={firstProgress}
        />
        <rect
          x={rectX}
          y={rectY}
          width={rectWidth}
          height={crossRect.armWidth}
          transform={transformFor(-crossRect.rotationDegrees)}
          fill={crossRect.fill}
          stroke={crossRect.stroke}
          strokeWidth={crossRect.strokeWidth}
          opacity={secondProgress}
        />
      </g>
  );
};
