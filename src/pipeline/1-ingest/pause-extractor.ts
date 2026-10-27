/**
 * 口播分句与教学停顿（Pause Directives）提取器。
 *
 * 1. 按中文自然标点将分镜口播拆分为适合 Qwen3-TTS（<=120 字）的短句序列；
 * 2. 自动识别口播中的“给你两秒钟看一眼 / 扫一下四个选项”以及视觉指示中的“【停顿 2s 后动画】”，
 *    在对应分句后注入显式停顿指令（如 1500ms / 2000ms），供 Stage 2 TTS 拼接真实静音段。
 */
import type { PauseDirective } from "../../../contracts/storyboard-ir.schema.ts";

const PUNCTUATION = "，,、；;：:。！？!?";

export const splitNarrationClauses = (narration: string): string[] => {
  const normalized = narration.replace(/\s+/g, " ").trim();
  const rawClauses: string[] = [];
  let buf = "";

  for (const ch of normalized) {
    buf += ch;
    if (PUNCTUATION.includes(ch)) {
      if (buf.replace(/[^\u4e00-\u9fa5A-Za-z0-9]/g, "").length > 0) {
        rawClauses.push(buf.trim());
      }
      buf = "";
    }
  }
  if (buf.replace(/[^\u4e00-\u9fa5A-Za-z0-9]/g, "").length > 0) {
    rawClauses.push(buf.trim());
  }

  // 合并过短的分句（如“第一，”、“来，”），避免 Qwen3-TTS 对 2~3 字极短词产生气声或伪影
  const merged: string[] = [];
  for (const clause of rawClauses) {
    const pureLen = clause.replace(/[^\u4e00-\u9fa5A-Za-z0-9]/g, "").length;
    if (merged.length > 0 && pureLen <= 3 && merged[merged.length - 1].length < 80) {
      merged[merged.length - 1] = `${merged[merged.length - 1]}${clause}`;
    } else {
      merged.push(clause);
    }
  }

  return merged;
};

export const extractPauseDirectives = (
  clauses: string[],
  visualBlockBody: string,
): PauseDirective[] => {
  const directives: PauseDirective[] = [];
  const visualPauseMatch = visualBlockBody.match(/【停顿\s*(\d+(?:\.\d+)?)\s*s/i);
  const visualPauseMs = visualPauseMatch ? Math.round(Number(visualPauseMatch[1]) * 1000) : 0;

  let matchedSpokenPause = false;
  clauses.forEach((clause, idx) => {
    if (/两秒钟|看一眼|扫一下/.test(clause)) {
      directives.push({
        afterClauseIndex: idx,
        durationMs: visualPauseMs > 0 ? visualPauseMs : 2000,
        reason: `口播互动思考停顿：${clause}`,
      });
      matchedSpokenPause = true;
    }
  });

  // 若视觉指令包含【停顿 Xs 后动画】，但口播没有显式说“两秒钟”，则绑定在题面读完后的分句（约前 35% 位置）
  if (!matchedSpokenPause && visualPauseMs > 0 && clauses.length >= 2) {
    const targetIdx = Math.min(clauses.length - 2, Math.max(0, Math.floor(clauses.length * 0.35)));
    directives.push({
      afterClauseIndex: targetIdx,
      durationMs: visualPauseMs,
      reason: `视觉指令【停顿 ${visualPauseMs}ms 后动画】`,
    });
  }

  return directives;
};
