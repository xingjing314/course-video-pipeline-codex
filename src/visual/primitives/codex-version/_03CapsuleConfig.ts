export type Capsule03Config = {
  canvas: {width: number; height: number};
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
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

export type Capsule03Timeline = {
  startFrame: number;
  loopDurationInFrames: number;
  loop: boolean;
};
