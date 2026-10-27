export type SolidCircle04Config = {
  canvas: {width: number; height: number};
  circle: {
    cx: number;
    cy: number;
    radius: number;
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

export type SolidCircle04Timeline = {
  startFrame: number;
  loopDurationInFrames: number;
  loop: boolean;
};
