import type { Interval } from './intervals';
import { mergeIntervals } from './intervals';
import { civilToUtcMidnight, type CivilDate } from './time';

/** 1-based eighth of the day for each weekday (index 0 = Sunday). */
const RAHU_PART = [8, 2, 7, 5, 6, 4, 3];
const YAMA_PART = [5, 4, 3, 2, 1, 7, 6];
const KULIGAI_PART = [7, 6, 5, 4, 3, 2, 1];

export type DayPartKind = 'rahu' | 'yama' | 'kuligai';

/** The eighth of daylight (sunrise to sunset) used by Rahu Kalam, Yamagandam or Kuligai. */
export function dayPart(kind: DayPartKind, weekday: number, sunrise: Date, sunset: Date): Interval {
  const part = { rahu: RAHU_PART, yama: YAMA_PART, kuligai: KULIGAI_PART }[kind][weekday];
  const eighth = (sunset.getTime() - sunrise.getTime()) / 8;
  const start = sunrise.getTime() + (part - 1) * eighth;
  return { start, end: start + eighth };
}

/** Abhijit muhurta: the eighth of fifteen day-muhurtas (around midday). Not used on Wednesdays. */
export function abhijit(weekday: number, sunrise: Date, sunset: Date): Interval | null {
  if (weekday === 3) return null;
  const muhurta = (sunset.getTime() - sunrise.getTime()) / 15;
  const start = sunrise.getTime() + 7 * muhurta;
  return { start, end: start + muhurta };
}

/**
 * Brahma Muhurtham: the sacred pre-dawn muhurta — 2 muhurtas (96 min) to 1 muhurta (48 min)
 * before local sunrise, lasting 48 minutes every day.
 */
export function brahmaMuhurtham(sunrise: Date): Interval {
  const sr = sunrise.getTime();
  return { start: sr - 96 * 60_000, end: sr - 48 * 60_000 };
}

/** Planet indices (into PLANETS) in hora order, starting with the Sun. */
const HORA_ORDER = [0, 5, 3, 1, 6, 4, 2]; // Sun, Venus, Mercury, Moon, Saturn, Jupiter, Mars
/** Lord of each weekday, as an index into PLANETS (Sunday … Saturday). */
const DAY_LORD = [0, 1, 2, 3, 4, 5, 6];

export type HoraQuality = 'good' | 'mixed' | 'avoid';

export const HORA_QUALITY: Record<number, HoraQuality> = {
  0: 'mixed', // Sun
  1: 'good', // Moon
  2: 'avoid', // Mars
  3: 'good', // Mercury
  4: 'good', // Jupiter
  5: 'good', // Venus
  6: 'avoid', // Saturn
};

export type Hora = Interval & { planet: number; quality: HoraQuality; night: boolean };

/**
 * 24 horas of a day: 12 between sunrise and sunset, 12 between sunset and the
 * next sunrise, each lasting an equal share of its half.
 */
export function horas(weekday: number, sunrise: Date, sunset: Date, nextSunrise: Date): Hora[] {
  const first = HORA_ORDER.indexOf(DAY_LORD[weekday]);
  const dayLen = (sunset.getTime() - sunrise.getTime()) / 12;
  const nightLen = (nextSunrise.getTime() - sunset.getTime()) / 12;
  return Array.from({ length: 24 }, (_, i) => {
    const night = i >= 12;
    const start = night ? sunset.getTime() + (i - 12) * nightLen : sunrise.getTime() + i * dayLen;
    const planet = HORA_ORDER[(first + i) % 7];
    return { start, end: start + (night ? nightLen : dayLen), planet, quality: HORA_QUALITY[planet], night };
  });
}

/**
 * Good hora windows with the inauspicious day-parts removed is computed by the
 * caller; this just merges neighbouring good horas into continuous windows.
 */
export function goodHoraWindows(list: Hora[]): Interval[] {
  return mergeIntervals(list.filter((h) => h.quality === 'good').map(({ start, end }) => ({ start, end })));
}

export type CalendarWindow = { morning: Interval | null; evening: Interval | null };

type MinRange = [number, number] | null;

// Traditional Tamil daily calendar (Pambu / Sivakasi) weekday slots, in minutes from local midnight.
// Index 0 = Sunday … 6 = Saturday.
const TRADITIONAL_NALLA_NERAM: [MinRange, MinRange][] = [
  [[465, 525], [915, 975]], // Sun: 7:45–8:45 AM, 3:15–4:15 PM
  [[375, 435], [1005, 1065]], // Mon: 6:15–7:15 AM, 4:45–5:45 PM
  [[465, 525], [1005, 1065]], // Tue: 7:45–8:45 AM, 4:45–5:45 PM
  [[555, 615], [840, 900]], // Wed: 9:15–10:15 AM, 2:00–3:00 PM
  [[645, 705], [735, 795]], // Thu: 10:45–11:45 AM, 12:15–1:15 PM
  [[555, 615], [1005, 1065]], // Fri: 9:15–10:15 AM, 4:45–5:45 PM
  [[645, 705], [1005, 1065]], // Sat: 10:45–11:45 AM, 4:45–5:45 PM
];

const GOWRI_NALLA_NERAM: [MinRange, MinRange][] = [
  [[645, 705], [810, 870]], // Sun: 10:45–11:45 AM, 1:30–2:30 PM
  [[555, 615], [1170, 1230]], // Mon: 9:15–10:15 AM, 7:30–8:30 PM
  [[645, 705], [1170, 1230]], // Tue: 10:45–11:45 AM, 7:30–8:30 PM
  [[645, 705], [1110, 1170]], // Wed: 10:45–11:45 AM, 6:30–7:30 PM
  [null, [1110, 1170]], // Thu: —, 6:30–7:30 PM
  [[735, 795], [1110, 1170]], // Fri: 12:15–1:15 PM, 6:30–7:30 PM
  [[735, 795], [1290, 1350]], // Sat: 12:15–1:15 PM, 9:30–10:30 PM
];

function toCalendarWindow(date: CivilDate, utcOffsetMin: number, [morning, evening]: [MinRange, MinRange]): CalendarWindow {
  const localMidnight = civilToUtcMidnight(date) - utcOffsetMin * 60_000;
  const toInterval = (r: MinRange): Interval | null =>
    r ? { start: localMidnight + r[0] * 60_000, end: localMidnight + r[1] * 60_000 } : null;
  return { morning: toInterval(morning), evening: toInterval(evening) };
}

/** Standard printed Tamil calendar Nalla Neram (Morning & Evening) for a weekday (fixed 6–6). */
export function traditionalNallaNeram(date: CivilDate, weekday: number, utcOffsetMin: number): CalendarWindow {
  return toCalendarWindow(date, utcOffsetMin, TRADITIONAL_NALLA_NERAM[weekday]);
}

/** Standard printed Tamil calendar Gowri Nalla Neram (Morning & Evening) for a weekday (fixed 6–6). */
export function gowriNallaNeram(date: CivilDate, weekday: number, utcOffsetMin: number): CalendarWindow {
  return toCalendarWindow(date, utcOffsetMin, GOWRI_NALLA_NERAM[weekday]);
}

// Sunrise-scaled Thirukanitha Nalla Neram: 1 daytime hora (daylight / 12) starting at half-hora offsets (daylight / 24).
const THIRUKANITHA_NALLA_HALF_HORA: [number | null, number | null][] = [
  [3, null], // Sun
  [1, 21], // Mon
  [3, 21], // Tue
  [7, 21], // Wed
  [9, 21], // Thu
  [7, 21], // Fri
  [3, 21], // Sat
];

/** Sunrise-scaled Thirukanitha Nalla Neram (Morning & Evening) for a weekday. */
export function thirukanithaNallaNeram(weekday: number, sunrise: Date, sunset: Date): CalendarWindow {
  const halfHora = (sunset.getTime() - sunrise.getTime()) / 24;
  const slot = (h: number | null): Interval | null =>
    h === null ? null : { start: sunrise.getTime() + h * halfHora, end: sunrise.getTime() + (h + 2) * halfHora };
  const [m, e] = THIRUKANITHA_NALLA_HALF_HORA[weekday];
  return { morning: slot(m), evening: slot(e) };
}

// Sunrise-scaled Thirukanitha Gowri Panchangam auspicious daytime eighths (1-based).
const THIRUKANITHA_GOWRI_PARTS: [number, number][] = [
  [2, 4], // Sun
  [1, 5], // Mon
  [2, 8], // Tue
  [1, 7], // Wed
  [5, 8], // Thu
  [5, 8], // Fri
  [4, 7], // Sat
];

/** Sunrise-scaled Thirukanitha Gowri Nalla Neram (two auspicious daytime eighths). */
export function thirukanithaGowriNallaNeram(weekday: number, sunrise: Date, sunset: Date): CalendarWindow {
  const eighth = (sunset.getTime() - sunrise.getTime()) / 8;
  const part = (p: number): Interval => ({
    start: sunrise.getTime() + (p - 1) * eighth,
    end: sunrise.getTime() + p * eighth,
  });
  const [a, b] = THIRUKANITHA_GOWRI_PARTS[weekday];
  return { morning: part(a), evening: part(b) };
}
