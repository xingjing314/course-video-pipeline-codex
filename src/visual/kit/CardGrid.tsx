/**
 * CardGrid · 等宽卡片组。
 *
 * 提炼自 A3 四笔账的四格面板、A9 的四张口诀卡、A4 的三步卡——
 * 这三处都在重复"定宽卡 + tone 描边 + 标题/说明 + 逐张入场"。
 *
 * 只负责布局与视觉，不负责内容语义：文案由调用方给。
 */
import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BASE_COLORS, resolveTone, rgba } from "../tokens/colorCard";

export type CardItem = {
  /** 卡片主标题 */
  name: string;
  /** 次行说明 */
  line?: string;
  /** 语义色，默认 cyan */
  tone?: string;
  /** 右上角小签（可选） */
  tag?: string;
};

export type CardGridProps = {
  items: CardItem[];
  left: number;
  top: number;
  /** 列数，默认 2 */
  columns?: number;
  cardWidth?: number;
  cardHeight?: number;
  gap?: number;
  /** 整体入场进度 0–1；缺省 1（无入场） */
  enter?: number;
  /** 逐张错峰入场（每张间隔 6 帧）；与 enter 二选一，默认关闭 */
  stagger?: boolean;
  /**
   * 逐步点亮状态（配合 useStepper）：past 保持常态、current 加强、future 压暗。
   * 不给时行为与历史版本完全一致。
   */
  states?: ("past" | "current" | "future")[];
};

const CARD_BG = "rgba(8, 19, 41, 0.82)";

export const CardGrid: React.FC<CardGridProps> = ({
  items,
  left,
  top,
  columns = 2,
  cardWidth = 540,
  cardHeight = 210,
  gap = 140,
  enter = 1,
  stagger = false,
  states,
}) => {
  const width = columns * cardWidth + (columns - 1) * gap;
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width,
        display: "flex",
        flexWrap: "wrap",
        gap,
      }}
    >
      {items.map((it, index) => {
        const tone = resolveTone(it.tone ?? "cyan");
        const state = states?.[index];
        const active = state === "current";
        const future = state === "future";
        if (stagger)
          return <StaggeredCard key={it.name} item={it} index={index} width={cardWidth} height={cardHeight} state={state} />;
        return (
          <div
            key={it.name}
            style={{
              position: "relative",
              width: cardWidth,
              height: cardHeight,
              borderRadius: 16,
              background: active ? rgba(tone.rgb, 0.16) : CARD_BG,
              border: `1.5px solid ${rgba(tone.rgb, active ? 0.95 : future ? 0.3 : 0.55)}`,
              boxShadow: active ? `0 0 32px ${rgba(tone.rgb, 0.38)}` : `0 0 28px ${rgba(tone.rgb, 0.16)}`,
              padding: "26px 30px",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              opacity: enter * (future ? 0.52 : 1),
              transform: active ? "scale(1.02)" : undefined,
            }}
          >
            {it.tag ? (
              <div
                style={{
                  position: "absolute",
                  right: 18,
                  top: 16,
                  padding: "4px 10px",
                  borderRadius: 6,
                  border: `1px solid ${rgba(tone.rgb, 0.8)}`,
                  color: tone.hex,
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: 1,
                }}
              >
                {it.tag}
              </div>
            ) : null}
            <div style={{ fontSize: 34, fontWeight: 800, color: tone.hex }}>{it.name}</div>
            {it.line ? (
              <div style={{ marginTop: 14, fontSize: 26, color: BASE_COLORS.text }}>{it.line}</div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};


/** 逐张入场：与 CardGrid 共享同一套卡片样式，只是把 opacity 换成按序号延迟的 spring。 */
const StaggeredCard: React.FC<{
  item: CardItem;
  index: number;
  width: number;
  height: number;
  state?: "past" | "current" | "future";
}> = ({ item, index, width, height, state }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tone = resolveTone(item.tone ?? "cyan");
  const progress = spring({ frame: frame - index * 6, fps, config: { damping: 200, stiffness: 110 } });
  const active = state === "current";
  const future = state === "future";
  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        borderRadius: 16,
        background: active ? rgba(tone.rgb, 0.16) : CARD_BG,
        border: `1.5px solid ${rgba(tone.rgb, active ? 0.95 : future ? 0.3 : 0.55)}`,
        boxShadow: active ? `0 0 32px ${rgba(tone.rgb, 0.38)}` : `0 0 28px ${rgba(tone.rgb, 0.16)}`,
        padding: "26px 30px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        opacity: progress * (future ? 0.52 : 1),
        transform: `translateY(${(1 - progress) * 12}px)`,
      }}
    >
      {item.tag ? (
        <div
          style={{
            position: "absolute",
            right: 18,
            top: 16,
            padding: "4px 10px",
            borderRadius: 6,
            border: `1px solid ${rgba(tone.rgb, 0.8)}`,
            color: tone.hex,
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          {item.tag}
        </div>
      ) : null}
      <div style={{ fontSize: 34, fontWeight: 800, color: tone.hex }}>{item.name}</div>
      {item.line ? (
        <div style={{ marginTop: 14, fontSize: 26, color: BASE_COLORS.text }}>{item.line}</div>
      ) : null}
    </div>
  );
};
