import React from 'react';
export type RectPlus24Config = {
  canvas: {width: number; height: number};
  plus: {
    center: [number, number];
    armLength: number;
    armWidth: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
    linejoin: 'miter' | 'round' | 'bevel';
  };
  animation: {
    horizontalStartFrame: number;
    horizontalDurationInFrames: number;
    verticalStartFrame: number;
    verticalDurationInFrames: number;
    outlineStartFrame: number;
    outlineDurationInFrames: number;
  };
};

export type RectPlus24Timeline = {
  startFrame: number;
  loopDurationInFrames: number;
  loop: boolean;
};

type RectPlus24Props = {config: RectPlus24Config; localFrame: number};

const easeInOut = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

const progressAt = (frame: number, start: number, duration: number) =>
  easeInOut(Math.min(1, Math.max(0, (frame - start) / duration)));

export const RectPlus24: React.FC<RectPlus24Props> = ({config, localFrame}) => {
  const __uid = React.useId().replace(/:/g, '');
  const {canvas, plus, animation} = config;
  const [cx, cy] = plus.center;
  const halfWidth = plus.armWidth / 2;
  const horizontalProgress = progressAt(
    localFrame,
    animation.horizontalStartFrame,
    animation.horizontalDurationInFrames,
  );
  const verticalProgress = progressAt(
    localFrame,
    animation.verticalStartFrame,
    animation.verticalDurationInFrames,
  );
  const outlineProgress = progressAt(
    localFrame,
    animation.outlineStartFrame,
    animation.outlineDurationInFrames,
  );
  const points = [
    [cx - halfWidth, cy - plus.armLength],
    [cx + halfWidth, cy - plus.armLength],
    [cx + halfWidth, cy - halfWidth],
    [cx + plus.armLength, cy - halfWidth],
    [cx + plus.armLength, cy + halfWidth],
    [cx + halfWidth, cy + halfWidth],
    [cx + halfWidth, cy + plus.armLength],
    [cx - halfWidth, cy + plus.armLength],
    [cx - halfWidth, cy + halfWidth],
    [cx - plus.armLength, cy + halfWidth],
    [cx - plus.armLength, cy - halfWidth],
    [cx - halfWidth, cy - halfWidth],
  ];
  const outline = `M ${points.map(([x, y]) => `${x} ${y}`).join(' L ')} Z`;

  return (
    <g>
        <defs>
          <mask
            id={`rect-plus24-outline-reveal-${__uid}`}
            maskUnits="userSpaceOnUse"
            x={0}
            y={0}
            width={canvas.width}
            height={canvas.height}
          >
            <rect x={0} y={0} width={canvas.width} height={canvas.height} fill="black" />
            <path
              d={outline}
              fill="none"
              stroke="white"
              strokeWidth={plus.strokeWidth + 10}
              strokeLinejoin={plus.linejoin}
              pathLength={1}
              strokeDasharray={`${outlineProgress} 1`}
            />
          </mask>
        </defs>
        <rect
          x={cx - plus.armLength}
          y={cy - halfWidth}
          width={plus.armLength * 2}
          height={plus.armWidth}
          fill={plus.fill}
          fillOpacity={horizontalProgress}
        />
        <rect
          x={cx - halfWidth}
          y={cy - plus.armLength}
          width={plus.armWidth}
          height={plus.armLength * 2}
          fill={plus.fill}
          fillOpacity={verticalProgress}
        />
        <path
          d={outline}
          fill="none"
          stroke={plus.stroke}
          strokeWidth={plus.strokeWidth}
          strokeLinejoin={plus.linejoin}
          mask={`url(#rect-plus24-outline-reveal-${__uid})`}
        />
      </g>
  );
};
