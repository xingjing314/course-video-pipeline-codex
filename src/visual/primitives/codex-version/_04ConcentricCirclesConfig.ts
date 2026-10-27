export type ConcentricCircles04Config = {
  canvas: {width: number; height: number};
  center: {cx: number; cy: number};
  circles: Array<{radius: number; strokeWidth: number}>;
  style: {
    stroke: string;
    shadow: {x: number; y: number; blur: number; color: string};
  };
  animation: {
    outlineStartFrame: number;
    outlineDurationInFrames: number;
    staggerFrames: number;
  };
};

export type ConcentricCircles04Timeline = {
  startFrame: number;
  loopDurationInFrames: number;
  loop: boolean;
};
