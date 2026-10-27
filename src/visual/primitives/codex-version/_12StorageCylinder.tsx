import React from 'react';
export type StorageCylinder12Config = {
  canvas: {width: number; height: number};
  cylinder: {
    cx: number;
    topY: number;
    bottomY: number;
    radiusX: number;
    radiusY: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
    sectionRatios: number[];
    sectionStrokeWidth: number;
  };
  animation: {
    outlineStartFrame: number;
    outlineDurationInFrames: number;
    fillStartFrame: number;
    fillDurationInFrames: number;
    sectionStartFrame: number;
    sectionDurationInFrames: number;
  };
};

export type StorageCylinder12Timeline = {
  startFrame: number;
  loopDurationInFrames: number;
  loop: boolean;
};

type StorageCylinder12Props = {config: StorageCylinder12Config; localFrame: number};

const easeInOut = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

const progressAt = (frame: number, start: number, duration: number) =>
  easeInOut(Math.min(1, Math.max(0, (frame - start) / duration)));

const pathReveal = (path: string, progress: number, stroke: string, strokeWidth: number) => (
  <path
    d={path}
    fill="none"
    stroke={stroke}
    strokeWidth={strokeWidth}
    strokeLinecap={progress >= 1 ? 'round' : 'butt'}
    pathLength={progress < 1 ? 1 : undefined}
    strokeDasharray={progress < 1 ? `${progress} 1` : undefined}
  />
);

export const StorageCylinder12: React.FC<StorageCylinder12Props> = ({config, localFrame}) => {
  const {canvas, cylinder, animation} = config;
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
  const sectionProgress = progressAt(
    localFrame,
    animation.sectionStartFrame,
    animation.sectionDurationInFrames,
  );

  const {cx, topY, bottomY, radiusX, radiusY} = cylinder;
  const left = cx - radiusX;
  const right = cx + radiusX;
  const height = bottomY - topY;
  const bodyPath = `M ${left} ${topY} L ${left} ${bottomY} A ${radiusX} ${radiusY} 0 0 0 ${right} ${bottomY} L ${right} ${topY} A ${radiusX} ${radiusY} 0 0 1 ${left} ${topY} Z`;
  const topEllipsePath = `M ${left} ${topY} A ${radiusX} ${radiusY} 0 0 1 ${right} ${topY} A ${radiusX} ${radiusY} 0 0 1 ${left} ${topY} Z`;
  const bottomFrontArc = `M ${left} ${bottomY} A ${radiusX} ${radiusY} 0 0 0 ${right} ${bottomY}`;

  return (
    <g>
        <path d={bodyPath} fill={cylinder.fill} opacity={fillProgress} />
        <path d={topEllipsePath} fill={cylinder.fill} fillOpacity={fillProgress} />
        {pathReveal(`M ${left} ${topY} L ${left} ${bottomY}`, outlineProgress, cylinder.stroke, cylinder.strokeWidth)}
        {pathReveal(`M ${right} ${topY} L ${right} ${bottomY}`, outlineProgress, cylinder.stroke, cylinder.strokeWidth)}
        {pathReveal(bottomFrontArc, outlineProgress, cylinder.stroke, cylinder.strokeWidth)}
        {pathReveal(topEllipsePath, outlineProgress, cylinder.stroke, cylinder.strokeWidth)}
        {cylinder.sectionRatios.map((ratio, index) => {
          const y = topY + height * ratio;
          const sectionArc = `M ${left} ${y} A ${radiusX} ${radiusY} 0 0 0 ${right} ${y}`;
          return (
            <React.Fragment key={`${ratio}-${index}`}>
              {pathReveal(sectionArc, sectionProgress, cylinder.stroke, cylinder.sectionStrokeWidth)}
            </React.Fragment>
          );
        })}
      </g>
  );
};
