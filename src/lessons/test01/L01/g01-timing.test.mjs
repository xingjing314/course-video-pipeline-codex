import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { findPhraseStartMs } from "./g01-timing.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const timeline = JSON.parse(fs.readFileSync(path.join(root, "workspaces/test01/g01/audio-timeline.json"), "utf8"));
const tokens = timeline.scenes.flatMap((scene) => scene.tokens);

test("短语触发点取开头，并用「节」区分 6.4 与 6.4.1", () => {
  const badge = findPhraseStartMs(tokens, "第一高频霸主区");
  const outer = findPhraseStartMs(tokens, "6.4节");
  const inner = findPhraseStartMs(tokens, "6.4.1节");
  const head = ["第", "一", "高", "频", "霸", "主", "区"];
  const badgeToken = tokens.find((_, index) => head.every((text, offset) => tokens[index + offset]?.text === text));
  const zone = tokens.find((token, index) => token.text === "区" && tokens[index - 1]?.text === "主");
  assert.equal(badge, badgeToken.startMs);
  assert.ok(badge < zone.startMs);
  assert.equal(outer, tokens.find((token) => token.text === "64").startMs);
  assert.equal(inner, tokens.find((token) => token.text === "641").startMs);
  assert.ok(outer < inner);
});
