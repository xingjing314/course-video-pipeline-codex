/** L03 预览片（配音前）：按估算镜表排入全部 30 个段，用于评审画面与倒计时。 */
import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { L03Span } from "../../lessons/ch07/l03-spans";
import { L03_SPANS } from "../../lessons/ch07/l03-spans";
import { SPAN_TABLE } from "../../lessons/ch07/l03-span-timeline";
import { L03_TOTAL_FRAMES } from "../../lessons/ch07/l03-shot-table";
import { TechNetwork } from "../backgrounds/tech-network/TechNetwork";
import { techNetworkSchema } from "../backgrounds/tech-network/schema";

const BG = techNetworkSchema.parse({ type: "tech-network" });

export const L03Preview: React.FC = () => (
  <AbsoluteFill style={{ background: "#0B1A33" }}>
    <TechNetwork {...BG} />
    {SPAN_TABLE.filter((s) => L03_SPANS[s.key]).map((s) => (
      <Sequence key={s.key} from={s.from} durationInFrames={s.duration} name={s.key}>
        <L03Span payload={{ span: s.key, offset: s.from }} />
      </Sequence>
    ))}
  </AbsoluteFill>
);

export { L03_TOTAL_FRAMES };
