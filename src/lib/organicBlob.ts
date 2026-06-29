// A deterministic "imperfect ellipse" — an organic, wobbly blob outline returned as an SVG
// path `d`. Used for the Journey garden bed so its edge reads hand-painted (like the mockup's
// feTurbulence-displaced wash) WITHOUT a live filter, which is too expensive in RN (spec §5).
//
// The wobble is a fixed sum of sines per vertex (no RNG), so the shape is stable across every
// render and never reshuffles. Vertices are stitched with a Catmull-Rom→cubic-bezier spline so
// the outline is irregular but smooth (not spiky). `phase` shifts the wobble so a nested blob
// (e.g. the darker inner soil pool) doesn't trace the exact same edge.
export function organicBlobPath(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  phase = 0,
  n = 18,
): string {
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const w =
      1 +
      0.05 * Math.sin(a * 3 + 0.7 + phase) +
      0.035 * Math.sin(a * 5 + 2.1 + phase) +
      0.02 * Math.sin(a * 2 - 1.2 + phase);
    pts.push([cx + rx * w * Math.cos(a), cy + ry * w * Math.sin(a)]);
  }

  const f = (v: number) => v.toFixed(1);
  const d = [`M ${f(pts[0][0])} ${f(pts[0][1])}`];
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d.push(`C ${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(p2[0])} ${f(p2[1])}`);
  }
  d.push('Z');
  return d.join(' ');
}
