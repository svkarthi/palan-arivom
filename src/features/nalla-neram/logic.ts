import { abhijit, dayPart, goodHoraWindows, horas, type Hora } from '@core/astro/dayparts';
import { subtractIntervals, type Interval } from '@core/astro/intervals';
import { dayPanchang, type DayPanchang } from '@core/astro/panchang';
import type { Place } from '@core/astro/sunrise';
import { specialDays, type SpecialDay } from '@core/astro/specialDays';
import { weekdayOf, type CivilDate } from '@core/astro/time';

const MIN_WINDOW_MS = 15 * 60_000;

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
  /** Good-hora windows with Rahu Kalam, Yamagandam and Kuligai removed. */
  goodWindows: Interval[];
};

export function nallaNeramDay(date: CivilDate, place: Place): NallaNeramDay {
  const panchang = dayPanchang(date, place);
  const { sunrise, sunset, nextSunrise } = panchang;
  const weekday = weekdayOf(date);
  const rahu = dayPart('rahu', weekday, sunrise, sunset);
  const yama = dayPart('yama', weekday, sunrise, sunset);
  const kuligai = dayPart('kuligai', weekday, sunrise, sunset);
  const list = horas(weekday, sunrise, sunset, nextSunrise);
  const goodWindows = subtractIntervals(goodHoraWindows(list), [rahu, yama, kuligai]).filter(
    (w) => w.end - w.start >= MIN_WINDOW_MS,
  );
  return { weekday, panchang, rahu, yama, kuligai, abhijit: abhijit(weekday, sunrise, sunset), horas: list, specials: specialDays(panchang), goodWindows };
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
