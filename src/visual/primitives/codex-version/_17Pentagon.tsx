import React from 'react';
export type Pentagon17Config = {
  canvas: {width: number; height: number};
  pentagon: {
    center: [number, number];
    radius: number;
    rotationDegrees: number;
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

export type Pentagon17Timeline = {
  startFrame: number;
  loopDurationInFrames: number;
  loop: boolean;
};

type Pentagon17Props = {config: Pentagon17Config; localFrame: number};

const SIDES = 5;

const easeInOut = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

const progressAt = (frame: number, start: number, duration: number) =>
  easeInOut(Math.min(1, Math.max(0, (frame - start) / duration)));

export const Pentagon17: React.FC<Pentagon17Props> = ({config, localFrame}) => {
  const __uid = React.useId().replace(/:/g, '');
  const {canvas, pentagon, animation} = config;
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
  const [cx, cy] = pentagon.center;
  const points = Array.from({length: SIDES}, (_, index) => {
    const angle = ((pentagon.rotationDegrees + (360 * index) / SIDES) * Math.PI) / 180;
    return [cx + pentagon.radius * Math.cos(angle), cy + pentagon.radius * Math.sin(angle)];
  });
  const polygonPoints = points.map(([x, y]) => `${x},${y}`).join(' ');
  const path = `M ${points.map(([x, y]) => `${x} ${y}`).join(' L ')} Z`;

  return (
    <g>
        <defs>
          <mask
            id={`pentagon17-outline-reveal-${__uid}`}
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
              strokeWidth={pentagon.strokeWidth + 10}
              strokeLinejoin={pentagon.linejoin}
              pathLength={1}
              strokeDasharray={`${outlineProgress} 1`}
            />
          </mask>
        </defs>
        <polygon
          points={polygonPoints}
          fill={pentagon.fill}
          fillOpacity={fillProgress}
          stroke={pentagon.stroke}
          strokeWidth={pentagon.strokeWidth}
          strokeLinejoin={pentagon.linejoin}
          mask={`url(#pentagon17-outline-reveal-${__uid})`}
        />
      </g>
  );
};
