// Deterministic, device-independent flower placement. A flower seeded by its check-in id
// gets the same jittered home on every device and every reload (spec §4.2 / §6.1).

export interface BedRect { x: number; y: number; width: number; height: number; }
export interface Point { x: number; y: number; }

// cyrb53 — a fast, well-distributed 53-bit string hash. No Math.random anywhere.
export function hashSeed(seed: string): number {
  let h1 = 0xdeadbeef ^ seed.length;
  let h2 = 0x41c6ce57 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    const ch = seed.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

// Two independent floats in [0,1) from one seed (salt the second draw).
function seededPair(seed: string): [number, number] {
  const a = hashSeed(seed) % 1_000_003;
  const b = hashSeed(`${seed}::y`) % 1_000_003;
  return [a / 1_000_003, b / 1_000_003];
}

// One jittered point inside the bed, kept `margin` (fraction) off the edges.
export function seededFlowerPosition(seed: string, bed: BedRect, margin = 0.12): Point {
  const [u, v] = seededPair(seed);
  const mx = bed.width * margin;
  const my = bed.height * margin;
  return {
    x: bed.x + mx + u * (bed.width - 2 * mx),
    y: bed.y + my + v * (bed.height - 2 * my),
  };
}

// Place a list of seeds, re-jittering (with a salted seed) on collision so it reads
// "tended scatter," never clutter. Falls back to the last candidate after maxTries.
export function placeFlowers(seeds: string[], bed: BedRect, minDist: number, maxTries = 24): Point[] {
  const placed: Point[] = [];
  for (const seed of seeds) {
    let candidate = seededFlowerPosition(seed, bed);
    for (let t = 0; t < maxTries; t++) {
      const ok = placed.every((p) => Math.hypot(p.x - candidate.x, p.y - candidate.y) >= minDist);
      if (ok) break;
      candidate = seededFlowerPosition(`${seed}::retry${t}`, bed);
    }
    placed.push(candidate);
  }
  return placed;
}
