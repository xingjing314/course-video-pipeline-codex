/**
 * Remotion Studio 与渲染入口。
 *
 * 这里**不再手写任何 composition**：全部来自 `./compositions` 的注册表。
 * 加一节课 = 在 `src/lessons/<chapter>/` 里导出成片，`Root` 保持不动。
 */
import React from "react";
import { Composition } from "remotion";
import { COMPOSITIONS } from "./compositions";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {COMPOSITIONS.map((spec) => (
        <Composition key={spec.id} {...spec} />
      ))}
    </>
  );
};
