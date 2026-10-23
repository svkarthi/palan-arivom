import { ZONES, type Zone } from '../data/zones';

export const normalizeDegrees = (deg: number): number => ((deg % 360) + 360) % 360;

/**
 * Compass heading (clockwise degrees from magnetic north) from a magnetometer
 * reading taken with the phone held flat and its top edge pointing ahead.
 */
export function headingFromMagnetometer(x: number, y: number): number {
  const angle = (Math.atan2(y, x) * 180) / Math.PI;
  return normalizeDegrees(angle - 90);
}

/** Smallest signed difference between two headings, in -180..180. */
export function angleDelta(from: number, to: number): number {
  return ((to - from + 540) % 360) - 180;
}

/** Exponential low-pass filter that is safe across the 359°→0° wrap. */
export function smoothHeading(previous: number | null, next: number, alpha = 0.2): number {
  if (previous === null) return next;
  return normalizeDegrees(previous + alpha * angleDelta(previous, next));
}

/** The 16-way zone that a heading falls into. */
export function zoneForHeading(heading: number): Zone {
  const index = Math.round(normalizeDegrees(heading) / 22.5) % 16;
  return ZONES[index];
}
