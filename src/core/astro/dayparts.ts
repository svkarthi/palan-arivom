import type { Interval } from './intervals';
import { mergeIntervals } from './intervals';

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
