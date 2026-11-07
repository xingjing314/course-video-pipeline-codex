/**
 * 公共按组配音。一次只处理 --workspace 指定的目录。
 *
 *   node --experimental-strip-types scripts/run-group-audio.ts --workspace=workspaces/<课>/<组>
 *   node --experimental-strip-types scripts/run-group-audio.ts --workspace=workspaces/<课>/<组> --dry-run
 *
 * 省略 --mode 时使用 cuda，不会自动改成 cpu 或 synthetic。
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runGroupAudioCli } from "./group-audio-cli.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
process.exit(runGroupAudioCli({
  root,
  argv: process.argv.slice(2),
  defaultMode: "cuda",
  label: "GROUP-AUDIO",
}));
