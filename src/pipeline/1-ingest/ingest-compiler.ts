/**
 * Stage 1 (`1-ingest`) 总入口：将《讲师口播与画面分镜合一稿V0.1.md》编译为 StoryboardIR。
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {
  StoryboardIRSchema,
  type StoryboardIR,
  type StoryboardSceneIR,
} from "../../../contracts/storyboard-ir.schema.ts";
import { parseStoryboardMarkdown } from "./markdown-table-parser.ts";
import { splitCompoundScenes } from "./subscene-splitter.ts";
import { extractPauseDirectives, splitNarrationClauses } from "./pause-extractor.ts";
import { transpileVisualAndCues } from "./visual-transpiler.ts";

export const compileMarkdownToStoryboardIR = (
  markdownPath: string,
  lessonId: string,
  workspaceDir: string,
): StoryboardIR => {
  const parsed = parseStoryboardMarkdown(markdownPath);
  const splitUnits = splitCompoundScenes(parsed.rows);

  const scenes: StoryboardSceneIR[] = splitUnits.map((unit, idx) => {
    const clauses = splitNarrationClauses(unit.narration);
    const pauseDirectives = extractPauseDirectives(clauses, unit.visualBlockBody);
    const { visualType, payload, cueSpecs } = transpileVisualAndCues(unit);
    const narrationSha256 = crypto
      .createHash("sha256")
      .update(unit.narration, "utf-8")
      .digest("hex");

    const sceneObj = {
      sceneId: unit.sceneId,
      parentSceneId: unit.parentSceneId,
      segmentTitle: unit.segmentTitle,
      sceneTitle: unit.sceneTitle,
      order: idx + 1,
      estimatedSeconds: unit.estimatedSeconds,
      narration: unit.narration,
      narrationSha256,
      clauses,
      pauseDirectives,
      rawVisualInstruction: unit.visualBlockBody,
      pedagogicalIntent: unit.pedagogicalIntent,
      cueSpecs,
      visualType,
      payload,
    } as StoryboardSceneIR;

    return sceneObj;
  });

  const irCandidate: StoryboardIR = {
    schemaVersion: "1.0.0",
    lessonId,
    lessonTitle: parsed.lessonTitle,
    sourceMarkdownPath: parsed.sourceMarkdownPath,
    sourceMarkdownSha256: parsed.sourceMarkdownSha256,
    companionScriptVerified: parsed.companionScriptVerified,
    overview: parsed.overview,
    scenes,
    compiledAt: new Date().toISOString(),
  };

  const validated = StoryboardIRSchema.parse(irCandidate);

  fs.mkdirSync(workspaceDir, { recursive: true });
  const irPath = path.join(workspaceDir, "storyboard-ir.json");
  fs.writeFileSync(irPath, `${JSON.stringify(validated, null, 2)}\n`, "utf-8");

  return validated;
};
