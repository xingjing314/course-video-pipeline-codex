/**
 * 自动生成，勿手改。来源：scripts/build-l02-shot-table.ts
 *
 * 镜长由真实配音派生（audio-timeline.json），不是估算。
 * 配音若重录，重跑脚本即可，不要手改数字。
 */
export type L02Shot = { id: string; segment: string; from: number; duration: number; ms: number };

export const L02_SHOTS: L02Shot[] = [
  { id: "S01", segment: "交棒与定义", from: 0, duration: 467, ms: 15563 },
  { id: "S02", segment: "交棒与定义", from: 467, duration: 516, ms: 17204 },
  { id: "S03", segment: "交棒与定义", from: 983, duration: 474, ms: 15793 },
  { id: "S04", segment: "五顶帽子", from: 1457, duration: 502, ms: 16732 },
  { id: "S05", segment: "五顶帽子", from: 1959, duration: 453, ms: 15095 },
  { id: "S06", segment: "五顶帽子", from: 2412, duration: 1632, ms: 54415 },
  { id: "S07", segment: "五顶帽子", from: 4044, duration: 627, ms: 20901 },
  { id: "S08", segment: "技术：先进与适用", from: 4671, duration: 576, ms: 19195 },
  { id: "S09", segment: "技术：先进与适用", from: 5247, duration: 307, ms: 10249 },
  { id: "S10", segment: "技术：先进与适用", from: 5554, duration: 402, ms: 13414 },
  { id: "S11", segment: "技术：先进与适用", from: 5956, duration: 196, ms: 6545 },
  { id: "S12", segment: "技术四因素", from: 6152, duration: 813, ms: 27106 },
  { id: "S13", segment: "技术四因素", from: 6965, duration: 1325, ms: 44173 },
  { id: "S14", segment: "技术四因素", from: 8290, duration: 1462, ms: 48738 },
  { id: "S15", segment: "技术四因素", from: 9752, duration: 975, ms: 32512 },
  { id: "S16", segment: "技术四因素", from: 10727, duration: 129, ms: 4308 },
  { id: "S17", segment: "技术四因素", from: 10856, duration: 410, ms: 13679 },
  { id: "S18", segment: "经济四笔账", from: 11266, duration: 683, ms: 22775 },
  { id: "S19", segment: "经济四笔账", from: 11949, duration: 306, ms: 10189 },
  { id: "S20", segment: "经济四笔账", from: 12255, duration: 394, ms: 13129 },
  { id: "S21", segment: "经济四笔账", from: 12649, duration: 547, ms: 18219 },
  { id: "S22", segment: "经济四笔账", from: 13196, duration: 562, ms: 18732 },
  { id: "S23", segment: "经济四笔账", from: 13758, duration: 542, ms: 18054 },
  { id: "S24", segment: "经济四笔账", from: 14300, duration: 266, ms: 8858 },
  { id: "S25", segment: "经济四笔账", from: 14566, duration: 589, ms: 19644 },
  { id: "S26", segment: "经济真题", from: 15155, duration: 452, ms: 15068 },
  { id: "S27", segment: "经济真题", from: 15607, duration: 943, ms: 31420 },
  { id: "S28", segment: "经济真题", from: 16550, duration: 716, ms: 23867 },
  { id: "S29", segment: "经济真题", from: 17266, duration: 673, ms: 22445 },
  { id: "S30", segment: "社会效益", from: 17939, duration: 469, ms: 15630 },
  { id: "S31", segment: "社会效益", from: 18408, duration: 518, ms: 17254 },
  { id: "S32", segment: "社会效益", from: 18926, duration: 1116, ms: 37190 },
  { id: "S33", segment: "社会效益", from: 20042, duration: 777, ms: 25893 },
  { id: "S34", segment: "终极防坑表", from: 20819, duration: 818, ms: 27265 },
  { id: "S35", segment: "终极防坑表", from: 21637, duration: 1020, ms: 33989 },
  { id: "S36", segment: "终极防坑表", from: 22657, duration: 626, ms: 20875 },
  { id: "S37", segment: "终极防坑表", from: 23283, duration: 887, ms: 29578 },
  { id: "S38", segment: "运行环境与收官", from: 24170, duration: 1781, ms: 59377 },
  { id: "S39", segment: "运行环境与收官", from: 25951, duration: 781, ms: 26049 },
  { id: "S40", segment: "运行环境与收官", from: 26732, duration: 1250, ms: 41673 },
  { id: "S41", segment: "运行环境与收官", from: 27982, duration: 1003, ms: 33435 },
  { id: "S42", segment: "运行环境与收官", from: 28985, duration: 592, ms: 19746 },
];

export const L02_TOTAL_FRAMES = L02_SHOTS.reduce((a, s) => Math.max(a, s.from + s.duration), 0);

/** 当前帧属于哪一镜（1-based 序号供面包屑使用）。 */
export const l02ShotAt = (frame: number): { shot: L02Shot; order: number } => {
  for (let i = 0; i < L02_SHOTS.length; i++) {
    const s = L02_SHOTS[i];
    if (frame < s.from + s.duration) return { shot: s, order: i + 1 };
  }
  const last = L02_SHOTS[L02_SHOTS.length - 1];
  return { shot: last, order: L02_SHOTS.length };
};
