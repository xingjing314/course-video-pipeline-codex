export type Ellipse05Config = {
  canvas: {width: number; height: number};
  ellipse: {
    cx: number;
    cy: number;
    radiusX: number;
    radiusY: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
    shadow: {x: number; y: number; blur: number; color: string};
  };
  animation: {
    outlineStartFrame: number;
    outlineDurationInFrames: number;
    fillStartFrame: number;
    fillDurationInFrames: number;
  };
};

export type Ellipse05Timeline = {
  startFrame: number;
  loopDurationInFrames: number;
  loop: boolean;
};
