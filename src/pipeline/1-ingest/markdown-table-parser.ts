/**
 * 《讲师口播与画面分镜合一稿V0.1.md》确定性 Markdown 表格 AST 解析器。
 *
 * 提取：
 * 1. 课程标题与同目录《完整口播稿V0.1.md》引用（并做一致性核验）
 * 2. 一、课前速览卡（LessonOverviewCard）
 * 3. 二、分段口播与画面分镜合一表（四列表格原始行）
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import type { LessonOverviewCard } from "../../../contracts/storyboard-ir.schema.ts";

export type RawStoryboardRow = {
  rawSceneId: string;
  sceneTitle: string;
  estimatedSeconds: number;
  segmentTitle: string;
  narrationRaw: string;
  narrationParagraphs: string[];
  visualRaw: string;
  pedagogicalIntent: string;
};

export type ParsedMarkdownStoryboard = {
  lessonTitle: string;
  sourceMarkdownPath: string;
  sourceMarkdownSha256: string;
  companionScriptVerified: boolean;
  overview: LessonOverviewCard;
  rows: RawStoryboardRow[];
};

const cleanCellHtml = (raw: string): string =>
  raw
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/&nbsp;/g, " ")
    .trim();

const stripMarkdownFormatting = (text: string): string =>
  text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim();

/**
 * 解析顶层 Markdown 表格行（跳过内嵌在单元格 <br> 中的子表头，因为合一稿每个主表行以 `| **S0` 或 `| **项目` 开头）。
 */
const splitMarkdownTableCells = (line: string): string[] => {
  const trimmed = line.trim();
  const inner = trimmed.startsWith("|") ? trimmed.slice(1) : trimmed;
  const withoutTrailing = inner.endsWith("|") ? inner.slice(0, -1) : inner;
  // 注意：合一稿第 3 列可能内嵌 `| 考题关键词 | 归属维度 |` 表格，因此四列表格按前 2 列和最后 1 列定界：
  const parts = withoutTrailing.split("|");
  if (parts.length <= 4) {
    return parts.map((p) => p.trim());
  }
  const col1 = parts[0].trim();
  const col2 = parts[1].trim();
  const col4 = parts[parts.length - 1].trim();
  const col3 = parts.slice(2, parts.length - 1).join("|").trim();
  return [col1, col2, col3, col4];
};

export const parseStoryboardMarkdown = (markdownFilePath: string): ParsedMarkdownStoryboard => {
  const absPath = path.resolve(markdownFilePath);
  if (!fs.existsSync(absPath)) {
    throw new Error(`找不到合一稿文件：${absPath}`);
  }
  const rawBuffer = fs.readFileSync(absPath);
  const sourceMarkdownSha256 = crypto.createHash("sha256").update(rawBuffer).digest("hex");
  const content = rawBuffer.toString("utf-8").replace(/\r\n/g, "\n");
  const lines = content.split("\n");

  // 1. 提取一级标题
  const h1Line = lines.find((l) => l.startsWith("# "));
  const lessonTitle = h1Line ? h1Line.replace(/^#\s+/, "").trim() : path.basename(absPath, ".md");

  // 2. 提取课前速览卡
  const overviewMap = new Map<string, string>();
  let inSection1 = false;
  let inSection2 = false;
  let currentSegmentTitle = "段 1";
  const rows: RawStoryboardRow[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("## 一、")) {
      inSection1 = true;
      inSection2 = false;
      continue;
    }
    if (trimmed.startsWith("## 二、")) {
      inSection1 = false;
      inSection2 = true;
      continue;
    }
    if (trimmed.startsWith("## 三、")) {
      inSection1 = false;
      inSection2 = false;
      continue;
    }

    if (inSection1 && trimmed.startsWith("|")) {
      const cells = trimmed
        .slice(1, trimmed.endsWith("|") ? -1 : undefined)
        .split("|")
        .map((c) => c.trim());
      if (cells.length >= 2 && !cells[0].includes("---") && cells[0] !== "项目") {
        const key = stripMarkdownFormatting(cells[0]);
        const val = cleanCellHtml(cells.slice(1).join(" | "));
        overviewMap.set(key, val);
      }
    }

    if (inSection2) {
      if (trimmed.startsWith("### ")) {
        currentSegmentTitle = trimmed
          .replace(/^###\s+/, "")
          .replace(/（预计.*?）/, "")
          .trim();
        continue;
      }
      if (trimmed.startsWith("|") && /\*\*S\d{2}-\d+\*\*/.test(trimmed)) {
        const [col1Raw, col2Raw, col3Raw, col4Raw] = splitMarkdownTableCells(trimmed);
        const col1Lines = cleanCellHtml(col1Raw)
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);

        const idMatch = col1Lines[0]?.match(/S\d{2}-\d+/);
        const rawSceneId = idMatch ? idMatch[0] : `S00-${rows.length + 1}`;
        const sceneTitle = stripMarkdownFormatting(col1Lines[1] ?? rawSceneId);
        const secMatch = col1Raw.match(/(\d+)\s*s/i) ?? col1Raw.match(/(\d+)\s*秒/);
        const estimatedSeconds = secMatch ? Number(secMatch[1]) : 60;

        const narrationClean = cleanCellHtml(col2Raw);
        const narrationParagraphs = narrationClean
          .split(/\n{2,}|\n/)
          .map((p) => stripMarkdownFormatting(p))
          .filter(Boolean);

        const visualRaw = cleanCellHtml(col3Raw);
        const pedagogicalIntent = stripMarkdownFormatting(cleanCellHtml(col4Raw));

        rows.push({
          rawSceneId,
          sceneTitle,
          estimatedSeconds,
          segmentTitle: currentSegmentTitle,
          narrationRaw: narrationParagraphs.join("\n"),
          narrationParagraphs,
          visualRaw,
          pedagogicalIntent,
        });
      }
    }
  }

  if (rows.length === 0) {
    throw new Error(`未能从 ${absPath} 解析出任何 SXX-X 分镜行`);
  }

  const splitList = (raw: string | undefined): string[] =>
    (raw ?? "")
      .split("\n")
      .map((s) => stripMarkdownFormatting(s.replace(/^\d+\.\s*/, "")))
      .filter(Boolean);

  const overview: LessonOverviewCard = {
    chapterScope: stripMarkdownFormatting(overviewMap.get("所属章节与教材范围") ?? lessonTitle),
    estimatedDurationText: stripMarkdownFormatting(overviewMap.get("预计总时长") ?? "约 10 分钟"),
    cognitiveGoals: splitList(overviewMap.get("本课核心认知目标")),
    coreVisualAssets: splitList(overviewMap.get("本课核心视觉资产")),
    examAnchors: splitList(overviewMap.get("课堂嵌入真题锚点")),
  };

  // 3. 检查同目录完整口播稿一致性（若存在）
  let companionScriptVerified = false;
  const linkMatch = content.match(/\[([^\]]+完整口播稿[^\]]*\.md)\]/);
  if (linkMatch) {
    const companionPath = path.join(path.dirname(absPath), linkMatch[1]);
    if (fs.existsSync(companionPath)) {
      const companionText = fs.readFileSync(companionPath, "utf-8");
      const normalizeChars = (s: string) => s.replace(/[^\u4e00-\u9fa5A-Za-z0-9]/g, "");
      const allNarrationNorm = normalizeChars(rows.map((r) => r.narrationRaw).join(""));
      const companionNorm = normalizeChars(companionText);
      companionScriptVerified = companionNorm.includes(allNarrationNorm.slice(0, 60));
    }
  }

  return {
    lessonTitle,
    sourceMarkdownPath: absPath,
    sourceMarkdownSha256,
    companionScriptVerified,
    overview,
    rows,
  };
};
