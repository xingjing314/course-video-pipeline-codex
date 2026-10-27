/**
 * 原子图形通用色卡说明 v1.1 标准实现
 * 适用范围：信息系统项目管理师课程 Remotion 视频全部原子图形
 * 规范出处：/projects/gaoxiang/remotion-experiment/Grok/Grok bot-视觉工程师和视觉模板工程师输出/色卡/atom-color-card-v1.1
 */

export interface ToneColor {
  name: string;
  hex: string;
  rgb: [number, number, number];
  role: string;
}

export type ToneName =
  | 'cyan'
  | 'teal'
  | 'blue'
  | 'green'
  | 'emerald'
  | 'gold'
  | 'amber'
  | 'orange'
  | 'red'
  | 'rose'
  | 'purple'
  | 'violet'
  | 'neutral'
  | 'gray'
  | 'accent';

export type VariantName = 'tint' | 'solid' | 'outline' | 'ghost' | 'line';
export type StateName = 'normal' | 'emphasis' | 'selected' | 'muted';
export type SurfaceName = 'none' | 'panel' | 'card';

// 1. 基础色 (base)
export const BASE_COLORS = {
  bg: '#0B1A33', // 画面背景底色（深海军蓝）
  text: '#E6F1FA', // 主文字
  text2: '#8FB8D9', // 次要文字、说明、行标签
  textOnSolid: '#0B1A33', // 实心 (solid) 底上的文字
  panelFill: 'rgba(6, 14, 31, 0.55)', // 底板填充
  panelStroke: 'rgba(46, 196, 214, 0.18)', // 底板描边 (1px cyan α0.18)
  cardFill: 'rgba(11, 26, 51, 0.72)', // 卡片填充
  cardStroke: 'rgba(143, 184, 217, 0.25)', // 卡片描边 (1.5px #8FB8D9 α0.25)
};

const BASE_TONES: Record<string, ToneColor> = {
  cyan: {
    name: 'cyan',
    hex: '#2EC4D6',
    rgb: [46, 196, 214],
    role: '主色。默认色系，画面中占比最大',
  },
  blue: {
    name: 'blue',
    hex: '#5B9BF0',
    rgb: [91, 155, 240],
    role: '辅助色，用于第二类对象',
  },
  green: {
    name: 'green',
    hex: '#4CC38A',
    rgb: [76, 195, 138],
    role: '辅助色，用于第三类对象',
  },
  gold: {
    name: 'gold',
    hex: '#E0B050',
    rgb: [224, 176, 80],
    role: '保留的唯一重点色（一屏一重点）',
  },
  orange: {
    name: 'orange',
    hex: '#F07A3E',
    rgb: [240, 122, 62],
    role: '辅助色，偏锈红，刻意与金色拉开',
  },
  red: {
    name: 'red',
    hex: '#E0605A',
    rgb: [224, 96, 90],
    role: '默认预警色',
  },
  purple: {
    name: 'purple',
    hex: '#A784E8',
    rgb: [167, 132, 232],
    role: '辅助色，用于额外分类',
  },
  neutral: {
    name: 'neutral',
    hex: '#8FB8D9',
    rgb: [143, 184, 217],
    role: '灰蓝，次要元素、未激活对象',
  },
};

// 2. 8 大基础色系 + 别名映射 (兼容规范与流水线数据契约)
export const TONES: Record<ToneName, ToneColor> = {
  cyan: BASE_TONES.cyan,
  teal: BASE_TONES.cyan,
  accent: BASE_TONES.cyan,
  blue: BASE_TONES.blue,
  green: BASE_TONES.green,
  emerald: BASE_TONES.green,
  gold: BASE_TONES.gold,
  amber: BASE_TONES.gold,
  orange: BASE_TONES.orange,
  red: BASE_TONES.red,
  rose: BASE_TONES.red,
  purple: BASE_TONES.purple,
  violet: BASE_TONES.purple,
  neutral: BASE_TONES.neutral,
  gray: BASE_TONES.neutral,
};

export const rgba = (rgb: [number, number, number], a: number) =>
  `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${a})`;

export const resolveTone = (tone?: string): ToneColor => {
  if (!tone) return TONES.cyan;
  const key = tone.toLowerCase().trim() as ToneName;
  if (TONES[key]) return TONES[key];

  // 支持临时 Hex 自定义色 (#RRGGBB)
  const clean = tone.trim();
  if (/^#([0-9a-fA-F]{6})$/.test(clean)) {
    const r = parseInt(clean.slice(1, 3), 16);
    const g = parseInt(clean.slice(3, 5), 16);
    const b = parseInt(clean.slice(5, 7), 16);
    return { name: 'custom', hex: clean.toUpperCase(), rgb: [r, g, b], role: '自定义色' };
  }
  return TONES.cyan;
};

export interface ComputedAtomStyle {
  toneObj: ToneColor;
  hex: string;
  rgb: [number, number, number];
  fill: string;
  stroke: string;
  strokeWidth: number;
  textColor: string;
  subTextColor: string;
  textOpacity: number;
  outerGlowColor?: string;
  outerGlowRadius?: number;
  accentBarColor?: string;
  opacity: number;
}

/**
 * 严格按照色卡 v1.1 规范计算样式
 */
export function computeAtomStyle(options: {
  tone?: string;
  variant?: VariantName;
  state?: StateName;
  surface?: SurfaceName;
  strokeWidthOverride?: number;
}): ComputedAtomStyle {
  const {
    tone = 'cyan',
    variant = 'tint',
    state = 'normal',
    surface = 'none',
    strokeWidthOverride,
  } = options;

  const t = resolveTone(tone);
  const { rgb, hex } = t;

  let fill = rgba(rgb, 0.12);
  let stroke = rgba(rgb, 0.60);
  let strokeWidth = 1.5;
  let textColor = BASE_COLORS.text;
  const subTextColor = BASE_COLORS.text2;
  let textOpacity = 1;
  let opacity = 1;
  let outerGlowColor: string | undefined;
  let outerGlowRadius: number | undefined;
  let accentBarColor: string | undefined;

  // 1) 样式公式 (variant)
  if (variant === 'solid') {
    fill = rgba(rgb, 0.90);
    stroke = 'none';
    strokeWidth = 0;
    textColor = BASE_COLORS.textOnSolid;
  } else if (variant === 'outline') {
    fill = 'none';
    stroke = rgba(rgb, 0.85);
    strokeWidth = 1.5;
  } else if (variant === 'ghost') {
    fill = rgba(rgb, 0.10);
    stroke = 'none';
    strokeWidth = 0;
    textOpacity = 0.85;
  } else if (variant === 'line') {
    fill = 'none';
    stroke = rgba(rgb, 0.85);
    strokeWidth = 2.0;
  } else {
    // tint (默认)
    fill = rgba(rgb, 0.12);
    stroke = rgba(rgb, 0.60);
    strokeWidth = 1.5;
  }

  // 2) 底板覆盖 (surface)
  if (surface === 'panel') {
    fill = BASE_COLORS.panelFill;
    stroke = BASE_COLORS.panelStroke;
    strokeWidth = 1.0;
  } else if (surface === 'card') {
    fill = BASE_COLORS.cardFill;
    stroke = BASE_COLORS.cardStroke;
    strokeWidth = 1.5;
  }

  // 3) 状态公式 (state)
  if (state === 'emphasis') {
    stroke = rgba(rgb, 1.0);
    strokeWidth = 2.0;
    outerGlowColor = rgba(rgb, 0.25);
    outerGlowRadius = 12; // 模糊 12px (stdDeviation 6)
  } else if (state === 'selected') {
    if (variant !== 'solid') {
      fill = rgba(rgb, 0.16);
    }
    stroke = rgba(rgb, 0.75);
    accentBarColor = rgba(rgb, 1.0); // 4px 强调条 (基色 α1.0)
    if (strokeWidth === 0) strokeWidth = 1.5;
  } else if (state === 'muted') {
    opacity = 0.5;
  }

  if (typeof strokeWidthOverride === 'number') {
    strokeWidth = strokeWidthOverride;
  }

  return {
    toneObj: t,
    hex,
    rgb,
    fill,
    stroke,
    strokeWidth,
    textColor,
    subTextColor,
    textOpacity,
    outerGlowColor,
    outerGlowRadius,
    accentBarColor,
    opacity,
  };
}

/**
 * 几何内缩计算：确保描边在内侧，外轮廓尺寸严格等于 w × h
 */
export function getInsetRect(x: number, y: number, w: number, h: number, strokeWidth: number) {
  if (strokeWidth <= 0) return { x, y, width: w, height: h };
  const half = strokeWidth / 2;
  return {
    x: x + half,
    y: y + half,
    width: Math.max(0, w - strokeWidth),
    height: Math.max(0, h - strokeWidth),
  };
}

export function getInsetCircle(cx: number, cy: number, r: number, strokeWidth: number) {
  if (strokeWidth <= 0) return { cx, cy, r };
  return {
    cx,
    cy,
    r: Math.max(0, r - strokeWidth / 2),
  };
}
