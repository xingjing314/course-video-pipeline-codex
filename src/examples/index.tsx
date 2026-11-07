import React from "react";
import { Composition, registerRoot } from "remotion";
import type { CompositionSpec } from "../visual/composition-types";
import { QUIZ_EXAMPLE_COMPOSITIONS } from "./quiz/compositions";
import { TABLE_EXAMPLE_COMPOSITIONS } from "./tables/compositions";

/** 默认公共 Studio。只含独立示例，不导入课程或 workspaces。 */
export const PUBLIC_EXAMPLE_COMPOSITIONS = [
  ...QUIZ_EXAMPLE_COMPOSITIONS,
  ...TABLE_EXAMPLE_COMPOSITIONS,
] as CompositionSpec[];

const Root: React.FC = () => (
  <>
    {PUBLIC_EXAMPLE_COMPOSITIONS.map((spec) => (
      <Composition key={spec.id} {...spec} />
    ))}
  </>
);

registerRoot(Root);
