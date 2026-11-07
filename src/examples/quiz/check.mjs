import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Internals } from "remotion";
import ts from "typescript";

// 使用仓库已有 TypeScript 编译器加载真实 TSX，不启动浏览器或视频渲染。
const sourceRoot = new URL("../../../", import.meta.url).href;
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith(".") && context.parentURL?.startsWith(sourceRoot)) {
      for (const suffix of ["", ".ts", ".tsx"]) {
        const url = new URL(specifier + suffix, context.parentURL);
        if (existsSync(url)) return nextResolve(url.href, context);
      }
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url.startsWith(sourceRoot) && /\.tsx?$/.test(url)) {
      return {
        format: "module", shortCircuit: true,
        source: ts.transpileModule(readFileSync(new URL(url), "utf8"), {
          compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
        }).outputText,
      };
    }
    return nextLoad(url, context);
  },
});

const { ExamQuizCard, DualQuizBattleCard, CompactQuizCard, BriefQuizCard, QUIZ_COLORS } = await import("../../visual/templates/quiz.ts");
const { quizFade } = await import("../../visual/templates/quiz-presentation.tsx");
const data = await import("./data.ts");
const examples = await import("./Examples.tsx");
const h = React.createElement;
function renderAt(Component, props, frame, fps = 30, offset = 0) {
  const video = { id: "QuizTest", fps, width: 1920, height: 1080, durationInFrames: 3000, defaultProps: {}, props: {} };
  return renderToStaticMarkup(
    h(Internals.CompositionManager.Provider, { value: {
      compositions: [{ ...video, component: Component }], canvasContent: { type: "composition", compositionId: video.id },
      currentCompositionMetadata: video, currentAssetMetadata: null,
    } }, h(Internals.VideoProvider, null,
      h(Internals.TimelineContext.Provider, { value: { frame: { [video.id]: frame }, isInsideFreeze: false } },
        h(Internals.CanUseRemotionHooksProvider, null,
          h(Internals.SequenceContext.Provider, { value: { cumulatedFrom: 0, relativeFrom: offset } }, h(Component, props)),
        ),
      ),
    )),
  );
}

const cards = [
  ["exam", ExamQuizCard, { payload: data.examQuestion, withShell: false }],
  ["dual", DualQuizBattleCard, { payload: { title: "双题", leftQuiz: data.examQuestion, rightQuiz: data.sequence }, withShell: false }],
  ["compact", CompactQuizCard, { payload: data.examQuestion }],
  ["brief", BriefQuizCard, { payload: data.examQuestion }],
];
const propsFor = (kind, props, timing, presentation) => ({ ...props,
  timing: kind === "dual" ? { left: timing } : timing,
  presentation: kind === "dual" ? { left: presentation } : presentation,
});
for (const [kind, Card, props] of cards) {
  test(`${kind}: 倒计时窗口完整中性、清除读题关注、延后过早的判断与解释`, () => {
    for (const fps of [24, 30, 60]) {
      const end = 120 + fps * 3;
      const presentation = { focus: [{ targetId: "D", from: 30, to: 999 }],
        judgements: [{ targetId: "D", from: 10 }], explanations: [{ text: "解释标记", from: 10 }] };
      const p = propsFor(kind, props, { stemEndFrame: 120, revealFrame: 10 }, presentation);
      for (const frame of [120, 120 + fps, end - 1]) {
        const html = renderAt(Card, p, frame, fps);
        assert.match(html, /data-countdown-seconds=/);
        assert.doesNotMatch(html, /data-answer-revealed|data-quiz-focus|data-quiz-judged|data-quiz-explanation|解释标记/);
        for (const option of data.examQuestion.options) assert.ok(html.includes(option.text));
      }
      const html = renderAt(Card, p, end + 20, fps);
      assert.doesNotMatch(html, /data-quiz-focus|data-countdown-seconds/);
      assert.match(html, /data-answer-revealed="true"/);
      assert.match(html, /data-error-phrase/);
      assert.match(html, /本题答案 D/);
      assert.match(html, /#E0605A/);
      assert.match(html, /#4CC38A/);
    }
  });
  test(`${kind}: 无解析没有面板；答案动画从揭晓帧开始，样式可覆盖`, () => {
    const p = propsFor(kind, props, { stemEndFrame: 0, revealFrame: 150 }, { transitionSeconds: 0.4, colors: { answer: "#11AA77" } });
    const before = renderAt(Card, p, 149);
    assert.doesNotMatch(before, /data-answer-stamp|data-quiz-explanation|data-quiz-judged/);
    const start = renderAt(Card, p, 150);
    assert.match(start, /data-answer-stamp="true" style="opacity:0;/);
    const middle = renderAt(Card, p, 156);
    assert.match(middle, /data-answer-stamp="true" style="opacity:0.5;/);
    assert.match(middle, /#11AA77/);
    const after = renderAt(Card, p, 162);
    assert.match(after, /data-answer-stamp="true" style="opacity:1;/);
    assert.doesNotMatch(after, /data-quiz-explanation|data-quiz-judged|data-error-phrase/);
    // 选项的网格与字号固定，出现标签不改变文字栏宽。
    const grid = (html) => [...html.matchAll(/grid-template-columns:([^;]+)/g)].map((m) => m[1]);
    assert.deepEqual(grid(before), grid(after));
    const slots = (html) => [...html.matchAll(/justify-content:center;height:([^;]+);font-size:([^;]+)/g)].map((m) => [m[1], m[2]]);
    assert.ok(slots(before).length >= 4);
    assert.deepEqual(slots(before), slots(after));
  });
}
test("四个独立示例覆盖完整、简短、无解析；数据与注册入口不读取旧课", () => {
  const cases = [[examples.ExamExample, 120, 1140, 1], [examples.DualExample, 90, 750, 2],
    [examples.CompactExample, 90, 600, 1], [examples.BriefExample, 120, 960, 0]];
  for (const [Example, thinking, final, panels] of cases) {
    const neutral = renderAt(Example, {}, thinking);
    assert.match(neutral, /data-countdown-seconds="3"/);
    assert.doesNotMatch(neutral, /data-answer-revealed|data-quiz-focus|data-quiz-judged|data-quiz-explanation/);
    const done = renderAt(Example, {}, final);
    assert.equal((done.match(/data-quiz-explanation=/g) ?? []).length, panels);
    assert.match(done, /data-answer-stamp/);
    assert.doesNotMatch(done, /<audio|<video|data-narration-caption/);
  }
  const visited = new Set();
  const walk = (url) => {
    if (visited.has(url.href)) return;
    visited.add(url.href);
    assert.doesNotMatch(url.pathname, /\/lessons\/|\/workspaces\/|\/prototypes\//);
    const source = readFileSync(url, "utf8");
    assert.doesNotMatch(source, /staticFile\(|fetch\(|readFileSync\(/);
    for (const match of source.matchAll(/(?:from\s*|import\s*)["'](\.[^"']+)["']/g)) {
      for (const suffix of ["", ".ts", ".tsx", "/index.ts", "/index.tsx"]) {
        const child = new URL(match[1] + suffix, url);
        if (existsSync(child) && /\.[cm]?[tj]sx?$/.test(child.pathname)) { walk(child); break; }
      }
    }
  };
  walk(new URL("./index.tsx", import.meta.url));
  assert.ok(visited.size > 10);
});
test("默认色来自公共 token；过渡按请求帧可重复计算", () => {
  assert.deepEqual(Object.values(QUIZ_COLORS), ["#E6F1FA", "#2EC4D6", "#E0605A", "#4CC38A", "#E0B050"]);
  assert.deepEqual([99, 100, 103, 106, 99].map((f) => quizFade(f, 100, 6)), [0, 0, 0.5, 1, 0]);
});

test("Exam 第 26 题：首帧完整中性题面，题干结束立即思考，解析随后按项出现", () => {
  const first = renderAt(examples.ExamExample, {}, 0);
  assert.match(first, /关于进度管理计划的概述，不正确的是/);
  for (const option of data.examQuestion.options) assert.ok(first.includes(option.text));
  assert.doesNotMatch(first, /data-quiz-explanation|data-answer-stamp|data-quiz-judged|data-countdown-seconds/);
  for (const frame of [120, 150, 180, 209]) {
    const thinking = renderAt(examples.ExamExample, {}, frame);
    assert.match(thinking, /data-countdown-seconds/);
    assert.doesNotMatch(thinking, /data-quiz-focus|data-quiz-explanation|data-answer-stamp/);
  }
  assert.doesNotMatch(renderAt(examples.ExamExample, {}, 210), /data-countdown-seconds/);
  assert.match(renderAt(examples.ExamExample, {}, 240), /data-quiz-focus/);
  assert.doesNotMatch(renderAt(examples.ExamExample, {}, 659), /data-quiz-explanation/);
  assert.match(renderAt(examples.ExamExample, {}, 680), /data-exam-evidence/);
  assert.doesNotMatch(renderAt(examples.ExamExample, {}, 929), /data-exam-comparison|data-answer-stamp/);
  assert.match(renderAt(examples.ExamExample, {}, 950), /data-exam-comparison/);
  assert.doesNotMatch(renderAt(examples.ExamExample, {}, 1049), /data-answer-stamp/);
  assert.match(renderAt(examples.ExamExample, {}, 1080), /data-option-key="D" data-answer-revealed="true"/);
});


test("Dual 完整题面：两题独立思考与揭晓，交接时保留左题依据", () => {
  const side = (html, key) => html.split(`data-quiz-column="${key}"`)[1].split('data-quiz-column=')[0];
  const first = renderAt(examples.DualExample, {}, 0);
  assert.doesNotMatch(first, /data-answer-stamp|data-quiz-explanation|data-countdown-seconds/);
  for (const question of [data.sequence, data.records]) {
    assert.ok(first.includes(question.stem));
    for (const option of question.options) assert.ok(first.includes(option.text));
  }
  for (const frame of [90, 120, 150, 179]) {
    const html = renderAt(examples.DualExample, {}, frame);
    assert.match(side(html, "left"), /data-countdown-seconds/);
    assert.doesNotMatch(html, /data-answer-stamp|data-quiz-judged|data-quiz-explanation|data-quiz-focus/);
    assert.doesNotMatch(side(html, "right"), /data-countdown-seconds/);
  }
  for (const frame of [510, 540, 570, 599]) {
    const html = renderAt(examples.DualExample, {}, frame);
    assert.match(side(html, "left"), /data-answer-stamp/);
    assert.match(side(html, "left"), /data-quiz-explanation/);
    assert.match(side(html, "right"), /data-countdown-seconds/);
    assert.doesNotMatch(side(html, "right"), /data-answer-stamp|data-quiz-judged|data-quiz-explanation|data-quiz-focus/);
  }
  assert.doesNotMatch(side(renderAt(examples.DualExample, {}, 719), "right"), /data-answer-stamp/);
  assert.match(side(renderAt(examples.DualExample, {}, 726), "right"), /data-answer-stamp/);
});


test("Brief 四题同屏：逐题三秒思考和直接揭晓，后续题不提前显示答案", () => {
  const first = renderAt(examples.BriefExample, {}, 0);
  assert.equal((first.match(/data-quiz-card="brief"/g) ?? []).length, 4);
  assert.equal((first.match(/data-option-key=/g) ?? []).length, 16);
  assert.doesNotMatch(first, /data-answer-stamp|data-quiz-explanation|data-countdown-seconds/);
  for (const item of data.briefCards) assert.ok(first.includes(item.question.stem));
  for (const [index, item] of data.briefCards.entries()) {
    const start = item.timing.stemEndFrame;
    for (const offset of [0, 30, 60, 89]) {
      const html = renderAt(examples.BriefExample, {}, start + offset);
      assert.equal((html.match(/data-countdown-seconds=/g) ?? []).length, 1);
      assert.match(html, new RegExp(`data-countdown-seconds="${3 - Math.floor(offset / 30)}"`));
      assert.equal((html.match(/data-answer-stamp=/g) ?? []).length, index);
      assert.doesNotMatch(html, /data-quiz-explanation|data-quiz-judged/);
    }
    const revealed = renderAt(examples.BriefExample, {}, start + 96);
    assert.equal((revealed.match(/data-answer-stamp=/g) ?? []).length, index + 1);
    assert.doesNotMatch(revealed, /data-countdown-seconds|data-quiz-explanation/);
  }
});
