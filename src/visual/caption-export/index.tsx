import React from "react";
import { Composition, registerRoot } from "remotion";
import { CaptionStill } from "./CaptionStill";

// 独立入口只打包公共字幕，不加载任何课程、音频或教学场景。
const CaptionExportRoot: React.FC = () => (
  <Composition id="CaptionStill" component={CaptionStill} durationInFrames={1}
    fps={30} width={1920} height={1080} defaultProps={{ text: "" }} />
);

registerRoot(CaptionExportRoot);
