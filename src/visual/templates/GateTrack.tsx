/**
 * A5 · 立项四关轨道（Gate Track）状态机原型 v0.1
 *
 * 验证分镜方案的核心假设——"一图到底"：
 * 一条轨道、四座门，靠状态演进讲完 7.1 之前的全部推进关系。
 *
 *   stage 0 建立   : 轨道生长，四座空门升起
 *   stage 1 点亮   : 四门依次点亮（每门约 1.6s）
 *   stage 2 幽灵门 : ⑤ 机会可行性研究 滑入 → 划叉 → 淡出
 *   stage 3 盖章   : ②③ 合二为一虚线 + ③ 落「★ 不可缺少」金章
 *   stage 4 裁剪   : 升级改造 / 小项目 两条裁剪轨
 *   stage 5 推镜   : 推近 ①（7.1 入场）
 *   stage 6 交棒   : 拉开到 ①②，① 落「✓ 批复同意」，② 亮出 7.2
 *
 * 用法：
 *   <GateTrack stage={n} f={localFrame} />
 *   f 缺省时用全局帧。正式接入流水线时，把 stage/f 换成场景 cue 点即可。
 */
import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BASE_COLORS, resolveTone, rgba } from "../tokens/colorCard";
import { SceneShell } from "./shared";
import { TechNetwork } from "../backgrounds/tech-network/TechNetwork";
import { techNetworkSchema } from "../backgrounds/tech-network/schema";

const CYAN = resolveTone("cyan");
const GOLD = resolveTone("gold");
const RED = resolveTone("red");
const GREEN = resolveTone("green");
const NEUTRAL = resolveTone("neutral");

const GATES = [
  { step: "第一步", name: "项目建议与立项申请", note: "先打报告：我想干这件事" },
  { step: "第二步", name: "初步可行性研究", note: "粗算前途：值不值得深究" },
  { step: "第三步", name: "详细可行性研究", note: "全面比选方案 ＋ 经济测算" },
  { step: "第四步", name: "评估与决策", note: "第三方审可研 → 拍板立项" },
] as const;

const CENTERS = [300, 760, 1220, 1680] as const;
const GATE_W = 250;
const GATE_H = 200;
const GATE_TOP = 300;
const TRACK_Y = GATE_TOP + GATE_H / 2;
const RAIL_Y1 = 700;
const RAIL_Y2 = 792;

export const A5_STAGES = [
  { key: "establish", label: "建立", dur: 90 },
  { key: "light", label: "点亮", dur: 220 },
  { key: "ghost", label: "幽灵门", dur: 100 },
  { key: "stamp", label: "盖章", dur: 90 },
  { key: "prune", label: "裁剪", dur: 150 },
  { key: "pushEntry", label: "推镜 7.1", dur: 120 },
  { key: "pushHandoff", label: "交棒 7.2", dur: 120 },
] as const;

const ease = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
const lr = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));

export type GateTrackProps = {
  stage: number;
  f?: number;
  /** 点亮阶段每座门的间隔帧数，默认 48（评审片节奏） */
  beatFrames?: number;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
};

export const GateTrack: React.FC<GateTrackProps> = ({
  stage,
  f,
  beatFrames = 48,
  eyebrow = "7.0 导言 ｜ 投资前时期",
  title = "立项论证 ＝ 教材「投资前时期」",
  subtitle = "四关闯完，才轮到 7.1",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = f ?? frame;

  const s = Math.max(0, Math.min(A5_STAGES.length - 1, stage));
  const p = (frames: number) => ease(local / frames);

  // 阶段 1：四门依次点亮
  const litCount = s > 1 ? 4 : s === 1 ? Math.max(0, Math.min(4, Math.floor((local - 30) / beatFrames) + 1)) : 0;

  // 阶段 2：幽灵门 滑入 → 划叉 → 淡出
  const ghostStruck = s > 2 ? 1 : s === 2 ? ease((local - 44) / 14) : 0;
  const ghostGone = s > 2 ? 1 : s === 2 ? ease((local - 70) / 22) : 0;

  // 阶段 3：合二为一 + 落章
  const bridge = s > 3 ? 1 : s === 3 ? ease(local / 18) : 0;
  const stamp = s > 3 ? 1 : s === 3 ? ease((local - 24) / 16) : 0;

  // 阶段 4：裁剪轨（推镜后隐藏，避免与画面底部抢注意力）
  const rail = s === 4 ? ease(local / 26) : 0;

  // 阶段 5/6：推镜
  const entryT = s > 5 ? 1 : s === 5 ? ease(local / 34) : 0;
  const handoffT = s > 6 ? 1 : s === 6 ? ease(local / 34) : 0;
  const cam =
    s === 5
      ? { x: lr(0, 175, entryT), y: lr(0, -120, entryT), k: lr(1, 1.55, entryT) }
      : s === 6
        ? { x: lr(175, 65, handoffT), y: lr(-120, -60, handoffT), k: lr(1.55, 1.35, handoffT) }
        : { x: 0, y: 0, k: 1 };

  // 阶段 6：批复章
  const approve = s > 6 ? 1 : s === 6 ? ease((local - 16) / 16) : 0;

  const lowerOp = s === 5 ? ease(local / 20) : s === 6 ? 1 : 0;

  return (
    <SceneShell eyebrow={eyebrow} title={title} subtitle={subtitle}>
      {/* 缩放舞台 */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1920,
          height: 1080,
          transformOrigin: "0 0",
          transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.k})`,
        }}
      >
        {/* 轨道主线 */}
        <div
          style={{
            position: "absolute",
            left: 170,
            top: TRACK_Y - 1.5,
            width: 1610 * (s === 0 ? p(26) : 1),
            height: 3,
            background: rgba(CYAN.rgb, 0.42),
            borderRadius: 2,
          }}
        />

        {/* 门间箭头 */}
        {GATES.slice(1).map((_, i) => {
          const x0 = CENTERS[i] + GATE_W / 2 + 12;
          const x1 = CENTERS[i + 1] - GATE_W / 2 - 12;
          return (
            <React.Fragment key={`arrow-${i}`}>
              <div
                style={{
                  position: "absolute",
                  left: x0,
                  top: TRACK_Y - 1,
                  width: Math.max(0, x1 - x0 - 12),
                  height: 2,
                  background: rgba(CYAN.rgb, 0.45),
                  opacity: s === 0 ? p(40) : 1,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: x1 - 12,
                  top: TRACK_Y - 6,
                  width: 0,
                  height: 0,
                  borderTop: "6px solid transparent",
                  borderBottom: "6px solid transparent",
                  borderLeft: `12px solid ${rgba(CYAN.rgb, 0.6)}`,
                  opacity: s === 0 ? p(40) : 1,
                }}
              />
            </React.Fragment>
          );
        })}

        {/* 可合二为一（②↔③），推镜阶段隐藏 */}
        {bridge > 0 && s < 5 ? (
          <div
            style={{
              position: "absolute",
              left: CENTERS[1] + GATE_W / 2 + 10,
              top: TRACK_Y - 62,
              width: (CENTERS[2] - GATE_W / 2 - 10 - (CENTERS[1] + GATE_W / 2 + 10)) * bridge,
              height: 0,
              borderTop: `2px dashed ${rgba(GOLD.rgb, 0.85)}`,
              opacity: bridge,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                top: -38,
                whiteSpace: "nowrap",
                fontSize: 20,
                fontWeight: 700,
                color: GOLD.hex,
                background: "rgba(11,26,51,0.85)",
                padding: "2px 10px",
                borderRadius: 8,
                opacity: bridge,
              }}
            >
              可合二为一
            </div>
          </div>
        ) : null}

        {/* 四座门 */}
        {GATES.map((g, i) => {
          const lit = i < litCount;
          const cx = CENTERS[i];
          const rise =
            s === 0
              ? spring({ frame: local - 8 - i * 5, fps, config: { damping: 18, mass: 0.85, stiffness: 115 } })
              : 1;
          const isTarget = (s === 5 && i === 0) || (s === 6 && i <= 1);
          const dim = (s >= 5 && !isTarget ? 0.18 : 1) * (lit || s === 0 ? 1 : 0.55);
          const tone = i === 2 && stamp > 0.5 && s < 5 ? GOLD : CYAN;

          return (
            <div key={g.name} style={{ position: "absolute", left: 0, top: 0, opacity: dim }}>
              <div
                style={{
                  position: "absolute",
                  left: cx - GATE_W / 2,
                  top: GATE_TOP + (1 - rise) * 24,
                  width: GATE_W,
                  height: GATE_H,
                  borderTopLeftRadius: 125,
                  borderTopRightRadius: 125,
                  borderBottomLeftRadius: 12,
                  borderBottomRightRadius: 12,
                  border: `3px solid ${rgba(tone.rgb, lit || s === 0 ? (isTarget ? 1 : 0.6) : 0.2)}`,
                  background: lit
                    ? `linear-gradient(180deg, ${rgba(tone.rgb, 0.16)}, ${rgba(tone.rgb, 0.03)})`
                    : "rgba(8,18,36,0.5)",
                  boxShadow:
                    isTarget || (i === 2 && s === 3)
                      ? `0 0 46px ${rgba(tone.rgb, 0.5)}, inset 0 0 40px ${rgba(tone.rgb, 0.14)}`
                      : lit
                        ? `0 0 22px ${rgba(tone.rgb, 0.18)}`
                        : "none",
                  opacity: rise,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: cx - 48,
                  top: GATE_TOP + (1 - rise) * 24 + 52,
                  width: 96,
                  height: 96,
                  borderRadius: "50%",
                  border: `2px solid ${rgba(tone.rgb, lit ? 0.85 : 0.28)}`,
                  background: lit ? rgba(tone.rgb, 0.18) : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 52,
                  fontWeight: 700,
                  color: lit ? BASE_COLORS.text : rgba(NEUTRAL.rgb, 0.65),
                }}
              >
                {i + 1}
              </div>

              <div
                style={{
                  position: "absolute",
                  left: cx - GATE_W / 2,
                  top: GATE_TOP + GATE_H + 20,
                  width: GATE_W,
                  textAlign: "center",
                  fontSize: 22,
                  letterSpacing: 4,
                  color: lit ? GOLD.hex : BASE_COLORS.text2,
                }}
              >
                {g.step}
              </div>
              {lit ? (
                <div
                  style={{
                    position: "absolute",
                    left: cx - GATE_W / 2,
                    top: GATE_TOP + GATE_H + 56,
                    width: GATE_W,
                    textAlign: "center",
                    fontSize: 27,
                    fontWeight: 700,
                    lineHeight: 1.28,
                    color: BASE_COLORS.text,
                    opacity: s === 0 ? 0 : 1,
                  }}
                >
                  {g.name}
                </div>
              ) : (
                <div
                  style={{
                    position: "absolute",
                    left: cx - GATE_W / 2 + 18,
                    top: GATE_TOP + GATE_H + 60,
                    width: GATE_W - 36,
                    height: 30,
                    borderRadius: 6,
                    border: `1.5px dashed ${rgba(NEUTRAL.rgb, 0.4)}`,
                  }}
                />
              )}

              {lit ? (
                <div
                  style={{
                    position: "absolute",
                    left: cx - GATE_W / 2 - 16,
                    top: GATE_TOP + GATE_H + 100,
                    width: GATE_W + 32,
                    textAlign: "center",
                    fontSize: 21,
                    lineHeight: 1.35,
                    color: BASE_COLORS.text2,
                  }}
                >
                  {g.note}
                </div>
              ) : (
                <div
                  style={{
                    position: "absolute",
                    left: cx - GATE_W / 2 + 40,
                    top: GATE_TOP + GATE_H + 106,
                    width: GATE_W - 80,
                    height: 18,
                    borderRadius: 6,
                    border: `1.5px dashed ${rgba(NEUTRAL.rgb, 0.26)}`,
                  }}
                />
              )}

              {/* ③ 的金色印章 */}
              {i === 2 && stamp > 0 && s < 5 ? (
                <div
                  style={{
                    position: "absolute",
                    left: cx - 118,
                    top: GATE_TOP - 34,
                    width: 236,
                    padding: "8px 0",
                    textAlign: "center",
                    borderRadius: 8,
                    border: `3px solid ${GOLD.hex}`,
                    color: GOLD.hex,
                    fontSize: 30,
                    fontWeight: 800,
                    letterSpacing: 2,
                    background: "rgba(224,176,80,0.12)",
                    transform: `scale(${1.35 - 0.35 * stamp}) rotate(-3deg)`,
                    opacity: stamp,
                  }}
                >
                  ★ 不可缺少
                </div>
              ) : null}

              {/* ① 的绿色批复章 */}
              {i === 0 && approve > 0 ? (
                <div
                  style={{
                    position: "absolute",
                    left: cx - 104,
                    top: GATE_TOP - 26,
                    width: 208,
                    padding: "6px 0",
                    textAlign: "center",
                    borderRadius: 8,
                    border: `3px solid ${GREEN.hex}`,
                    color: GREEN.hex,
                    fontSize: 28,
                    fontWeight: 800,
                    background: "rgba(76,195,138,0.14)",
                    transform: `scale(${1.3 - 0.3 * approve}) rotate(-4deg)`,
                    opacity: approve,
                  }}
                >
                  ✓ 批复同意
                </div>
              ) : null}

              {/* ② 的门内标签 */}
              {i === 1 && s === 6 ? (
                <div
                  style={{
                    position: "absolute",
                    left: cx - 140,
                    top: GATE_TOP - 50,
                    width: 280,
                    textAlign: "center",
                    fontSize: 24,
                    fontWeight: 700,
                    color: CYAN.hex,
                    background: "rgba(11,26,51,0.9)",
                    border: `1.5px solid ${rgba(CYAN.rgb, 0.55)}`,
                    borderRadius: 8,
                    padding: "6px 0",
                    opacity: handoffT,
                  }}
                >
                  7.2 项目可行性研究
                </div>
              ) : null}
            </div>
          );
        })}

        {/* 幽灵门 ⑤ */}
        {s === 2 ? (
          <div
            style={{
              position: "absolute",
              left: 820,
              top: 706,
              width: 280,
              height: 196,
              opacity: 1 - ghostGone,
              transform: `translateY(${(1 - ease(local / 20)) * 90}px)`,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderTopLeftRadius: 140,
                borderTopRightRadius: 140,
                borderBottomLeftRadius: 12,
                borderBottomRightRadius: 12,
                border: `3px dashed ${rgba(RED.rgb, 0.85)}`,
                background: rgba(RED.rgb, 0.07),
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
              }}
            >
              <div style={{ fontSize: 40, fontWeight: 800, color: rgba(RED.rgb, 0.95) }}>⑤</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: BASE_COLORS.text, opacity: 0.85 }}>
                机会可行性研究
              </div>
            </div>

            {ghostStruck > 0 ? (
              <svg width={280} height={196} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
                <line
                  x1={14}
                  y1={28}
                  x2={14 + 252 * ghostStruck}
                  y2={168}
                  stroke={RED.hex}
                  strokeWidth={7}
                  strokeLinecap="round"
                />
                <line
                  x1={266}
                  y1={28}
                  x2={266 - 252 * ghostStruck}
                  y2={168}
                  stroke={RED.hex}
                  strokeWidth={7}
                  strokeLinecap="round"
                />
              </svg>
            ) : null}
          </div>
        ) : null}

        {/* 警告签 */}
        {s === 2 && ghostStruck > 0.6 ? (
          <div
            style={{
              position: "absolute",
              right: 96,
              top: 232,
              padding: "12px 22px",
              borderRadius: 12,
              background: rgba(RED.rgb, 0.16),
              border: `1.5px solid ${RED.hex}`,
              color: BASE_COLORS.text,
              fontSize: 22,
              fontWeight: 700,
              opacity: clamp01((local - 52) / 12),
            }}
          >
            ⚠ 教材四阶段里没有「机会可行性研究」→ 见到直接排除
          </div>
        ) : null}

        {/* 裁剪双轨 */}
        {rail > 0 ? (
          <>
            <div
              style={{
                position: "absolute",
                left: 96,
                top: RAIL_Y1 - 34,
                fontSize: 20,
                fontWeight: 700,
                color: BASE_COLORS.text,
                opacity: rail,
              }}
            >
              升级改造项目 <span style={{ color: BASE_COLORS.text2, fontWeight: 400 }}>· 只做初步 ＋ 详细</span>
            </div>
            <div
              style={{
                position: "absolute",
                left: 96,
                top: RAIL_Y2 - 34,
                fontSize: 20,
                fontWeight: 700,
                color: BASE_COLORS.text,
                opacity: rail,
              }}
            >
              小项目 <span style={{ color: BASE_COLORS.text2, fontWeight: 400 }}>· 一般只做详细</span>
            </div>

            {(
              [
                { y: RAIL_Y1, keep: [false, true, true, null] },
                { y: RAIL_Y2, keep: [false, false, true, null] },
              ] as const
            ).map((row, ri) => (
              <React.Fragment key={ri}>
                {CENTERS.map((cx, i) => {
                  const keep = row.keep[i];
                  const tone = keep === true ? GREEN : NEUTRAL;
                  const text = keep === true ? "保留" : keep === false ? "跳过" : "—";
                  return (
                    <div
                      key={i}
                      style={{
                        position: "absolute",
                        left: cx - 70,
                        top: row.y,
                        width: 140,
                        height: 44,
                        borderRadius: 22,
                        border: `1.5px solid ${rgba(tone.rgb, keep === null ? 0.22 : 0.8)}`,
                        background: keep === true ? rgba(tone.rgb, 0.18) : "transparent",
                        color: keep === true ? tone.hex : BASE_COLORS.text2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        fontSize: 19,
                        fontWeight: 700,
                        opacity: (keep === null ? 0.45 : 1) * rail,
                      }}
                    >
                      <span>{i + 1}</span>
                      <span style={{ fontSize: 17, fontWeight: 500 }}>{text}</span>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}

            <div style={{ position: "absolute", left: 96, top: 862, fontSize: 18, color: BASE_COLORS.text2, opacity: rail }}>
              ※ ④ 评估与决策：教材只规定「只做初步和详细研究」，未对评估环节表态，此处留白
            </div>
          </>
        ) : null}
      </div>

      {/* 推镜阶段的下三分之一字幕带 */}
      {s >= 5 ? (
        <>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 250,
              background: "linear-gradient(180deg, rgba(11,26,51,0) 0%, rgba(11,26,51,0.9) 60%, #0B1A33 100%)",
              opacity: lowerOp,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 96,
              bottom: 104,
              display: "flex",
              alignItems: "center",
              gap: 18,
              opacity: s === 6 ? ease((local - 8) / 16) : lowerOp,
            }}
          >
            <div
              style={{
                fontSize: 20,
                letterSpacing: 3,
                color: s === 6 ? GOLD.hex : CYAN.hex,
                border: `1.5px solid ${s === 6 ? GOLD.hex : CYAN.hex}`,
                borderRadius: 6,
                padding: "4px 10px",
              }}
            >
              {s === 6 ? "下一节" : "本章 7.1"}
            </div>
            <div style={{ fontSize: 34, fontWeight: 700, color: BASE_COLORS.text }}>
              {s === 6 ? "7.2 项目可行性研究" : "7.1 项目建议与立项申请"}
            </div>
            <div style={{ fontSize: 22, color: BASE_COLORS.text2 }}>
              {s === 6 ? "四关走完，进入「能不能干」" : "立项申请 ＝《项目建议书》"}
            </div>
          </div>
        </>
      ) : null}
    </SceneShell>
  );
};
