/**
 * 给 deepseek 版 L02 生成 StoryboardIR（音频阶段的输入）。
 *
 * 与 build-l01-ir 同一套做法：用「口播稿行号 → 镜号」的既定映射（分镜第七节覆盖核对表）
 * 拼出 IR，绕开散文抽取。每一行口播都必须被分配到某个镜头，否则直接报错。
 *
 * 视觉字段：全部挂 `chapter-local`，key 指向 `src/lessons/ch07/l02-spans` 里的段组件；
 * 音频阶段只读 narration / clauses / pauseDirectives，视觉字段不影响配音。
 *
 * 用法：
 *   node --experimental-strip-types scripts/build-l02-ir.ts [口播稿路径] [--lesson=ch07-L02-ds]
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { parseLessonArg } from "./_lesson-arg.ts";
import { StoryboardIRSchema } from "../contracts/storyboard-ir.schema.ts";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const { lessonId: LESSON_ID, workspace: WORKSPACE } = parseLessonArg(ROOT);

/** 位置参数：口播稿路径（可省略）。 */
const positional = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const SCRIPT =
  positional[0] ??
  "/projects/gaoxiang/information-systems-project-management-4e-course-Gemini/docs/第7章/第七章-L02完整口播稿V0.1.md";

const sha256 = (s: string) => crypto.createHash("sha256").update(s, "utf-8").digest("hex");

/** 口播稿行号 → 镜号（与分镜第七节覆盖核对表一致）。 */
const SHOT_LINES: Record<string, number[]> = {
  S01: [1], S02: [3], S03: [5], S04: [7], S05: [9],
  S06: [10, 11, 12, 14, 15], S07: [13, 16],
  S08: [18, 19, 22], S09: [20], S10: [21], S11: [24],
  S12: [26], S13: [28, 29, 31, 32], S14: [30], S15: [34, 35, 36, 37], S16: [39], S17: [],
  S18: [41], S19: [43], S20: [44], S21: [45], S22: [46], S23: [48], S24: [50], S25: [52],
  S26: [54, 56], S27: [57], S28: [59, 60, 61], S29: [62],
  S30: [64], S31: [66], S32: [68, 69, 70, 71, 72, 73], S33: [75],
  S34: [77, 79], S35: [80, 81, 82, 83], S36: [85, 86], S37: [87],
  S38: [89, 91, 92, 93], S39: [95], S40: [97, 98, 99, 100, 101, 102, 103],
  S41: [105, 106, 107, 108, 109], S42: [111],
};

/** 镜号 → 所属渲染段（多个镜号共用一个段组件时，段键是 "S19-S21" 这种）。 */
const SHOT_SPAN: Record<string, string> = {
  S01: "S01", S02: "S02", S03: "S03", S04: "S04", S05: "S05", S06: "S05", S07: "S05",
  S08: "S08", S09: "S09-S10", S10: "S09-S10", S11: "S11", S12: "S12", S13: "S13", S14: "S13",
  S15: "S15-S17", S16: "S15-S17", S17: "S15-S17", S18: "S18",
  S19: "S19-S21", S20: "S19-S21", S21: "S19-S21",
  S22: "S19-S21", S23: "S23", S24: "S24", S25: "S25",
  S26: "S26-S29", S27: "S26-S29", S28: "S26-S29", S29: "S26-S29",
  S30: "S30", S31: "S31-S33", S32: "S31-S33", S33: "S31-S33",
  S34: "S34", S35: "S35", S36: "S36-S37", S37: "S36-S37",
  S38: "S38-S39", S39: "S38-S39", S40: "S40-S41", S41: "S40-S41", S42: "S42",
};

/** 段短名（与分镜 2.8 节「右上段名」表一致）。 */
const SEGMENT_TITLE: Record<string, string> = {
  S01: "交棒与定义", S02: "交棒与定义", S03: "交棒与定义", S04: "五顶帽子", S05: "五顶帽子",
  S06: "五顶帽子", S07: "五顶帽子", S08: "技术：先进与适用", S09: "技术：先进与适用",
  S10: "技术：先进与适用", S11: "技术：先进与适用", S12: "技术四因素", S13: "技术四因素",
  S14: "技术四因素", S15: "技术四因素", S16: "技术四因素", S17: "技术四因素",
  S18: "经济四笔账", S19: "经济四笔账", S20: "经济四笔账", S21: "经济四笔账", S22: "经济四笔账",
  S23: "经济四笔账", S24: "经济四笔账", S25: "经济四笔账", S26: "经济真题", S27: "经济真题",
  S28: "经济真题", S29: "经济真题", S30: "社会效益", S31: "社会效益", S32: "社会效益",
  S33: "社会效益", S34: "终极防坑表", S35: "终极防坑表", S36: "终极防坑表", S37: "终极防坑表",
  S38: "运行环境与收官", S39: "运行环境与收官", S40: "运行环境与收官", S41: "运行环境与收官",
  S42: "运行环境与收官",
};

const INTENT: Record<string, string> = {
  S01: "用四关轨道把学生从 L01 送进 L02，零认知成本",
  S02: "定义按输入→动作→结论排，不写成一整句话",
  S03: "刻意做轻：口播自己说先混个脸熟",
  S04: "先给分量，学生才愿意投入注意力",
  S05: "用具体场景承载五个抽象维度",
  S06: "五顶逐条讲，画面一次只亮一个",
  S07: "最易记混的一层，单独给一镜",
  S08: "先立判断标准，再给案例",
  S09: "案例要短，一句话能读完",
  S10: "两个案例同屏，才有分量",
  S11: "从讲故事切回讲考点，画面明显收束",
  S12: "定义只留一句，重音落在根本失败",
  S13: "星标是考场头号陷阱的视觉锚",
  S14: "学生最容易错的那一步，单独立镜",
  S15: "用现成模板，零改动",
  S16: "判卷动作交给 cue，画面只负责呈现",
  S17: "收口一句话，避免回去翻书",
  S18: "先给全貌，再逐个展开",
  S19: "二元分类先用结构表达",
  S20: "五项并列，避免挤成一团",
  S21: "与 S20 左右呼应，形成对照",
  S22: "全课最高频陷阱，必须单独立镜",
  S23: "三类并列，不展开",
  S24: "用最简结构表达算比值",
  S25: "敏感性=变量变了会怎样，画面必须动",
  S26: "连看两道，用同屏并置表达题型稳定性",
  S27: "判卷动画复用 L01 的逐项逻辑",
  S28: "第二题换屏，保持节奏",
  S29: "顺带一提，用轻量卡带过",
  S30: "换帽子不拉回全景，避免节奏断层",
  S31: "先立结构，再填内容",
  S32: "五条一口气念完会糊，必须逐条",
  S33: "左右对称，便于对比记忆",
  S34: "先立表，再逐行填",
  S35: "每行问法→归属，可当清单背",
  S36: "L01 已验证的模板，直接复用",
  S37: "左右同屏才有通透感",
  S38: "软环境是考点，不能只写硬环境",
  S39: "与 S38 同屏对照，五顶帽子收齐",
  S40: "一题串起五个维度",
  S41: "用连线把四个维度一次性回指",
  S42: "与 L01 的 S31 同一手法，固定收尾句式",
};

const raw = fs.readFileSync(SCRIPT, "utf-8");
const lines = raw.split("\n");
const contentLines = lines.map((l, i) => ({ no: i + 1, text: l.trim() })).filter((l) => l.text.length > 0);

// 每一行必须且只能属于一个镜头
const assigned = new Map<number, string>();
for (const [shot, nos] of Object.entries(SHOT_LINES)) {
  for (const n of nos) {
    if (assigned.has(n)) throw new Error(`第 ${n} 行被重复分配：${assigned.get(n)} 与 ${shot}`);
    assigned.set(n, shot);
  }
}
const unassigned = contentLines.filter((l) => !assigned.has(l.no));
if (unassigned.length > 0) {
  throw new Error(`有 ${unassigned.length} 行口播未分配镜头：${unassigned.map((l) => `L${l.no}`).join(", ")}`);
}

const byShot = new Map<string, string[]>();
for (const shot of Object.keys(SHOT_LINES)) byShot.set(shot, []);
for (const l of contentLines) byShot.get(assigned.get(l.no)!)!.push(l.text);

/**
 * L39 同时覆盖 S16 与 S17（"看这道题…" + "…完全就是原话，直接选 A"）。
 * 按第一个问号切成两段，S16 拿问句、S17 拿结论——不重复、不丢字。
 */
{
  const l39 = lines[38].trim();
  const cut = l39.indexOf("？") + 1;
  if (cut <= 0) throw new Error("L39 没有问号，切分假设失效");
  byShot.set("S16", [l39.slice(0, cut)]);
  byShot.set("S17", [l39.slice(cut)]);
}

const toClauses = (text: string): string[] => {
  const out = text.split(/(?<=[。！？；])/).filter((s) => s.length > 0);
  if (out.join("") !== text) throw new Error(`clause 切分丢字：${text.slice(0, 30)}…`);
  return out;
};

const chars = (s: string) => s.replace(/[\s，。、：；？！“”‘’（）()《》—…·,.:;?!%\-]/g, "").length;

const scenes = Object.keys(SHOT_LINES).map((shot, idx) => {
  const narration = byShot.get(shot)!.join("");
  if (!narration) throw new Error(`${shot} 没有分到口播`);
  const clauses = toClauses(narration);

  return {
    sceneId: shot,
    parentSceneId: shot,
    segmentTitle: SEGMENT_TITLE[shot],
    sceneTitle: `${shot} · ${SEGMENT_TITLE[shot]}`,
    order: idx + 1,
    estimatedSeconds: Number((chars(narration) / 3.6).toFixed(2)),
    narration,
    narrationSha256: sha256(narration),
    clauses,
    pauseDirectives: [],
    rawVisualInstruction: SEGMENT_TITLE[shot],
    pedagogicalIntent: INTENT[shot] ?? SEGMENT_TITLE[shot],
    cueSpecs: [],
    visualType: "chapter-local" as const,
    payload: { key: "l02-span", data: { span: SHOT_SPAN[shot] } },
  };
});

const totalSeconds = scenes.reduce((a, s) => a + s.estimatedSeconds, 0);

const ir = {
  schemaVersion: "1.0.0" as const,
  lessonId: LESSON_ID,
  lessonTitle: "第 7 章 项目立项管理 · L02（deepseek 版）",
  sourceMarkdownPath: SCRIPT,
  sourceMarkdownSha256: sha256(raw),
  companionScriptVerified: true,
  overview: {
    chapterScope: "第 7 章 7.2 导言 — 7.2.1 可行性研究的五大维度",
    estimatedDurationText: `${Math.floor(totalSeconds / 60)} 分 ${Math.round(totalSeconds % 60)} 秒`,
    cognitiveGoals: [
      "掌握可行性研究的定义与四个特点",
      "用五顶帽子记住五个可行性的判别标准",
      "分清技术可行性 vs 社会效益的两组易混表述",
      "分清一次性支出与非一次性支出",
    ],
    coreVisualAssets: ["A11 五顶帽子", "A12 技术四因素", "A13 经济四笔账", "A16 终极防坑表"],
    examAnchors: ["2023.5 T21", "23下1批T28", "23下4批T22", "23下1批T61", "26上2批T23", "25上1批T58"],
  },
  scenes,
  compiledAt: new Date().toISOString(),
};

const parsed = StoryboardIRSchema.parse(ir);
fs.mkdirSync(WORKSPACE, { recursive: true });
const outPath = path.join(WORKSPACE, "storyboard-ir.json");
fs.writeFileSync(outPath, JSON.stringify(parsed, null, 2) + "\n", "utf-8");

console.log(`生成 ${parsed.scenes.length} 个场景 → ${path.relative(ROOT, outPath)}`);
console.log(`估算总时长 ${totalSeconds.toFixed(1)} s（${Math.floor(totalSeconds / 60)}:${String(Math.round(totalSeconds % 60)).padStart(2, "0")}）`);
console.log(`口播行数 ${contentLines.length}，全部已分配；镜头 ${Object.keys(SHOT_LINES).length} 个，渲染段 ${new Set(Object.values(SHOT_SPAN)).size} 个`);
