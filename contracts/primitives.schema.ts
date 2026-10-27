/**
 * 原子图形（primitives）契约：28 类 / 42 个组件变体的同源判别联合。
 *
 * 每个变体的 config 形状必须与其 React 组件（07-remotion-templates/process/src/primitives/
 * codex-version/*.tsx）的 Props 类型逐字段一致，组件类型由本文件推导。
 */
import { z } from "zod";

const CanvasSchema = z.object({
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});
const PointSchema = z.tuple([z.number(), z.number()]);
const ColorSchema = z.string().min(1);
const LinecapSchema = z.enum(["butt", "round", "square"]);
const LinejoinSchema = z.enum(["miter", "round", "bevel"]);
const ShadowSchema = z.object({
  x: z.number(),
  y: z.number(),
  blur: z.number(),
  color: ColorSchema,
});

const shapeBase = {
  id: z.string().min(1).regex(/^[A-Za-z0-9._-]+$/, "图形实例 id 只允许字母数字与 ._-"),
  velocityX: z.number().optional().default(0),
  velocityY: z.number().optional().default(0),
};

/** 轮廓 + 填充两段式动画（矩形、圆、多边形等）。 */
const OutlineFillAnimationSchema = z.object({
  outlineStartFrame: z.number(),
  outlineDurationInFrames: z.number(),
  fillStartFrame: z.number(),
  fillDurationInFrames: z.number(),
});

/** 仅轮廓绘制动画（空心圆、圆弧、括号等）。 */
const OutlineAnimationSchema = z.object({
  outlineStartFrame: z.number(),
  outlineDurationInFrames: z.number(),
});

/** 单段描边绘制动画（直线、折线、对勾、曲线连接线）。 */
const DrawAnimationSchema = z.object({
  startFrame: z.number(),
  durationInFrames: z.number(),
});

/** 十字 / 加号的两笔绘制动画。 */
const TwoStrokeAnimationSchema = z.object({
  horizontalStartFrame: z.number(),
  horizontalDurationInFrames: z.number(),
  verticalStartFrame: z.number(),
  verticalDurationInFrames: z.number(),
});

const RectLikeSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number().nonnegative(),
  height: z.number().nonnegative(),
  radius: z.number().nonnegative(),
  fill: ColorSchema,
  stroke: ColorSchema,
  strokeWidth: z.number().nonnegative(),
  shadow: ShadowSchema,
});

/** 空心 / 实心圆的公共形状字段。 */
const CircleShapeSchema = z.object({
  cx: z.number(),
  cy: z.number(),
  radius: z.number().nonnegative(),
  fill: ColorSchema,
  stroke: ColorSchema,
  strokeWidth: z.number().nonnegative(),
  shadow: ShadowSchema,
});

/** 正多边形（五 / 六 / 八边形）的公共形状字段。 */
const RegularPolygonShapeSchema = z.object({
  center: PointSchema,
  radius: z.number(),
  rotationDegrees: z.number(),
  fill: ColorSchema,
  stroke: ColorSchema,
  strokeWidth: z.number(),
  linejoin: LinejoinSchema,
});

export const PRIMITIVE_IDS = [
  "01-rect",
  "02-rounded-rect",
  "03-capsule",
  "04-solid-circle",
  "04-hollow-circle",
  "04-concentric-circles",
  "05-ellipse",
  "06-straight-line",
  "06-dash-dot",
  "06-polyline",
  "07-one-way-arrow",
  "07-two-way-arrow",
  "08-curve-connector",
  "09-curve-band",
  "10-irregular-region",
  "11-trapezoid",
  "12-storage-cylinder",
  "13-cloud",
  "14-rhombus",
  "15-parallelogram",
  "16-triangle",
  "17-hexagon",
  "17-octagon",
  "17-pentagon",
  "18-sector",
  "18-semicircle",
  "19-arc",
  "20-annular-sector",
  "20-ring",
  "21-callout-bubble",
  "22-curly-brace",
  "22-round-bracket",
  "22-square-bracket",
  "23-star",
  "24-cross",
  "24-plus",
  "24-rect-cross",
  "24-rect-plus",
  "25-document",
  "26-check",
  "26-rect-check",
  "28-row-selection",
] as const;

export type PrimitiveId = (typeof PRIMITIVE_IDS)[number];

export const PrimitiveIdSchema = z.enum(PRIMITIVE_IDS);

export const AtomicShapeItemSchema = z.discriminatedUnion("primitive", [
  z.object({
    ...shapeBase,
    primitive: z.literal("01-rect"),
    config: z.object({
      canvas: CanvasSchema,
      rect: RectLikeSchema,
      animation: OutlineFillAnimationSchema,
    }),
  }),
  z.object({
    ...shapeBase,
    primitive: z.literal("02-rounded-rect"),
    config: z.object({
      canvas: CanvasSchema,
      rect: RectLikeSchema,
      animation: OutlineFillAnimationSchema,
    }),
  }),
  z.object({
    ...shapeBase,
    primitive: z.literal("03-capsule"),
    config: z.object({
      canvas: CanvasSchema,
      rect: RectLikeSchema,
      animation: OutlineFillAnimationSchema,
    }),
  }),
  z.object({
    ...shapeBase,
    primitive: z.literal("04-solid-circle"),
    config: z.object({
      canvas: CanvasSchema,
      circle: CircleShapeSchema,
      animation: OutlineFillAnimationSchema,
    }),
  }),
  z.object({
    ...shapeBase,
    primitive: z.literal("04-hollow-circle"),
    config: z.object({
      canvas: CanvasSchema,
      circle: z.object({
        cx: z.number(),
        cy: z.number(),
        radius: z.number().nonnegative(),
        stroke: ColorSchema,
        strokeWidth: z.number().nonnegative(),
        shadow: ShadowSchema,
      }),
      animation: OutlineAnimationSchema,
    }),
  }),
  z.object({
    ...shapeBase,
    primitive: z.literal("04-concentric-circles"),
    config: z.object({
      canvas: CanvasSchema,
      center: z.object({ cx: z.number(), cy: z.number() }),
      circles: z.array(z.object({ radius: z.number(), strokeWidth: z.number() })),
      style: z.object({
        stroke: ColorSchema,
        shadow: ShadowSchema,
      }),
      animation: z.object({
        outlineStartFrame: z.number(),
        outlineDurationInFrames: z.number(),
        staggerFrames: z.number(),
      }),
    }),
  }),
  z.object({
    ...shapeBase,
    primitive: z.literal("05-ellipse"),
    config: z.object({
      canvas: CanvasSchema,
      ellipse: z.object({
        cx: z.number(),
        cy: z.number(),
        radiusX: z.number(),
        radiusY: z.number(),
        fill: ColorSchema,
        stroke: ColorSchema,
        strokeWidth: z.number(),
        shadow: ShadowSchema,
      }),
      animation: OutlineFillAnimationSchema,
    }),
  }),
  z.object({
    ...shapeBase,
    primitive: z.literal("06-straight-line"),
    config: z.object({
      canvas: CanvasSchema,
      line: z.object({
        from: PointSchema,
        to: PointSchema,
        stroke: ColorSchema,
        strokeWidth: z.number(),
        linecap: LinecapSchema,
      }),
      animation: DrawAnimationSchema,
    }),
  }),
  z.object({
    ...shapeBase,
    primitive: z.literal("06-dash-dot"),
    config: z.object({
      canvas: CanvasSchema,
      style: z.object({ stroke: ColorSchema, strokeWidth: z.number() }),
      lines: z.array(
        z.object({
          id: z.string(),
          points: z.array(PointSchema),
          dashArray: z.array(z.number()),
          linecap: LinecapSchema,
          startFrame: z.number(),
        }),
      ),
      animation: z.object({ durationInFrames: z.number() }),
    }),
  }),
  z.object({
    ...shapeBase,
    primitive: z.literal("06-polyline"),
    config: z.object({
      canvas: CanvasSchema,
      polyline: z.object({
        points: z.array(PointSchema),
        stroke: ColorSchema,
        strokeWidth: z.number(),
        linecap: LinecapSchema,
        linejoin: LinejoinSchema,
      }),
      animation: DrawAnimationSchema,
    }),
  }),
  z.object({
    ...shapeBase,
    primitive: z.literal("07-one-way-arrow"),
    config: z.object({
      canvas: CanvasSchema,
      arrow: z.object({
        from: PointSchema,
        to: PointSchema,
        stroke: ColorSchema,
        strokeWidth: z.number(),
        linecap: LinecapSchema,
        headLength: z.number(),
        headWidth: z.number(),
      }),
      animation: z.object({
        shaftStartFrame: z.number(),
        shaftDurationInFrames: z.number(),
        headStartFrame: z.number(),
        headDurationInFrames: z.number(),
      }),
    }),
  }),
  z.object({
    ...shapeBase,
    primitive: z.literal("07-two-way-arrow"),
    config: z.object({
      canvas: CanvasSchema,
      arrow: z.object({
        from: PointSchema,
        to: PointSchema,
        stroke: ColorSchema,
        strokeWidth: z.number(),
        linecap: LinecapSchema,
        headLength: z.number(),
        headWidth: z.number(),
      }),
      animation: z.object({
        shaftStartFrame: z.number(),
        shaftDurationInFrames: z.number(),
        headsStartFrame: z.number(),
        headsDurationInFrames: z.number(),
      }),
    }),
  }),
  z.object({
    ...shapeBase,
    primitive: z.literal("08-curve-connector"),
    config: z.object({
      canvas: CanvasSchema,
      curve: z.object({
        start: PointSchema,
        control1: PointSchema,
        control2: PointSchema,
        end: PointSchema,
        stroke: ColorSchema,
        strokeWidth: z.number(),
        linecap: LinecapSchema,
      }),
      animation: z.object({
        drawStartFrame: z.number(),
        drawDurationInFrames: z.number(),
      }),
    }),
  }),
  z.object({
    ...shapeBase,
    primitive: z.literal("09-curve-band"),
    config: z.object({
      canvas: CanvasSchema,
      centerline: z.object({
        start: PointSchema,
        control1: PointSchema,
        control2: PointSchema,
        end: PointSchema,
      }),
      band: z.object({
        width: z.number(),
        taper: z.number(),
        minimumWidthRatio: z.number(),
        fill: ColorSchema,
        stroke: ColorSchema,
        strokeWidth: z.number(),
        linejoin: LinejoinSchema,
      }),
      animation: z.object({
        growthStartFrame: z.number(),
        growthDurationInFrames: z.number(),
        taperStartFrame: z.number(),
        taperDurationInFrames: z.number(),
      }),
    }),
  }),
  z.object({
    ...shapeBase,
    primitive: z.literal("10-irregular-region"),
    config: z.object({
      canvas: CanvasSchema,
      region: z.object({
        points: z.array(PointSchema),
        tension: z.number(),
        fill: ColorSchema,
        stroke: ColorSchema,
        strokeWidth: z.number(),
        linejoin: LinejoinSchema,
      }),
      animation: z.object({
        appearStartFrame: z.number(),
        appearDurationInFrames: z.number(),
        smoothStartFrame: z.number(),
        smoothDurationInFrames: z.number(),
        fillStartFrame: z.number(),
        fillDurationInFrames: z.number(),
      }),
    }),
  }),
  z.object({
    ...shapeBase,
    primitive: z.literal("11-trapezoid"),
    config: z.object({
      canvas: CanvasSchema,
      trapezoid: z.object({
        x: z.number(),
        y: z.number(),
        bottomWidth: z.number(),
        topWidth: z.number(),
        topOffset: z.number(),
        height: z.number(),
        fill: ColorSchema,
        stroke: ColorSchema,
        strokeWidth: z.number(),
        linejoin: LinejoinSchema,
      }),
      animation: OutlineFillAnimationSchema,
    }),
  }),
  z.object({
    ...shapeBase,
    primitive: z.literal("12-storage-cylinder"),
    config: z.object({
      canvas: CanvasSchema,
      cylinder: z.object({
        cx: z.number(),
        topY: z.number(),
        bottomY: z.number(),
        radiusX: z.number(),
        radiusY: z.number(),
        fill: ColorSchema,
        stroke: ColorSchema,
        strokeWidth: z.number(),
        sectionRatios: z.array(z.number()),
        sectionStrokeWidth: z.number(),
      }),
      animation: z.object({
        outlineStartFrame: z.number(),
        outlineDurationInFrames: z.number(),
        fillStartFrame: z.number(),
        fillDurationInFrames: z.number(),
        sectionStartFrame: z.number(),
        sectionDurationInFrames: z.number(),
      }),
    }),
  }),
  z.object({
    ...shapeBase,
    primitive: z.literal("13-cloud"),
    config: z.object({
      canvas: CanvasSchema,
      cloud: z.object({
        origin: z.object({ x: z.number(), y: z.number() }),
        scale: z.number(),
        base: z.object({
          x: z.number(),
          y: z.number(),
          width: z.number(),
          height: z.number(),
          radius: z.number(),
        }),
        circles: z.array(z.object({ x: z.number(), y: z.number(), radius: z.number() })),
        fill: ColorSchema,
        stroke: ColorSchema,
        strokeWidth: z.number(),
      }),
      animation: z.object({
        solidStartFrame: z.number(),
        solidDurationInFrames: z.number(),
      }),
    }),
  }),
  z.object({
    ...shapeBase,
    primitive: z.literal("14-rhombus"),
    config: z.object({
      canvas: CanvasSchema,
      rhombus: z.object({
        center: PointSchema,
        diagonalWidth: z.number(),
        diagonalHeight: z.number(),
        fill: ColorSchema,
        stroke: ColorSchema,
        strokeWidth: z.number(),
        linejoin: LinejoinSchema,
      }),
      animation: OutlineFillAnimationSchema,
    }),
  }),
  z.object({
    ...shapeBase,
    primitive: z.literal("15-parallelogram"),
    config: z.object({
      canvas: CanvasSchema,
      parallelogram: z.object({
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number(),
        skew: z.number(),
        fill: ColorSchema,
        stroke: ColorSchema,
        strokeWidth: z.number(),
        linejoin: LinejoinSchema,
      }),
      animation: OutlineFillAnimationSchema,
    }),
  }),
  z.object({
    ...shapeBase,
    primitive: z.literal("16-triangle"),
    config: z.object({
      canvas: CanvasSchema,
      triangle: z.object({
        points: z.tuple([PointSchema, PointSchema, PointSchema]),
        fill: ColorSchema,
        stroke: ColorSchema,
        strokeWidth: z.number(),
        linejoin: LinejoinSchema,
      }),
      animation: OutlineFillAnimationSchema,
    }),
  }),
  z.object({
    ...shapeBase,
    primitive: z.literal("17-hexagon"),
    config: z.object({
      canvas: CanvasSchema,
      hexagon: RegularPolygonShapeSchema,
      animation: OutlineFillAnimationSchema,
    }),
  }),
  z.object({
    ...shapeBase,
    primitive: z.literal("17-octagon"),
    config: z.object({
      canvas: CanvasSchema,
      octagon: RegularPolygonShapeSchema,
      animation: OutlineFillAnimationSchema,
    }),
  }),
  z.object({
    ...shapeBase,
    primitive: z.literal("17-pentagon"),
    config: z.object({
      canvas: CanvasSchema,
      pentagon: RegularPolygonShapeSchema,
      animation: OutlineFillAnimationSchema,
    }),
  }),
  z.object({
    ...shapeBase,
    primitive: z.literal("18-sector"),
    config: z.object({
      canvas: CanvasSchema,
      sector: z.object({
        center: PointSchema,
        radius: z.number(),
        startAngleDegrees: z.number(),
        sweepAngleDegrees: z.number(),
        fill: ColorSchema,
        stroke: ColorSchema,
        strokeWidth: z.number(),
        linejoin: LinejoinSchema,
      }),
      animation: OutlineFillAnimationSchema,
    }),
  }),
  z.object({
    ...shapeBase,
    primitive: z.literal("18-semicircle"),
    config: z.object({
      canvas: CanvasSchema,
      semicircle: z.object({
        center: PointSchema,
        radius: z.number(),
        rotationDegrees: z.number(),
        fill: ColorSchema,
        stroke: ColorSchema,
        strokeWidth: z.number(),
        linejoin: LinejoinSchema,
      }),
      animation: OutlineFillAnimationSchema,
    }),
  }),
  z.object({
    ...shapeBase,
    primitive: z.literal("19-arc"),
    config: z.object({
      canvas: CanvasSchema,
      arc: z.object({
        center: PointSchema,
        radius: z.number(),
        startAngleDegrees: z.number(),
        sweepAngleDegrees: z.number(),
        stroke: ColorSchema,
        strokeWidth: z.number(),
        linecap: LinecapSchema,
      }),
      animation: OutlineAnimationSchema,
    }),
  }),
  z.object({
    ...shapeBase,
    primitive: z.literal("20-annular-sector"),
    config: z.object({
      canvas: CanvasSchema,
      annularSector: z.object({
        center: PointSchema,
        outerRadius: z.number(),
        innerRadius: z.number(),
        startAngleDegrees: z.number(),
        sweepAngleDegrees: z.number(),
        fill: ColorSchema,
        stroke: ColorSchema,
        strokeWidth: z.number(),
        linejoin: LinejoinSchema,
      }),
      animation: OutlineFillAnimationSchema,
    }),
  }),
  z.object({
    ...shapeBase,
    primitive: z.literal("20-ring"),
    config: z.object({
      canvas: CanvasSchema,
      ring: z.object({
        center: PointSchema,
        outerRadius: z.number(),
        thickness: z.number(),
        fill: ColorSchema,
        stroke: ColorSchema,
        strokeWidth: z.number(),
      }),
      animation: OutlineFillAnimationSchema,
    }),
  }),
  z.object({
    ...shapeBase,
    primitive: z.literal("21-callout-bubble"),
    config: z.object({
      canvas: CanvasSchema,
      callout: z.object({
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number(),
        radius: z.number(),
        fill: ColorSchema,
        stroke: ColorSchema,
        strokeWidth: z.number(),
        linejoin: LinejoinSchema,
        tail: z.object({
          baseCenterX: z.number(),
          width: z.number(),
          tip: PointSchema,
        }),
      }),
      animation: OutlineFillAnimationSchema,
    }),
  }),
  z.object({
    ...shapeBase,
    primitive: z.literal("22-curly-brace"),
    config: z.object({
      canvas: CanvasSchema,
      brace: z.object({
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number(),
        stroke: ColorSchema,
        strokeWidth: z.number(),
        linecap: LinecapSchema,
      }),
      animation: OutlineAnimationSchema,
    }),
  }),
  z.object({
    ...shapeBase,
    primitive: z.literal("22-round-bracket"),
    config: z.object({
      canvas: CanvasSchema,
      roundBracket: z.object({
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number(),
        stroke: ColorSchema,
        strokeWidth: z.number(),
        linecap: LinecapSchema,
      }),
      animation: OutlineAnimationSchema,
    }),
  }),
  z.object({
    ...shapeBase,
    primitive: z.literal("22-square-bracket"),
    config: z.object({
      canvas: CanvasSchema,
      bracket: z.object({
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number(),
        stroke: ColorSchema,
        strokeWidth: z.number(),
        linecap: LinecapSchema,
        linejoin: LinejoinSchema,
      }),
      animation: OutlineAnimationSchema,
    }),
  }),
  z.object({
    ...shapeBase,
    primitive: z.literal("23-star"),
    config: z.object({
      canvas: CanvasSchema,
      star: z.object({
        center: PointSchema,
        points: z.number(),
        outerRadius: z.number(),
        innerRadiusRatio: z.number(),
        rotationDegrees: z.number(),
        fill: ColorSchema,
        stroke: ColorSchema,
        strokeWidth: z.number(),
        linejoin: LinejoinSchema,
      }),
      animation: OutlineFillAnimationSchema,
    }),
  }),
  z.object({
    ...shapeBase,
    primitive: z.literal("24-cross"),
    config: z.object({
      canvas: CanvasSchema,
      cross: z.object({
        center: PointSchema,
        armLength: z.number(),
        rotationDegrees: z.number(),
        stroke: ColorSchema,
        strokeWidth: z.number(),
        linecap: LinecapSchema,
      }),
      animation: z.object({
        firstLineStartFrame: z.number(),
        firstLineDurationInFrames: z.number(),
        secondLineStartFrame: z.number(),
        secondLineDurationInFrames: z.number(),
      }),
    }),
  }),
  z.object({
    ...shapeBase,
    primitive: z.literal("24-plus"),
    config: z.object({
      canvas: CanvasSchema,
      plus: z.object({
        center: PointSchema,
        armLength: z.number(),
        stroke: ColorSchema,
        strokeWidth: z.number(),
        linecap: LinecapSchema,
      }),
      animation: TwoStrokeAnimationSchema,
    }),
  }),
  z.object({
    ...shapeBase,
    primitive: z.literal("24-rect-cross"),
    config: z.object({
      canvas: CanvasSchema,
      crossRect: z.object({
        center: PointSchema,
        armLength: z.number(),
        armWidth: z.number(),
        rotationDegrees: z.number(),
        fill: ColorSchema,
        stroke: ColorSchema,
        strokeWidth: z.number(),
      }),
      animation: z.object({
        firstRectStartFrame: z.number(),
        firstRectDurationInFrames: z.number(),
        secondRectStartFrame: z.number(),
        secondRectDurationInFrames: z.number(),
      }),
    }),
  }),
  z.object({
    ...shapeBase,
    primitive: z.literal("24-rect-plus"),
    config: z.object({
      canvas: CanvasSchema,
      plus: z.object({
        center: PointSchema,
        armLength: z.number(),
        armWidth: z.number(),
        fill: ColorSchema,
        stroke: ColorSchema,
        strokeWidth: z.number(),
        linejoin: LinejoinSchema,
      }),
      animation: TwoStrokeAnimationSchema.extend({
        outlineStartFrame: z.number(),
        outlineDurationInFrames: z.number(),
      }),
    }),
  }),
  z.object({
    ...shapeBase,
    primitive: z.literal("25-document"),
    config: z.object({
      canvas: CanvasSchema,
      document: z.object({
        center: PointSchema,
        width: z.number(),
        height: z.number(),
        fold: z.number(),
        fill: ColorSchema,
        foldTint: ColorSchema,
        foldTintOpacity: z.number(),
        stroke: ColorSchema,
        strokeWidth: z.number(),
        linejoin: LinejoinSchema,
      }),
      animation: OutlineFillAnimationSchema.extend({
        flapStartFrame: z.number(),
        flapDurationInFrames: z.number(),
      }),
    }),
  }),
  z.object({
    ...shapeBase,
    primitive: z.literal("26-check"),
    config: z.object({
      canvas: CanvasSchema,
      check: z.object({
        center: PointSchema,
        points: z.tuple([PointSchema, PointSchema, PointSchema]),
        stroke: ColorSchema,
        strokeWidth: z.number(),
        linecap: LinecapSchema,
        linejoin: LinejoinSchema,
      }),
      animation: DrawAnimationSchema,
    }),
  }),
  z.object({
    ...shapeBase,
    primitive: z.literal("26-rect-check"),
    config: z.object({
      canvas: CanvasSchema,
      checkRect: z.object({
        center: PointSchema,
        points: z.tuple([PointSchema, PointSchema, PointSchema]),
        armWidth: z.number(),
        fill: ColorSchema,
        stroke: ColorSchema,
        strokeWidth: z.number(),
      }),
      animation: z.object({
        firstRectStartFrame: z.number(),
        firstRectDurationInFrames: z.number(),
        fanStartFrame: z.number(),
        fanDurationInFrames: z.number(),
        secondRectStartFrame: z.number(),
        secondRectDurationInFrames: z.number(),
      }),
    }),
  }),
  z.object({
    ...shapeBase,
    primitive: z.literal("28-row-selection"),
    config: z.object({
      canvas: CanvasSchema,
      table: z.object({
        x: z.number(),
        y: z.number(),
        columns: z.array(
          z.object({
            label: z.string(),
            width: z.number(),
            align: z.enum(["left", "center", "right"]).optional(),
            mono: z.boolean().optional(),
            fontSize: z.number(),
            accentValues: z.array(z.string()).optional(),
          }),
        ),
        rows: z.array(z.array(z.string())),
        headerHeight: z.number(),
        rowHeight: z.number(),
        headerFontSize: z.number(),
        style: z.object({
          ink: ColorSchema,
          accent: ColorSchema,
          headerTintOpacity: z.number(),
          selectionOpacity: z.number(),
          hoverOpacity: z.number(),
          columnHoverOpacity: z.number(),
          columnMarkerHoverOpacity: z.number(),
          cellSelectionOpacity: z.number(),
          cellHoverOpacity: z.number(),
          internalLineOpacity: z.number(),
        }),
      }),
      animation: z.object({
        horizontalGridStartFrame: z.number(),
        verticalGridStartFrame: z.number(),
        headerStartFrame: z.number(),
        headerTextStartFrame: z.number(),
        headerDurationInFrames: z.number(),
        rowsStartFrame: z.number(),
        rowRevealDurationInFrames: z.number(),
        rowStaggerInFrames: z.number(),
        hoverRowIndex: z.number(),
        hoverStartFrame: z.number(),
        hoverEndFrame: z.number(),
        hoverColumnIndex: z.number(),
        hoverColumnStartFrame: z.number(),
        hoverColumnEndFrame: z.number(),
        hoverCell: z.object({ row: z.number(), column: z.number() }),
        hoverCellStartFrame: z.number(),
        hoverCellEndFrame: z.number(),
      }),
      selection: z.object({
        transitionDurationInFrames: z.number(),
        keyframes: z.array(
          z.object({
            atFrame: z.number(),
            rows: z.array(z.number()),
            columns: z.array(z.number()),
            cells: z.array(z.object({ row: z.number(), column: z.number() })),
          }),
        ),
      }),
    }),
  }),
]);

export type AtomicShapeItem = z.infer<typeof AtomicShapeItemSchema>;

/** 已接入生产判别联合的图形变体；当前覆盖全部 42 个组件变体。 */
export const CONTRACTED_PRIMITIVES: readonly PrimitiveId[] = [...PRIMITIVE_IDS];
