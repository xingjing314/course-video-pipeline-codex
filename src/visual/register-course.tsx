import React from "react";
import { Composition } from "remotion";
import type { CompositionSpec } from "./composition-types";

/**
 * 单课根组件。入口文件必须自己调用 registerRoot，
 * Remotion CLI 只检查入口文件文本里有没有 registerRoot。
 */
export const courseRoot = (specs: CompositionSpec[]): React.FC => {
  const Root: React.FC = () => (
    <>
      {specs.map((spec) => (
        <Composition key={spec.id} {...spec} />
      ))}
    </>
  );
  return Root;
};
