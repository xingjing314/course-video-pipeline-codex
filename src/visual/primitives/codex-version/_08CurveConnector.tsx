import React from 'react';
export type CurveConnector08Config = {
  canvas: {width: number; height: number};
  curve: {
    start: [number, number];
    control1: [number, number];
    control2: [number, number];
    end: [number, number];
    stroke: string;
    strokeWidth: number;
    linecap: 'butt' | 'round' | 'square';
  };
  animation: {drawStartFrame: number; drawDurationInFrames: number};
};

export type Curve08Timeline = {
  startFrame: number;
  loopDurationInFrames: number;
  loop: boolean;
};

type CurveConnector08Props = {config: CurveConnector08Config; localFrame: number};

const easeInOut = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

export const CurveConnector08: React.FC<CurveConnector08Props> = ({config, localFrame}) => {
  const __uid = React.useId().replace(/:/g, '');
  const {canvas, curve, animation} = config;
  const rawProgress = Math.min(
    1,
    Math.max(0, (localFrame - animation.drawStartFrame) / animation.drawDurationInFrames),
  );
  const progress = easeInOut(rawProgress);
  const [x0, y0] = curve.start;
  const [x1, y1] = curve.control1;
  const [x2, y2] = curve.control2;
  const [x3, y3] = curve.end;
  const path = `M ${x0} ${y0} C ${x1} ${y1}, ${x2} ${y2}, ${x3} ${y3}`;

  return (
    <g>
        <defs>
          <mask
            id={`curve08-connector-reveal-${__uid}`}
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
              strokeWidth={curve.strokeWidth + 10}
              strokeLinecap={curve.linecap}
              pathLength={1}
              strokeDasharray={`${progress} 1`}
            />
          </mask>
        </defs>
        <path
          d={path}
          fill="none"
          stroke={curve.stroke}
          strokeWidth={curve.strokeWidth}
          strokeLinecap={curve.linecap}
          mask={`url(#curve08-connector-reveal-${__uid})`}
        />
      </g>
  );
};
