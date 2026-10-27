import React from 'react';
export type Star23Config = {
  canvas: {width: number; height: number};
  star: {
    center: [number, number];
    points: number;
    outerRadius: number;
    innerRadiusRatio: number;
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

export type Star23Timeline = {
  startFrame: number;
  loopDurationInFrames: number;
  loop: boolean;
};

type Star23Props = {config: Star23Config; localFrame: number};

const easeInOut = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

const progressAt = (frame: number, start: number, duration: number) =>
  easeInOut(Math.min(1, Math.max(0, (frame - start) / duration)));

export const Star23: React.FC<Star23Props> = ({config, localFrame}) => {
  const __uid = React.useId().replace(/:/g, '');
  const {canvas, star, animation} = config;
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
  const [cx, cy] = star.center;
  const pointCount = Math.max(5, Math.floor(star.points));
  const vertices = Array.from({length: pointCount * 2}, (_, index) => {
    const angle = ((star.rotationDegrees + (180 * index) / pointCount) * Math.PI) / 180;
    const radius = index % 2 === 0 ? star.outerRadius : star.outerRadius * star.innerRadiusRatio;
    return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
  });
  const polygonPoints = vertices.map(([x, y]) => `${x},${y}`).join(' ');
  const path = `M ${vertices.map(([x, y]) => `${x} ${y}`).join(' L ')} Z`;

  return (
    <g>
        <defs>
          <mask
            id={`star23-outline-reveal-${__uid}`}
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
              strokeWidth={star.strokeWidth + 10}
              strokeLinejoin={star.linejoin}
              pathLength={1}
              strokeDasharray={`${outlineProgress} 1`}
            />
          </mask>
        </defs>
        <polygon
          points={polygonPoints}
          fill={star.fill}
          fillOpacity={fillProgress}
          stroke={star.stroke}
          strokeWidth={star.strokeWidth}
          strokeLinejoin={star.linejoin}
          mask={`url(#star23-outline-reveal-${__uid})`}
        />
      </g>
  );
};
