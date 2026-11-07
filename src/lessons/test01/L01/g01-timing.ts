import type { CaptionSegment } from "../../../../contracts/audio-timeline.schema.ts";

export const G01_NARRATION =
  "欢迎来到第 6 章的第三节课，也是全章分值最密集的“第一高频霸主区”——6.4 节“价值驱动的项目管理知识体系”与 6.4.1 节“12 个项目管理原则”。";

export type G01Preview = {
  timeline: {
    totalDurationMs: number;
    fullWavPath: string;
    scenes: Array<{ sceneId: string; startMs: number; endMs: number }>;
    captions: CaptionSegment[];
  };
  cues: { badgeMs: number; outerMs: number; innerMs: number };
  includeAudio?: boolean;
  includeCaptions?: boolean;
};

export type PhraseToken = { text: string; startMs: number };

const droppedMarks = /[\s\p{P}\p{S}]/gu;

/** 对齐结果会丢掉小数点等标点。短语和 token 用同一规则去掉这些符号后再比较。 */
export const normalizePhraseText = (value: string) => value.normalize("NFKC").replace(droppedMarks, "");

/**
 * 返回短语第一个字的开始时间。
 * 查找「6.4节」「6.4.1节」，避免只搜「64」时落到「641」里。
 */
export const findPhraseStartMs = (tokens: readonly PhraseToken[], phrase: string) => {
  const needle = normalizePhraseText(phrase);
  if (!needle) throw new Error(`短语归一化后为空：${phrase}`);
  const units: Array<{ ch: string; startMs: number }> = [];
  for (const token of tokens) {
    for (const ch of normalizePhraseText(token.text)) units.push({ ch, startMs: token.startMs });
  }
  const at = units.map((unit) => unit.ch).join("").indexOf(needle);
  if (at < 0) throw new Error(`配音里找不到短语：${phrase}（归一化为 ${needle}）`);
  return units[at].startMs;
};

export const g01Phase = (ms: number, cues: G01Preview["cues"]) => {
  if (ms >= cues.innerMs) return "inner" as const;
  if (ms >= cues.outerMs) return "outer" as const;
  if (ms >= cues.badgeMs) return "badge" as const;
  return "locate" as const;
};
