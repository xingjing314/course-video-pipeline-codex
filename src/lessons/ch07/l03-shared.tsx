/** L03 组件共用的小零件（与 l03-extra 内的同名组件保持一致）。 */
import React from "react";
import { BASE_COLORS, resolveTone, rgba } from "../../visual/tokens/colorCard";

const CYAN = resolveTone("cyan");

export const Chip: React.FC<{ text: string; tone?: { rgb: [number, number, number]; hex: string }; dim?: boolean }> = ({
  text,
  tone = CYAN,
  dim = false,
}) => (
  <div
    style={{
      padding: "10px 18px",
      borderRadius: 10,
      border: `1.5px solid ${rgba(tone.rgb, dim ? 0.25 : 0.55)}`,
      background: rgba(tone.rgb, dim ? 0.05 : 0.12),
      color: dim ? BASE_COLORS.text2 : BASE_COLORS.text,
      fontSize: 22,
      whiteSpace: "nowrap",
    }}
  >
    {text}
  </div>
);
