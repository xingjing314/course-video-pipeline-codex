/**
 * 由《第七章-L01完整口播稿V0.1.md》生成 L01 成片字幕轨。
 *
 * 做法：每个自然段按 PARAGRAPH_SHOTS 落到它所属的镜头，再在镜头时长内按字数比例切分；
 * 段内按标点拆成 ≤ 30 字的字幕行。没有配音，所以这是"按分镜节奏推的时间"，
 * 等 TTS 与字级对齐就位后，由 cue-point-resolver 用真实时间替换本文件。
 *
 * 用法：
 *   node --experimental-strip-types scripts/build-l01-captions.ts [口播稿路径]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SHOTS, PARAGRAPH_SHOTS, L01_FPS } from "../src/visual/prototypes/l01-timeline.ts";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");

const DEFAULT_SCRIPT =
  "/projects/gaoxiang/information-systems-project-management-4e-course-Gemini/docs/deepseek版/第七章-L01完整口播稿V0.1.md";

const MAX_CHARS = 38;

const scriptPath = process.argv[2] ?? DEFAULT_SCRIPT;
const raw = fs.readFileSync(scriptPath, "utf-8");

const paragraphs = raw
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l.length > 0);

if (paragraphs.length !== PARAGRAPH_SHOTS.length) {
  throw new Error(
    `自然段数（${paragraphs.length}）与 PARAGRAPH_SHOTS（${PARAGRAPH_SHOTS.length}）不一致；口播稿改过就要同步这张表。`,
  );
}

/** 按标点切句，再贪心打包成 ≤ MAX_CHARS 的行。 */
const chunk = (text: string): string[] => {
  const clauses = text.split(/(?<=[，。、：；？！])/).filter((s) => s.length > 0);
  const lines: string[] = [];
  let cur = "";
  for (const c of clauses) {
    if (cur.length + c.length > MAX_CHARS && cur.length > 0) {
      lines.push(cur);
      cur = "";
    }
    cur += c;
    // 单句就超长时硬切；切点避开书名号内部
    while (cur.length > MAX_CHARS) {
      let cut = MAX_CHARS;
      const open = cur.lastIndexOf("《", cut);
      const close = cur.lastIndexOf("》", cut);
      if (open > close && open > 0) cut = open; // 正切在《…》中间，退到《 之前
      lines.push(cur.slice(0, cut));
      cur = cur.slice(cut);
    }
  }
  if (cur.length > 0) lines.push(cur);
  return lines;
};

type Caption = { index: number; sceneId: string; text: string; startMs: number; endMs: number };

const captions: Caption[] = [];
let index = 0;

/** 先把自然段按镜头归组，再在镜头内按字数比例分配时间（否则段与段会互相盖住）。 */
const byShot = new Map<string, string[]>();
paragraphs.forEach((para, i) => {
  const shotId = PARAGRAPH_SHOTS[i];
  if (!SHOTS.some((s2) => s2.id === shotId)) throw new Error(`未知镜号 ${shotId}`);
  const list = byShot.get(shotId) ?? [];
  list.push(para);
  byShot.set(shotId, list);
});

SHOTS.forEach((shot) => {
  const paras = byShot.get(shot.id);
  if (!paras) return;

  const spanMs = ((shot.to - shot.from) / L01_FPS) * 1000;
  const totalChars = paras.reduce((a, p) => a + p.length, 0);
  let cursor = (shot.from / L01_FPS) * 1000;

  paras.forEach((para) => {
    const paraMs = (para.length / totalChars) * spanMs;
    const lines = chunk(para);
    const lineChars = lines.reduce((a, l) => a + l.length, 0);
    let c = cursor;
    lines.forEach((text) => {
      const dur = (text.length / lineChars) * paraMs;
      index += 1;
      captions.push({
        index,
        sceneId: shot.id,
        text,
        startMs: Math.round(c),
        endMs: Math.round(c + dur),
      });
      c += dur;
    });
    cursor += paraMs;
  });
});

const outPath = path.join(ROOT, "src/visual/prototypes/l01-captions.json");
fs.writeFileSync(outPath, `${JSON.stringify(captions, null, 2)}\n`, "utf-8");

const totalMs = captions[captions.length - 1].endMs;
console.log(`生成 ${captions.length} 条字幕 -> ${path.relative(ROOT, outPath)}`);
console.log(`覆盖 0 – ${(totalMs / 1000).toFixed(1)}s（片长 ${(15210 / 30).toFixed(1)}s）`);

/** 顺带导出一份 SRT，供后续配音/校对使用。 */
const srt = captions
  .map((c, i) => {
    const fmt = (ms: number) => {
      const h = Math.floor(ms / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      const f = ms % 1000;
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(f).padStart(3, "0")}`;
    };
    return `${i + 1}\n${fmt(c.startMs)} --> ${fmt(c.endMs)}\n${c.text}\n`;
  })
  .join("\n");

const srtPath = path.join(ROOT, "out/l01/l01-film.srt");
fs.mkdirSync(path.dirname(srtPath), { recursive: true });
fs.writeFileSync(srtPath, srt, "utf-8");
console.log(`同时导出 SRT -> ${path.relative(ROOT, srtPath)}`);
