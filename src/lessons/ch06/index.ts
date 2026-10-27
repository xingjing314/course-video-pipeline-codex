/** 第六章入口汇总。新课在自己的 Lxx/index.ts 声明入口，再在此接入。 */
import type { CompositionSpec } from "../composition-types";
import { CH06_L01_COMPOSITIONS } from "./L01";

export const CH06_COMPOSITIONS: CompositionSpec[] = [...CH06_L01_COMPOSITIONS];
