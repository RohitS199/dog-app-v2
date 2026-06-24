import { hashSeed, seededFlowerPosition, placeFlowers, BedRect } from '../gardenPlacement';

const BED: BedRect = { x: 0, y: 0, width: 100, height: 200 };

describe('gardenPlacement', () => {
  it('hashSeed is deterministic for the same seed', () => {
    expect(hashSeed('check-in-abc')).toBe(hashSeed('check-in-abc'));
  });

  it('hashSeed differs for different seeds', () => {
    expect(hashSeed('check-in-abc')).not.toBe(hashSeed('check-in-xyz'));
  });

  it('seededFlowerPosition is stable across calls (same point forever)', () => {
    const a = seededFlowerPosition('seed-1', BED);
    const b = seededFlowerPosition('seed-1', BED);
    expect(a).toEqual(b);
  });

  it('places the point inside the bed (within the margin)', () => {
    const p = seededFlowerPosition('seed-1', BED);
    expect(p.x).toBeGreaterThanOrEqual(BED.x);
    expect(p.x).toBeLessThanOrEqual(BED.x + BED.width);
    expect(p.y).toBeGreaterThanOrEqual(BED.y);
    expect(p.y).toBeLessThanOrEqual(BED.y + BED.height);
  });

  it('placeFlowers keeps every pair at least minDist apart', () => {
    const seeds = ['a', 'b', 'c', 'd', 'e'];
    const pts = placeFlowers(seeds, BED, 20);
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
        expect(d).toBeGreaterThanOrEqual(20 - 1e-6);
      }
    }
  });

  it('placeFlowers is deterministic for the same seed order', () => {
    const seeds = ['a', 'b', 'c'];
    expect(placeFlowers(seeds, BED, 15)).toEqual(placeFlowers(seeds, BED, 15));
  });
});
