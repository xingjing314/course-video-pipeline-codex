/**
 * 双版本视频与四项交付渲染 CLI（`npm run render`）。
 *
 * 用法示例：
 *   npm run render -- --lesson=ch07-L01
 *   npm run render -- --lesson=ch07-L01 --max-frames=90
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CompiledLessonSchema } from "../../contracts/compiled-lesson.schema.ts";
import { renderLessonDeliverables } from "../pipeline/4-render/nvenc-renderer.ts";

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

const parseArgs = (argv: string[]) => {
  let lesson = "ch07-L01";
  let maxFrames: number | undefined;

  for (let i = 0; i < argv.length; i += 1) {
    const [flag, inline] = argv[i].split("=", 2);
    const val = () => (inline !== undefined ? inline : argv[++i]);
    if (flag === "--lesson") lesson = val();
    else if (flag === "--max-frames") maxFrames = Number(val());
  }
  return { lesson, maxFrames };
};

const main = async () => {
  const { lesson, maxFrames } = parseArgs(process.argv.slice(2));
  const compiledPath = path.join(PROJECT_ROOT, "workspaces", lesson, "compiled-lesson.json");
  if (!fs.existsSync(compiledPath)) {
    throw new Error(`未找到 ${compiledPath}，请先运行 npm run compile -- --lesson=${lesson}`);
  }

  const compiled = CompiledLessonSchema.parse(JSON.parse(fs.readFileSync(compiledPath, "utf-8")));
  const manifest = await renderLessonDeliverables(compiled, PROJECT_ROOT, { maxFrames });

  console.log(`\n==================================================================`);
  console.log(`[4-RENDER] ✓ 课程 ${lesson} 四项标准交付物导出并核验成功！`);
  for (const item of manifest.deliverables) {
    console.log(
      `  - [${item.role.padEnd(16)}] ${item.path} (${(item.bytes / 1024).toFixed(1)} KB)`,
    );
  }
  console.log(`==================================================================\n`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
