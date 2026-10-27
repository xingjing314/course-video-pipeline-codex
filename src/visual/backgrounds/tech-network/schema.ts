import { z } from "zod";
import { hexColor } from "../hex-color";

const opacity = z.number().min(0).max(1);
const seconds = z.number().min(0).max(60);

/**
 * "信息系统项目管理师" tech background (spec: /workspace/bg-preview/SPEC.md).
 * Every field has the approved spec value as its default, so `{ "type": "tech-network" }`
 * alone renders the approved design. Times are in seconds inside one loop and are
 * converted with fps in the component. All periodic motion is an integer number of
 * cycles per loop, so the last frame flows into frame 0 without a seam.
 * The background contains no text of any kind.
 */
export const techNetworkSchema = z
  .object({
    type: z.literal("tech-network"),
    /** Loop length; drift, grid shift, highlights and gantt all repeat on it. */
    loopSeconds: z.number().min(1).max(60).default(30),
    /** cubic-bezier control points [x1, y1, x2, y2] for every eased motion. */
    easing: z
      .tuple([z.number().min(0).max(1), z.number(), z.number().min(0).max(1), z.number()])
      .default([0.45, 0, 0.55, 1]),
    /**
     * Stroke width of grid lines, network links and highlighted links, px at 1920x1080.
     * 2 = render.py / preview.mp4 (2px on its 1920 canvas). Grid follows this value.
     */
    lineWidth: z.number().gt(0).max(4).default(2),

    // 1. Base: radial gradient, centre → corners.
    baseCenterColor: hexColor.default("#0B1A33"),
    baseEdgeColor: hexColor.default("#060E1F"),
    /** Exponent on the normalised radius (1 = linear). */
    baseFalloff: z.number().min(0.2).max(5).default(1.6),

    // 2. Grid.
    gridColor: hexColor.default("#2EC4D6"),
    gridCellSize: z.number().int().min(8).max(400).default(80),
    gridMajorEvery: z.number().int().min(1).max(16).default(4),
    gridMinorOpacity: opacity.default(0.04),
    gridMajorOpacity: opacity.default(0.06),
    /** Cells the grid moves toward the bottom-right per loop; a multiple of gridMajorEvery keeps it seamless. */
    gridCellsPerLoop: z.number().int().min(0).max(32).default(4),

    // 3./4. Node network (layout is baked, see layout.ts).
    nodeColor: hexColor.default("#8FB8D9"),
    nodeOpacity: opacity.default(0.18),
    linkOpacity: opacity.default(0.11),
    /** Multiplier on the baked 12–24px sine drift amplitudes. */
    driftScale: z.number().min(0).max(3).default(1),
    /**
     * Central zone reserved for the instructor / slides: width and height as a fraction
     * of the frame (0.6 = central 60%x60%). Nodes and links inside it are dimmed.
     * The baked layout keeps the 5 hubs outside the default 60% zone.
     */
    centerZoneSize: z.number().min(0).max(1).default(0.6),
    /** Opacity multiplier for nodes/links inside the central zone (0.5 = half). */
    centerDim: opacity.default(0.5),
    /** Soft edge of the central zone, px. */
    centerZoneFeather: z.number().min(0).max(200).default(60),

    // 5. Auto highlight of the 5 hubs.
    highlightColor: hexColor.default("#2EC4D6"),
    highlightAltColor: hexColor.default("#E0B050"),
    /** Which highlight (0-based) uses the warm alt colour; -1 = none. */
    highlightAltIndex: z.number().int().min(-1).max(4).default(2),
    /** Start time of each highlight; one per hub, in order. */
    highlightStarts: z.array(seconds).min(0).max(5).default([0.5, 6.5, 12.5, 18.5, 24.5]),
    highlightFadeIn: seconds.default(0.8),
    highlightHold: seconds.default(1.5),
    highlightFadeOut: seconds.default(1.2),
    /**
     * FINAL composited opacity of the lit hub core at its centre (over the unlit image),
     * i.e. render.py's max(core, glow, links). The core layer's own alpha is derived so
     * that core stacked over glow + highlighted links lands on this value.
     */
    highlightCoreOpacity: opacity.default(0.6),
    highlightGlowOpacity: opacity.default(0.55),
    /** Glow softness (Gaussian std deviation), px. */
    highlightGlowBlur: z.number().min(0).max(60).default(12),
    highlightLinkOpacity: opacity.default(0.35),
    /** Light dots start travelling this long after the highlight starts... */
    pulseStart: seconds.default(0.8),
    /** ...and take this long to reach the neighbours. */
    pulseTravel: seconds.default(1.5),
    /** Dots fade out over this time after arriving. */
    pulseFade: seconds.default(0.3),
    pulseDotOpacity: opacity.default(0.75),
    /** Brightness of a reached neighbour until the highlight has faded out. */
    arrivalOpacity: opacity.default(0.6),

    // 6. Gantt progress lines.
    /** false hides the whole gantt band (tracks, progress fill and milestone diamonds). */
    ganttEnabled: z.boolean().default(true),
    /**
     * Which frame edge the band sits on. "bottom" = approved layout (y ≈ 946–1004).
     * "top" = band fitted into y 70–130 (bar order kept, vertical spacing scaled to fit),
     * same 96px side margins, opacities multiplied by ganttTopOpacityScale.
     */
    ganttBand: z.enum(["bottom", "top"]).default("bottom"),
    /** Extra vertical shift of the whole band, px at 1920x1080 (positive = down), ±60. */
    ganttOffsetY: z.number().min(-60).max(60).default(0),
    /** In "top" mode, track / fill / milestone opacities are multiplied by this. */
    ganttTopOpacityScale: z.number().min(0).max(1).default(0.7),
    ganttTrackColor: hexColor.default("#8FB8D9"),
    ganttTrackOpacity: opacity.default(0.1),
    ganttFillColor: hexColor.default("#2EC4D6"),
    ganttFillOpacity: opacity.default(0.25),
    /** Fill sweeps left → right from 0 to this time... */
    ganttProgressEnd: seconds.default(27),
    /** ...then fades out, fully gone at this time (before the loop restarts). */
    ganttFadeEnd: seconds.default(29.5),
    milestoneBaseOpacity: opacity.default(0.1),
    milestonePeakOpacity: opacity.default(0.35),
    milestonePulse: seconds.default(0.6),

    // 7. Grain.
    /** Static noise amplitude (fraction of full scale), against colour banding. */
    grainAmount: z.number().min(0).max(0.1).default(0.02),
    grainSeed: z.string().min(1).default("tech-network-grain"),
  })
  .refine((d) => d.gridCellsPerLoop % d.gridMajorEvery === 0, {
    message: "gridCellsPerLoop must be a multiple of gridMajorEvery, or the loop seams",
    path: ["gridCellsPerLoop"],
  })
  .refine(
    (d) =>
      d.highlightStarts.every((s, i, all) => {
        const end = s + d.highlightFadeIn + d.highlightHold + d.highlightFadeOut;
        return end <= d.loopSeconds && (i === all.length - 1 || all[i + 1] >= end);
      }),
    {
      message:
        "Highlights must be ascending, must not overlap (one at a time) and must end within loopSeconds",
      path: ["highlightStarts"],
    },
  )
  // Skipped when the band is hidden: its timing cannot affect the loop then.
  .refine(
    (d) =>
      !d.ganttEnabled || (d.ganttProgressEnd < d.ganttFadeEnd && d.ganttFadeEnd <= d.loopSeconds),
    {
      message: "Need ganttProgressEnd < ganttFadeEnd <= loopSeconds (when ganttEnabled)",
      path: ["ganttFadeEnd"],
    },
  );

export type TechNetworkParams = z.infer<typeof techNetworkSchema>;
