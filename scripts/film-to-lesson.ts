/**
 * film-to-lesson：把 L01 的成片数据翻译成 compiled-lesson.json。
 *
 * 目的：让「数据驱动的 MasterCanvas」与「手搭的 L01Film」使用同一份实现与同一份数据，
 * 从而可以逐帧比对，验证渲染器合并没有改变画面。
 *
 * 用法：node --experimental-strip-types scripts/film-to-lesson.ts
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { parseLessonArg } from "./_lesson-arg.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const { lessonId: LESSON_ID, workspace: WS, chapter, spanKey } = parseLessonArg(ROOT);

/** 段表模块名（默认 span-timeline；L02 用 l02-span-timeline）。 */
const spanModuleName =
  process.argv.slice(2).find((a) => a.startsWith("--spanModule="))?.split("=")[1] ?? "span-timeline";

/** 章节的段表（每章一份，纯数据）。 */
const spanModule = await import(
  new URL(`../src/lessons/${chapter}/${spanModuleName}.ts`, import.meta.url).href
);
const SPAN_TABLE = spanModule.SPAN_TABLE ?? spanModule.L01_SPAN_TABLE;
if (!SPAN_TABLE) {
  throw new Error(`src/lessons/${chapter}/${spanModuleName}.ts 必须导出 SPAN_TABLE`);
}

const sha256 = (buf: Buffer | string) => crypto.createHash("sha256").update(buf).digest("hex");
const sha256File = (p: string) => sha256(fs.readFileSync(p));

const ir = JSON.parse(fs.readFileSync(path.join(WS, "storyboard-ir.json"), "utf-8"));
const captions = JSON.parse(fs.readFileSync(path.join(WS, "audio-timeline.json"), "utf-8")).captions;
const audioPath = path.join(WS, `${LESSON_ID}-full.wav`);
const srtPath = path.join(WS, `${LESSON_ID}.srt`);

const irSceneById = new Map<string, any>(ir.scenes.map((s: any) => [s.sceneId, s]));


const scenes = SPAN_TABLE.map((span: { key: string; ids: string[]; from: number; duration: number }, i: number) => {
  const irScenes = span.ids.map((id) => irSceneById.get(id));
  const missing = span.ids.filter((id) => !irSceneById.has(id));
  if (missing.length > 0) throw new Error(`IR 里缺少镜号：${missing.join(", ")}`);

  const narration = irScenes.map((s) => s.narration).join("");
  const startMs = Math.round((span.from / 30) * 1000);
  const durationMs = Math.round((span.duration / 30) * 1000);

  return {
    id: span.key,
    parentSceneId: span.ids[0],
    segmentTitle: irScenes[0].segmentTitle,
    sceneTitle: span.ids.length > 1 ? `${span.ids[0]}–${span.ids[span.ids.length - 1]}` : span.ids[0],
    order: i + 1,
    startMs,
    endMs: startMs + durationMs,
    durationMs,
    fromFrame: span.from,
    durationInFrames: span.duration,
    narration,
    narrationSha256: sha256(narration),
    pedagogicalIntent: irScenes[0].pedagogicalIntent,
    cues: [],
    headerMode: "chapter" as const,
    visualType: "chapter-local" as const,
    payload: { key: spanKey, data: { span: span.key, offset: span.from } },
  };
});

const totalFrames = scenes.reduce((a, s) => Math.max(a, s.fromFrame + s.durationInFrames), 0);

const lesson = {
  schemaVersion: "1.0.0" as const,
  lessonId: LESSON_ID,
  lessonTitle: ir.lessonTitle,
  meta: {
    fps: 30,
    width: 1920,
    height: 1080,
    durationMs: Math.round((totalFrames / 30) * 1000),
    durationInFrames: totalFrames,
    audioPublicSrc: `audio/${LESSON_ID}/${LESSON_ID}-full.wav`,
    audioSha256: sha256File(audioPath),
    srtRelativePath: `${LESSON_ID}.srt`,
    srtSha256: sha256File(srtPath),
  },
  overview: ir.overview,
  scenes,
  captions,
  compiledAt: new Date().toISOString(),
};

const outPath = path.join(WS, "compiled-lesson.json");
fs.writeFileSync(outPath, JSON.stringify(lesson, null, 2) + "\n", "utf-8");

console.log(`lesson=${LESSON_ID}（chapter=${chapter}，段表=${spanModuleName}，组件键=${spanKey}）`);
console.log(`生成 ${scenes.length} 个渲染段 → ${path.relative(ROOT, outPath)}`);
console.log(`总帧数 ${totalFrames}（${(totalFrames / 30).toFixed(3)} s），字幕 ${captions.length} 条`);
console.log(`段清单：${scenes.map((s) => s.id).join(" · ")}`);
