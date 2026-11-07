import { Table67Example } from "./Table67Example";
import { L01TableExample } from "./L01TableExample";

// 沿用原有 ID、时长及画幅；总 Studio 与独立入口共用。
const format = { fps: 30, width: 1920, height: 1080 };
export const TABLE_EXAMPLE_COMPOSITIONS = [
  { id: "Table67Example", component: Table67Example, durationInFrames: 1980, ...format },
  { id: "L01TableExample", component: L01TableExample, durationInFrames: 840, ...format },
];
