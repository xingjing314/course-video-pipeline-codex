import React from 'react';
export type OneWayArrow07Config = {
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
    headStartFrame: number;
    headDurationInFrames: number;
  };
};

export type Arrow07Timeline = {
  startFrame: number;
  loopDurationInFrames: number;
  loop: boolean;
};

type OneWayArrow07Props = {config: OneWayArrow07Config; localFrame: number};

const easeInOut = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

const progressAt = (frame: number, start: number, duration: number) => {
  const progress = Math.min(1, Math.max(0, (frame - start) / duration));
  return easeInOut(progress);
};

export const OneWayArrow07: React.FC<OneWayArrow07Props> = ({config, localFrame}) => {
  const __uid = React.useId().replace(/:/g, '');
  const {canvas, arrow, animation} = config;
  const shaftProgress = progressAt(
    localFrame,
    animation.shaftStartFrame,
    animation.shaftDurationInFrames,
  );
  const headProgress = progressAt(
    localFrame,
    animation.headStartFrame,
    animation.headDurationInFrames,
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
  const baseX = x2 - ux * arrow.headLength;
  const baseY = y2 - uy * arrow.headLength;
  const halfWidth = arrow.headWidth / 2;
  const wingA: [number, number] = [baseX + px * halfWidth, baseY + py * halfWidth];
  const wingB: [number, number] = [baseX - px * halfWidth, baseY - py * halfWidth];
  const shaftPath = `M ${x1} ${y1} L ${x2} ${y2}`;
  const headPath = `M ${wingA[0]} ${wingA[1]} L ${x2} ${y2} L ${wingB[0]} ${wingB[1]}`;

  return (
    <g>
        <defs>
          <mask
            id={`arrow07-shaft-reveal-${__uid}`}
            maskUnits="userSpaceOnUse"
            x={0}
            y={0}
            width={canvas.width}
            height={canvas.height}
          >
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
          <mask
            id={`arrow07-head-reveal-${__uid}`}
            maskUnits="userSpaceOnUse"
            x={0}
            y={0}
            width={canvas.width}
            height={canvas.height}
          >
            <rect x={0} y={0} width={canvas.width} height={canvas.height} fill="black" />
            <path
              d={headPath}
              fill="none"
              stroke="white"
              strokeWidth={arrow.strokeWidth + 10}
              strokeLinecap={arrow.linecap}
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray={`${headProgress} 1`}
            />
          </mask>
        </defs>
        <path
          d={shaftPath}
          fill="none"
          stroke={arrow.stroke}
          strokeWidth={arrow.strokeWidth}
          strokeLinecap={arrow.linecap}
          mask={`url(#arrow07-shaft-reveal-${__uid})`}
        />
        <path
          d={headPath}
          fill="none"
          stroke={arrow.stroke}
          strokeWidth={arrow.strokeWidth}
          strokeLinecap={arrow.linecap}
          strokeLinejoin="round"
          mask={`url(#arrow07-head-reveal-${__uid})`}
        />
      </g>
  );
};
