import { organicBlobPath } from '../organicBlob';

describe('organicBlobPath', () => {
  it('returns a closed cubic-bezier path (M … C … Z)', () => {
    const d = organicBlobPath(100, 100, 80, 40);
    expect(d.startsWith('M ')).toBe(true);
    expect(d).toContain('C ');
    expect(d.trim().endsWith('Z')).toBe(true);
  });

  it('is deterministic for the same inputs (no RNG — never reshuffles between renders)', () => {
    expect(organicBlobPath(100, 100, 80, 40, 0)).toBe(organicBlobPath(100, 100, 80, 40, 0));
  });

  it('is an IMPERFECT ellipse — at least one vertex pushes past the base radius', () => {
    const d = organicBlobPath(0, 0, 100, 100, 0, 18);
    const nums = (d.match(/-?\d+\.?\d*/g) ?? []).map(Number);
    // A perfect ellipse would cap coordinates at the radius (100); the wobble must exceed it.
    expect(Math.max(...nums.map(Math.abs))).toBeGreaterThan(101);
  });

  it('different phase => different shape (so nested blobs do not perfectly overlap)', () => {
    expect(organicBlobPath(0, 0, 100, 50, 0)).not.toBe(organicBlobPath(0, 0, 100, 50, 2.5));
  });
});
