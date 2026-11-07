export function readCaptionText(
  text: string,
  extension: string,
): Array<{ text: string; startMs: number; endMs: number }>;

export function buildCaptionPlan(
  captions: Array<{ text: string; startMs: number; endMs: number }>,
  options: { fps: number; totalFrames: number; startFrame?: number },
): {
  images: string[];
  runs: Array<{ image: number; fromFrame: number; endFrame: number }>;
  srt: string;
};
