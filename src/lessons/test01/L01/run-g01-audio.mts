import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const extra = process.argv.slice(2).filter((arg) => !arg.startsWith("--workspace=") && arg !== "--workspace");
const result = spawnSync(process.execPath, [
  "--experimental-strip-types",
  path.join(root, "scripts/run-group-audio.ts"),
  `--workspace=${path.join(root, "workspaces/test01/g01")}`,
  ...extra,
], { stdio: "inherit" });
process.exit(result.status ?? 1);
