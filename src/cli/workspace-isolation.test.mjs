import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const publicIds = ["QuizCardExam", "QuizCardDual", "QuizCardCompact", "QuizCardBrief", "QuizShowcase", "Table67Example", "L01TableExample"];

const load = (script) => {
  const log = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "loads-")), "loads.txt");
  const result = spawnSync(process.execPath, [
    "--experimental-strip-types",
    "--import", path.join(root, "src/cli/register-typescript.mjs"),
    "--import", path.join(root, "src/cli/isolation-loader.mjs"),
    script,
  ], { cwd: root, encoding: "utf8", env: { ...process.env, LOAD_LOG: log } });
  const loaded = fs.existsSync(log) ? fs.readFileSync(log, "utf8").split("\n").filter(Boolean) : [];
  return { ...result, output: `${result.stdout}\n${result.stderr}`, loaded };
};

const forbidden = (file) =>
  file.includes(`${path.sep}src${path.sep}lessons${path.sep}test01${path.sep}`)
  || file.includes(`${path.sep}src${path.sep}lessons${path.sep}ch06${path.sep}`)
  || file.includes(`${path.sep}src${path.sep}lessons${path.sep}ch07${path.sep}`)
  || file.includes(`${path.sep}src${path.sep}lessons${path.sep}ch08${path.sep}`)
  || file.includes(`${path.sep}workspaces${path.sep}`);

test("公共入口与 test01 入口各加载两次，依赖互相分开", () => {
  const publicScript = path.join(root, "src/cli/print-public-ids.mjs");
  const courseScript = path.join(root, "src/cli/print-course-ids.mjs");
  const first = load(publicScript);
  const second = load(publicScript);
  assert.equal(first.status, 0, first.output);
  assert.equal(second.status, 0, second.output);
  const ids = JSON.parse(first.stdout);
  assert.deepEqual(ids, JSON.parse(second.stdout));
  assert.equal(ids.length > 0, true);
  for (const id of publicIds) assert.equal(ids.includes(id), true, id);
  assert.equal(ids.some((id) => /^(Test01|Ch0|CourseVideo|L0[123]Lesson)/.test(id)), false);
  for (const file of first.loaded) assert.equal(forbidden(file), false, file);
  console.log(first.stdout.trim());

  const courseFirst = load(courseScript);
  const courseSecond = load(courseScript);
  assert.equal(courseFirst.status, 0, courseFirst.output);
  assert.equal(courseSecond.status, 0, courseSecond.output);
  const courseIds = JSON.parse(courseFirst.stdout);
  assert.deepEqual(courseIds, JSON.parse(courseSecond.stdout));
  for (const id of ["Test01L01Full", "Test01L01FullSilentClean"]) {
    assert.equal(courseIds.includes(id), true, id);
  }
  assert.equal(courseFirst.loaded.some((file) => file.includes(`${path.sep}workspaces${path.sep}test01${path.sep}`)), true);
  assert.equal(courseFirst.loaded.some((file) => /workspaces\/ch0[678]/.test(file)), false);
  assert.equal(courseFirst.loaded.some((file) => /src\/lessons\/ch0[678]/.test(file)), false);
  const studioSource = fs.readFileSync(path.join(root, "src/lessons/test01/studio.tsx"), "utf8");
  assert.match(studioSource, /registerRoot\s*\(/);
  console.log(courseFirst.stdout.trim());
});
