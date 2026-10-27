/**
 * 原子图形注册表：primitive id -> 组件。组件均为纯 `<g>` 图元，
 * 由调用方提供外层 svg 画布；同屏多实例通过 React.useId() 隔离 SVG id。
 */
import React from "react";
import { Rect01 } from "./codex-version/_01Rect";
import { RoundedRect02 } from "./codex-version/_02RoundedRect";
import { Capsule03 } from "./codex-version/_03Capsule";
import { ConcentricCircles04 } from "./codex-version/_04ConcentricCircles";
import { HollowCircle04 } from "./codex-version/_04HollowCircle";
import { SolidCircle04 } from "./codex-version/_04SolidCircle";
import { Ellipse05 } from "./codex-version/_05Ellipse";
import { DashDot06 } from "./codex-version/_06DashDot";
import { Polyline06 } from "./codex-version/_06Polyline";
import { StraightLine06 } from "./codex-version/_06StraightLine";
import { OneWayArrow07 } from "./codex-version/_07OneWayArrow";
import { TwoWayArrow07 } from "./codex-version/_07TwoWayArrow";
import { CurveConnector08 } from "./codex-version/_08CurveConnector";
import { CurveBand09 } from "./codex-version/_09CurveBand";
import { IrregularRegion10 } from "./codex-version/_10IrregularRegion";
import { Trapezoid11 } from "./codex-version/_11Trapezoid";
import { StorageCylinder12 } from "./codex-version/_12StorageCylinder";
import { Cloud13 } from "./codex-version/_13Cloud";
import { Rhombus14 } from "./codex-version/_14Rhombus";
import { Parallelogram15 } from "./codex-version/_15Parallelogram";
import { Triangle16 } from "./codex-version/_16Triangle";
import { Hexagon17 } from "./codex-version/_17Hexagon";
import { Octagon17 } from "./codex-version/_17Octagon";
import { Pentagon17 } from "./codex-version/_17Pentagon";
import { Sector18 } from "./codex-version/_18Sector";
import { Semicircle18 } from "./codex-version/_18Semicircle";
import { Arc19 } from "./codex-version/_19Arc";
import { AnnularSector20 } from "./codex-version/_20AnnularSector";
import { Ring20 } from "./codex-version/_20Ring";
import { CalloutBubble21 } from "./codex-version/_21CalloutBubble";
import { CurlyBrace22 } from "./codex-version/_22CurlyBrace";
import { RoundBracket22 } from "./codex-version/_22RoundBracket";
import { SquareBracket22 } from "./codex-version/_22SquareBracket";
import { Star23 } from "./codex-version/_23Star";
import { Cross24 } from "./codex-version/_24Cross";
import { Plus24 } from "./codex-version/_24Plus";
import { RectCross24 } from "./codex-version/_24RectCross";
import { RectPlus24 } from "./codex-version/_24RectPlus";
import { Document25 } from "./codex-version/_25Document";
import { Check26 } from "./codex-version/_26Check";
import { RectCheck26 } from "./codex-version/_26RectCheck";
import { RowSelection28 } from "./codex-version/_28RowSelection";

/** 组件 props 的受控擦除点：每个 primitive 的 config 由其契约 Schema 校验后才到达这里。 */
export type PrimitiveComponent = React.ComponentType<{ config: never; localFrame: number }>;

const asPrimitive = (component: unknown): PrimitiveComponent => component as PrimitiveComponent;

export const PRIMITIVE_COMPONENTS: Record<string, PrimitiveComponent> = {
  "01-rect": asPrimitive(Rect01),
  "02-rounded-rect": asPrimitive(RoundedRect02),
  "03-capsule": asPrimitive(Capsule03),
  "04-solid-circle": asPrimitive(SolidCircle04),
  "04-hollow-circle": asPrimitive(HollowCircle04),
  "04-concentric-circles": asPrimitive(ConcentricCircles04),
  "05-ellipse": asPrimitive(Ellipse05),
  "06-straight-line": asPrimitive(StraightLine06),
  "06-dash-dot": asPrimitive(DashDot06),
  "06-polyline": asPrimitive(Polyline06),
  "07-one-way-arrow": asPrimitive(OneWayArrow07),
  "07-two-way-arrow": asPrimitive(TwoWayArrow07),
  "08-curve-connector": asPrimitive(CurveConnector08),
  "09-curve-band": asPrimitive(CurveBand09),
  "10-irregular-region": asPrimitive(IrregularRegion10),
  "11-trapezoid": asPrimitive(Trapezoid11),
  "12-storage-cylinder": asPrimitive(StorageCylinder12),
  "13-cloud": asPrimitive(Cloud13),
  "14-rhombus": asPrimitive(Rhombus14),
  "15-parallelogram": asPrimitive(Parallelogram15),
  "16-triangle": asPrimitive(Triangle16),
  "17-hexagon": asPrimitive(Hexagon17),
  "17-octagon": asPrimitive(Octagon17),
  "17-pentagon": asPrimitive(Pentagon17),
  "18-sector": asPrimitive(Sector18),
  "18-semicircle": asPrimitive(Semicircle18),
  "19-arc": asPrimitive(Arc19),
  "20-annular-sector": asPrimitive(AnnularSector20),
  "20-ring": asPrimitive(Ring20),
  "21-callout-bubble": asPrimitive(CalloutBubble21),
  "22-curly-brace": asPrimitive(CurlyBrace22),
  "22-round-bracket": asPrimitive(RoundBracket22),
  "22-square-bracket": asPrimitive(SquareBracket22),
  "23-star": asPrimitive(Star23),
  "24-cross": asPrimitive(Cross24),
  "24-plus": asPrimitive(Plus24),
  "24-rect-cross": asPrimitive(RectCross24),
  "24-rect-plus": asPrimitive(RectPlus24),
  "25-document": asPrimitive(Document25),
  "26-check": asPrimitive(Check26),
  "26-rect-check": asPrimitive(RectCheck26),
  "28-row-selection": asPrimitive(RowSelection28),
};

export const PRIMITIVE_IDS = Object.keys(PRIMITIVE_COMPONENTS);
