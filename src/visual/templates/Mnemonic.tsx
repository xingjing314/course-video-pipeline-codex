/**
 * A9 · 「一必要、两市场、一条件」四件套口诀卡 · 原型 v0.1
 *
 * 对应分镜 S26–S28。本版**不做逐字描金**：口诀整句入场 + 一次扫光，
 * 之后 4 张卡按口播节拍逐张点亮，每卡自带"属于哪一句"的金色小签，
 * 把「三句口诀 ↔ 四项内容」的映射关系直接钉在卡上。
 *
 * 背景使用项目既有 TechNetwork（与 MasterCanvas 一致），不再手绘底色。
 */
import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BASE_COLORS, resolveTone, rgba } from "../tokens/colorCard";
import { SceneShell } from "./shared";
import { TechNetwork } from "../backgrounds/tech-network/TechNetwork";
import { techNetworkSchema } from "../backgrounds/tech-network/schema";

const CYAN = resolveTone("cyan");
const GOLD = resolveTone("gold");
const GREEN = resolveTone("green");
const NEUTRAL = resolveTone("neutral");

const BG = techNetworkSchema.parse({ type: "tech-network" });

const ease = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

export const A9_STAGES = [
  { key: "intro", label: "口诀入场", dur: 100 },
  { key: "c1", label: "① 必要性", dur: 120 },
  { key: "c2", label: "② 市场预测", dur: 120 },
  { key: "c3", label: "③ 成果市场", dur: 120 },
  { key: "c4", label: "④ 必需条件", dur: 120 },
] as const;

const PHRASES = ["一必要", "两市场", "一条件"] as const;

const CARDS = [
  {
    id: "①",
    phrase: 0,
    name: "项目的必要性",
    plain: "向上级主管部门说明：\n为什么非干不可",
    accent: "为什么干",
  },
  {
    id: "②",
    phrase: 1,
    name: "项目的市场预测",
    plain: "这个项目本身，有没有市场需求",
    accent: "项目本身",
  },
  {
    id: "③",
    phrase: 1,
    name: "预期成果的市场预测",
    plain: "做出来的产品或服务\n市场前途怎么样",
    accent: "成果本身",
  },
  {
    id: "④",
    phrase: 2,
    name: "项目建设必需的条件",
    plain: "干成这件事，得具备哪些基本条件",
    accent: "干成它",
  },
] as const;

const CARD_W = 372;
const CARD_GAP = 26;
const CARD_START = (1920 - (CARD_W * 4 + CARD_GAP * 3)) / 2;
const CARD_TOP = 452;
const CARD_H = 336;

const CHIP_W = 262;
const CHIP_GAP = 64;
const CHIP_START = (1920 - (CHIP_W * 3 + CHIP_GAP * 2)) / 2;

export type MnemonicProps = {
  stage: number;
  f: number;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
};

export const MnemonicCard: React.FC<MnemonicProps> = ({
  stage,
  f,
  eyebrow = "7.1.2 项目建议书内容",
  title = "项目建议书的核心内容：三句口诀，四项内容",
  subtitle = "连考 3 次：23下1批T27 ｜ 23下4批T21 ｜ 24上2批T18",
}) => {
  const { fps } = useVideoConfig();
  const s = Math.max(0, Math.min(A9_STAGES.length - 1, stage));

  const intro = s === 0 ? ease((f - 10) / 22) : 1;
  // 口诀整句只做一次扫光（不是逐字）
  const sweep = s === 0 ? ease((f - 46) / 30) : 1;

  const litCards = Math.max(0, s); // 0..4
  const activePhrase = litCards === 0 ? -1 : CARDS[Math.min(litCards, 4) - 1].phrase;

  return (
    <SceneShell eyebrow={eyebrow} title={title} subtitle={subtitle}>
      {/* 口诀带 */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 236, height: 110 }}>
        {PHRASES.map((p, i) => {
          const d = 12 + i * 6;
          const enter =
            s > 0 ? 1 : spring({ frame: f - d, fps, config: { damping: 18, mass: 0.8, stiffness: 120 } });
          const isActive = activePhrase === i;
          return (
            <div
              key={p}
              style={{
                position: "absolute",
                left: CHIP_START + i * (CHIP_W + CHIP_GAP),
                top: (1 - enter) * 16,
                width: CHIP_W,
                height: 84,
                borderRadius: 12,
                border: `2px solid ${rgba(isActive ? GOLD.rgb : CYAN.rgb, isActive ? 0.95 : 0.45)}`,
                background: isActive ? rgba(GOLD.rgb, 0.16) : "rgba(8,19,41,0.72)",
                boxShadow: isActive ? `0 0 34px ${rgba(GOLD.rgb, 0.4)}` : undefined,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                fontWeight: 800,
                letterSpacing: 6,
                color: isActive ? GOLD.hex : BASE_COLORS.text,
                opacity: enter,
                transform: `scale(${isActive ? 1.04 : 1})`,
              }}
            >
              {p}
            </div>
          );
        })}

        {/* 一次扫光：覆盖整条口诀，从左到右 0.9 秒，不逐字 */}
        <div
          style={{
            position: "absolute",
            left: CHIP_START - 20,
            top: 84,
            width: (CHIP_W * 3 + CHIP_GAP * 2 + 40) * sweep,
            height: 3,
            borderRadius: 2,
            background: `linear-gradient(90deg, ${rgba(GOLD.rgb, 0)}, ${GOLD.hex})`,
            opacity: 0.9,
          }}
        />
      </div>

      {/* 四张卡 */}
      {CARDS.map((c, i) => {
        const on = i < litCards;
        const enter = !on
          ? 0
          : i === litCards - 1
            ? spring({ frame: f - 8, fps, config: { damping: 18, mass: 0.85, stiffness: 120 } })
            : 1;
        const isLast = i === litCards - 1;

        return (
          <div
            key={c.id}
            style={{
              position: "absolute",
              left: CARD_START + i * (CARD_W + CARD_GAP),
              top: CARD_TOP + (1 - Math.min(1, enter)) * 18,
              width: CARD_W,
              height: CARD_H,
              borderRadius: 16,
              background: on ? "rgba(9, 22, 46, 0.86)" : "rgba(8, 18, 36, 0.4)",
              border: `1.5px solid ${rgba(isLast ? GOLD.rgb : CYAN.rgb, on ? (isLast ? 0.85 : 0.5) : 0.16)}`,
              boxShadow: isLast ? `0 0 40px ${rgba(GOLD.rgb, 0.28)}` : undefined,
              opacity: on ? Math.min(1, enter) : 0.35,
              padding: "26px 24px",
              boxSizing: "border-box",
            }}
          >
            {/* 归属口诀小签 */}
            <div
              style={{
                position: "absolute",
                right: 18,
                top: 16,
                padding: "4px 10px",
                borderRadius: 6,
                border: `1px solid ${rgba(GOLD.rgb, on ? 0.8 : 0.25)}`,
                color: on ? GOLD.hex : rgba(GOLD.rgb, 0.4),
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: 1,
              }}
            >
              {PHRASES[c.phrase]}
            </div>

            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                border: `2px solid ${rgba(on ? GOLD.rgb : CYAN.rgb, on ? 0.9 : 0.3)}`,
                background: on ? rgba(GOLD.rgb, 0.14) : "transparent",
                color: on ? GOLD.hex : BASE_COLORS.text2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 34,
                fontWeight: 800,
                marginBottom: 18,
              }}
            >
              {c.id}
            </div>

            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: on ? BASE_COLORS.text : BASE_COLORS.text2,
                lineHeight: 1.3,
                minHeight: 74,
              }}
            >
              {c.name}
            </div>

            <div
              style={{
                marginTop: 10,
                paddingTop: 14,
                borderTop: `1px solid ${rgba(CYAN.rgb, on ? 0.22 : 0.1)}`,
                fontSize: 20,
                lineHeight: 1.45,
                whiteSpace: "pre-line",
                color: on ? BASE_COLORS.text2 : rgba(NEUTRAL.rgb, 0.5),
              }}
            >
              {c.plain}
            </div>

            <div
              style={{
                marginTop: 12,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: 17,
                color: on ? GREEN.hex : rgba(GREEN.rgb, 0.35),
                fontWeight: 700,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: 3, background: "currentColor" }} />
              {c.accent}
            </div>
          </div>
        );
      })}

      {/* 底部口径条 */}
      <div
        style={{
          position: "absolute",
          left: 96,
          right: 96,
          top: 836,
          padding: "16px 26px",
          borderRadius: 12,
          background: "rgba(9, 22, 46, 0.82)",
          border: `1.5px solid ${rgba(CYAN.rgb, 0.35)}`,
          display: "flex",
          alignItems: "center",
          gap: 24,
          opacity: Math.min(1, s / 2),
        }}
      >
        <div style={{ fontSize: 20, color: BASE_COLORS.text, fontWeight: 700 }}>
          打立项申请时可研还没开始 → 「不包括」题里凡出现可研的东西，一律排除
        </div>
        <div style={{ fontSize: 18, color: BASE_COLORS.text2 }}>
          23下1批T27 ｜ 23下4批T21 ｜ 24上2批T18
        </div>
      </div>
    </SceneShell>
  );
};
