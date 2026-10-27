import React from 'react';
export type RectCheck26Config = {
  canvas: {width: number; height: number};
  checkRect: {
    center: [number, number];
    points: [[number, number], [number, number], [number, number]];
    armWidth: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
  };
  animation: {
    firstRectStartFrame: number;
    firstRectDurationInFrames: number;
    fanStartFrame: number;
    fanDurationInFrames: number;
    secondRectStartFrame: number;
    secondRectDurationInFrames: number;
  };
};

export type RectCheck26Timeline = {
  startFrame: number;
  loopDurationInFrames: number;
  loop: boolean;
};

type RectCheck26Props = {config: RectCheck26Config; localFrame: number};

const easeInOut = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

const progressAt = (frame: number, start: number, duration: number) =>
  easeInOut(Math.min(1, Math.max(0, (frame - start) / duration)));

const rectFromSegment = (
  from: [number, number],
  to: [number, number],
  width: number,
) => {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const length = Math.hypot(dx, dy);
  return {
    x: (from[0] + to[0]) / 2 - length / 2,
    y: (from[1] + to[1]) / 2 - width / 2,
    centerX: (from[0] + to[0]) / 2,
    centerY: (from[1] + to[1]) / 2,
    length,
    rotationDegrees: (Math.atan2(dy, dx) * 180) / Math.PI,
  };
};

const fanPathAt = (
  corner: [number, number],
  first: [number, number],
  second: [number, number],
  radius: number,
) => {
  const firstLength = Math.hypot(first[0], first[1]);
  const secondLength = Math.hypot(second[0], second[1]);
  const firstUnit: [number, number] = [first[0] / firstLength, first[1] / firstLength];
  const secondUnit: [number, number] = [second[0] / secondLength, second[1] / secondLength];
  const turn = firstUnit[0] * secondUnit[1] - firstUnit[1] * secondUnit[0];
  const outsideSign = turn < 0 ? 1 : -1;
  const firstNormal: [number, number] = [
    -firstUnit[1] * outsideSign,
    firstUnit[0] * outsideSign,
  ];
  const secondNormal: [number, number] = [
    -secondUnit[1] * outsideSign,
    secondUnit[0] * outsideSign,
  ];
  const start = [corner[0] + firstNormal[0] * radius, corner[1] + firstNormal[1] * radius];
  const end = [corner[0] + secondNormal[0] * radius, corner[1] + secondNormal[1] * radius];
  const sweepFlag = turn < 0 ? 0 : 1;
  return `M ${corner[0]} ${corner[1]} L ${start[0]} ${start[1]} A ${radius} ${radius} 0 0 ${sweepFlag} ${end[0]} ${end[1]} Z`;
};

export const RectCheck26: React.FC<RectCheck26Props> = ({config, localFrame}) => {
  const {canvas, checkRect, animation} = config;
  const [cx, cy] = checkRect.center;
  const [startOffset, cornerOffset, endOffset] = checkRect.points;
  const points: [[number, number], [number, number], [number, number]] = [
    [cx + startOffset[0], cy + startOffset[1]],
    [cx + cornerOffset[0], cy + cornerOffset[1]],
    [cx + endOffset[0], cy + endOffset[1]],
  ];
  const firstRect = rectFromSegment(points[0], points[1], checkRect.armWidth);
  const secondRect = rectFromSegment(points[1], points[2], checkRect.armWidth);
  const fanProgress = progressAt(localFrame, animation.fanStartFrame, animation.fanDurationInFrames);
  const fanPath = fanPathAt(
    points[1],
    [points[1][0] - points[0][0], points[1][1] - points[0][1]],
    [points[2][0] - points[1][0], points[2][1] - points[1][1]],
    checkRect.armWidth / 2,
  );
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

  return (
    <g>
        <rect
          x={firstRect.x}
          y={firstRect.y}
          width={firstRect.length}
          height={checkRect.armWidth}
          transform={`rotate(${firstRect.rotationDegrees} ${firstRect.centerX} ${firstRect.centerY})`}
          fill={checkRect.fill}
          stroke={checkRect.stroke}
          strokeWidth={checkRect.strokeWidth}
          opacity={firstProgress}
        />
        <path
          d={fanPath}
          fill={checkRect.fill}
          opacity={fanProgress}
          transform={`translate(${points[1][0]} ${points[1][1]}) scale(${fanProgress}) translate(${-points[1][0]} ${-points[1][1]})`}
        />
        <rect
          x={secondRect.x}
          y={secondRect.y}
          width={secondRect.length}
          height={checkRect.armWidth}
          transform={`rotate(${secondRect.rotationDegrees} ${secondRect.centerX} ${secondRect.centerY})`}
          fill={checkRect.fill}
          stroke={checkRect.stroke}
          strokeWidth={checkRect.strokeWidth}
          opacity={secondProgress}
        />
      </g>
  );
};
