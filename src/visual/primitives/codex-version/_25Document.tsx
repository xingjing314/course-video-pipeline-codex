import React from 'react';
export type Document25Config = {
  canvas: {width: number; height: number};
  document: {
    center: [number, number];
    width: number;
    height: number;
    fold: number;
    fill: string;
    foldTint: string;
    foldTintOpacity: number;
    stroke: string;
    strokeWidth: number;
    linejoin: 'miter' | 'round' | 'bevel';
  };
  animation: {
    outlineStartFrame: number;
    outlineDurationInFrames: number;
    fillStartFrame: number;
    fillDurationInFrames: number;
    flapStartFrame: number;
    flapDurationInFrames: number;
  };
};

export type Document25Timeline = {
  startFrame: number;
  loopDurationInFrames: number;
  loop: boolean;
};

type Document25Props = {config: Document25Config; localFrame: number};

const easeInOut = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

const progressAt = (frame: number, start: number, duration: number) =>
  easeInOut(Math.min(1, Math.max(0, (frame - start) / duration)));

export const Document25: React.FC<Document25Props> = ({config, localFrame}) => {
  const __uid = React.useId().replace(/:/g, '');
  const {canvas, document, animation} = config;
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
  const flapProgress = progressAt(
    localFrame,
    animation.flapStartFrame,
    animation.flapDurationInFrames,
  );
  const [cx, cy] = document.center;
  const left = cx - document.width / 2;
  const top = cy - document.height / 2;
  const right = left + document.width;
  const bottom = top + document.height;
  const foldX = right - document.fold;
  const foldY = top + document.fold;

  const bodyPath = `M ${left} ${top} L ${foldX} ${top} L ${right} ${foldY} L ${right} ${bottom} L ${left} ${bottom} Z`;
  const flapPath = `M ${foldX} ${top} L ${foldX} ${foldY} L ${right} ${foldY} Z`;
  const outlinePath = [
    `M ${left} ${top} L ${foldX} ${top}`,
    `M ${right} ${foldY} L ${right} ${bottom} L ${left} ${bottom} L ${left} ${top}`,
    `M ${foldX} ${top} L ${right} ${foldY}`,
    `M ${foldX} ${top} L ${foldX} ${foldY} L ${right} ${foldY}`,
  ].join(' ');

  return (
    <g>
        <defs>
          <mask
            id={`document25-outline-reveal-${__uid}`}
            maskUnits="userSpaceOnUse"
            x={0}
            y={0}
            width={canvas.width}
            height={canvas.height}
          >
            <rect x={0} y={0} width={canvas.width} height={canvas.height} fill="black" />
            <path
              d={outlinePath}
              fill="none"
              stroke="white"
              strokeWidth={document.strokeWidth + 10}
              strokeLinejoin={document.linejoin}
              pathLength={1}
              strokeDasharray={`${outlineProgress} 1`}
            />
          </mask>
        </defs>
        <path d={bodyPath} fill={document.fill} fillOpacity={fillProgress} />
        <path d={flapPath} fill={document.fill} fillOpacity={flapProgress} />
        <path
          d={flapPath}
          fill={document.foldTint}
          fillOpacity={flapProgress * document.foldTintOpacity}
        />
        <path
          d={outlinePath}
          fill="none"
          stroke={document.stroke}
          strokeWidth={document.strokeWidth}
          strokeLinejoin={document.linejoin}
          mask={`url(#document25-outline-reveal-${__uid})`}
        />
      </g>
  );
};
