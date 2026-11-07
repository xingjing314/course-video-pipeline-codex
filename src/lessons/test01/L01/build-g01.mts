import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { StoryboardIRSchema } from "../../../../contracts/storyboard-ir.schema.ts";
import { G01_NARRATION } from "./g01-timing.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const work = path.join(root, "workspaces/test01/g01");
const sourcePath = "docs/lessons/test01/L01/input/test1.md";
const sha = (value: string) => createHash("sha256").update(value).digest("hex");

const narration = G01_NARRATION;
const ir = StoryboardIRSchema.parse({
  schemaVersion: "1.0.0",
  lessonId: "test01-L01-g01",
  lessonTitle: "第测试章 L01 G01",
  sourceMarkdownPath: sourcePath,
  sourceMarkdownSha256: sha(fs.readFileSync(path.join(root, sourcePath), "utf8")),
  companionScriptVerified: false,
  overview: {
    chapterScope: "6.4 与 6.4.1 的包含关系",
    estimatedDurationText: "配音完成后确定",
    cognitiveGoals: ["分清第6章第3课、6.4 和 6.4.1 的包含关系"],
    coreVisualAssets: ["课次定位", "6.4 外层", "6.4.1 内层"],
    examAnchors: [],
  },
  scenes: [
    {
      sceneId: "S01",
      parentSceneId: "S01",
      segmentTitle: "这一课在讲哪一块",
      sceneTitle: "定位 6.4 与 6.4.1",
      order: 1,
      estimatedSeconds: 18,
      narration,
      narrationSha256: sha(narration),
      clauses: [
        "欢迎来到第 6 章的第三节课，",
        "也是全章分值最密集的“第一高频霸主区”——",
        "6.4 节“价值驱动的项目管理知识体系”",
        "与 6.4.1 节“12 个项目管理原则”。",
      ],
      pauseDirectives: [],
      rawVisualInstruction: "先出现课次，再标出第一高频霸主区，然后出现 6.4 外层和 6.4.1 内层。",
      pedagogicalIntent: "分清课次、节号和包含关系",
      cueSpecs: [],
      visualType: "title-card",
      payload: { title: "第 6 章 · 第 3 课", bullets: ["6.4 价值驱动的项目管理知识体系", "6.4.1 12 个项目管理原则"] },
    },
  ],
  compiledAt: new Date().toISOString(),
});

fs.mkdirSync(work, { recursive: true });
fs.writeFileSync(path.join(work, "storyboard-ir.json"), `${JSON.stringify(ir, null, 2)}\n`);

const totalDurationMs = 18000;
const at = (phrase: string) => Math.round((narration.indexOf(phrase) / narration.length) * totalDurationMs);
const preview = {
  timeline: {
    totalDurationMs,
    fullWavPath: "",
    scenes: [{ sceneId: "S01", startMs: 0, endMs: totalDurationMs }],
    captions: [{ index: 1, sceneId: "S01", text: narration, startMs: 0, endMs: totalDurationMs }],
  },
  cues: { badgeMs: at("第一高频霸主区"), outerMs: at("6.4 节"), innerMs: at("6.4.1") },
  includeAudio: false,
  includeCaptions: true,
};
fs.writeFileSync(path.join(work, "preview-data.json"), `${JSON.stringify(preview, null, 2)}\n`);
console.log(`[G01] 已写入 ${path.relative(root, work)}`);
console.log(`  cues ${JSON.stringify(preview.cues)}`);
