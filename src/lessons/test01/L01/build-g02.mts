import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { StoryboardIRSchema } from "../../../../contracts/storyboard-ir.schema.ts";
import { G02_NARRATION } from "./g02-timing.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const work = path.join(root, "workspaces/test01/g02");
const sourcePath = "docs/lessons/test01/L01/input/test1.md";
const sha = (value: string) => createHash("sha256").update(value).digest("hex");
const narration = G02_NARRATION;
const ir = StoryboardIRSchema.parse({
  schemaVersion: "1.0.0",
  lessonId: "test01-L01-g02",
  lessonTitle: "第测试章 L01 G02",
  sourceMarkdownPath: sourcePath,
  sourceMarkdownSha256: sha(fs.readFileSync(path.join(root, sourcePath), "utf8")),
  companionScriptVerified: false,
  overview: {
    chapterScope: "6.4.1 在 11 套试卷中的 9 道选择题",
    estimatedDurationText: "配音完成后确定",
    cognitiveGoals: ["看见 9 道选择题属于 6.4.1，而不是整节 6.4"],
    coreVisualAssets: ["6.4 参照", "6.4.1", "11 套中的 9 道"],
    examAnchors: ["索引 6.4.1 共 9 道"],
  },
  scenes: [
    {
      sceneId: "S02",
      parentSceneId: "S02",
      segmentTitle: "密在哪一个小节",
      sceneTitle: "11 套试卷里的 9 道选择题",
      order: 2,
      estimatedSeconds: 12,
      narration,
      narrationSha256: sha(narration),
      clauses: ["单单 6.4.1 这一个小节，", "在 11 套试卷里", "就考了整整 9 道选择题！"],
      pauseDirectives: [],
      rawVisualInstruction: "6.4 保持为参照。先出现 11 套试卷，再说到 9 道选择题时，9 落在这 11 套之内。",
      pedagogicalIntent: "看见考题次数属于 6.4.1",
      cueSpecs: [],
      visualType: "title-card",
      payload: { title: "6.4.1", bullets: ["11 套试卷", "9 道选择题"] },
    },
  ],
  compiledAt: new Date().toISOString(),
});

fs.mkdirSync(work, { recursive: true });
fs.writeFileSync(path.join(work, "storyboard-ir.json"), `${JSON.stringify(ir, null, 2)}\n`);
const totalDurationMs = 12000;
const at = (phrase: string) => Math.round((narration.indexOf(phrase) / narration.length) * totalDurationMs);
const preview = {
  timeline: {
    totalDurationMs,
    fullWavPath: "",
    scenes: [{ sceneId: "S02", startMs: 0, endMs: totalDurationMs }],
    captions: [{ index: 1, sceneId: "S02", text: narration, startMs: 0, endMs: totalDurationMs }],
  },
  cues: { papersMs: at("11 套试卷"), questionsMs: at("9 道选择题") },
  includeAudio: false,
  includeCaptions: true,
};
fs.writeFileSync(path.join(work, "preview-data.json"), `${JSON.stringify(preview, null, 2)}\n`);
console.log(`[G02] 已写入 ${path.relative(root, work)}`);
console.log(`  cues ${JSON.stringify(preview.cues)}`);
