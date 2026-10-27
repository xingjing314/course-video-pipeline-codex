import React, { useLayoutEffect, useMemo, useRef } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  interpolateColors,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  GANTT_BARS,
  GANTT_MILESTONES,
  GANTT_X0,
  GANTT_X1,
  HIGHLIGHT_ORDER,
  HUB_NEIGHBOURS,
  LINKS,
  NODES,
  REF_HEIGHT,
  REF_WIDTH,
} from "./layout";
import type { TechNetworkParams } from "./schema";

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const W = REF_WIDTH;
const H = REF_HEIGHT;
const HUB_COUNT = 5;
/** interpolate() needs strictly increasing input ranges; keeps 0-length phases legal. */
const span = (frames: number) => Math.max(frames, 0.001);
/** Glow filter: blurred alpha is multiplied by this and clipped to 1 (render.py: *3.5). */
const GLOW_GAIN = 3.5;

/**
 * Alpha for the core layer so that, drawn "over" the layers already below it at the
 * hub centre (glow, highlighted links), the composite equals `target`.
 * SVG stacks with source-over (1 - Π(1 - a)); render.py took the max instead.
 */
const coreLayerAlpha = (target: number, under: number): number =>
  under >= target ? 0 : 1 - (1 - target) / (1 - under);

/** Glow alpha at the centre of a blurred disk of radius r (Gaussian std sigma), before group opacity. */
const glowAtCentre = (r: number, sigma: number): number =>
  sigma <= 0 ? 1 : Math.min(1, GLOW_GAIN * (1 - Math.exp(-(r * r) / (2 * sigma * sigma))));
const PULSE_DOT_RADIUS = 3.5;
const DIAMOND_HALF = 4; // 8px milestone diamonds
/** Vertical extent of the approved (bottom) gantt band: bar centres ± diamond half-height. */
const GANTT_TOP = Math.min(...GANTT_BARS.map((b) => b[2])) - DIAMOND_HALF;
const GANTT_BOTTOM = Math.max(...GANTT_BARS.map((b) => b[2])) + DIAMOND_HALF;
/** "top" band extent (visual spec): the same band is fitted into y 70–130. */
const GANTT_TOP_BAND_Y0 = 70;
const GANTT_TOP_BAND_Y1 = 130;

type Pt = { readonly x: number; readonly y: number };

/** Quadratic control point of link (i, j); symmetric, so h→j and j→h share one curve. */
const controlPoint = (a: Pt, b: Pt, bend: number, forward: boolean): Pt => {
  const s = forward ? bend : -bend;
  return {
    x: (a.x + b.x) / 2 - (b.y - a.y) * s,
    y: (a.y + b.y) / 2 + (b.x - a.x) * s,
  };
};
const bezierAt = (a: Pt, c: Pt, b: Pt, t: number): Pt => ({
  x: (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * c.x + t * t * b.x,
  y: (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * c.y + t * t * b.y,
});
const bendOf = (i: number, j: number): number => {
  const lo = Math.min(i, j);
  const hi = Math.max(i, j);
  for (const l of LINKS) {
    if (l[0] === lo && l[1] === hi) return l[2];
  }
  return 0;
};

/**
 * Static ±grainAmount noise. Positive half is added with `plus-lighter`, negative half
 * subtracted with `difference`, so the grain is zero-mean like the draft's additive noise.
 * Seeded (remotion random → mulberry32), drawn once per tab, identical on every frame.
 */
const Grain: React.FC<{
  readonly amount: number;
  readonly seed: string;
  readonly sign: 1 | -1;
}> = ({ amount, seed, sign }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const img = ctx.createImageData(W, H);
    let a = Math.floor(random(seed) * 4294967296) >>> 0;
    const data = img.data;
    for (let p = 0; p < data.length; p += 4) {
      // mulberry32
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      const n = (((t ^ (t >>> 14)) >>> 0) / 4294967296) * 2 - 1; // uniform -1..1
      const v = n * sign > 0 ? Math.round(Math.abs(n) * amount * 255) : 0;
      data[p] = v;
      data[p + 1] = v;
      data[p + 2] = v;
      data[p + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }, [amount, seed, sign]);
  return (
    <canvas
      ref={ref}
      width={W}
      height={H}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        mixBlendMode: sign > 0 ? "plus-lighter" : "difference",
      }}
    />
  );
};

/**
 * "信息系统项目管理师" tech background: radial base, drifting grid, node network,
 * timed hub highlights with travelling light, gantt progress lines, static grain.
 * Pure function of the frame: everything periodic is derived from frame / loopFrames
 * with an integer cycle count, so frame loopFrames == frame 0. No text.
 */
export const TechNetwork: React.FC<TechNetworkParams> = (p) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const loopFrames = Math.round(p.loopSeconds * fps);
  const f = ((frame % loopFrames) + loopFrames) % loopFrames;
  const phase = (2 * Math.PI * f) / loopFrames; // 0..2π over one loop
  const easing = Easing.bezier(p.easing[0], p.easing[1], p.easing[2], p.easing[3]);
  const ids = useMemo(() => `tn${Math.floor(random(p.grainSeed) * 1e9)}`, [p.grainSeed]);

  // Base gradient stops: colour = mix(centre, edge, r^falloff), r = 0 centre … 1 corner.
  const baseStops = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1].map((o) => ({
    o,
    c: interpolateColors(Math.pow(o, p.baseFalloff), [0, 1], [p.baseCenterColor, p.baseEdgeColor]),
  }));

  // Grid: shifts gridCellsPerLoop cells toward bottom-right per loop.
  const cell = p.gridCellSize;
  const shift = interpolate(f, [0, loopFrames], [0, p.gridCellsPerLoop * cell], CLAMP);
  const gridLines = (extent: number) => {
    const minor: number[] = [];
    const major: number[] = [];
    const first = Math.floor(-shift / cell) - 1;
    for (let k = first; k * cell + shift <= extent + cell; k++) {
      const pos = k * cell + shift;
      if (pos < -cell || pos > extent + cell) continue;
      (((k % p.gridMajorEvery) + p.gridMajorEvery) % p.gridMajorEvery === 0 ? major : minor).push(
        pos,
      );
    }
    return { minor, major };
  };
  const gx = gridLines(W);
  const gy = gridLines(H);

  // Node positions: integer cycles per loop.
  const pts: Pt[] = NODES.map((n) => ({
    x: n.x + p.driftScale * n.ax * Math.sin(n.cx * phase + n.px),
    y: n.y + p.driftScale * n.ay * Math.sin(n.cy * phase + n.py),
  }));
  const linkPath = (i: number, j: number) => {
    const c = controlPoint(pts[i], pts[j], bendOf(i, j), i < j);
    return `M ${pts[i].x} ${pts[i].y} Q ${c.x} ${c.y} ${pts[j].x} ${pts[j].y}`;
  };

  // Central zone (dimmed), soft-edged via a blurred mask.
  const zw = W * p.centerZoneSize;
  const zh = H * p.centerZoneSize;

  // Gantt progress.
  const progressX = interpolate(f, [0, span(p.ganttProgressEnd * fps)], [GANTT_X0, GANTT_X1], {
    ...CLAMP,
    easing,
  });
  const fillAlpha = interpolate(f, [p.ganttProgressEnd * fps, p.ganttFadeEnd * fps], [1, 0], {
    ...CLAMP,
    easing,
  });
  // Band placement: bottom keeps the layout's y; top remaps it linearly into y 70–130.
  const ganttTop = p.ganttBand === "top";
  const ganttY = (yc: number) =>
    (ganttTop
      ? GANTT_TOP_BAND_Y0 +
        ((yc - GANTT_TOP) * (GANTT_TOP_BAND_Y1 - GANTT_TOP_BAND_Y0)) / (GANTT_BOTTOM - GANTT_TOP)
      : yc) + p.ganttOffsetY;
  const ganttOpacity = ganttTop ? p.ganttTopOpacityScale : 1;

  // Time (s) at which the sweep reaches x: invert the eased sweep by bisection.
  const reachTime = (x: number) => {
    const target = (x - GANTT_X0) / (GANTT_X1 - GANTT_X0);
    let lo = 0;
    let hi = 1;
    for (let it = 0; it < 40; it++) {
      const mid = (lo + hi) / 2;
      if (easing(mid) < target) lo = mid;
      else hi = mid;
    }
    return hi * p.ganttProgressEnd;
  };

  return (
    <AbsoluteFill style={{ isolation: "isolate", backgroundColor: p.baseEdgeColor }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <defs>
          <radialGradient id={`${ids}-base`} cx="50%" cy="50%" r="70.71%">
            {baseStops.map((s) => (
              <stop key={s.o} offset={s.o} stopColor={s.c} />
            ))}
          </radialGradient>
          <filter id={`${ids}-zone-blur`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={p.centerZoneFeather / 2.5} />
          </filter>
          <mask id={`${ids}-zone`} maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}>
            <rect x={0} y={0} width={W} height={H} fill="white" />
            <rect
              x={(W - zw) / 2}
              y={(H - zh) / 2}
              width={zw}
              height={zh}
              fill="black"
              fillOpacity={1 - p.centerDim}
              filter={p.centerZoneFeather > 0 ? `url(#${ids}-zone-blur)` : undefined}
            />
          </mask>
          <filter
            id={`${ids}-glow`}
            filterUnits="userSpaceOnUse"
            x={-200}
            y={-200}
            width={W + 400}
            height={H + 400}
          >
            <feGaussianBlur stdDeviation={p.highlightGlowBlur} />
            <feComponentTransfer>
              <feFuncA type="linear" slope={GLOW_GAIN} />
            </feComponentTransfer>
          </filter>
        </defs>

        {/* 1. Base */}
        <rect x={0} y={0} width={W} height={H} fill={`url(#${ids}-base)`} />

        {/* 2. Grid */}
        <g stroke={p.gridColor} strokeWidth={p.lineWidth} opacity={p.gridMinorOpacity}>
          {gx.minor.map((x) => (
            <line key={`vx${x}`} x1={x} y1={0} x2={x} y2={H} />
          ))}
          {gy.minor.map((y) => (
            <line key={`hy${y}`} x1={0} y1={y} x2={W} y2={y} />
          ))}
        </g>
        <g stroke={p.gridColor} strokeWidth={p.lineWidth} opacity={p.gridMajorOpacity}>
          {gx.major.map((x) => (
            <line key={`VX${x}`} x1={x} y1={0} x2={x} y2={H} />
          ))}
          {gy.major.map((y) => (
            <line key={`HY${y}`} x1={0} y1={y} x2={W} y2={y} />
          ))}
        </g>

        {/* 3./4. Network, dimmed in the central zone */}
        <g mask={`url(#${ids}-zone)`}>
          <g stroke={p.nodeColor} strokeWidth={p.lineWidth} fill="none" opacity={p.linkOpacity}>
            {LINKS.map(([i, j]) => (
              <path key={`l${i}-${j}`} d={linkPath(i, j)} />
            ))}
          </g>
          <g fill={p.nodeColor} opacity={p.nodeOpacity}>
            {NODES.map((n, i) => (
              <circle key={`n${i}`} cx={pts[i].x} cy={pts[i].y} r={n.r} />
            ))}
          </g>
        </g>

        {/* 5. Hub highlights: one at a time, schedule from highlightStarts */}
        {p.highlightStarts.slice(0, HUB_COUNT).map((startS, k) => {
          const s = startS * fps;
          const inF = span(p.highlightFadeIn * fps);
          const holdF = span(p.highlightHold * fps);
          const outF = span(p.highlightFadeOut * fps);
          const e = interpolate(
            f,
            [s, s + inF, s + inF + holdF, s + inF + holdF + outF],
            [0, 1, 1, 0],
            {
              ...CLAMP,
              easing,
            },
          );
          if (e <= 0) return null;
          const hub = HIGHLIGHT_ORDER[k];
          const color = k === p.highlightAltIndex ? p.highlightAltColor : p.highlightColor;
          const u = f - s;
          const arriveF = p.pulseStart * fps + span(p.pulseTravel * fps);
          const travel = interpolate(u, [p.pulseStart * fps, arriveF], [0, 1], {
            ...CLAMP,
            easing,
          });
          const dotAlpha =
            u < p.pulseStart * fps
              ? 0
              : interpolate(u, [arriveF, arriveF + span(p.pulseFade * fps)], [1, 0], CLAMP);
          const arrived = u > arriveF;
          const nbrs = HUB_NEIGHBOURS[hub];
          const dots = nbrs.map((j) => {
            const c = controlPoint(pts[hub], pts[j], bendOf(hub, j), hub < j);
            return bezierAt(pts[hub], c, pts[j], travel);
          });
          const glowSources = (
            <>
              <circle cx={pts[hub].x} cy={pts[hub].y} r={NODES[hub].r} />
              {dotAlpha > 0
                ? dots.map((d, n) => (
                    <circle
                      key={`gd${n}`}
                      cx={d.x}
                      cy={d.y}
                      r={PULSE_DOT_RADIUS}
                      fillOpacity={dotAlpha}
                    />
                  ))
                : null}
              {arrived
                ? nbrs.map((j) => (
                    <circle
                      key={`ga${j}`}
                      cx={pts[j].x}
                      cy={pts[j].y}
                      r={NODES[j].r + 1}
                      fillOpacity={p.arrivalOpacity}
                    />
                  ))
                : null}
            </>
          );
          return (
            <g key={`hl${k}`}>
              <g fill={color} filter={`url(#${ids}-glow)`} opacity={p.highlightGlowOpacity * e}>
                {glowSources}
              </g>
              <g
                stroke={color}
                strokeWidth={p.lineWidth}
                fill="none"
                opacity={p.highlightLinkOpacity * e}
              >
                {nbrs.map((j) => (
                  <path key={`hp${j}`} d={linkPath(hub, j)} />
                ))}
              </g>
              <circle
                cx={pts[hub].x}
                cy={pts[hub].y}
                r={NODES[hub].r}
                fill={color}
                opacity={coreLayerAlpha(
                  p.highlightCoreOpacity * e,
                  1 -
                    (1 -
                      glowAtCentre(NODES[hub].r, p.highlightGlowBlur) *
                        p.highlightGlowOpacity *
                        e) *
                      (1 - (nbrs.length > 0 ? p.highlightLinkOpacity * e : 0)),
                )}
              />
              <g fill={color} opacity={p.pulseDotOpacity * e}>
                {dotAlpha > 0
                  ? dots.map((d, n) => (
                      <circle
                        key={`d${n}`}
                        cx={d.x}
                        cy={d.y}
                        r={PULSE_DOT_RADIUS}
                        fillOpacity={dotAlpha}
                      />
                    ))
                  : null}
                {arrived
                  ? nbrs.map((j) => (
                      <circle
                        key={`a${j}`}
                        cx={pts[j].x}
                        cy={pts[j].y}
                        r={NODES[j].r + 1}
                        fillOpacity={p.arrivalOpacity}
                      />
                    ))
                  : null}
              </g>
            </g>
          );
        })}

        {/* 6. Gantt progress lines (whole band hidden when ganttEnabled is false) */}
        {p.ganttEnabled
          ? GANTT_BARS.map(([x0, x1, layoutY], b) => {
              const yc = ganttY(layoutY);
              return (
                <g key={`bar${b}`}>
                  <rect
                    x={x0}
                    y={yc - 2}
                    width={x1 - x0}
                    height={4}
                    fill={p.ganttTrackColor}
                    opacity={p.ganttTrackOpacity * ganttOpacity}
                  />
                  {GANTT_MILESTONES[b].map((mx) => {
                    const t0 = reachTime(mx) * fps;
                    const pulse = interpolate(
                      f,
                      [t0, t0 + span(p.milestonePulse * fps)],
                      [0, 1],
                      CLAMP,
                    );
                    const a =
                      p.milestoneBaseOpacity +
                      (p.milestonePeakOpacity - p.milestoneBaseOpacity) * Math.sin(Math.PI * pulse);
                    return (
                      <path
                        key={`m${mx}`}
                        d={`M ${mx} ${yc - DIAMOND_HALF} L ${mx + DIAMOND_HALF} ${yc} L ${mx} ${yc + DIAMOND_HALF} L ${mx - DIAMOND_HALF} ${yc} Z`}
                        fill={p.ganttTrackColor}
                        opacity={a * ganttOpacity}
                      />
                    );
                  })}
                  {progressX > x0 && fillAlpha > 0 ? (
                    <rect
                      x={x0}
                      y={yc - 2}
                      width={Math.min(progressX, x1) - x0}
                      height={4}
                      fill={p.ganttFillColor}
                      opacity={p.ganttFillOpacity * fillAlpha * ganttOpacity}
                    />
                  ) : null}
                </g>
              );
            })
          : null}
      </svg>

      {/* 7. Grain */}
      {p.grainAmount > 0 ? (
        <>
          <Grain amount={p.grainAmount} seed={p.grainSeed} sign={1} />
          <Grain amount={p.grainAmount} seed={p.grainSeed} sign={-1} />
        </>
      ) : null}
    </AbsoluteFill>
  );
};
