/**
 * 确定性字幕切分与 UTF-8 SRT 导出器（srt-exporter.ts）。
 *
 * 将字级对齐时间戳（AlignedToken[]）结合原始标点切分为单行 <= 28 字、
 * 时间严密递增、不重叠的权威字幕轨，并导出标准 SRT 文件。
 */
import type { AlignedToken, CaptionSegment } from "../../../contracts/audio-timeline.schema.ts";

const formatSrtTimestamp = (ms: number): string => {
  const clamped = Math.max(0, Math.round(ms));
  const hours = Math.floor(clamped / 3_600_000);
  const minutes = Math.floor((clamped % 3_600_000) / 60_000);
  const seconds = Math.floor((clamped % 60_000) / 1000);
  const millis = clamped % 1000;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")},${String(millis).padStart(3, "0")}`;
};

export const buildCaptionsFromTokens = (
  sceneId: string,
  tokens: AlignedToken[],
  startIndex: number,
): CaptionSegment[] => {
  const captions: CaptionSegment[] = [];
  let buf: AlignedToken[] = [];
  let idx = startIndex;

  const flush = () => {
    if (buf.length === 0) return;
    const text = buf.map((t) => t.text).join("").trim();
    if (!text) {
      buf = [];
      return;
    }
    const prevEnd = captions.length > 0 ? captions[captions.length - 1].endMs : 0;
    const startMs = Math.max(prevEnd, buf[0].startMs);
    const endMs = Math.max(startMs + 120, buf[buf.length - 1].endMs);
    captions.push({
      index: idx++,
      sceneId,
      text,
      startMs,
      endMs,
    });
    buf = [];
  };

  for (const token of tokens) {
    if (buf.length > 0) {
      const prev = buf[buf.length - 1];
      const gapMs = token.startMs - prev.endMs;
      const curChars = buf.reduce((sum, item) => sum + item.text.length, 0);
      if ((gapMs >= 180 && curChars >= 5) || curChars >= 16) {
        flush();
      }
    }
    buf.push(token);
  }
  flush();

  return captions;
};


/**
 * 按原文标点切分字幕（推荐）。
 *
 * 对齐后的 token 是**纯字符、没有标点**，只按时间间隔或字数切，必然切出
 * "…三个身份信" 这种半句。本函数拿回带标点的原文，把标点作为零时长的锚点
 * 插回字符流，再按"优先在标点处断、字数只作上限"的规则切分。
 *
 * 规则：以句末标点（。！？）为强断点（≥4 字即可断），以逗号顿号等为弱断点（≥6 字），
 * 单行超过 MAX_CHARS 时强制断。
 */
export const buildCaptionsFromNarration = (
  sceneId: string,
  narration: string,
  tokens: AlignedToken[],
  startIndex: number,
): CaptionSegment[] => {
  const MAX_CHARS = 26;
  const MIN_CHARS = 6;
  const norm = (text: string) => text.replace(/[^\u4e00-\u9fa5A-Za-z0-9]/g, "").toUpperCase();

  // 1) token 流摊平成"字符 + 时间"表（token 可能是 "2023" 这种多字符块）
  const flat: { ch: string; startMs: number; endMs: number }[] = [];
  for (const t of tokens) {
    for (const ch of norm(t.text)) flat.push({ ch, startMs: t.startMs, endMs: t.endMs });
  }
  const joined = flat.map((f) => f.ch).join("");

  // 2) 原文按标点切 clause（保留标点）
  // 切分时把标点后紧跟的右引号/右括号一并归入本句，
  // 否则会出现下一行以 ” 开头这种断法。
  const splitClauses = (text: string): string[] => {
    const out: string[] = [];
    let buf = "";
    for (let i = 0; i < text.length; i += 1) {
      buf += text[i];
      if (/[，。、；：？！…]/.test(text[i])) {
        while (i + 1 < text.length && /[”’）》」』】]/.test(text[i + 1])) {
          buf += text[i + 1];
          i += 1;
        }
        out.push(buf.trim());
        buf = "";
      }
    }
    if (buf.trim()) out.push(buf.trim());
    return out.filter((c) => c.length > 0);
  };

  const clauses = splitClauses(narration);

  // 3) 每个 clause 在 token 流里顺序查找，得到起止时间
  let cursor = 0;
  const timed: { text: string; startMs: number; endMs: number }[] = [];
  let lastEnd = tokens.length > 0 ? tokens[0].startMs : 0;

  for (const clause of clauses) {
    const target = norm(clause);
    if (!target) {
      timed.push({ text: clause, startMs: lastEnd, endMs: lastEnd });
      continue;
    }
    const at = joined.indexOf(target, cursor);
    if (at < 0) {
      // 找不到（对齐器吞字）：沿用上一个的结束时间
      timed.push({ text: clause, startMs: lastEnd, endMs: lastEnd });
      continue;
    }
    const startMs = flat[at].startMs;
    const endMs = flat[at + target.length - 1].endMs;
    cursor = at + target.length;
    lastEnd = endMs;
    timed.push({ text: clause, startMs, endMs });
  }

  // 4) 合并 clause 成字幕行：句末标点且够长就断，逗号类至少 10 字再断，超长强制断
  const captions: CaptionSegment[] = [];
  let buf: { text: string; startMs: number; endMs: number }[] = [];
  let idx = startIndex;

  const visible = (arr: typeof buf) => arr.reduce((sum, c) => sum + norm(c.text).length, 0);

  const flush = () => {
    if (buf.length === 0) return;
    const text = buf.map((c) => c.text).join("").trim();
    const startMs = buf[0].startMs;
    const endMs = Math.max(startMs + 120, buf[buf.length - 1].endMs);
    captions.push({ index: idx++, sceneId, text, startMs, endMs });
    buf = [];
  };

  for (const clause of timed) {
    buf.push(clause);
    const len = visible(buf);
    const endsStrong = /[。！？…]$/.test(clause.text);
    const endsWeak = /[，、；：]$/.test(clause.text);
    if ((endsStrong && len >= 4) || (endsWeak && len >= 10) || len >= MAX_CHARS) flush();
  }
  flush();

  // 4.5) 单行仍然过长（>28 可见字）：按优先级选断点（：；，→ 、），时间按字数比例分
  const splitLong = (cap: CaptionSegment): CaptionSegment[] => {
    const vis = norm(cap.text).length;
    if (vis <= 28) return [cap];
    const chars = [...cap.text];
    const pick = (marks: string[]) => {
      const cands = chars
        .map((ch, i) => (marks.includes(ch) && i > 2 && i < chars.length - 2 ? i : -1))
        .filter((i) => i > 0);
      if (cands.length === 0) return -1;
      return cands.reduce((best, i) =>
        Math.abs(i - chars.length / 2) < Math.abs(best - chars.length / 2) ? i : best,
      );
    };
    let mid = pick(["：", "；"]);
    if (mid < 0) mid = pick(["，"]);
    if (mid < 0) mid = pick(["、", "—"]);
    if (mid < 0) return [cap];

    // 右引号、右括号要跟着前一句走，不能落到下一行开头
    let cut = mid + 1;
    while (cut < chars.length && /[”’）》」』】]/.test(chars[cut])) cut += 1;
    const head = chars.slice(0, cut).join("");
    const tail = chars.slice(cut).join("");
    if (!tail.trim()) return [cap];
    const ratio = norm(head).length / vis;
    const cutMs = Math.round(cap.startMs + (cap.endMs - cap.startMs) * ratio);
    return [
      { ...cap, text: head, endMs: cutMs },
      { ...cap, text: tail, startMs: cutMs, endMs: cap.endMs },
    ];
  };

  // 5) 兜底：时间严格递增、不重叠
  for (let i = 0; i < captions.length; i += 1) {
    if (i > 0 && captions[i].startMs < captions[i - 1].endMs) {
      captions[i].startMs = captions[i - 1].endMs;
    }
    captions[i].endMs = Math.max(captions[i].startMs + 120, captions[i].endMs);
  }

  return captions
    .filter((c) => c.text.length > 0 && norm(c.text).length >= MIN_CHARS / 2)
    .flatMap(splitLong)
    .map((c, i) => ({ ...c, index: startIndex + i }));
};

export const exportCaptionsToSrt = (captions: CaptionSegment[]): string => {
  return captions
    .map(
      (cap, idx) =>
        `${idx + 1}\n${formatSrtTimestamp(cap.startMs)} --> ${formatSrtTimestamp(cap.endMs)}\n${cap.text}\n`,
    )
    .join("\n");
};
