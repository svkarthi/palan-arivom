import {
  angleDelta,
  headingFromMagnetometer,
  normalizeDegrees,
  smoothHeading,
  zoneForHeading,
} from '../src/features/vastu/utils/heading';

describe('heading helpers', () => {
  it('normalizes degrees', () => {
    expect(normalizeDegrees(-10)).toBe(350);
    expect(normalizeDegrees(370)).toBe(10);
  });

  it('computes the shortest signed angle', () => {
    expect(angleDelta(350, 10)).toBe(20);
    expect(angleDelta(10, 350)).toBe(-20);
  });

  it('smooths across the 0/360 wrap', () => {
    const next = smoothHeading(350, 10, 0.5);
    expect(next).toBeCloseTo(0, 5);
  });

  it('starts from the first reading', () => {
    expect(smoothHeading(null, 123)).toBe(123);
  });

  it('maps a magnetometer reading to a heading', () => {
    // Field pointing along +y means the phone top is facing north.
    expect(headingFromMagnetometer(0, 1)).toBeCloseTo(0, 5);
    expect(headingFromMagnetometer(1, 0)).toBeCloseTo(270, 5);
  });

  it('finds the 16-way zone for a heading', () => {
    expect(zoneForHeading(0).id).toBe('N');
    expect(zoneForHeading(359).id).toBe('N');
    expect(zoneForHeading(45).id).toBe('NE');
    expect(zoneForHeading(100).id).toBe('E');
    expect(zoneForHeading(225).id).toBe('SW');
  });
});
