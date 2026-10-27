import React from 'react';
export type CurveBand09Config = {
  canvas: {width: number; height: number};
  centerline: {
    start: [number, number];
    control1: [number, number];
    control2: [number, number];
    end: [number, number];
  };
  band: {
    width: number;
    taper: number;
    minimumWidthRatio: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
    linejoin: 'miter' | 'round' | 'bevel';
  };
  animation: {
    growthStartFrame: number;
    growthDurationInFrames: number;
    taperStartFrame: number;
    taperDurationInFrames: number;
  };
};

export type CurveBand09Timeline = {
  startFrame: number;
  loopDurationInFrames: number;
  loop: boolean;
};

type CurveBand09Props = {config: CurveBand09Config; localFrame: number};

const easeInOut = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

const progressAt = (frame: number, start: number, duration: number) =>
  easeInOut(Math.min(1, Math.max(0, (frame - start) / duration)));

const SAMPLE_COUNT = 110;

export const CurveBand09: React.FC<CurveBand09Props> = ({config, localFrame}) => {
  const {canvas, centerline, band, animation} = config;
  const growth = progressAt(
    localFrame,
    animation.growthStartFrame,
    animation.growthDurationInFrames,
  );
  const taperProgress = progressAt(
    localFrame,
    animation.taperStartFrame,
    animation.taperDurationInFrames,
  );
  const taper = band.taper * taperProgress;

  const [x0, y0] = centerline.start;
  const [x1, y1] = centerline.control1;
  const [x2, y2] = centerline.control2;
  const [x3, y3] = centerline.end;
  const pointAt = (t: number): [number, number] => {
    const u = 1 - t;
    return [
      u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3,
      u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3,
    ];
  };
  const tangentAt = (t: number): [number, number] => {
    const u = 1 - t;
    return [
      3 * u * u * (x1 - x0) + 6 * u * t * (x2 - x1) + 3 * t * t * (x3 - x2),
      3 * u * u * (y1 - y0) + 6 * u * t * (y2 - y1) + 3 * t * t * (y3 - y2),
    ];
  };
  const edgeA: string[] = [];
  const edgeB: string[] = [];

  for (let index = 0; index <= SAMPLE_COUNT; index++) {
    const t = index / SAMPLE_COUNT;
    const [x, y] = pointAt(t);
    const [tx, ty] = tangentAt(t);
    const tangentLength = Math.hypot(tx, ty) || 1;
    const normalX = -ty / tangentLength;
    const normalY = tx / tangentLength;
    const profile = 1 - taper + taper * (
      band.minimumWidthRatio + (1 - band.minimumWidthRatio) * Math.sin(Math.PI * t)
    );
    const halfWidth = (band.width * growth * profile) / 2;
    edgeA.push(`${(x + normalX * halfWidth).toFixed(1)} ${(y + normalY * halfWidth).toFixed(1)}`);
    edgeB.push(`${(x - normalX * halfWidth).toFixed(1)} ${(y - normalY * halfWidth).toFixed(1)}`);
  }

  const path = `M ${edgeA.join(' L ')} L ${edgeB.reverse().join(' L ')} Z`;

  return (
    <g>
        <path
          d={path}
          fill={band.fill}
          stroke={band.stroke}
          strokeWidth={band.strokeWidth}
          strokeLinejoin={band.linejoin}
          opacity={growth > 0.02 ? 1 : 0}
        />
      </g>
  );
};
