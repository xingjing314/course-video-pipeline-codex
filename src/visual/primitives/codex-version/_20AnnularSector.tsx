import React from 'react';
export type AnnularSector20Config = {
  canvas: {width: number; height: number};
  annularSector: {
    center: [number, number];
    outerRadius: number;
    innerRadius: number;
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

export type AnnularSector20Timeline = {
  startFrame: number;
  loopDurationInFrames: number;
  loop: boolean;
};

type AnnularSector20Props = {
  config: AnnularSector20Config;
  localFrame: number;
};

const easeInOut = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

const progressAt = (frame: number, start: number, duration: number) =>
  easeInOut(Math.min(1, Math.max(0, (frame - start) / duration)));

const pointAt = (cx: number, cy: number, radius: number, angleDegrees: number) => {
  const angle = (angleDegrees * Math.PI) / 180;
  return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
};

export const AnnularSector20: React.FC<AnnularSector20Props> = ({config, localFrame}) => {
  const __uid = React.useId().replace(/:/g, '');
  const {canvas, annularSector, animation} = config;
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
  const [cx, cy] = annularSector.center;
  const {
    outerRadius,
    innerRadius,
    startAngleDegrees,
    sweepAngleDegrees,
  } = annularSector;
  const endAngleDegrees = startAngleDegrees + sweepAngleDegrees;
  const startOuter = pointAt(cx, cy, outerRadius, startAngleDegrees);
  const endOuter = pointAt(cx, cy, outerRadius, endAngleDegrees);
  const endInner = pointAt(cx, cy, innerRadius, endAngleDegrees);
  const startInner = pointAt(cx, cy, innerRadius, startAngleDegrees);
  const sweepMagnitude = Math.abs(sweepAngleDegrees);
  const largeArcFlag = sweepMagnitude > 180 ? 1 : 0;
  const outerSweepFlag = sweepAngleDegrees > 0 ? 1 : 0;
  const innerSweepFlag = outerSweepFlag === 1 ? 0 : 1;
  const path = [
    `M ${startOuter[0]} ${startOuter[1]}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} ${outerSweepFlag} ${endOuter[0]} ${endOuter[1]}`,
    `L ${endInner[0]} ${endInner[1]}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} ${innerSweepFlag} ${startInner[0]} ${startInner[1]}`,
    'Z',
  ].join(' ');

  return (
    <g>
        <defs>
          <mask
            id={`annular-sector20-outline-reveal-${__uid}`}
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
              strokeWidth={annularSector.strokeWidth + 10}
              strokeLinejoin={annularSector.linejoin}
              pathLength={1}
              strokeDasharray={`${outlineProgress} 1`}
            />
          </mask>
        </defs>
        <path
          d={path}
          fill={annularSector.fill}
          fillOpacity={fillProgress}
          fillRule="evenodd"
          stroke={annularSector.stroke}
          strokeWidth={annularSector.strokeWidth}
          strokeLinejoin={annularSector.linejoin}
          mask={`url(#annular-sector20-outline-reveal-${__uid})`}
        />
      </g>
  );
};
