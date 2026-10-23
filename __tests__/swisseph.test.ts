/**
 * Regression test against Swiss Ephemeris values from tamil-panchang-api
 * (MIT, https://github.com/karthiknitt/tamil-panchang-api). The reference values are in
 * fixtures/swisseph-chennai-2026.json; the app's own Meeus-based engine must stay close.
 */
import fixture from './fixtures/swisseph-chennai-2026.json';
import { dayPanchang } from '../src/core/astro/panchang';
import { placeById } from '../src/core/astro/places';
import { toLocal } from '../src/core/astro/time';
import { nallaNeramDay } from '../src/features/nalla-neram/logic';

const chennai = placeById('chennai');
const seconds = (hms: string) => {
  const [h, m, s] = hms.split(':').map(Number);
  return h * 3600 + m * 60 + s;
};
/** Seconds since local midnight of the civil date. */
const localSeconds = (at: Date | number) => {
  const { minutes } = toLocal(new Date(at), chennai.utcOffsetMin);
  return minutes * 60;
};

describe('engine vs Swiss Ephemeris (Chennai, 2026)', () => {
  it.each(fixture.days)('$date', (ref) => {
    const [y, m, d] = ref.date.split('-').map(Number);
    const day = nallaNeramDay({ y, m, d }, chennai);
    const p = day.panchang;

    expect(Math.abs(localSeconds(p.sunrise) - seconds(ref.sunrise))).toBeLessThan(30);
    expect(Math.abs(localSeconds(p.sunset) - seconds(ref.sunset))).toBeLessThan(30);

    expect(p.tithi[0].index + 1).toBe(ref.tithi.number);
    expect(p.nakshatra[0].index + 1).toBe(ref.nakshatra.number);
    expect(p.yoga[0].index + 1).toBe(ref.yoga.number);

    const base = Date.UTC(y, m - 1, d) - chennai.utcOffsetMin * 60_000;
    for (const [mine, theirs] of [
      [p.tithi[0], ref.tithi],
      [p.nakshatra[0], ref.nakshatra],
      [p.yoga[0], ref.yoga],
    ] as const) {
      if (theirs.end) {
        expect(Math.abs((mine.end.getTime() - base) / 1000 - seconds(theirs.end))).toBeLessThan(5 * 60);
      }
    }

    const startOf = (i: { start: number }) => (i.start - base) / 1000;
    expect(Math.abs(startOf(day.rahu) - seconds(ref.rahuStart))).toBeLessThan(60);
    expect(Math.abs(startOf(day.yama) - seconds(ref.yamaStart))).toBeLessThan(60);
    expect(Math.abs(startOf(day.kuligai) - seconds(ref.gulikaiStart))).toBeLessThan(60);
  });
});
