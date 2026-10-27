import React from 'react';
export type IrregularRegion10Config = {
  canvas: {width: number; height: number};
  region: {
    points: Array<[number, number]>;
    tension: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
    linejoin: 'miter' | 'round' | 'bevel';
  };
  animation: {
    appearStartFrame: number;
    appearDurationInFrames: number;
    smoothStartFrame: number;
    smoothDurationInFrames: number;
    fillStartFrame: number;
    fillDurationInFrames: number;
  };
};

export type IrregularRegion10Timeline = {
  startFrame: number;
  loopDurationInFrames: number;
  loop: boolean;
};

type IrregularRegion10Props = {config: IrregularRegion10Config; localFrame: number};

const easeInOut = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

const progressAt = (frame: number, start: number, duration: number) =>
  easeInOut(Math.min(1, Math.max(0, (frame - start) / duration)));

const makeSmoothClosedPath = (points: Array<[number, number]>, tension: number) => {
  const count = points.length;
  const [startX, startY] = points[0];
  let path = `M ${startX} ${startY}`;

  for (let index = 0; index < count; index++) {
    const p0 = points[(index - 1 + count) % count];
    const p1 = points[index];
    const p2 = points[(index + 1) % count];
    const p3 = points[(index + 2) % count];
    const c1x = p1[0] + ((p2[0] - p0[0]) / 6) * tension;
    const c1y = p1[1] + ((p2[1] - p0[1]) / 6) * tension;
    const c2x = p2[0] - ((p3[0] - p1[0]) / 6) * tension;
    const c2y = p2[1] - ((p3[1] - p1[1]) / 6) * tension;
    path += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2[0]} ${p2[1]}`;
  }

  return `${path} Z`;
};

export const IrregularRegion10: React.FC<IrregularRegion10Props> = ({config, localFrame}) => {
  const {canvas, region, animation} = config;
  const appear = progressAt(
    localFrame,
    animation.appearStartFrame,
    animation.appearDurationInFrames,
  );
  const smoothProgress = progressAt(
    localFrame,
    animation.smoothStartFrame,
    animation.smoothDurationInFrames,
  );
  const fillProgress = progressAt(
    localFrame,
    animation.fillStartFrame,
    animation.fillDurationInFrames,
  );
  const tension = region.tension * smoothProgress;
  const path = makeSmoothClosedPath(region.points, tension);

  return (
    <g>
        <path
          d={path}
          fill={region.fill}
          fillOpacity={fillProgress}
          stroke={region.stroke}
          strokeWidth={region.strokeWidth}
          strokeLinejoin={region.linejoin}
          opacity={appear}
        />
      </g>
  );
};
