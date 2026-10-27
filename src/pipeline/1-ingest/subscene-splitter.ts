/**
 * 复合画面子镜头裂变器（subscene-splitter.ts）。
 *
 * 当《合一稿》单行第 3 列包含多个独立 `**【画面 1A：...】**` / `**【画面 1B：...】**` 块，
 * 且口播自然段数 >= 画面块数时，自动裂变为 `S01-1a`、`S01-1b` 子场景，
 * 使每个子场景拥有独立纯粹的视觉模板与对应的口播段落。
 */
import type { RawStoryboardRow } from "./markdown-table-parser.ts";

export type SplitStoryboardUnit = {
  sceneId: string;
  parentSceneId: string;
  sceneTitle: string;
  segmentTitle: string;
  estimatedSeconds: number;
  narration: string;
  visualBlockTitle: string;
  visualBlockBody: string;
  pedagogicalIntent: string;
};

const SCREEN_HEADER_REGEX = /\*\*【画面[^】]+】\*\*/g;

export const splitCompoundScenes = (rows: RawStoryboardRow[]): SplitStoryboardUnit[] => {
  const units: SplitStoryboardUnit[] = [];

  for (const row of rows) {
    const headers = [...row.visualRaw.matchAll(SCREEN_HEADER_REGEX)];

    // 只有当明确出现 >= 2 个“【画面 1A...】【画面 1B...】”切换块，且口播段落足够分配时才裂变
    const isMultiScreenSwitch =
      headers.length >= 2 &&
      row.narrationParagraphs.length >= headers.length &&
      headers.every((m) => /【画面\s*\d+[A-Z]/.test(m[0]));

    if (!isMultiScreenSwitch) {
      const firstHeader = headers[0]?.[0]?.replace(/\*\*/g, "").replace(/^【|】$/g, "") ?? row.sceneTitle;
      units.push({
        sceneId: row.rawSceneId,
        parentSceneId: row.rawSceneId,
        sceneTitle: row.sceneTitle,
        segmentTitle: row.segmentTitle,
        estimatedSeconds: row.estimatedSeconds,
        narration: row.narrationParagraphs.join("\n"),
        visualBlockTitle: firstHeader,
        visualBlockBody: row.visualRaw,
        pedagogicalIntent: row.pedagogicalIntent,
      });
      continue;
    }

    // 按 headers 位置切分 visualRaw
    const blocks: Array<{ header: string; body: string }> = [];
    for (let i = 0; i < headers.length; i += 1) {
      const startIdx = headers[i].index!;
      const endIdx = i + 1 < headers.length ? headers[i + 1].index! : row.visualRaw.length;
      const rawTitle = headers[i][0].replace(/\*\*/g, "").replace(/^【|】$/g, "");
      const body = row.visualRaw.slice(startIdx, endIdx).trim();
      blocks.push({ header: rawTitle, body });
    }

    // 将 narrationParagraphs 按字符比例或顺序分配给各子画面
    const totalParas = row.narrationParagraphs.length;
    const totalBlocks = blocks.length;
    const totalChars = row.narrationParagraphs.reduce((acc, p) => acc + p.length, 0) || 1;

    for (let bIdx = 0; bIdx < totalBlocks; bIdx += 1) {
      const startPara = Math.floor((bIdx * totalParas) / totalBlocks);
      const endPara = Math.floor(((bIdx + 1) * totalParas) / totalBlocks);
      const subParas = row.narrationParagraphs.slice(startPara, Math.max(startPara + 1, endPara));
      const subNarration = subParas.join("\n");
      const subChars = subNarration.length;
      const suffix = String.fromCharCode(97 + bIdx); // a, b, c...
      const subTitleClean = blocks[bIdx].header.replace(/^画面\s*\d+[A-Z]\s*[:：]\s*/, "").trim();

      units.push({
        sceneId: `${row.rawSceneId}${suffix}`,
        parentSceneId: row.rawSceneId,
        sceneTitle: `${row.sceneTitle} · ${subTitleClean || suffix.toUpperCase()}`,
        segmentTitle: row.segmentTitle,
        estimatedSeconds: Math.max(12, Math.round((row.estimatedSeconds * subChars) / totalChars)),
        narration: subNarration,
        visualBlockTitle: blocks[bIdx].header,
        visualBlockBody: blocks[bIdx].body,
        pedagogicalIntent: row.pedagogicalIntent,
      });
    }
  }

  return units;
};
