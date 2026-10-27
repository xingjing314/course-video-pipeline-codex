"""生成 L03 的"配音前"镜表：按字数估时长，题干镜额外加 3 秒倒计时尾巴。"""
import re, pathlib

SRC = pathlib.Path("../information-systems-project-management-4e-course-Gemini/docs/第7章/第七章-L03完整口播稿V0.1.md")
OUT = pathlib.Path("src/lessons/ch07/l03-shot-table.ts")
lines = SRC.read_text(encoding="utf-8").split("\n")
def chars(s): return len(re.sub(r"[\s，。、：；？！“”‘’（）()《》—…·,.:;?!%\-]", "", s))

# 镜号 → (段名, 口播行号, 是否带 3 秒倒计时尾巴)
SHOTS = [
 ("S01","交棒与初可研",[1],False),
 ("S02","交棒与初可研",[3,4,5,6],False),
 ("S03","初可研报告与辅助研究",[8,9,10,11],False),
 ("S04","初可研报告与辅助研究",[13,14],False),
 ("S05","初可研报告与辅助研究",[16],False),
 ("S06","真题：初可研",[18,20],True),
 ("S08","真题：初可研",[21,22,23,24],False),
 ("S09","真题：初可研",[26],True),
 ("S11","真题：初可研",[27],False),
 ("S12","详细可行性研究",[29],False),
 ("S13","详细可行性研究",[31,32],False),
 ("S14","详细可行性研究",[34],False),
 ("S15","详细可行性研究",[35],False),
 ("S16","详细可行性研究",[37,38,39,40,41],False),
 ("S17","详细可行性研究",[42],False),
 ("S18","详细可行性研究",[44,45,46],False),
 ("S19","详细可行性研究",[47],False),
 ("S20","项目评估",[49],False),
 ("S21","项目评估",[51,52,53,54],False),
 ("S22","项目评估",[56,57],False),
 ("S23","项目评估",[58,59],False),
 ("S24","真题：项目评估",[61],False),
 ("S25","真题：项目评估",[63,64],True),
 ("S27","真题：项目评估",[],False),
 ("S28","真题：项目评估",[65],True),
 ("S30","真题：项目评估",[],False),
 ("S31","真题：项目评估",[67,68],True),
 ("S33","真题：项目评估",[],False),
 ("S34","真题：项目评估",[69],True),
 ("S36","真题：项目评估",[],False),
 ("S37","评估程序与内容",[71,73,74],False),
 ("S38","评估程序与内容",[76,77,78,79,80,81],False),
 ("S39","评估程序与内容",[83],False),
 ("S40","收官真题",[85],False),
 ("S41","收官真题",[87],True),
 ("S43","收官真题",[88,89],False),
 ("S44","章末总图与交棒",[91,93,94,95],False),
 ("S45","章末总图与交棒",[97],False),
 ("S46","章末总图与交棒",[98],False),
]

# 同一行被拆成"题干镜 + 解析镜"时，解析镜的字数（约 40%）
L64 = chars(lines[63].strip()); L65 = chars(lines[64].strip())
L68 = chars(lines[67].strip()); L69 = chars(lines[68].strip())
SPLIT_CARRY = {"S27": L64*0.42, "S30": L65*0.40, "S33": L68*0.42, "S36": L69*0.40}

FPS=30
frame=0
out=[]
prev_dur=0
for sid,seg,lns,tail in SHOTS:
    c=sum(chars(lines[n-1].strip()) for n in lns)
    # 解析镜的口播在上一行里（L64b/L65b/...），先用固定值占位
    # 被拆分的行：题干镜拿 60%，解析镜拿 40%（按原文长度估）
    if c==0:
        c = int(SPLIT_CARRY.get(sid, 90))
    sec=c/3.6 + (3.0 if tail else 0)
    dur=max(30, round(sec*FPS))
    out.append({"id":sid,"segment":seg,"from":frame,"duration":dur,"chars":c})
    frame+=dur

ts=['/**',' * 自动生成，勿手改。来源：scripts/gen-l03-shot-table.py',' *',
    ' * 这是**配音前的估算镜表**：按字数估时长，题干镜额外加 3 秒倒计时尾巴。',
    ' * 配音落地后由 build-l03-shot-table.ts 用音频重算。',' */',
    'export type L03Shot = { id: string; segment: string; from: number; duration: number; chars: number };',
    '','export const L03_SHOTS: L03Shot[] = [']
for s in out:
    ts.append('  { id: "%s", segment: "%s", from: %d, duration: %d, chars: %d },'%(s["id"],s["segment"],s["from"],s["duration"],s["chars"]))
ts+= ['];','','export const L03_TOTAL_FRAMES = L03_SHOTS.reduce((a, s) => Math.max(a, s.from + s.duration), 0);','',
      'export const l03ShotAt = (frame: number): { shot: L03Shot; order: number } => {',
      '  for (let i = 0; i < L03_SHOTS.length; i++) {',
      '    const s = L03_SHOTS[i];',
      '    if (frame < s.from + s.duration) return { shot: s, order: i + 1 };',
      '  }',
      '  const last = L03_SHOTS[L03_SHOTS.length - 1];',
      '  return { shot: last, order: L03_SHOTS.length };',
      '};','']
OUT.write_text("\n".join(ts), encoding="utf-8")
print("镜头", len(out), "总帧", frame, "≈%.1f 分钟"%(frame/FPS/60))
