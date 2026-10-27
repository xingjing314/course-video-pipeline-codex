/**
 * 顶部常驻课程与分镜导航条（HeaderBreadcrumb）。
 *
 * 属于教学文字结构的一部分，在有声版与无声纯净版中均保持一致显示，
 * 为全课提供统一的“章节锚点 + 当前分镜进度”视觉秩序。
 */
import React from "react";
import { BASE_COLORS, resolveTone, rgba } from "../tokens/colorCard";

export const HeaderBreadcrumb: React.FC<{
  lessonId: string;
  lessonTitle: string;
  sceneId: string;
  sceneOrder: number;
  totalScenes: number;
  segmentTitle: string;
}> = ({ lessonId, lessonTitle, sceneId, sceneOrder, totalScenes, segmentTitle }) => {
  const shortLessonTitle = lessonTitle.replace(/（讲师口播与画面分镜合一稿.*?）/, "").trim();
  const cyan = resolveTone("cyan");
  const gold = resolveTone("gold");

  return (
    <div
      style={{
        position: "absolute",
        top: 14,
        left: 96,
        right: 96,
        height: 32,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        pointerEvents: "none",
        zIndex: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span
          style={{
            padding: "2px 10px",
            borderRadius: 6,
            background: rgba(cyan.rgb, 0.16),
            border: `1px solid ${rgba(cyan.rgb, 0.45)}`,
            color: cyan.hex,
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          {lessonId.toUpperCase()}
        </span>
        <span style={{ fontSize: 15, color: BASE_COLORS.text2, fontWeight: 500 }}>{shortLessonTitle}</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 14, color: BASE_COLORS.text2 }}>{segmentTitle}</span>
        <span
          style={{
            padding: "2px 10px",
            borderRadius: 999,
            background: rgba(gold.rgb, 0.18),
            border: `1px solid ${rgba(gold.rgb, 0.5)}`,
            color: gold.hex,
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          {sceneId} · {sceneOrder}/{totalScenes}
        </span>
      </div>
    </div>
  );
};
