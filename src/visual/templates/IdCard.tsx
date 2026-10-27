/**
 * A8 · 《项目建议书》身份证卡（IdCard）状态机原型 v0.1
 *
 * 对应分镜 S19–S21：一张卡、三行身份信息，逐行点亮。
 *   ① 谁写给谁：项目建设单位（甲方）→ 上级主管部门；排除乙方 / 国家监管部门
 *   ② 什么深度：初始阶段 · 框架性总体设想（配深度刻度尺，标出"还没到实施计划方案"）
 *   ③ 什么作用：对上「选择项目的依据」／对下「可行性研究的依据」，附外资特批节点
 *
 * 先立卡、再逐行填字——未点亮的行只留编号与栏名，制造"待填"的悬念，
 * 也保证讲师每讲一条，画面才多一条，不抢话。
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

const ease = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

export const A8_STAGES = [
  { key: "row1", label: "谁写给谁", dur: 270 },
  { key: "row2", label: "什么深度", dur: 270 },
  { key: "row3", label: "什么作用", dur: 270 },
] as const;

const CARD = { left: 120, top: 212, width: 1680, height: 760 } as const;
const COL = { x: 330, width: 1290 } as const; // 内容区（卡片内右栏）

type RowProps = {
  index: number;
  label: string;
  active: boolean;
  done: boolean;
  enter: number;
  children?: React.ReactNode;
};

const Row: React.FC<RowProps> = ({ index, label, active, done, enter, children }) => {
  const top = 96 + index * 216;
  const dim = active ? 1 : done ? 0.62 : 0.3;
  return (
    <>
      {/* 行分隔线 */}
      {index > 0 ? <div
        style={{
          position: "absolute",
          left: 40,
          top: top - 26,
          width: CARD.width - 80,
          height: 1,
          background: "rgba(143,184,217,0.14)",
        }}
      /> : null}
      {/* 编号 + 栏名 */}
      <div
        style={{
          position: "absolute",
          left: 60,
          top: top + 8,
          display: "flex",
          alignItems: "center",
          gap: 16,
          opacity: dim,
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            border: `2px solid ${rgba(active ? GOLD.rgb : CYAN.rgb, active ? 0.95 : 0.45)}`,
            background: active ? rgba(GOLD.rgb, 0.16) : "transparent",
            color: active ? GOLD.hex : BASE_COLORS.text2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
            fontWeight: 800,
          }}
        >
          {index + 1}
        </div>
        <div
          style={{
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: 2,
            color: active ? BASE_COLORS.text : BASE_COLORS.text2,
            width: 160,
          }}
        >
          {label}
        </div>
      </div>
      {/* 内容区：已填的行保留（身份证是累积的） */}
      {active || done ? (
        <div
          style={{
            position: "absolute",
            left: COL.x,
            top: top,
            width: COL.width,
            opacity: (active ? 1 : 0.55) * enter,
          }}
        >
          {children}
        </div>
      ) : null}
    </>
  );
};

export type IdCardProps = {
  stage: number;
  f?: number;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
};

export const IdCard: React.FC<IdCardProps> = ({
  stage,
  f,
  eyebrow = "7.1.1 立项申请概念",
  title = "《项目建议书》＝ 立项申请的身份证",
  subtitle = "三条身份信息，考试只考这三条",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = f ?? frame;

  const s = Math.max(0, Math.min(A8_STAGES.length - 1, stage));
  const enter = s === 0 ? ease((local - 12) / 20) : 1;

  const cardIn = spring({ frame: local - 4, fps, config: { damping: 20, mass: 0.8, stiffness: 110 } });

  // ② 刻度尺的推进
  const ruler = s > 1 ? 1 : s === 1 ? ease((local - 70) / 40) : 0;
  // ③ 的"附"角标
  const appendix = s > 2 ? 1 : s === 2 ? ease((local - 130) / 30) : 0;

  return (
    <SceneShell eyebrow={eyebrow} title={title} subtitle={subtitle}>
      {/* 卡片本体 */}
      <div
        style={{
          position: "absolute",
          left: CARD.left,
          top: CARD.top,
          width: CARD.width,
          height: CARD.height,
          borderRadius: 20,
          background: "rgba(8, 19, 41, 0.88)",
          border: `1.5px solid ${rgba(CYAN.rgb, 0.3)}`,
          boxShadow: "0 10px 40px rgba(0,0,0,0.35)",
          transform: `translateY(${(1 - cardIn) * 20}px)`,
          opacity: cardIn,
        }}
      >
        {/* 卡头 */}
        <div
          style={{
            height: 74,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 40px",
            borderBottom: `1px solid ${rgba(CYAN.rgb, 0.22)}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: GOLD.hex }} />
            <div style={{ fontSize: 24, fontWeight: 700, color: BASE_COLORS.text, letterSpacing: 1 }}>
              建议书 · 身份档案
            </div>
          </div>
          <div style={{ fontSize: 19, color: BASE_COLORS.text2, letterSpacing: 1 }}>教材 7.1.1 ｜ 项目发展周期的初始阶段</div>
        </div>

        <Row index={0} label="谁写给谁" active={s === 0} done={s > 0} enter={enter}>
          {/* 提交方向 */}
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <div
              style={{
                width: 330,
                padding: "16px 20px",
                borderRadius: 12,
                border: `1.5px solid ${rgba(CYAN.rgb, 0.6)}`,
                background: rgba(CYAN.rgb, 0.1),
              }}
            >
              <div style={{ fontSize: 18, color: BASE_COLORS.text2, marginBottom: 4 }}>提交方（甲方）</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: BASE_COLORS.text }}>项目建设单位</div>
              <div style={{ fontSize: 17, color: BASE_COLORS.text2, marginTop: 2 }}>＝ 筹建单位</div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 90, height: 2, background: rgba(CYAN.rgb, 0.7) }} />
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderTop: "7px solid transparent",
                  borderBottom: "7px solid transparent",
                  borderLeft: `14px solid ${rgba(CYAN.rgb, 0.85)}`,
                }}
              />
            </div>

            <div
              style={{
                width: 330,
                padding: "16px 20px",
                borderRadius: 12,
                border: `1.5px solid ${GOLD.hex}`,
                background: rgba(GOLD.rgb, 0.12),
              }}
            >
              <div style={{ fontSize: 18, color: BASE_COLORS.text2, marginBottom: 4 }}>接收方（唯一正确）</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: GOLD.hex }}>上级主管部门</div>
              <div style={{ fontSize: 17, color: BASE_COLORS.text2, marginTop: 2 }}>选择项目 / 批复建议书</div>
            </div>
          </div>

          {/* 两个必排除项 */}
          <div style={{ display: "flex", gap: 16, marginTop: 18 }}>
            {["乙方承建单位（承建方无权申请）", "国家监管部门（不是监管报批）"].map((t) => (
              <div
                key={t}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: `1.5px solid ${rgba(RED.rgb, 0.7)}`,
                  background: rgba(RED.rgb, 0.1),
                  color: "#FCA5A5",
                  fontSize: 19,
                  fontWeight: 600,
                }}
              >
                ✕ {t}
              </div>
            ))}
          </div>
        </Row>

        <Row index={1} label="什么深度" active={s === 1} done={s > 1} enter={1}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
            <div style={{ fontSize: 34, fontWeight: 800, color: GOLD.hex }}>框架性总体设想</div>
            <div style={{ fontSize: 22, color: BASE_COLORS.text2 }}>初始阶段 · 不是实施计划，更不是方案</div>
          </div>

          {/* 深度刻度尺 */}
          <div style={{ position: "relative", width: 1120, height: 96, marginTop: 26 }}>
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 40,
                width: 1120,
                height: 2,
                background: "rgba(143,184,217,0.28)",
              }}
            />
            {/* 已到达段 */}
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 40,
                width: 1120 * 0.42 * ruler,
                height: 2,
                background: GOLD.hex,
              }}
            />
            {/* 断层 */}
            <div
              style={{
                position: "absolute",
                left: 1120 * 0.42,
                top: 16,
                height: 52,
                width: 0,
                borderLeft: `2px dashed ${rgba(RED.rgb, 0.9)}`,
                opacity: ruler,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 1120 * 0.42 + 12,
                top: 18,
                fontSize: 18,
                color: RED.hex,
                fontWeight: 700,
                opacity: ruler,
              }}
            >
              ✕ 还没到这一步
            </div>

            {[
              { p: 0.06, label: "框架性总体设想", tone: GOLD, active: true },
              { p: 0.6, label: "可行性研究", tone: NEUTRAL },
              { p: 0.94, label: "实施计划和方案", tone: NEUTRAL },
            ].map((m) => (
              <React.Fragment key={m.label}>
                <div
                  style={{
                    position: "absolute",
                    left: 1120 * m.p - 9,
                    top: 31,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: m.active ? m.tone.hex : "rgba(143,184,217,0.35)",
                    border: m.active ? `3px solid ${rgba(m.tone.rgb, 0.5)}` : "none",
                    boxShadow: m.active ? `0 0 18px ${rgba(m.tone.rgb, 0.6)}` : undefined,
                    opacity: m.active ? 1 : ruler,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: 1120 * m.p - 90,
                    top: 60,
                    width: 180,
                    textAlign: "center",
                    fontSize: 19,
                    fontWeight: m.active ? 700 : 500,
                    color: m.active ? GOLD.hex : BASE_COLORS.text2,
                    opacity: m.active ? 1 : ruler,
                  }}
                >
                  {m.label}
                </div>
              </React.Fragment>
            ))}
          </div>
        </Row>

        <Row index={2} label="什么作用" active={s === 2} done={false} enter={ease(local / 18)}>
          <div style={{ display: "flex", gap: 24 }}>
            <div
              style={{
                width: 560,
                padding: "16px 22px",
                borderRadius: 12,
                border: `1.5px solid ${rgba(CYAN.rgb, 0.55)}`,
                background: rgba(CYAN.rgb, 0.08),
              }}
            >
              <div style={{ fontSize: 26, fontWeight: 700, color: BASE_COLORS.text }}>↑ 选择项目的依据</div>
              <div style={{ fontSize: 19, color: BASE_COLORS.text2, marginTop: 6 }}>
                国家 / 上级主管部门据此决定"给不给这个项目"
              </div>
            </div>

            <div
              style={{
                width: 560,
                padding: "16px 22px",
                borderRadius: 12,
                border: `1.5px solid ${rgba(GREEN.rgb, 0.55)}`,
                background: rgba(GREEN.rgb, 0.08),
              }}
            >
              <div style={{ fontSize: 26, fontWeight: 700, color: BASE_COLORS.text }}>↓ 可行性研究的依据</div>
              <div style={{ fontSize: 19, color: BASE_COLORS.text2, marginTop: 6 }}>
                建议书获批 → 才进入 7.2 项目可行性研究
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 20,
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 18px",
              borderRadius: 10,
              border: `1px dashed ${rgba(NEUTRAL.rgb, 0.55)}`,
              opacity: appendix,
            }}
          >
            <div
              style={{
                fontSize: 16,
                color: BASE_COLORS.text2,
                border: `1px solid ${rgba(NEUTRAL.rgb, 0.5)}`,
                borderRadius: 4,
                padding: "2px 8px",
              }}
            >
              附
            </div>
            <div style={{ fontSize: 20, color: BASE_COLORS.text }}>
              涉及利用外资的项目：<span style={{ color: GOLD.hex, fontWeight: 700 }}>建议书获批后</span>，方可开展后续工作
            </div>
          </div>
        </Row>
      </div>
    </SceneShell>
  );
};
