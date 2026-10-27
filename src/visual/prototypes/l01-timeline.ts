/**
 * L01 时间线常量（纯数据，无 JSX）：成片、字幕生成脚本共用同一份真源。
 *
 * 时间码来自《第七章-L01-画面分镜方案V0.1》S01–S31 的真实镜长，30fps。
 */

export type Shot = { id: string; from: number; to: number; segment: string };

export const SHOTS: Shot[] = [
  { id: "S01", from: 0, to: 180, segment: "开场与全书坐标" },
  { id: "S02", from: 180, to: 750, segment: "开场与全书坐标" },
  { id: "S03", from: 750, to: 1050, segment: "开场与全书坐标" },
  { id: "S04", from: 1050, to: 1410, segment: "开场与全书坐标" },
  { id: "S05", from: 1410, to: 1950, segment: "开场与全书坐标" },
  { id: "S06", from: 1950, to: 2460, segment: "四笔账与三件事" },
  { id: "S07", from: 2460, to: 2820, segment: "四笔账与三件事" },
  { id: "S08", from: 2820, to: 3210, segment: "投资前四阶段与裁剪" },
  { id: "S09", from: 3210, to: 4020, segment: "投资前四阶段与裁剪" },
  { id: "S10", from: 4020, to: 4470, segment: "投资前四阶段与裁剪" },
  { id: "S11", from: 4470, to: 4740, segment: "投资前四阶段与裁剪" },
  { id: "S12", from: 4740, to: 5220, segment: "投资前四阶段与裁剪" },
  { id: "S13", from: 5220, to: 5580, segment: "投资前四阶段与裁剪" },
  { id: "S14", from: 5580, to: 6300, segment: "真题 1：四阶段排除法" },
  { id: "S15", from: 6300, to: 6420, segment: "真题 1：四阶段排除法" },
  { id: "S16", from: 6420, to: 6810, segment: "真题 1：四阶段排除法" },
  { id: "S17", from: 6810, to: 7290, segment: "真题 1：四阶段排除法" },
  { id: "S18", from: 7290, to: 7830, segment: "7.1 进场" },
  { id: "S19", from: 7830, to: 8610, segment: "7.1 身份证 · 谁写给谁" },
  { id: "S20", from: 8610, to: 9150, segment: "7.1 身份证 · 什么深度" },
  { id: "S21", from: 9150, to: 9780, segment: "7.1 身份证 · 什么作用" },
  { id: "S22", from: 9780, to: 10140, segment: "真题 2：逐项判卷" },
  { id: "S23", from: 10140, to: 10290, segment: "真题 2：逐项判卷" },
  { id: "S24", from: 10290, to: 10650, segment: "真题 2：逐项判卷" },
  { id: "S25", from: 10650, to: 11370, segment: "真题 2：逐项判卷" },
  { id: "S26", from: 11370, to: 11760, segment: "四件套：连考三次" },
  { id: "S27", from: 11760, to: 12780, segment: "四件套：连考三次" },
  { id: "S28", from: 12780, to: 13590, segment: "四件套：连考三次" },
  { id: "S29", from: 13590, to: 14130, segment: "真题 3：一题带三题" },
  { id: "S30", from: 14130, to: 14760, segment: "真题 3：一题带三题" },
  { id: "S31", from: 14760, to: 15210, segment: "交棒 7.2" },
];

export const L01_TOTAL_FRAMES = 15210;
export const L01_FPS = 30;

/**
 * 口播自然段 → 镜号（按《分镜方案》第七节的覆盖核对表）。
 *
 * 数组下标 = 口播稿第 n 个非空自然段（从 1 开始对齐，脚本内 +1）。
 * 口播稿改动时必须同步这张表——脚本会校验段落数是否一致，不一致直接报错。
 */
export const PARAGRAPH_SHOTS: string[] = [
  "S01", "S02", "S03", "S04", "S05",
  "S06", "S06", "S06", "S06", "S06", "S07",
  "S08", "S08",
  "S09", "S09", "S09", "S09",
  "S10", "S11", "S12",
  "S13", "S13",
  "S14", "S14", "S15", "S16", "S17",
  "S18", "S18",
  "S19", "S19", "S20", "S21",
  "S22", "S23",
  "S24", "S24", "S25", "S25",
  "S26",
  "S27", "S27", "S27", "S27", "S27",
  "S28",
  "S29", "S29", "S30", "S31",
];
