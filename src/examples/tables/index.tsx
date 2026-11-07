import React from "react";
import { Composition, registerRoot } from "remotion";
import { TABLE_EXAMPLE_COMPOSITIONS } from "./compositions";

const Root: React.FC = () => <>
  {TABLE_EXAMPLE_COMPOSITIONS.map((spec) => <Composition key={spec.id} {...spec} />)}
</>;
registerRoot(Root);
