import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Internals } from "remotion";
import ts from "typescript";

// 使用仓库已有 TypeScript 编译器加载真实 TSX，不启动浏览器或视频渲染。
const sourceRoot = new URL("../", import.meta.url).href;
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

const { ExamQuizCard, DualQuizBattleCard, CompactQuizCard, BriefQuizCard } = await import("../visual/templates/quiz.ts");
const { Countdown } = await import("../visual/kit/Countdown.tsx");
const { getQuizSchedule, getDualQuizCues } = await import("../visual/templates/quiz-timing.ts");
const h = React.createElement;

const question = {
  title: "题卡测试", examMeta: "测试题", stem: "请选择正确的描述（　）。", stemHighlights: [],
  options: [
    { key: "A", text: "选项甲", isCorrect: false, critiqueNote: "排错批注" },
    { key: "B", text: "选项乙", isCorrect: true },
    { key: "C", text: "选项丙", isCorrect: false },
    { key: "D", text: "选项丁", isCorrect: false },
  ],
  tipBanner: "讲解结论", siblingQuestions: [{ examMeta: "关联题", trapNote: "关联解析" }],
};
const dualPayload = { title: "双题测试", leftQuiz: question, rightQuiz: { ...question, extraNote: "右题解析" } };
const timing = { stemEndFrame: 120, revealFrame: 270 };

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

const cases = [
  ["单题", ExamQuizCard, { payload: question, timing }],
  ["双题", DualQuizBattleCard, { payload: dualPayload, timing: { left: timing, right: { stemEndFrame: 450, revealFrame: 570 } } }],
  ["紧凑", CompactQuizCard, { payload: question, timing }],
  ["简版", BriefQuizCard, { payload: question, timing, fillText: "选项乙" }],
];

for (const [name, Component, props] of cases) {
  test(`${name}：题干结束即倒计时，3 秒期间不泄题，答案等讲解锚点`, () => {
    const before = renderAt(Component, props, 119);
    assert.doesNotMatch(before, /data-countdown-seconds|data-answer-revealed|排错批注|讲解结论|关联解析|右题解析/);
    for (const [frame, seconds] of [[120, 3], [149, 3], [150, 2], [179, 2], [180, 1], [209, 1]]) {
      const markup = renderAt(Component, props, frame);
      assert.match(markup, new RegExp(`data-countdown-seconds="${seconds}"`));
      assert.doesNotMatch(markup, /data-answer-revealed|排错批注|讲解结论|关联解析|右题解析|✓|❌/);
      for (const option of question.options) assert.ok(markup.includes(option.text));
    }
    for (const frame of [210, 269]) {
      assert.doesNotMatch(renderAt(Component, props, frame), /data-countdown-seconds|data-answer-revealed/);
    }
    assert.match(renderAt(Component, props, 270), /data-option-key="B" data-answer-revealed="true"/);
  });

  test(`${name}：未传时序时不按片段比例猜测答案`, () => {
    const markup = renderAt(Component, { payload: props.payload }, 2999);
    assert.doesNotMatch(markup, /data-countdown-seconds|data-answer-revealed|排错批注|讲解结论|关联解析|右题解析/);
  });

  test(`${name}：字体、位置与倒计时样式可以覆盖，局部帧不受整课偏移影响`, () => {
    const markup = renderAt(Component, {
      ...props, left: 222, top: 333, width: 900, bodySize: 31, optionSize: 23, tone: "purple", columns: 2,
      countdown: { size: 80, strokeWidth: 6, color: "#123456", label: "独立思考" },
    }, 420, 30, 300);
    assert.match(markup, /left:222px/);
    assert.match(markup, /top:333px/);
    assert.match(markup, /font-size:31px/);
    assert.match(markup, /font-size:23px/);
    assert.match(markup, /data-countdown-seconds="3"/);
    assert.match(markup, /stroke="#123456"/);
    assert.match(markup, /width="80"/);
    assert.match(markup, /grid-template-columns:1fr 1fr/);
  });
}

test("帧率变化仍倒数 3 秒；窗口外不显示 0 秒", () => {
  for (const fps of [24, 30, 60]) {
    const { thinking } = getQuizSchedule([], fps, { stemEndFrame: 120 });
    assert.equal(thinking.endFrame - thinking.startFrame, fps * 3);
    for (const [delta, seconds] of [[0, 3], [fps, 2], [fps * 2, 1]]) {
      assert.match(renderAt(Countdown, thinking, 120 + delta, fps), new RegExp(`data-countdown-seconds="${seconds}"`));
    }
    assert.equal(renderAt(Countdown, thinking, thinking.endFrame, fps), "");
  }
});

test("明确的题干结束位置优先于旧 cue，过早判卷不能截短思考窗口", () => {
  const cues = [
    { action: "thinking-pause", localFrame: 300 },
    { action: "eliminate-option", localFrame: 150, targetId: "A" },
    { action: "reveal-answer", localFrame: 170 },
    { action: "show-tip", localFrame: 160 },
  ];
  const result = getQuizSchedule(cues, 30, { stemEndFrame: 120 });
  assert.deepEqual(result.thinking, { startFrame: 120, endFrame: 210 });
  assert.equal(result.eliminateFrame, 210);
  assert.equal(result.revealFrame, 210);
  assert.equal(result.tipFrame, 210);
  assert.equal(cues[1].localFrame, 150);
  for (const Component of [ExamQuizCard, CompactQuizCard]) {
    assert.doesNotMatch(renderAt(Component, { payload: question, cues, timing: { stemEndFrame: 120 } }, 209), /data-answer-revealed|排错批注/);
  }
});

test("双题左右独立，thinking-pause 不会误触发揭示", () => {
  const props = cases[1][2];
  const markup = renderAt(DualQuizBattleCard, props, 450);
  const [left, right] = markup.split('data-quiz-side="right"');
  assert.match(left, /data-answer-revealed/);
  assert.doesNotMatch(left, /data-countdown-seconds/);
  assert.match(right, /data-countdown-seconds="3"/);
  assert.doesNotMatch(right, /data-answer-revealed|右题解析/);
  const cues = [{ action: "thinking-pause", localFrame: 120, targetId: "left" }];
  assert.equal(getQuizSchedule(getDualQuizCues(cues, "left"), 30).revealFrame, Infinity);
  assert.equal(getQuizSchedule(getDualQuizCues(cues, "right"), 30).thinking, null);
});

test("四种题卡均支持选错误项，答案字母不写死", () => {
  const negative = { ...question, polarity: "negative", options: question.options.map((option) => ({
    ...option, isCorrect: option.key !== "D",
  })) };
  for (const [, Component, props] of cases) {
    const payload = Component === DualQuizBattleCard ? { ...dualPayload, leftQuiz: negative, rightQuiz: negative } : negative;
    const markup = renderAt(Component, { ...props, payload }, 270);
    assert.match(markup, /data-option-key="D" data-answer-revealed="true"/);
    assert.doesNotMatch(markup, /data-option-key="[ABC]" data-answer-revealed="true"/);
  }
});

test("整屏标题可关闭", () => {
  for (const Component of [ExamQuizCard, DualQuizBattleCard]) {
    const payload = Component === ExamQuizCard ? question : dualPayload;
    assert.doesNotMatch(renderAt(Component, { payload, withShell: false }, 100), new RegExp(payload.title));
  }
});

test("逐项讲解只排除当前目标，其他选项等自己的讲解位置", () => {
  const payload = { ...question, options: question.options.map((option) => option.key === "C"
    ? { ...option, critiqueNote: "丙项独立批注" } : option) };
  const cues = [
    { action: "eliminate-option", localFrame: 240, targetId: "A" },
    { action: "eliminate-option", localFrame: 300, targetId: "C" },
    { action: "reveal-answer", localFrame: 360, targetId: "B" },
  ];
  for (const Component of [ExamQuizCard, CompactQuizCard]) {
    const markup = renderAt(Component, { payload, cues, timing: { stemEndFrame: 120 } }, 240);
    assert.match(markup, /排错批注/);
    assert.doesNotMatch(markup, /丙项独立批注|data-answer-revealed/);
    assert.match(renderAt(Component, { payload, cues, timing: { stemEndFrame: 120 } }, 300), /丙项独立批注/);
  }
});

test("双题对照解析在两题揭示之后出现；关闭倒计时外观不会提前揭示", () => {
  const payload = { ...dualPayload, topComparisonTable: { headers: ["对照", "内容", "说明"], rows: [["解析表内容", "结论", "解释"]] } };
  const props = { ...cases[1][2], payload };
  assert.doesNotMatch(renderAt(DualQuizBattleCard, props, 450), /解析表内容/);
  assert.match(renderAt(DualQuizBattleCard, props, 570), /解析表内容/);
  for (const [, Component, originalProps] of cases) {
    const markup = renderAt(Component, { ...originalProps, countdown: false }, 180);
    assert.doesNotMatch(markup, /data-countdown-seconds|data-answer-revealed/);
  }
});

test("题干结束为第 0 帧时也正常开始；旧 cue 和简版 revealAt 仍可接入", () => {
  assert.equal(getQuizSchedule([], 30, { stemEndFrame: 0 }).thinking.startFrame, 0);
  const cues = [
    { action: "thinking-pause", localFrame: 120 },
    { action: "reveal-answer", localFrame: 270 },
  ];
  for (const Component of [ExamQuizCard, CompactQuizCard]) {
    assert.match(renderAt(Component, { payload: question, cues }, 120), /data-countdown-seconds="3"/);
  }
  assert.match(renderAt(BriefQuizCard, { payload: question, revealAt: 270 }, 270), /data-answer-revealed/);
});

test("四个旧原型使用 Legacy ID，调用公共组件并保留可播放预览", async () => {
  const { QUIZ_CARD_PREVIEWS } = await import("../visual/prototypes/QuizCardsPreview.tsx");
  assert.deepEqual(QUIZ_CARD_PREVIEWS.map((preview) => preview.id), ["LegacyQuizCardExam", "LegacyQuizCardDual", "LegacyQuizCardCompact", "LegacyQuizCardBrief"]);
  for (const preview of QUIZ_CARD_PREVIEWS) {
    const reading = renderAt(preview.component, preview.defaultProps, 100);
    assert.doesNotMatch(reading, /data-countdown-seconds|data-answer-revealed/);
    assert.match(renderAt(preview.component, preview.defaultProps, 120), /data-countdown-seconds="3"/);
    assert.match(renderAt(preview.component, preview.defaultProps, 240), /data-answer-revealed/);
  }
});

test("单题选项插槽保留公共题干和倒计时，不混入默认判卷或状态文字", () => {
  const props = {payload: {...question, siblingQuestions: undefined, tipBanner: undefined}, timing,
    statusText: false, renderOption: (option) => h('div', {'data-local-option': option.key}, option.text)};
  const html = renderAt(ExamQuizCard, props, 120);
  assert.match(html, /请选择正确的描述/);
  assert.match(html, /data-countdown-seconds="3"/);
  assert.equal((html.match(/data-local-option=/g) ?? []).length, 4);
  assert.doesNotMatch(html, /审题抓题眼|已揭晓标准答案|data-option-key/);
  assert.doesNotMatch(renderAt(ExamQuizCard, props, 280), /正确答案|排错批注/);
});

test("编号材料插槽保留完整题面和公共计时，未使用插槽的材料保持原样", () => {
  const payload = {...question, numberedStatements: [{id: '①', text: '材料甲'}, {id: '②', text: '材料乙'}]};
  const props = {payload, timing, statusText: false,
    renderStatement: (statement) => h('div', {'data-local-statement': statement.id}, statement.text)};
  const html = renderAt(ExamQuizCard, props, 120);
  assert.equal((html.match(/data-local-statement=/g) ?? []).length, 2);
  assert.match(html, /材料甲/);
  assert.match(html, /材料乙/);
  assert.match(html, /data-countdown-seconds="3"/);
  assert.doesNotMatch(html, /data-answer-revealed/);
  const defaults = renderAt(ExamQuizCard, {payload, timing}, 120);
  assert.match(defaults, /font-size:20px/);
  assert.doesNotMatch(defaults, /data-local-statement/);
});
