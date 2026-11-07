import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { parseRenderArgs, resolveRenderEntry } from "../../scripts/render-lesson.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

test("--entry 进入命令行解析，并原样作为打包入口", () => {
  const entry = "src/lessons/fixture/studio.tsx";
  const args = parseRenderArgs([
    "--lesson=fixture-L09",
    "--composition=FixtureSilentClean",
    "--output=deliverables/fixture-L09/silent-clean.mp4",
    "--silent-clean",
    `--entry=${entry}`,
  ]);
  assert.equal(args.entry, entry);
  assert.equal(args.composition, "FixtureSilentClean");
  assert.equal(resolveRenderEntry("fixture-L09", args.entry), entry);
  assert.equal(resolveRenderEntry("fixture-L09", undefined), "src/lessons/fixture/studio.tsx");
});

test("新课程私有路径被忽略，test01 源码和工作区 JSON 不被忽略", () => {
  const check = (file) => spawnSync("git", ["check-ignore", "-q", "--", file], { cwd: root }).status;
  assert.equal(check("src/lessons/fixture/studio.tsx"), 0);
  assert.equal(check("docs/lessons/fixture/L01/notes.md"), 0);
  assert.equal(check("workspaces/fixture-L09/compiled-lesson.json"), 0);
  assert.equal(check("src/lessons/test01/studio.tsx"), 1);
  assert.equal(check("docs/lessons/test01/L01/notes.md"), 1);
  assert.equal(check("workspaces/test01/g01/preview-data.json"), 1);
  assert.equal(check("src/examples/index.tsx"), 1);
  assert.equal(check("workspaces/test01/g01/narration.wav"), 0);
});
