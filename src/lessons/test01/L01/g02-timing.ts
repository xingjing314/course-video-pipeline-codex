import type { CaptionSegment } from "../../../../contracts/audio-timeline.schema.ts";

export const G02_NARRATION = "单单 6.4.1 这一个小节，在 11 套试卷里就考了整整 9 道选择题！";

export type G02Preview = {
  timeline: {
    totalDurationMs: number;
    fullWavPath: string;
    scenes: Array<{ sceneId: string; startMs: number; endMs: number }>;
    captions: CaptionSegment[];
  };
  cues: { papersMs: number; questionsMs: number };
  includeAudio?: boolean;
  includeCaptions?: boolean;
};

export const g02Phase = (ms: number, cues: G02Preview["cues"]) => {
  if (ms >= cues.questionsMs) return "questions" as const;
  if (ms >= cues.papersMs) return "papers" as const;
  return "focus" as const;
};
