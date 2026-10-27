/**
 * Stage 3 (`3-link`) 语音触发词锚点解析器（cue-point-resolver.ts）。
 *
 * 在分镜的字级强制对齐序列（AlignedToken[]）中检索 `matchPhrase`，
 * 将毫秒时间戳精确转换为镜头内局部帧号（localFrame）。
 */
import type { AlignedToken } from "../../../contracts/audio-timeline.schema.ts";
import type { CuePointSpec, ResolvedCuePoint } from "../../../contracts/visual-props.schema.ts";

const normalizeTokenText = (s: string): string =>
  s.replace(/[^\u4e00-\u9fa5A-Za-z0-9]/g, "").toUpperCase();

export const resolveSceneCuePoints = (
  specs: CuePointSpec[],
  tokens: AlignedToken[],
  sceneStartMs: number,
  sceneDurationMs: number,
  fps: number,
): ResolvedCuePoint[] => {
  if (specs.length === 0) return [];

  const charStream = tokens.map((t) => ({
    norm: normalizeTokenText(t.text),
    startMs: t.startMs,
    endMs: t.endMs,
  }));
  const joinedText = charStream.map((c) => c.norm).join("");

  return specs.map((spec) => {
    const targetPhrase = normalizeTokenText(spec.matchPhrase);
    let triggerMs = sceneStartMs + Math.round(sceneDurationMs * spec.fallbackRatio);
    let matchedBy: "token-exact" | "token-fuzzy" | "fallback-ratio" = "fallback-ratio";

    if (targetPhrase.length > 0 && joinedText.length > 0) {
      const exactIdx = joinedText.lastIndexOf(targetPhrase);
      if (exactIdx >= 0) {
        // 定位到对应字符 token
        let charCount = 0;
        for (const item of charStream) {
          if (charCount >= exactIdx) {
            triggerMs = item.startMs;
            matchedBy = "token-exact";
            break;
          }
          charCount += item.norm.length;
        }
      } else if (targetPhrase.length >= 2) {
        // 尝试末字或核心字模糊匹配（如“选C”匹配“C”）
        const tailChar = targetPhrase.slice(-1);
        const fuzzyIdx = joinedText.lastIndexOf(tailChar);
        if (fuzzyIdx >= 0) {
          let charCount = 0;
          for (const item of charStream) {
            if (charCount >= fuzzyIdx) {
              triggerMs = item.startMs;
              matchedBy = "token-fuzzy";
              break;
            }
            charCount += item.norm.length;
          }
        }
      }
    }

    const relMs = Math.max(0, Math.min(sceneDurationMs - 100, triggerMs - sceneStartMs));
    const localFrame = Math.max(0, Math.round((relMs / 1000) * fps));

    return {
      ...spec,
      triggerMs,
      localFrame,
      matchedBy,
    };
  });
};
