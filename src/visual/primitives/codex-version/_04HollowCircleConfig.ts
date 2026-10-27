export type HollowCircle04Config = {
  canvas: {width: number; height: number};
  circle: {
    cx: number;
    cy: number;
    radius: number;
    stroke: string;
    strokeWidth: number;
    shadow: {x: number; y: number; blur: number; color: string};
  };
  animation: {
    outlineStartFrame: number;
    outlineDurationInFrames: number;
  };
};

export type HollowCircle04Timeline = {
  startFrame: number;
  loopDurationInFrames: number;
  loop: boolean;
};
