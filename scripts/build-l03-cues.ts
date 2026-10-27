/**
 * 生成 L03 的 cue 表。
 *
 * ⚠️ 现阶段是 **PROVISIONAL（配音前）**：按镜表边界 + 固定偏移推算，
 * 只为预览与评审。配音落地后，同一脚本会改用 token 定位（见 build-l02-cues.ts 的做法），
 * 届时把 --final 打开即可覆盖。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { L03_SHOTS } from "../src/lessons/ch07/l03-shot-table.ts";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const byId = new Map(L03_SHOTS.map((s) => [s.id, s]));

/** 段 → 覆盖的镜号（与 l03-span-timeline.SPAN_IDS 一致）。 */
const SPAN_SHOTS: Record<string, string[]> = {
  "S06-S11": ["S06", "S08", "S09", "S11"],
  S21: ["S21"],
  S22: ["S22"],
  "S25-S27": ["S25", "S27"],
  "S28-S30": ["S28", "S30"],
  "S31-S33": ["S31", "S33"],
  "S34-S36": ["S34", "S36"],
  S37: ["S37"],
  S39: ["S39"],
  S45: ["S45"],
  "S40-S43": ["S40", "S41", "S43"],
};
const at = (id: string) => byId.get(id)!;

type Cue = {
  id: string;
  action: string;
  targetId?: string;
  matchPhrase: string;
  fallbackRatio: number;
  triggerMs: number;
  localFrame: number;
  matchedBy: string;
};

const cues: Record<string, Cue[]> = {};

const push = (span: string, base: number, action: string, localFrame: number, targetId?: string) => {
  (cues[span] ??= []).push({
    id: `${span}-${action}-${targetId ?? "x"}-${localFrame}`,
    action,
    targetId,
    matchPhrase: `provisional:${action}:${targetId ?? ""}`,
    fallbackRatio: 0,
    triggerMs: Math.round((localFrame / 30) * 1000),
    localFrame: localFrame - base,
    matchedBy: "provisional-ratio",
  });
};

/* 1) S06–S11：左题 T17（S06 含 3s 尾巴）+ 右题 T19（S09 含 3s 尾巴） */
{
  const s06 = at("S06"), s08 = at("S08"), s09 = at("S09"), s11 = at("S11");
  const span = "S06-S11";
  const base = s06.from;
  push(span, base, "thinking-pause", s06.from + s06.duration - 90);
  push(span, base, "eliminate-option", s08.from + 20, "A");
  push(span, base, "eliminate-option", s08.from + 55, "B");
  push(span, base, "eliminate-option", s08.from + 90, "C");
  push(span, base, "reveal-answer", s08.from + 125, "D");
  push(span, base, "thinking-pause", s09.from + s09.duration - 90);
  push(span, base, "eliminate-option", s11.from + 20, "C");
  push(span, base, "reveal-answer", s11.from + 70, "C");
}

/* 2) S25–S27：T18（两空）+ 迷你卡 T23 */
{
  const s25 = at("S25"), s27 = at("S27");
  const span = "S25-S27";
  const base = s25.from;
  push(span, base, "thinking-pause", s25.from + s25.duration - 90);
  push(span, base, "reveal-answer", s27.from + 40, "D");
}

/* 3) S28–S30：T33 */
{
  const s28 = at("S28"), s30 = at("S30");
  const span = "S28-S30";
  const base = s28.from;
  push(span, base, "thinking-pause", s28.from + s28.duration - 90);
  push(span, base, "reveal-answer", s30.from + 30, "A");
}

/* 4) S31–S33：T22 */
{
  const s31 = at("S31"), s33 = at("S33");
  const span = "S31-S33";
  const base = s31.from;
  push(span, base, "thinking-pause", s31.from + s31.duration - 90);
  push(span, base, "eliminate-option", s33.from + 25, "D");
  push(span, base, "reveal-answer", s33.from + 80, "D");
}

/* 5) S34–S36：T46 + 23下4 T23 挖空 */
{
  const s34 = at("S34"), s36 = at("S36");
  const span = "S34-S36";
  const base = s34.from;
  push(span, base, "thinking-pause", s34.from + s34.duration - 90);
  push(span, base, "eliminate-option", s36.from + 25, "D");
  push(span, base, "reveal-answer", s36.from + 80, "D");
}

/* 6) S40–S43：T27 */
{
  const s40 = at("S40"), s41 = at("S41"), s43 = at("S43");
  const span = "S40-S43";
  const base = s40.from;
  push(span, base, "thinking-pause", s41.from + s41.duration - 90);
  push(span, base, "eliminate-option", s43.from + 30, "D");
  push(span, base, "reveal-answer", s43.from + 110, "D");
}

/* ───────────── FINAL：用 token 定位判卷 cue ───────────── */

const FINAL = process.argv.includes("--final");

if (FINAL) {
  const tlPath = path.join(ROOT, "workspaces", "ch07-L03-ds", "audio-timeline.json");
  const irPath = path.join(ROOT, "workspaces", "ch07-L03-ds", "storyboard-ir.json");
  if (!fs.existsSync(tlPath)) throw new Error(`缺少 ${tlPath}`);
  const tl = JSON.parse(fs.readFileSync(tlPath, "utf-8"));
  const ir = JSON.parse(fs.readFileSync(irPath, "utf-8"));
  const sc = new Map(tl.scenes.map((x: any) => [x.sceneId, x]));
  const norm = (t: string) => t.replace(/[^\u4e00-\u9fa5A-Za-z0-9]/g, "").toUpperCase();

  /** 短语 → 该短语首字所在帧（绝对）。 */
  const frameOfPhrase = (sceneId: string, phrase: string): number => {
    const s: any = sc.get(sceneId);
    if (!s) throw new Error(`时间线里没有 ${sceneId}`);
    const flat = s.tokens.map((t: any) => norm(t.text)).join("");
    const at = flat.indexOf(norm(phrase));
    if (at < 0) throw new Error(`${sceneId} 找不到短语「${phrase}」`);
    let acc = 0;
    for (const t of s.tokens) {
      const len = norm(t.text).length;
      if (acc + len > at) return Math.round((t.startMs / 1000) * 30);
      acc += len;
    }
    return Math.round((s.startMs / 1000) * 30);
  };

  // 判卷 cue：短语来自稿子（与分镜 S08/S11/S27/S30/S33/S36/S43 一致）
  const JUDGE: { span: string; scene: string; action: string; target?: string; phrase: string }[] = [
    { span: "S06-S11", scene: "S08", action: "eliminate-option", target: "A", phrase: "试验室和中间工厂的试验是初步可行性研究" },
    { span: "S06-S11", scene: "S08", action: "eliminate-option", target: "B", phrase: "把“初步评估”安到了详细可研头上" },
    { span: "S06-S11", scene: "S08", action: "eliminate-option", target: "C", phrase: "正好说反" },
    { span: "S06-S11", scene: "S08", action: "reveal-answer", target: "D", phrase: "完全正确，选 D" },
    { span: "S06-S11", scene: "S11", action: "eliminate-option", target: "C", phrase: "显然错误" },
    { span: "S06-S11", scene: "S11", action: "reveal-answer", target: "C", phrase: "直接选 C" },
    { span: "S25-S27", scene: "S27", action: "reveal-answer", target: "D", phrase: "直接选 D" },
    { span: "S28-S30", scene: "S30", action: "reveal-answer", target: "A", phrase: "直接选 A" },
    { span: "S31-S33", scene: "S33", action: "reveal-answer", target: "D", phrase: "直接选 D 项目章程" },
    { span: "S34-S36", scene: "S36", action: "reveal-answer", target: "D", phrase: "还是选 D" },
    { span: "S40-S43", scene: "S43", action: "reveal-answer", target: "D", phrase: "所以不正确的选 D" },
  ];

  // 倒计时：题干场景的 3 秒尾巴，起点 = 场景结束前 90 帧（不是估算，是 pauseDirective 的实际位置）
  const COUNTDOWN: { span: string; scene: string }[] = [
    { span: "S06-S11", scene: "S06" },
    { span: "S06-S11", scene: "S09" },
    { span: "S25-S27", scene: "S25" },
    { span: "S28-S30", scene: "S28" },
    { span: "S31-S33", scene: "S31" },
    { span: "S34-S36", scene: "S34" },
    { span: "S40-S43", scene: "S41" },
  ];

  /**
   * 步骤 / 拆句 / 迷你卡锚点：统一 action = highlight-item，targetId 供组件读取。
   * 短语一律取「能唯一命中的长锚点」——归一化会吃掉标点，短锚点（如"第三、"）会撞车
   * （S39 开头的"第三，项目评估报告内容大纲"就比"第一、"更早出现）。
   */
  const ANCHORS: { span: string; scene: string; target: string; phrase: string }[] = [
    // S21 · 铁三角三块依次亮
    { span: "S21", scene: "S21", target: "1", phrase: "第一在什么基础上做" },
    { span: "S21", scene: "S21", target: "2", phrase: "第二由谁来做" },
    { span: "S21", scene: "S21", target: "3", phrase: "第三审查什么目的" },
    // S22 · 评估依据五条
    { span: "S22", scene: "S22", target: "1", phrase: "第一项目建议书及其批准文件" },
    { span: "S22", scene: "S22", target: "2", phrase: "第二项目可行性研究报告" },
    { span: "S22", scene: "S22", target: "3", phrase: "第三报送组织的申请报告" },
    { span: "S22", scene: "S22", target: "4", phrase: "第四项目关键建设条件" },
    { span: "S22", scene: "S22", target: "5", phrase: "第五必需的其他文件" },
    // S37 · 评估程序六步
    { span: "S37", scene: "S37", target: "1", phrase: "第一步成立评估小组" },
    { span: "S37", scene: "S37", target: "2", phrase: "第二步开展调查研究" },
    { span: "S37", scene: "S37", target: "3", phrase: "第三步分析与评估" },
    { span: "S37", scene: "S37", target: "4", phrase: "第四步编写" },
    { span: "S37", scene: "S37", target: "5", phrase: "第五步召开专家论证会" },
    { span: "S37", scene: "S37", target: "6", phrase: "第六步评估报告定稿" },
    // S39 · 报告大纲三块
    { span: "S39", scene: "S39", target: "1", phrase: "第一项目概况" },
    { span: "S39", scene: "S39", target: "2", phrase: "第二详细评估意见" },
    { span: "S39", scene: "S39", target: "3", phrase: "第三总结和建议" },
    // S43 · 嫁接拆句两枚 chip
    { span: "S40-S43", scene: "S43", target: "necessity", phrase: "前半句" },
    { span: "S40-S43", scene: "S43", target: "install-standard", phrase: "属于安装工程标准评估" },
    // S45 · “三份文件汇成依据文件”这条结论，跟着口播出现
    { span: "S45", scene: "S45", target: "basis", phrase: "就会化作项目建设的依据文件" },
    // S36 · 23下4 T23 迷你卡：先入场，再把空填上
    { span: "S34-S36", scene: "S36", target: "mini-show", phrase: "23年11月第4批次第23题" },
    { span: "S34-S36", scene: "S36", target: "mini-fill", phrase: "挖了个空" },
  ];

  const spanStart = (span: string): number => {
    const ids = SPAN_SHOTS[span];
    const first: any = sc.get(ids[0]);
    return Math.round((first.startMs / 1000) * 30);
  };

  const final: Record<string, any[]> = {};
  const add = (span: string, c: any) => (final[span] ??= []).push(c);

  for (const cd of COUNTDOWN) {
    const s: any = sc.get(cd.scene);
    const endFrame = Math.round(((s.startMs + s.durationMs) / 1000) * 30);
    add(cd.span, {
      id: `${cd.span}-thinking-${cd.scene}`,
      action: "thinking-pause",
      matchPhrase: `countdown:${cd.scene}`,
      fallbackRatio: 0,
      triggerMs: Math.round((endFrame - 30 * 3) / 30 * 1000),
      localFrame: endFrame - 90 - spanStart(cd.span),
      matchedBy: "pause-directive",
    });
  }

  for (const j of JUDGE) {
    const abs = frameOfPhrase(j.scene, j.phrase);
    add(j.span, {
      id: `${j.span}-${j.action}-${j.target}-${j.scene}`,
      action: j.action,
      targetId: j.target,
      matchPhrase: j.phrase,
      fallbackRatio: 0,
      triggerMs: Math.round((abs / 30) * 1000),
      localFrame: abs - spanStart(j.span),
      matchedBy: "token-exact",
    });
  }

  for (const a of ANCHORS) {
    const s: any = sc.get(a.scene);
    const flat = s.tokens.map((t: any) => norm(t.text)).join("");
    const needle = norm(a.phrase);
    const first = flat.indexOf(needle);
    const last = flat.lastIndexOf(needle);
    if (first < 0) throw new Error(`${a.scene} 找不到锚点短语「${a.phrase}」`);
    if (first !== last) throw new Error(`${a.scene} 锚点短语「${a.phrase}」不唯一，请换更长的锚点`);
    const abs = frameOfPhrase(a.scene, a.phrase);
    add(a.span, {
      id: `${a.span}-highlight-${a.target}-${a.scene}`,
      action: "highlight-item",
      targetId: a.target,
      matchPhrase: a.phrase,
      fallbackRatio: 0,
      triggerMs: Math.round((abs / 30) * 1000),
      localFrame: abs - spanStart(a.span),
      matchedBy: "token-exact",
    });
  }

  for (const list of Object.values(final)) list.sort((a: any, b: any) => a.localFrame - b.localFrame);

  const outFinal = path.join(ROOT, "src/lessons/ch07/l03-cues.json");
  fs.writeFileSync(outFinal, JSON.stringify({ provisional: false, spans: final }, null, 2) + "\n", "utf-8");
  console.log(`FINAL：${Object.values(final).flat().length} 条 cue（token 定位）→ src/lessons/ch07/l03-cues.json`);
  for (const [k, v] of Object.entries(final)) console.log(`  ${k}: ${v.map((c: any) => `${c.action}/${c.targetId ?? "-"}@${c.localFrame}`).join(" · ")}`);
  process.exit(0);
}

const out = path.join(ROOT, "src/lessons/ch07/l03-cues.json");
fs.writeFileSync(out, JSON.stringify({ provisional: true, spans: cues }, null, 2) + "\n", "utf-8");
console.log(`生成 ${Object.values(cues).flat().length} 条 cue（PROVISIONAL）→ src/lessons/ch07/l03-cues.json`);
for (const [k, v] of Object.entries(cues)) console.log(` ${k}: ${v.map((c) => `${c.action}@${c.localFrame}`).join(" · ")}`);
