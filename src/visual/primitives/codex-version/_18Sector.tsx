import React from 'react';
export type Sector18Config = {
  canvas: {width: number; height: number};
  sector: {
    center: [number, number];
    radius: number;
    startAngleDegrees: number;
    sweepAngleDegrees: number;
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

export type Sector18Timeline = {
  startFrame: number;
  loopDurationInFrames: number;
  loop: boolean;
};

type Sector18Props = {config: Sector18Config; localFrame: number};

const easeInOut = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

const progressAt = (frame: number, start: number, duration: number) =>
  easeInOut(Math.min(1, Math.max(0, (frame - start) / duration)));

const pointAt = (cx: number, cy: number, radius: number, angleDegrees: number) => {
  const angle = (angleDegrees * Math.PI) / 180;
  return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
};

export const Sector18: React.FC<Sector18Props> = ({config, localFrame}) => {
  const __uid = React.useId().replace(/:/g, '');
  const {canvas, sector, animation} = config;
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
  const [cx, cy] = sector.center;
  const {radius, startAngleDegrees, sweepAngleDegrees} = sector;
  const sweepMagnitude = Math.abs(sweepAngleDegrees);
  const sweepFlag = sweepAngleDegrees > 0 ? 1 : 0;
  const start = pointAt(cx, cy, radius, startAngleDegrees);
  const end = pointAt(cx, cy, radius, startAngleDegrees + sweepAngleDegrees);
  const path =
    sweepMagnitude === 360
      ? (() => {
          const middle = pointAt(
            cx,
            cy,
            radius,
            startAngleDegrees + Math.sign(sweepAngleDegrees) * 180,
          );
          return `M ${start[0]} ${start[1]} A ${radius} ${radius} 0 0 ${sweepFlag} ${middle[0]} ${middle[1]} A ${radius} ${radius} 0 0 ${sweepFlag} ${start[0]} ${start[1]} Z`;
        })()
      : `M ${cx} ${cy} L ${start[0]} ${start[1]} A ${radius} ${radius} 0 ${sweepMagnitude > 180 ? 1 : 0} ${sweepFlag} ${end[0]} ${end[1]} Z`;

  return (
    <g>
        <defs>
          <mask
            id={`sector18-outline-reveal-${__uid}`}
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
              strokeWidth={sector.strokeWidth + 10}
              strokeLinejoin={sector.linejoin}
              pathLength={1}
              strokeDasharray={`${outlineProgress} 1`}
            />
          </mask>
        </defs>
        <path
          d={path}
          fill={sector.fill}
          fillOpacity={fillProgress}
          stroke={sector.stroke}
          strokeWidth={sector.strokeWidth}
          strokeLinejoin={sector.linejoin}
          mask={`url(#sector18-outline-reveal-${__uid})`}
        />
      </g>
  );
};
