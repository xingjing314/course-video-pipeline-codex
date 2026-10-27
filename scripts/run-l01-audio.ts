/**
 * 从已生成的 StoryboardIR 跑 Stage 2（配音 + 对齐）。
 *
 * 用法：
 *   node --experimental-strip-types scripts/run-l01-audio.ts --mode=synthetic
 *   node --experimental-strip-types scripts/run-l01-audio.ts --mode=cuda      # 需要 GPU
 *
 * synthetic 只写静音 WAV + 均匀字级 token，用来验证链路；真实配音走 cuda，
 * 由 qwen3-tts / qwen3-forced-aligner 两个 venv 在 RTX 上跑。
 */
import fs from "node:fs";
import path from "node:path";
import { parseLessonArg } from "./_lesson-arg.ts";
import { fileURLToPath } from "node:url";
import { StoryboardIRSchema } from "../contracts/storyboard-ir.schema.ts";
import { runAudioEngine } from "../src/pipeline/2-audio/audio-runner.ts";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const { workspace: WORKSPACE } = parseLessonArg(ROOT);

const modeArg = process.argv.find((a) => a.startsWith("--mode="));
const mode = (modeArg ? modeArg.split("=")[1] : "synthetic") as "cuda" | "cpu" | "synthetic";

const force = process.argv.includes("--force");

/**
 * 安全闸：synthetic 会覆盖真实配音与时间线。
 *
 * 如果已有非 synthetic 的产物，必须显式加 --force 才允许覆盖。
 * （2026-10-25 就因为一次无声明的 synthetic 运行，覆盖了 L01 的真实音频。）
 */
const timelinePath = path.join(WORKSPACE, "audio-timeline.json");
if (mode === "synthetic" && !force && fs.existsSync(timelinePath)) {
  const prev = JSON.parse(fs.readFileSync(timelinePath, "utf-8"));
  const prevDevice = prev?.engineInfo?.device ?? "unknown";
  if (prevDevice !== "synthetic") {
    throw new Error(
      `已有真实产物（engineInfo.device=${prevDevice}），synthetic 会覆盖它。\n` +
        `确实要覆盖请加 --force；只想验证链路请用 --dry-run。`,
    );
  }
}
const irPath = path.join(WORKSPACE, "storyboard-ir.json");
if (!fs.existsSync(irPath)) throw new Error(`缺少 ${irPath}，先跑 build-l01-ir.ts`);

const ir = StoryboardIRSchema.parse(JSON.parse(fs.readFileSync(irPath, "utf-8")));
console.log(`[AUDIO] mode=${mode} scenes=${ir.scenes.length}`);

if (process.argv.includes("--dry-run")) {
  console.log("[AUDIO] dry-run：不写任何文件");
  process.exit(0);
}

const t0 = Date.now();
const timeline = runAudioEngine(ir, ROOT, WORKSPACE, mode);
const sec = ((Date.now() - t0) / 1000).toFixed(1);

console.log(`[AUDIO] 完成，用时 ${sec}s`);
console.log(`  total ${(timeline.totalDurationMs / 1000).toFixed(1)}s ｜ captions ${timeline.captions.length}`);
console.log(`  wav  ${path.relative(ROOT, path.join(ROOT, timeline.fullWavPath))}`);
console.log(`  srt  ${path.relative(ROOT, path.join(ROOT, timeline.srtPath))}`);
