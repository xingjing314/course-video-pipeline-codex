/**
 * 双版本视频与四项交付渲染 CLI（`npm run render`）。
 *
 * 用法示例：
 *   npm run render -- --lesson=<课号> --entry=<入口> --composition=<干净版 Composition>
 *   npm run render -- --lesson=<课号> --entry=<入口> --composition=<干净版 Composition> --frames=240-389
 *   npm run render -- --lesson=<课号> --clean=<已有干净 MP4>
 *
 * 调用方提供入口和干净版 Composition。未提供干净版时渲染一次，再调用 composeLesson()。
 * --frames 与 --max-frames 同时裁视频、交付 WAV 和 SRT。已有输出拒绝覆盖。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CompiledLessonSchema } from "../../contracts/compiled-lesson.schema.ts";
import { renderLessonDeliverables } from "../pipeline/4-render/nvenc-renderer.ts";

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

const parseArgs = (argv: string[]) => {
  let lesson: string | undefined;
  let maxFrames: number | undefined;
  let frames: string | undefined;
  let cleanVideo: string | undefined;
  let entry: string | undefined;
  let composition: string | undefined;

  for (let i = 0; i < argv.length; i += 1) {
    const [flag, inline] = argv[i].split("=", 2);
    const val = () => (inline !== undefined ? inline : argv[++i]);
    if (flag === "--lesson") lesson = val();
    else if (flag === "--max-frames") maxFrames = Number(val());
    else if (flag === "--frames") frames = val();
    else if (flag === "--clean") cleanVideo = val();
    else if (flag === "--entry") entry = val();
    else if (flag === "--composition") composition = val();
  }
  if (!lesson) throw new Error("请指定 --lesson。");
  if (!cleanVideo && (!entry || !composition)) {
    throw new Error("渲染干净版需要 --entry 和 --composition；已有干净版请传 --clean。");
  }
  return { lesson, maxFrames, frames, cleanVideo, entry, composition };
};

const main = async () => {
  const { lesson, maxFrames, frames, cleanVideo, entry, composition } = parseArgs(process.argv.slice(2));
  const compiledPath = path.join(PROJECT_ROOT, "workspaces", lesson, "compiled-lesson.json");
  if (!fs.existsSync(compiledPath)) {
    throw new Error(`未找到 ${compiledPath}，请先运行 npm run compile -- --lesson=${lesson}`);
  }

  const compiled = CompiledLessonSchema.parse(JSON.parse(fs.readFileSync(compiledPath, "utf-8")));
  const delivered = await renderLessonDeliverables(compiled, PROJECT_ROOT, {
    maxFrames, frames, cleanVideo, entry, composition,
  });

  console.log(`\n==================================================================`);
  console.log(`[4-RENDER] ✓ 课程 ${lesson} 已用一次干净画面和 composeLesson 完成交付`);
  console.log(`  - 帧范围 ${delivered.range.startFrame}-${delivered.range.endFrame}（${delivered.range.totalFrames} 帧）`);
  console.log(`  - 干净版 ${delivered.cleanVideo}${delivered.cleanRendered ? "" : "（复用）"}`);
  for (const [role, file] of Object.entries(delivered.outputs)) {
    console.log(`  - [${role}] ${file}`);
  }
  console.log(`==================================================================\n`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
