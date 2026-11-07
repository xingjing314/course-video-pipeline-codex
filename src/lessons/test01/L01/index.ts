import type { CompositionSpec } from "../../../visual/composition-types";
import assembly from "../../../../workspaces/test01/full/assembly.json";
import { Test01L01Full } from "./FullLesson";
import { TEST01_L01_GROUP_COMPOSITIONS } from "./groups";

const format = { fps: 30, width: 1920, height: 1080, durationInFrames: assembly.durationInFrames };

export const TEST01_L01_COMPOSITIONS: CompositionSpec[] = [
  ...TEST01_L01_GROUP_COMPOSITIONS,
  { id: "Test01L01Full", component: Test01L01Full, ...format, defaultProps: { silentClean: false } },
  { id: "Test01L01FullSilentClean", component: Test01L01Full, ...format, defaultProps: { silentClean: true } },
];
