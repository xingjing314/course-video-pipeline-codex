import React from 'react';
export type Arc19Config = {
  canvas: {width: number; height: number};
  arc: {
    center: [number, number];
    radius: number;
    startAngleDegrees: number;
    sweepAngleDegrees: number;
    stroke: string;
    strokeWidth: number;
    linecap: 'butt' | 'round' | 'square';
  };
  animation: {
    outlineStartFrame: number;
    outlineDurationInFrames: number;
  };
};

export type Arc19Timeline = {
  startFrame: number;
  loopDurationInFrames: number;
  loop: boolean;
};

type Arc19Props = {config: Arc19Config; localFrame: number};

const easeInOut = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

const progressAt = (frame: number, start: number, duration: number) =>
  easeInOut(Math.min(1, Math.max(0, (frame - start) / duration)));

const pointAt = (cx: number, cy: number, radius: number, angleDegrees: number) => {
  const angle = (angleDegrees * Math.PI) / 180;
  return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
};

export const Arc19: React.FC<Arc19Props> = ({config, localFrame}) => {
  const {canvas, arc, animation} = config;
  const outlineProgress = progressAt(
    localFrame,
    animation.outlineStartFrame,
    animation.outlineDurationInFrames,
  );
  const [cx, cy] = arc.center;
  const start = pointAt(cx, cy, arc.radius, arc.startAngleDegrees);
  const end = pointAt(cx, cy, arc.radius, arc.startAngleDegrees + arc.sweepAngleDegrees);
  const largeArcFlag = Math.abs(arc.sweepAngleDegrees) > 180 ? 1 : 0;
  const sweepFlag = arc.sweepAngleDegrees > 0 ? 1 : 0;
  const path = `M ${start[0]} ${start[1]} A ${arc.radius} ${arc.radius} 0 ${largeArcFlag} ${sweepFlag} ${end[0]} ${end[1]}`;

  return (
    <g>
        <path
          d={path}
          fill="none"
          stroke={arc.stroke}
          strokeWidth={arc.strokeWidth}
          strokeLinecap={arc.linecap}
          pathLength={1}
          strokeDasharray={`${outlineProgress} 1`}
        />
      </g>
  );
};
