import React from 'react';
export type TwoWayArrow07Config = {
  canvas: {width: number; height: number};
  arrow: {
    from: [number, number];
    to: [number, number];
    stroke: string;
    strokeWidth: number;
    linecap: 'butt' | 'round' | 'square';
    headLength: number;
    headWidth: number;
  };
  animation: {
    shaftStartFrame: number;
    shaftDurationInFrames: number;
    headsStartFrame: number;
    headsDurationInFrames: number;
  };
};

export type Arrow07Timeline = {
  startFrame: number;
  loopDurationInFrames: number;
  loop: boolean;
};

type TwoWayArrow07Props = {config: TwoWayArrow07Config; localFrame: number};

const easeInOut = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

const progressAt = (frame: number, start: number, duration: number) => {
  const progress = Math.min(1, Math.max(0, (frame - start) / duration));
  return easeInOut(progress);
};

export const TwoWayArrow07: React.FC<TwoWayArrow07Props> = ({config, localFrame}) => {
  const __uid = React.useId().replace(/:/g, '');
  const {canvas, arrow, animation} = config;
  const shaftProgress = progressAt(
    localFrame,
    animation.shaftStartFrame,
    animation.shaftDurationInFrames,
  );
  const headsProgress = progressAt(
    localFrame,
    animation.headsStartFrame,
    animation.headsDurationInFrames,
  );

  const [x1, y1] = arrow.from;
  const [x2, y2] = arrow.to;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy) || 1;
  const ux = dx / length;
  const uy = dy / length;
  const px = -uy;
  const py = ux;
  const halfWidth = arrow.headWidth / 2;

  const startBaseX = x1 + ux * arrow.headLength;
  const startBaseY = y1 + uy * arrow.headLength;
  const startWingA: [number, number] = [startBaseX + px * halfWidth, startBaseY + py * halfWidth];
  const startWingB: [number, number] = [startBaseX - px * halfWidth, startBaseY - py * halfWidth];
  const endBaseX = x2 - ux * arrow.headLength;
  const endBaseY = y2 - uy * arrow.headLength;
  const endWingA: [number, number] = [endBaseX + px * halfWidth, endBaseY + py * halfWidth];
  const endWingB: [number, number] = [endBaseX - px * halfWidth, endBaseY - py * halfWidth];

  const shaftPath = `M ${x1} ${y1} L ${x2} ${y2}`;
  const startHeadPath = `M ${startWingA[0]} ${startWingA[1]} L ${x1} ${y1} L ${startWingB[0]} ${startWingB[1]}`;
  const endHeadPath = `M ${endWingA[0]} ${endWingA[1]} L ${x2} ${y2} L ${endWingB[0]} ${endWingB[1]}`;

  return (
    <g>
        <defs>
          <mask id={`arrow07-two-way-shaft-mask-${__uid}`} maskUnits="userSpaceOnUse" x={0} y={0} width={canvas.width} height={canvas.height}>
            <rect x={0} y={0} width={canvas.width} height={canvas.height} fill="black" />
            <path
              d={shaftPath}
              fill="none"
              stroke="white"
              strokeWidth={arrow.strokeWidth + 10}
              strokeLinecap={arrow.linecap}
              pathLength={1}
              strokeDasharray={`${shaftProgress} 1`}
            />
          </mask>
          <mask id={`arrow07-two-way-start-head-mask-${__uid}`} maskUnits="userSpaceOnUse" x={0} y={0} width={canvas.width} height={canvas.height}>
            <rect x={0} y={0} width={canvas.width} height={canvas.height} fill="black" />
            <path
              d={startHeadPath}
              fill="none"
              stroke="white"
              strokeWidth={arrow.strokeWidth + 10}
              strokeLinecap={arrow.linecap}
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray={`${headsProgress} 1`}
            />
          </mask>
          <mask id={`arrow07-two-way-end-head-mask-${__uid}`} maskUnits="userSpaceOnUse" x={0} y={0} width={canvas.width} height={canvas.height}>
            <rect x={0} y={0} width={canvas.width} height={canvas.height} fill="black" />
            <path
              d={endHeadPath}
              fill="none"
              stroke="white"
              strokeWidth={arrow.strokeWidth + 10}
              strokeLinecap={arrow.linecap}
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray={`${headsProgress} 1`}
            />
          </mask>
        </defs>
        <path
          d={shaftPath}
          fill="none"
          stroke={arrow.stroke}
          strokeWidth={arrow.strokeWidth}
          strokeLinecap={arrow.linecap}
          mask={`url(#arrow07-two-way-shaft-mask-${__uid})`}
        />
        <path
          d={startHeadPath}
          fill="none"
          stroke={arrow.stroke}
          strokeWidth={arrow.strokeWidth}
          strokeLinecap={arrow.linecap}
          strokeLinejoin="round"
          mask={`url(#arrow07-two-way-start-head-mask-${__uid})`}
        />
        <path
          d={endHeadPath}
          fill="none"
          stroke={arrow.stroke}
          strokeWidth={arrow.strokeWidth}
          strokeLinecap={arrow.linecap}
          strokeLinejoin="round"
          mask={`url(#arrow07-two-way-end-head-mask-${__uid})`}
        />
      </g>
  );
};
