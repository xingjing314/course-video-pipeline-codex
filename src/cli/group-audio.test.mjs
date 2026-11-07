import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const cli = path.join(root, "scripts/run-group-audio.ts");
const sha = (value) => createHash("sha256").update(value).digest("hex");

const run = (args) => spawnSync(process.execPath, ["--experimental-strip-types", cli, ...args], {
  cwd: root,
  encoding: "utf8",
});

const treeHash = (dir) => {
  if (!fs.existsSync(dir)) return "absent";
  const files = [];
  const walk = (current) => {
    for (const name of fs.readdirSync(current).sort()) {
      const full = path.join(current, name);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) walk(full);
      else files.push(`${path.relative(dir, full)}\0${sha(fs.readFileSync(full))}`);
    }
  };
  walk(dir);
  return sha(files.join("\n"));
};

const cacheFiles = () => {
  const dir = path.join(root, ".cache/audio");
  if (!fs.existsSync(dir)) return [];
  const found = [];
  const walk = (current) => {
    for (const name of fs.readdirSync(current)) {
      const full = path.join(current, name);
      if (fs.statSync(full).isDirectory()) walk(full);
      else found.push(path.relative(dir, full));
    }
  };
  walk(dir);
  return found.sort();
};

const writeIr = (dir, lessonId) => {
  const narration = `欢迎来到 ${lessonId}。`;
  const narrationSha = sha(narration);
  const source = `source/${lessonId}.md`;
  const ir = {
    schemaVersion: "1.0.0",
    lessonId,
    lessonTitle: lessonId,
    sourceMarkdownPath: source,
    sourceMarkdownSha256: sha(source),
    companionScriptVerified: false,
    overview: {
      chapterScope: "夹具",
      estimatedDurationText: "数秒",
      cognitiveGoals: ["看清对象"],
      coreVisualAssets: ["标题"],
      examAnchors: [],
    },
    scenes: [{
      sceneId: "S01",
      parentSceneId: "S01",
      segmentTitle: "引入",
      sceneTitle: "标题",
      order: 1,
      estimatedSeconds: 4,
      narration,
      narrationSha256: narrationSha,
      clauses: [narration],
      pauseDirectives: [],
      rawVisualInstruction: "标题",
      pedagogicalIntent: "说明对象",
      cueSpecs: [],
      visualType: "title-card",
      payload: { title: "标题", bullets: [] },
    }],
    compiledAt: "2026-11-07T00:00:00.000Z",
  };
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "storyboard-ir.json"), `${JSON.stringify(ir, null, 2)}\n`);
};

const assertSynthetic = (result, workspace, lessonId) => {
  const output = `${result.stdout}\n${result.stderr}`;
  assert.equal(result.status, 0, output);
  assert.match(output, new RegExp(workspace.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(output, new RegExp(`lessonId=${lessonId}`));
  assert.match(output, /mode=synthetic/);
  assert.match(output, /用时/);
  const timelinePath = path.join(workspace, "audio-timeline.json");
  const timeline = JSON.parse(fs.readFileSync(timelinePath, "utf8"));
  assert.equal(timeline.engineInfo.device, "synthetic");
  assert.equal(timeline.lessonId, lessonId);
  for (const file of [timeline.fullWavPath, timeline.srtPath]) {
    const abs = path.resolve(root, file);
    assert.equal(abs.startsWith(`${workspace}${path.sep}`), true, abs);
    assert.equal(fs.existsSync(abs), true);
  }
  console.log(output);
};

test("两个不同层级的分组目录都走同一公共入口", () => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), "group-audio-"));
  const first = path.join(base, "course-a", "groups", "opening");
  const second = path.join(base, "elsewhere", "lesson", "part");
  writeIr(first, "lesson-alpha");
  writeIr(second, "lesson-beta");
  const beforeSecond = treeHash(second);
  try {
    const firstRun = run(["--workspace", first, "--mode=synthetic"]);
    assertSynthetic(firstRun, first, "lesson-alpha");
    assert.equal(treeHash(second), beforeSecond);
    const firstAgain = run([`--workspace=${first}`, "--mode=synthetic"]);
    assertSynthetic(firstAgain, first, "lesson-alpha");
    const secondRun = run(["--workspace", second, "--mode=synthetic"]);
    assertSynthetic(secondRun, second, "lesson-beta");
    const secondAgain = run([`--workspace=${second}`, "--mode=synthetic"]);
    assertSynthetic(secondAgain, second, "lesson-beta");
  } finally {
    fs.rmSync(base, { recursive: true, force: true });
  }
});

test("缺少输入或模式错误时失败，并且不产生音频产物", () => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), "group-audio-bad-"));
  const missing = path.join(base, "missing-dir");
  const empty = path.join(base, "empty-group");
  const invalid = path.join(base, "bad-ir");
  fs.mkdirSync(empty, { recursive: true });
  fs.mkdirSync(invalid, { recursive: true });
  fs.writeFileSync(path.join(invalid, "storyboard-ir.json"), "{}\n");
  const beforeCache = cacheFiles();
  const cases = [
    { args: [], needle: "--workspace" },
    { args: ["--workspace", missing], needle: missing },
    { args: ["--workspace", empty], needle: path.join(empty, "storyboard-ir.json") },
    { args: ["--workspace", invalid], needle: path.join(invalid, "storyboard-ir.json") },
    { args: ["--workspace", empty, "--mode=nope"], needle: "nope" },
  ];
  try {
    for (const item of cases) {
      const result = run(item.args);
      const output = `${result.stdout}\n${result.stderr}`;
      assert.notEqual(result.status, 0, output);
      assert.match(output, new RegExp(item.needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
      console.log(output);
    }
    for (const dir of [empty, invalid, base]) {
      assert.equal(fs.existsSync(path.join(dir, "audio-timeline.json")), false);
      assert.equal(fs.readdirSync(dir).some((name) => name.endsWith(".wav") || name.endsWith(".srt")), false);
    }
    assert.deepEqual(cacheFiles(), beforeCache);
  } finally {
    fs.rmSync(base, { recursive: true, force: true });
  }
});

test("显式 --mode 缺少值时拒绝执行，不使用默认模式", () => {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), "group-audio-empty-mode-"));
  writeIr(workspace, "lesson-empty-mode");
  const before = treeHash(workspace);
  try {
    // 保留 dry-run，防止解析回归时测试启动真实配音。
    for (const args of [
      ["--dry-run", "--mode"],
      ["--dry-run", "--mode="],
      ["--mode", "--dry-run"],
    ]) {
      const result = run(["--workspace", workspace, ...args]);
      const output = `${result.stdout}\n${result.stderr}`;
      assert.equal(result.status, 1, output);
      assert.match(output, /--mode 缺少值/);
      assert.doesNotMatch(output, /mode=cuda/);
      assert.equal(treeHash(workspace), before);
    }
  } finally {
    fs.rmSync(workspace, { recursive: true, force: true });
  }
});

test("dry-run 不写文件，省略模式时显示 cuda", () => {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), "group-audio-dry-"));
  writeIr(workspace, "lesson-dry");
  const cache = path.join(root, ".cache/audio");
  try {
    for (const args of [
      ["--workspace", workspace, "--dry-run"],
      [`--workspace=${workspace}`, "--dry-run"],
      ["--workspace", workspace, "--dry-run", "--mode=synthetic"],
      [`--workspace=${workspace}`, "--dry-run", "--mode=synthetic"],
    ]) {
      const beforeWorkspace = treeHash(workspace);
      const beforeCache = treeHash(cache);
      const result = run(args);
      const output = `${result.stdout}\n${result.stderr}`;
      assert.equal(result.status, 0, output);
      assert.match(output, new RegExp(workspace.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
      assert.match(output, /lessonId=lesson-dry/);
      assert.match(output, args.includes("--mode=synthetic") ? /mode=synthetic/ : /mode=cuda/);
      assert.match(output, /runAudioEngine/);
      assert.match(output, /不写任何文件/);
      assert.equal(treeHash(workspace), beforeWorkspace);
      assert.equal(treeHash(cache), beforeCache);
      console.log(output);
    }
  } finally {
    fs.rmSync(workspace, { recursive: true, force: true });
  }
});

test("synthetic 不覆盖真实配音，除非显式 --force", () => {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), "group-audio-force-"));
  writeIr(workspace, "lesson-force");
  const timelinePath = path.join(workspace, "audio-timeline.json");
  const sentinel = path.join(workspace, "keep-me.wav");
  const timeline = `${JSON.stringify({ engineInfo: { device: "cuda" }, marker: "keep" }, null, 2)}\n`;
  fs.writeFileSync(timelinePath, timeline);
  fs.writeFileSync(sentinel, "sentinel-bytes");
  try {
    const refused = run(["--workspace", workspace, "--mode=synthetic"]);
    const refusedOut = `${refused.stdout}\n${refused.stderr}`;
    assert.notEqual(refused.status, 0, refusedOut);
    assert.match(refusedOut, /cuda/);
    assert.match(refusedOut, /synthetic 会覆盖/);
    assert.equal(fs.readFileSync(timelinePath, "utf8"), timeline);
    assert.equal(fs.readFileSync(sentinel, "utf8"), "sentinel-bytes");
    console.log(refusedOut);
    const forced = run(["--workspace", workspace, "--mode=synthetic", "--force"]);
    assertSynthetic(forced, workspace, "lesson-force");
    assert.equal(fs.readFileSync(sentinel, "utf8"), "sentinel-bytes");
    for (const name of fs.readdirSync(workspace)) {
      assert.equal(path.resolve(workspace, name).startsWith(workspace), true);
    }
  } finally {
    fs.rmSync(workspace, { recursive: true, force: true });
  }
});



test("test01 包装只转发 dry-run，不改分组目录", () => {
  const dirs = ["g01", "g02"].map((name) => path.join(root, "workspaces/test01", name));
  const before = dirs.map(treeHash);
  for (const script of ["run-g01-audio.mts", "run-g02-audio.mts"]) {
    const result = spawnSync(process.execPath, [
      "--experimental-strip-types",
      path.join(root, "src/lessons/test01/L01", script),
      "--dry-run",
    ], { cwd: root, encoding: "utf8" });
    const output = `${result.stdout}\n${result.stderr}`;
    assert.equal(result.status, 0, output);
    assert.match(output, /mode=cuda/);
    assert.match(output, /dry-run/);
    console.log(output);
  }
  dirs.forEach((dir, index) => assert.equal(treeHash(dir), before[index]));
  const sources = ["run-g01-audio.mts", "run-g02-audio.mts"].map((name) =>
    fs.readFileSync(path.join(root, "src/lessons/test01/L01", name), "utf8"));
  for (const source of sources) assert.equal(source.includes("runAudioEngine"), false);
});
