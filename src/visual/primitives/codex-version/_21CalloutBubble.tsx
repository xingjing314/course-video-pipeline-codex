import React from 'react';
export type CalloutBubble21Config = {
  canvas: {width: number; height: number};
  callout: {
    x: number;
    y: number;
    width: number;
    height: number;
    radius: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
    linejoin: 'miter' | 'round' | 'bevel';
    tail: {
      baseCenterX: number;
      width: number;
      tip: [number, number];
    };
  };
  animation: {
    outlineStartFrame: number;
    outlineDurationInFrames: number;
    fillStartFrame: number;
    fillDurationInFrames: number;
  };
};

export type CalloutBubble21Timeline = {
  startFrame: number;
  loopDurationInFrames: number;
  loop: boolean;
};

type CalloutBubble21Props = {
  config: CalloutBubble21Config;
  localFrame: number;
};

const easeInOut = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

const progressAt = (frame: number, start: number, duration: number) =>
  easeInOut(Math.min(1, Math.max(0, (frame - start) / duration)));

export const CalloutBubble21: React.FC<CalloutBubble21Props> = ({config, localFrame}) => {
  const __uid = React.useId().replace(/:/g, '');
  const {canvas, callout, animation} = config;
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
  const {x, y, width, height, radius, tail} = callout;
  const right = x + width;
  const bottom = y + height;
  const tailLeft = tail.baseCenterX - tail.width / 2;
  const tailRight = tail.baseCenterX + tail.width / 2;
  const [tipX, tipY] = tail.tip;
  const path = [
    `M ${x + radius} ${y}`,
    `L ${right - radius} ${y}`,
    `Q ${right} ${y} ${right} ${y + radius}`,
    `L ${right} ${bottom - radius}`,
    `Q ${right} ${bottom} ${right - radius} ${bottom}`,
    `L ${tailRight} ${bottom}`,
    `L ${tipX} ${tipY}`,
    `L ${tailLeft} ${bottom}`,
    `L ${x + radius} ${bottom}`,
    `Q ${x} ${bottom} ${x} ${bottom - radius}`,
    `L ${x} ${y + radius}`,
    `Q ${x} ${y} ${x + radius} ${y}`,
    'Z',
  ].join(' ');

  return (
    <g>
        <defs>
          <mask
            id={`callout-bubble21-outline-reveal-${__uid}`}
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
              strokeWidth={callout.strokeWidth + 10}
              strokeLinejoin={callout.linejoin}
              pathLength={1}
              strokeDasharray={`${outlineProgress} 1`}
            />
          </mask>
        </defs>
        <path
          d={path}
          fill={callout.fill}
          fillOpacity={fillProgress}
          stroke={callout.stroke}
          strokeWidth={callout.strokeWidth}
          strokeLinejoin={callout.linejoin}
          mask={`url(#callout-bubble21-outline-reveal-${__uid})`}
        />
      </g>
  );
};
