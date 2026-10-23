import { abhijit, dayPart, goodHoraWindows, horas, type Hora } from '@core/astro/dayparts';
import { sulamFor, thiyajyamWindows, type Direction, type Thiyajyam } from '@core/astro/dayExtras';
import { subtractIntervals, type Interval } from '@core/astro/intervals';
import { dayPanchang, lagnaSpans, moonRashiSpans, type DayPanchang, type Span } from '@core/astro/panchang';
import type { Place } from '@core/astro/sunrise';
import { specialDays, type SpecialDay } from '@core/astro/specialDays';
import { civilToUtcMidnight, weekdayOf, type CivilDate } from '@core/astro/time';

const MIN_WINDOW_MS = 15 * 60_000;

/** `sun`: eighths of the real sunrise-sunset day. `fixed`: eighths of 6:00-18:00, as printed calendars list them. */
export type DayPartBasis = 'sun' | 'fixed';

export type NallaNeramDay = {
  weekday: number;
  panchang: DayPanchang;
  rahu: Interval;
  yama: Interval;
  kuligai: Interval;
  abhijit: Interval | null;
  horas: Hora[];
  /** Observance days such as Pournami, Pradosham, Karthigai. */
  specials: SpecialDay[];
  /** Direction to avoid and the remedy offering (both are the same direction's). */
  sulam: { direction: Direction; remedy: Direction };
  /** Rising sign through the day, from sunrise; index 0 = Mesha. */
  lagna: Span[];
  /** Moon's rashi through the day. Janma rashi `(r + 5) % 12` has Chandrashtamam while the Moon is in `r`. */
  moonRashi: Span[];
  thiyajyam: Thiyajyam[];
  basis: DayPartBasis;
  /** Good-hora windows with Rahu Kalam, Yamagandam and Kuligai removed. */
  goodWindows: Interval[];
};

export function nallaNeramDay(date: CivilDate, place: Place, basis: DayPartBasis = 'sun'): NallaNeramDay {
  const panchang = dayPanchang(date, place);
  const { sunrise, sunset, nextSunrise } = panchang;
  const weekday = weekdayOf(date);
  const midnight = civilToUtcMidnight(date);
  const partStart = basis === 'fixed' ? new Date(midnight + (360 - place.utcOffsetMin) * 60_000) : sunrise;
  const partEnd = basis === 'fixed' ? new Date(midnight + (1080 - place.utcOffsetMin) * 60_000) : sunset;
  const rahu = dayPart('rahu', weekday, partStart, partEnd);
  const yama = dayPart('yama', weekday, partStart, partEnd);
  const kuligai = dayPart('kuligai', weekday, partStart, partEnd);
  const list = horas(weekday, sunrise, sunset, nextSunrise);
  const goodWindows = subtractIntervals(goodHoraWindows(list), [rahu, yama, kuligai]).filter(
    (w) => w.end - w.start >= MIN_WINDOW_MS,
  );
  return { weekday, panchang, rahu, yama, kuligai, abhijit: abhijit(weekday, sunrise, sunset), horas: list, specials: specialDays(panchang), sulam: sulamFor(weekday), lagna: lagnaSpans(place, sunrise, nextSunrise), moonRashi: moonRashiSpans(sunrise, nextSunrise), thiyajyam: thiyajyamWindows(panchang.nakshatra, sunrise, nextSunrise), basis, goodWindows };
}

export type NowStatus =
  | { kind: 'rahu' | 'yama' | 'kuligai'; until: number }
  | { kind: 'good'; until: number }
  | { kind: 'neutral' };

/** What the current moment is, when the day being viewed contains it. */
export function statusAt(day: NallaNeramDay, now: number): NowStatus | null {
  const { sunrise, nextSunrise } = day.panchang;
  if (now < sunrise.getTime() || now >= nextSunrise.getTime()) return null;
  for (const kind of ['rahu', 'yama', 'kuligai'] as const) {
    const part = day[kind];
    if (now >= part.start && now < part.end) return { kind, until: part.end };
  }
  const window = day.goodWindows.find((w) => now >= w.start && now < w.end);
  return window ? { kind: 'good', until: window.end } : { kind: 'neutral' };
}
