import type { CompositionSpec } from "../../../visual/composition-types";
import { groupPreviewSpecs } from "../../../pipeline/resolve-full-lesson-groups";
import { Test01L01G01 } from "./G01";
import raw from "../../../../workspaces/test01/g01/preview-data.json";
import type { G01Preview } from "./g01-timing";
import { Test01L01G02 } from "./G02";
import rawG02 from "../../../../workspaces/test01/g02/preview-data.json";
import type { G02Preview } from "./g02-timing";
import { G03_DURATION_FRAMES, Test01L01G03 } from "./G03";
import { G04_DURATION_FRAMES, Test01L01G04 } from "./G04";

const preview = raw as G01Preview | null;
const g02 = rawG02 as G02Preview | null;

const spec = (id: string, component: CompositionSpec["component"], data: { timeline: { totalDurationMs: number } }) => ({
  id,
  component,
  durationInFrames: Math.ceil((data.timeline.totalDurationMs * 30) / 1000),
  fps: 30,
  width: 1920,
  height: 1080,
  defaultProps: data,
});

export const TEST01_L01_GROUP_COMPOSITIONS: CompositionSpec[] = [
  ...groupPreviewSpecs(preview, (data) => spec("Test01L01G01", Test01L01G01, data)),
  ...groupPreviewSpecs(g02, (data) => spec("Test01L01G02", Test01L01G02, data)),
  {
    id: "Test01L01G03",
    component: Test01L01G03,
    durationInFrames: G03_DURATION_FRAMES,
    fps: 30,
    width: 1920,
    height: 1080,
  },
  {
    id: "Test01L01G04",
    component: Test01L01G04,
    durationInFrames: G04_DURATION_FRAMES,
    fps: 30,
    width: 1920,
    height: 1080,
  },
];
