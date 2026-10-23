import { karanaName, tithiName, VISHTI_CYCLE_INDEX } from './names';
import { lahiriAyanamsa, siderealMoon, siderealSun } from './ephemeris';
import { addDays, daysBetween, fromJulianDay, julianDay, normalize360, toLocal, type CivilDate } from './time';
import { sunTimes, type Place } from './sunrise';

const NAKSHATRA_WIDTH = 360 / 27;

/** Angle (0-360, monotonically increasing in time) whose segments define an element. */
type AngleFn = (jd: number) => number;

const elongation: AngleFn = (jd) => normalize360(siderealMoon(jd) - siderealSun(jd));
const moonAngle: AngleFn = (jd) => siderealMoon(jd);
const yogaAngle: AngleFn = (jd) => normalize360(siderealSun(jd) + siderealMoon(jd));

export type Span = {
  /** Index of the element (tithi 0-29, nakshatra 0-26, yoga 0-26, karana 0-59). */
  index: number;
  /** When this element ends. */
  end: Date;
};

/** Time at which `angle` next reaches `target` after `jd0` (angle moves forward by < 40° in 3 days). */
function nextCrossing(angle: AngleFn, target: number, jd0: number): number {
  const base = angle(jd0);
  const wanted = normalize360(target - base);
  let lo = jd0;
  let hi = jd0 + 3;
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2;
    if (normalize360(angle(mid) - base) < wanted) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/**
 * Consecutive elements covering [from, until]: the one active at `from` and the
 * following ones, each with its end time.
 */
function spansBetween(angle: AngleFn, width: number, count: number, from: Date, until: Date): Span[] {
  const jdFrom = julianDay(from);
  const jdUntil = julianDay(until);
  let index = Math.floor(angle(jdFrom) / width) % count;
  let cursor = jdFrom;
  const result: Span[] = [];
  for (let guard = 0; guard < 8; guard++) {
    const endJd = nextCrossing(angle, ((index + 1) * width) % 360, cursor);
    result.push({ index, end: fromJulianDay(endJd) });
    if (endJd >= jdUntil) break;
    cursor = endJd + 1e-6;
    index = (index + 1) % count;
  }
  return result;
}

export const tithiSpans = (from: Date, until: Date) => spansBetween(elongation, 12, 30, from, until);
export const karanaSpans = (from: Date, until: Date) => spansBetween(elongation, 6, 60, from, until);
export const nakshatraSpans = (from: Date, until: Date) => spansBetween(moonAngle, NAKSHATRA_WIDTH, 27, from, until);
export const yogaSpans = (from: Date, until: Date) => spansBetween(yogaAngle, NAKSHATRA_WIDTH, 27, from, until);

/**
 * The span that covers most of [from, until]. Used to pick the tithi or
 * nakshatra that "belongs" to a daytime.
 */
export function dominantSpan(spans: Span[], from: Date, until: Date): Span {
  let best = spans[0];
  let bestLength = -1;
  let cursor = from.getTime();
  for (const span of spans) {
    const end = Math.min(span.end.getTime(), until.getTime());
    const length = end - cursor;
    if (length > bestLength) {
      best = span;
      bestLength = length;
    }
    cursor = Math.max(cursor, end);
  }
  return best;
}

export const rashiAt = (jd: number): number => Math.floor(siderealSun(jd) / 30) % 12;
export const moonRashiAt = (jd: number): number => Math.floor(siderealMoon(jd) / 30) % 12;

export type TamilDate = {
  /** Gregorian year in which the current Tamil year began (April). */
  yearStartGregorian: number;
  /** Index into TAMIL_YEARS. */
  yearIndex: number;
  /** Index into TAMIL_MONTHS (= Sun's sidereal rashi). */
  month: number;
  day: number;
};

/**
 * Tamil solar date. The month begins on the civil day in which the Sun enters
 * the next rashi before sunset; otherwise on the following day.
 */
export function tamilDate(date: CivilDate, place: Place): TamilDate {
  const { sunset } = sunTimes(date, place);
  const jdSunset = julianDay(sunset);
  const month = rashiAt(jdSunset);

  // Latest time the Sun crossed the start of this rashi.
  const target = month * 30;
  const wrap = (jd: number) => ((siderealSun(jd) - target + 540) % 360) - 180;
  let lo = jdSunset - 40;
  let hi = jdSunset;
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2;
    if (wrap(mid) < 0) lo = mid;
    else hi = mid;
  }
  const sankranti = fromJulianDay((lo + hi) / 2);

  const local = toLocal(sankranti, place.utcOffsetMin);
  const sunsetThatDay = toLocal(sunTimes(local.date, place).sunset, place.utcOffsetMin).minutes;
  const startDate = local.minutes < sunsetThatDay ? local.date : addDays(local.date, 1);
  const day = daysBetween(startDate, date) + 1;

  // Months Thai-Panguni (9-11) always fall in the year after the April it began; Margazhi may straddle January.
  const startYear = month >= 9 ? date.y - 1 : date.m >= 4 ? date.y : date.y - 1;
  const yearIndex = (((startYear - 1987) % 60) + 60) % 60;
  return { yearStartGregorian: startYear, yearIndex, month, day };
}

export type DayPanchang = {
  date: CivilDate;
  place: Place;
  sunrise: Date;
  sunset: Date;
  nextSunrise: Date;
  tithi: Span[];
  nakshatra: Span[];
  yoga: Span[];
  karana: Span[];
  tamil: TamilDate;
};

/** Panchang elements for the civil day, from sunrise to the next sunrise. */
export function dayPanchang(date: CivilDate, place: Place): DayPanchang {
  const { sunrise, sunset } = sunTimes(date, place);
  const nextSunrise = sunTimes(addDays(date, 1), place).sunrise;
  return {
    date,
    place,
    sunrise,
    sunset,
    nextSunrise,
    tithi: tithiSpans(sunrise, nextSunrise),
    nakshatra: nakshatraSpans(sunrise, nextSunrise),
    yoga: yogaSpans(sunrise, nextSunrise),
    karana: karanaSpans(sunrise, nextSunrise),
    tamil: tamilDate(date, place),
  };
}

export type Paksha = 'shukla' | 'krishna';
export const pakshaOf = (tithiIndex: number): Paksha => (tithiIndex < 15 ? 'shukla' : 'krishna');
/** Position within the paksha, 1-15 (Amavasai = 15 of krishna). */
export const tithiPosition = (tithiIndex: number): number => (tithiIndex % 15) + 1;
export const isVishti = (karanaIndex: number): boolean =>
  karanaIndex !== 0 && karanaIndex < 57 && (karanaIndex - 1) % 7 === VISHTI_CYCLE_INDEX;

export { karanaName, lahiriAyanamsa, tithiName };
