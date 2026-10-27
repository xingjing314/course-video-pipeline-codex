/**
 * 自动生成，勿手改。来源：scripts/build-l03-shot-table.ts
 *
 * 镜长由真实配音派生（audio-timeline.json），含 7 处 3 秒倒计时静音。
 * 配音若重录，重跑脚本即可，不要手改数字。
 */
export type L03Shot = { id: string; segment: string; from: number; duration: number; ms: number };

export const L03_SHOTS: L03Shot[] = [
  { id: "S01", segment: "交棒与初可研", from: 0, duration: 630, ms: 20992 },
  { id: "S02", segment: "交棒与初可研", from: 630, duration: 833, ms: 27774 },
  { id: "S03", segment: "初可研报告与辅助研究", from: 1463, duration: 1650, ms: 55004 },
  { id: "S04", segment: "初可研报告与辅助研究", from: 3113, duration: 789, ms: 26313 },
  { id: "S05", segment: "初可研报告与辅助研究", from: 3902, duration: 1115, ms: 37173 },
  { id: "S06", segment: "真题：初可研", from: 5017, duration: 471, ms: 15691 },
  { id: "S08", segment: "真题：初可研", from: 5488, duration: 1119, ms: 37306 },
  { id: "S09", segment: "真题：初可研", from: 6607, duration: 250, ms: 8329 },
  { id: "S11", segment: "真题：初可研", from: 6857, duration: 1210, ms: 40343 },
  { id: "S12", segment: "详细可行性研究", from: 8067, duration: 365, ms: 12155 },
  { id: "S13", segment: "详细可行性研究", from: 8432, duration: 1267, ms: 42238 },
  { id: "S14", segment: "详细可行性研究", from: 9699, duration: 598, ms: 19930 },
  { id: "S15", segment: "详细可行性研究", from: 10297, duration: 1037, ms: 34564 },
  { id: "S16", segment: "详细可行性研究", from: 11334, duration: 1578, ms: 52587 },
  { id: "S17", segment: "详细可行性研究", from: 12912, duration: 1179, ms: 39286 },
  { id: "S18", segment: "详细可行性研究", from: 14091, duration: 1473, ms: 49086 },
  { id: "S19", segment: "详细可行性研究", from: 15564, duration: 696, ms: 23216 },
  { id: "S20", segment: "项目评估", from: 16260, duration: 685, ms: 22828 },
  { id: "S21", segment: "项目评估", from: 16945, duration: 1529, ms: 50966 },
  { id: "S22", segment: "项目评估", from: 18474, duration: 931, ms: 31036 },
  { id: "S23", segment: "项目评估", from: 19405, duration: 1023, ms: 34091 },
  { id: "S24", segment: "真题：项目评估", from: 20428, duration: 234, ms: 7796 },
  { id: "S25", segment: "真题：项目评估", from: 20662, duration: 538, ms: 17918 },
  { id: "S27", segment: "真题：项目评估", from: 21200, duration: 477, ms: 15894 },
  { id: "S28", segment: "真题：项目评估", from: 21677, duration: 419, ms: 13955 },
  { id: "S30", segment: "真题：项目评估", from: 22096, duration: 369, ms: 12285 },
  { id: "S31", segment: "真题：项目评估", from: 22465, duration: 681, ms: 22704 },
  { id: "S33", segment: "真题：项目评估", from: 23146, duration: 75, ms: 2506 },
  { id: "S34", segment: "真题：项目评估", from: 23221, duration: 459, ms: 15305 },
  { id: "S36", segment: "真题：项目评估", from: 23680, duration: 481, ms: 16021 },
  { id: "S37", segment: "评估程序与内容", from: 24161, duration: 1223, ms: 40778 },
  { id: "S38", segment: "评估程序与内容", from: 25384, duration: 2423, ms: 80752 },
  { id: "S39", segment: "评估程序与内容", from: 27807, duration: 625, ms: 20849 },
  { id: "S40", segment: "收官真题", from: 28432, duration: 317, ms: 10562 },
  { id: "S41", segment: "收官真题", from: 28749, duration: 614, ms: 20473 },
  { id: "S43", segment: "收官真题", from: 29363, duration: 1232, ms: 41070 },
  { id: "S44a", segment: "章末总图与交棒", from: 30595, duration: 348, ms: 11607 },
  { id: "S44b", segment: "章末总图与交棒", from: 30943, duration: 491, ms: 16374 },
  { id: "S44c", segment: "章末总图与交棒", from: 31434, duration: 549, ms: 18289 },
  { id: "S44d", segment: "章末总图与交棒", from: 31983, duration: 645, ms: 21496 },
  { id: "S44e", segment: "章末总图与交棒", from: 32628, duration: 484, ms: 16132 },
  { id: "S45", segment: "章末总图与交棒", from: 33112, duration: 534, ms: 17789 },
  { id: "S46", segment: "章末总图与交棒", from: 33646, duration: 318, ms: 10595 },
];

export const L03_TOTAL_FRAMES = L03_SHOTS.reduce((a, s) => Math.max(a, s.from + s.duration), 0);

/** 当前帧属于哪一镜（1-based 序号供面包屑使用）。 */
export const l03ShotAt = (frame: number): { shot: L03Shot; order: number } => {
  for (let i = 0; i < L03_SHOTS.length; i++) {
    const s = L03_SHOTS[i];
    if (frame < s.from + s.duration) return { shot: s, order: i + 1 };
  }
  const last = L03_SHOTS[L03_SHOTS.length - 1];
  return { shot: last, order: L03_SHOTS.length };
};
