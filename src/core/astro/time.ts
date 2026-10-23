/** Calendar date on the civil (wall-clock) calendar of a place; month is 1-12. */
export type CivilDate = { y: number; m: number; d: number };

const DAY_MS = 86_400_000;
const UNIX_EPOCH_JD = 2440587.5;

export const julianDay = (date: Date): number => date.getTime() / DAY_MS + UNIX_EPOCH_JD;
export const fromJulianDay = (jd: number): Date => new Date((jd - UNIX_EPOCH_JD) * DAY_MS);

export const civilToUtcMidnight = ({ y, m, d }: CivilDate): number => Date.UTC(y, m - 1, d);

export function addDays(date: CivilDate, days: number): CivilDate {
  const t = new Date(civilToUtcMidnight(date) + days * DAY_MS);
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
}

export const daysBetween = (from: CivilDate, to: CivilDate): number =>
  Math.round((civilToUtcMidnight(to) - civilToUtcMidnight(from)) / DAY_MS);

export const sameDate = (a: CivilDate, b: CivilDate): boolean => a.y === b.y && a.m === b.m && a.d === b.d;

/** 0 = Sunday … 6 = Saturday. */
export const weekdayOf = ({ y, m, d }: CivilDate): number => new Date(Date.UTC(y, m - 1, d)).getUTCDay();

export const daysInMonth = (y: number, m: number): number => new Date(Date.UTC(y, m, 0)).getUTCDate();

/** The civil date and minutes-after-midnight of an instant in a fixed-offset zone. */
export function toLocal(instant: Date, utcOffsetMin: number): { date: CivilDate; minutes: number } {
  const shifted = new Date(instant.getTime() + utcOffsetMin * 60_000);
  return {
    date: { y: shifted.getUTCFullYear(), m: shifted.getUTCMonth() + 1, d: shifted.getUTCDate() },
    minutes: shifted.getUTCHours() * 60 + shifted.getUTCMinutes() + shifted.getUTCSeconds() / 60,
  };
}

/** "6:12 AM"-style time in a fixed-offset zone, independent of the device time zone. */
export function formatClock(instant: Date, utcOffsetMin: number): string {
  const { minutes } = toLocal(instant, utcOffsetMin);
  const total = Math.floor(minutes + 1e-6);
  const h24 = Math.floor(total / 60) % 24;
  const mm = total % 60;
  const suffix = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(mm).padStart(2, '0')} ${suffix}`;
}

export const normalize360 = (deg: number): number => ((deg % 360) + 360) % 360;
