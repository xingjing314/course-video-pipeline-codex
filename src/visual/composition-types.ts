/** 课时入口声明类型；不依赖任何具体章节或公共注册表。 */
import type React from "react";
import type { CalculateMetadataFunction } from "remotion";

export type CompositionSpec = {
  id: string;
  component: React.FC<any>;
  durationInFrames: number;
  fps: number;
  width: number;
  height: number;
  defaultProps?: Record<string, unknown>;
  calculateMetadata?: CalculateMetadataFunction<any>;
};
