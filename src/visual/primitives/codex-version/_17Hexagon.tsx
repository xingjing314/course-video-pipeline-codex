import React from 'react';
export type Hexagon17Config = {
  canvas: {width: number; height: number};
  hexagon: {
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

export type Hexagon17Timeline = {
  startFrame: number;
  loopDurationInFrames: number;
  loop: boolean;
};

type Hexagon17Props = {config: Hexagon17Config; localFrame: number};

const SIDES = 6;

const easeInOut = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

const progressAt = (frame: number, start: number, duration: number) =>
  easeInOut(Math.min(1, Math.max(0, (frame - start) / duration)));

export const Hexagon17: React.FC<Hexagon17Props> = ({config, localFrame}) => {
  const __uid = React.useId().replace(/:/g, '');
  const {canvas, hexagon, animation} = config;
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
  const [cx, cy] = hexagon.center;
  const points = Array.from({length: SIDES}, (_, index) => {
    const angle = ((hexagon.rotationDegrees + (360 * index) / SIDES) * Math.PI) / 180;
    return [cx + hexagon.radius * Math.cos(angle), cy + hexagon.radius * Math.sin(angle)];
  });
  const polygonPoints = points.map(([x, y]) => `${x},${y}`).join(' ');
  const path = `M ${points.map(([x, y]) => `${x} ${y}`).join(' L ')} Z`;

  return (
    <g>
        <defs>
          <mask
            id={`hexagon17-outline-reveal-${__uid}`}
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
              strokeWidth={hexagon.strokeWidth + 10}
              strokeLinejoin={hexagon.linejoin}
              pathLength={1}
              strokeDasharray={`${outlineProgress} 1`}
            />
          </mask>
        </defs>
        <polygon
          points={polygonPoints}
          fill={hexagon.fill}
          fillOpacity={fillProgress}
          stroke={hexagon.stroke}
          strokeWidth={hexagon.strokeWidth}
          strokeLinejoin={hexagon.linejoin}
          mask={`url(#hexagon17-outline-reveal-${__uid})`}
        />
      </g>
  );
};
