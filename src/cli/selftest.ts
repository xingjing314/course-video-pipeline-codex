/**
 * 架构端到端自测（`npm run test`）。
 *
 * 对《第7章》全部三篇真实《讲师口播与画面分镜合一稿V0.1.md》（L01 / L02 / L03）
 * 执行 Stage 1 -> Stage 2 -> Stage 3 全链路编译与 Zod 契约核验。
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compileMarkdownToStoryboardIR } from "../pipeline/1-ingest/ingest-compiler.ts";
import { runAudioEngine } from "../pipeline/2-audio/audio-runner.ts";
import { linkAndAssembleLesson } from "../pipeline/3-link/assembler.ts";

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const CH07_DIR = "/projects/gaoxiang/information-systems-project-management-4e-course-Gemini/docs/第7章";

const LESSONS = [
  { id: "ch07-L01", file: "L01-讲师口播与画面分镜合一稿V0.1.md" },
  { id: "ch07-L02", file: "L02-讲师口播与画面分镜合一稿V0.1.md" },
  { id: "ch07-L03", file: "L03-讲师口播与画面分镜合一稿V0.1.md" },
];

const main = () => {
  for (const item of LESSONS) {
    const mdPath = path.join(CH07_DIR, item.file);
    const workspaceDir = path.join(PROJECT_ROOT, "workspaces", item.id);
    const ir = compileMarkdownToStoryboardIR(mdPath, item.id, workspaceDir);
    const timeline = runAudioEngine(ir, PROJECT_ROOT, workspaceDir, "synthetic");
    const compiled = linkAndAssembleLesson(ir, timeline, PROJECT_ROOT, workspaceDir, 30);

    const visualTypes = [...new Set(compiled.scenes.map((s) => s.visualType))];
    console.log(
      `[PASS] ${item.id}: scenes=${compiled.scenes.length}, companionVerified=${ir.companionScriptVerified}, captions=${compiled.captions.length}, duration=${(compiled.meta.durationMs / 1000).toFixed(1)}s, templates=[${visualTypes.join(", ")}]`,
    );
  }

  // 最后将 ch07-L01 设为 current-lesson.json 默认激活课程
  const l01Dir = path.join(PROJECT_ROOT, "workspaces", "ch07-L01");
  const l01Ir = compileMarkdownToStoryboardIR(
    path.join(CH07_DIR, "L01-讲师口播与画面分镜合一稿V0.1.md"),
    "ch07-L01",
    l01Dir,
  );
  const l01Timeline = runAudioEngine(l01Ir, PROJECT_ROOT, l01Dir, "synthetic");
  linkAndAssembleLesson(l01Ir, l01Timeline, PROJECT_ROOT, l01Dir, 30);
  console.log(`[SELFTEST] 全部 3 节《合一稿V0.1》编译与契约自测通过！`);
};

main();
