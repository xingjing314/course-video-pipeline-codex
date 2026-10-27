"""生成 L02 的镜表（配音前的估算版）。

在拿到真实配音前，镜长按"段预算 × 该镜口播字数占比"分配；
配音落地后由 build-l02-timeline 用音频重算，本文件只作排期与预览。
"""
import re, json, pathlib

SRC = pathlib.Path("../information-systems-project-management-4e-course-Gemini/docs/第7章/第七章-L02完整口播稿V0.1.md")
OUT = pathlib.Path("src/lessons/ch07/l02-shot-table.ts")

lines = SRC.read_text(encoding="utf-8").split("\n")
def text(ln): return lines[ln-1].strip()
def chars(s): return len(re.sub(r"[\s，。、：；？！“”‘’（）()《》—…·,.:;?!%\-]", "", s))

SEGMENTS = [
    ("S01", "S03", "交棒与定义", 70),
    ("S04", "S07", "五顶帽子", 145),
    ("S08", "S11", "技术：先进与适用", 60),
    ("S12", "S17", "技术四因素", 130),
    ("S18", "S25", "经济四笔账", 135),
    ("S26", "S29", "经济真题", 115),
    ("S30", "S33", "社会效益", 95),
    ("S34", "S37", "终极防坑表", 90),
    ("S38", "S42", "运行环境与收官", 140),
]

SHOT_LINES = {
    "S01":[1],"S02":[3],"S03":[5],"S04":[7],"S05":[9],
    "S06":[10,11,12,14,15],"S07":[13,16],
    "S08":[18,19,22],"S09":[20],"S10":[21],"S11":[24],
    "S12":[26],"S13":[28,29,31,32],"S14":[30],"S15":[34,35,36,37],"S16":[39],"S17":[39],
    "S18":[41],"S19":[43],"S20":[44],"S21":[45],"S22":[46],"S23":[48],"S24":[50],"S25":[52],
    "S26":[54,56],"S27":[57],"S28":[59,60,61],"S29":[62],
    "S30":[64],"S31":[66],"S32":[68,69,70,71,72,73],"S33":[75],
    "S34":[77,79],"S35":[80,81,82,83],"S36":[85,86],"S37":[87],
    "S38":[89,91,92,93],"S39":[95],"S40":[97,98,99,100,101,102,103],"S41":[105,106,107,108,109],"S42":[111],
}

order = [k for k in SHOT_LINES]
rows = []
for k in order:
    c = sum(chars(text(l)) for l in SHOT_LINES[k] if text(l))
    rows.append({"id": k, "chars": c})

# 段内按字数分配帧
fps = 30
frame = 0
total_chars = sum(r["chars"] for r in rows)
print("总字数", total_chars)
seg_of = {}
for a, b, title, sec in SEGMENTS:
    ids = [r["id"] for r in rows if a <= r["id"] <= b] if a[0]=="S" else []
    seg_of[(a,b)] = (title, sec, ids)

out = []
for (a,b,title,sec) in SEGMENTS:
    ids = [r["id"] for r in rows if int(r["id"][1:]) >= int(a[1:]) and int(r["id"][1:]) <= int(b[1:])]
    seg_chars = sum(next(r["chars"] for r in rows if r["id"]==i) for i in ids)
    seg_frames = sec * fps
    for i in ids:
        c = next(r["chars"] for r in rows if r["id"]==i)
        dur = max(30, round(seg_frames * c / seg_chars))
        out.append({"id": i, "segment": title, "from": frame, "duration": dur, "chars": c})
        frame += dur

print("镜头数", len(out), "总帧", frame, "≈%.1f 分钟" % (frame/fps/60))

ts = ['/**',
      ' * 自动生成，勿手改。来源：scripts/gen-l02-shot-table.py',
      ' *',
      ' * 这是**配音前的估算镜表**：段预算按字数占比分摊到镜。',
      ' * 配音落地后由音频重算（届时替换本文件），当前只用于排期与预览。',
      ' */',
      'export type L02Shot = { id: string; segment: string; from: number; duration: number; chars: number };',
      '',
      'export const L02_SHOTS: L02Shot[] = [']
for s in out:
    ts.append('  { id: "%s", segment: "%s", from: %d, duration: %d, chars: %d },' % (s["id"], s["segment"], s["from"], s["duration"], s["chars"]))
ts += ['];',
       '',
       'export const L02_TOTAL_FRAMES = L02_SHOTS.reduce((a, s) => Math.max(a, s.from + s.duration), 0);',
       '',
       '/** 当前帧属于哪一镜（1-based 序号供面包屑使用）。 */',
       'export const l02ShotAt = (frame: number): { shot: L02Shot; order: number } => {',
       '  for (let i = 0; i < L02_SHOTS.length; i++) {',
       '    const s = L02_SHOTS[i];',
       '    if (frame < s.from + s.duration) return { shot: s, order: i + 1 };',
       '  }',
       '  const last = L02_SHOTS[L02_SHOTS.length - 1];',
       '  return { shot: last, order: L02_SHOTS.length };',
       '};',
       '']
OUT.write_text("\n".join(ts), encoding="utf-8")
print("写入", OUT)
