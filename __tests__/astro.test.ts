import { abhijit, dayPart, gowriNallaNeram, horas, traditionalNallaNeram } from '../src/core/astro/dayparts';
import { moonMeanTrueLongitude, sunLongitude } from '../src/core/astro/ephemeris';
import { mergeIntervals, subtractIntervals } from '../src/core/astro/intervals';
import { PLACES, placeById } from '../src/core/astro/places';
import { dayPanchang, lagnaSpans, tamilDate, tithiSpans } from '../src/core/astro/panchang';
import { sunTimes } from '../src/core/astro/sunrise';
import { addDays, daysBetween, formatClock, weekdayOf } from '../src/core/astro/time';

const MIN = 60_000;
const chennai = placeById('chennai');

describe('ephemeris', () => {
  it('matches the Meeus example for the Moon (1992-04-12 0h TD)', () => {
    // Example 47.a: λ = 133.162655° before nutation. Passing UT so that UT + ΔT = JDE.
    const jdUt = 2448724.5 - 69 / 86400;
    expect(moonMeanTrueLongitude(jdUt)).toBeCloseTo(133.162655, 2);
  });

  it('matches the Meeus example for the Sun (1992-10-13 0h TD)', () => {
    // Example 25.a: apparent longitude 199.90895°.
    const jdUt = 2448908.5 - 69 / 86400;
    expect(sunLongitude(jdUt)).toBeCloseTo(199.90895, 2);
  });
});

describe('lunar phases', () => {
  const from = (iso: string) => new Date(iso);

  it('ends the tithi at the 2025-10-21 new moon (~12:25 UTC)', () => {
    const spans = tithiSpans(from('2025-10-21T00:00:00Z'), from('2025-10-22T00:00:00Z'));
    expect(spans[0].index).toBe(29); // Amavasai
    const expected = from('2025-10-21T12:25:00Z').getTime();
    expect(Math.abs(spans[0].end.getTime() - expected)).toBeLessThan(6 * MIN);
  });

  it('ends the tithi at the 2025-10-07 full moon (~03:47 UTC)', () => {
    const spans = tithiSpans(from('2025-10-06T20:00:00Z'), from('2025-10-07T20:00:00Z'));
    expect(spans[0].index).toBe(14); // Pournami
    const expected = from('2025-10-07T03:47:00Z').getTime();
    expect(Math.abs(spans[0].end.getTime() - expected)).toBeLessThan(6 * MIN);
  });
});

describe('sunrise and sunset', () => {
  it('gives plausible times for Chennai on 2025-01-01', () => {
    const { sunrise, sunset } = sunTimes({ y: 2025, m: 1, d: 1 }, chennai);
    expect(formatClock(sunrise, 330)).toMatch(/^6:(2[5-9]|3\d) AM$/);
    expect(formatClock(sunset, 330)).toMatch(/^5:(4[5-9]|5\d) PM$/);
  });

  it('handles places east of UTC+5:30 whose sunrise falls on the previous UTC day', () => {
    const sg = placeById('singapore');
    const { sunrise, sunset } = sunTimes({ y: 2025, m: 6, d: 1 }, sg);
    expect(formatClock(sunrise, 480)).toMatch(/^6:5\d AM$/);
    expect(sunset.getTime()).toBeGreaterThan(sunrise.getTime());
  });

  it('works for every listed place', () => {
    for (const p of PLACES) {
      const { sunrise, sunset } = sunTimes({ y: 2025, m: 3, d: 21 }, p);
      const hours = (sunset.getTime() - sunrise.getTime()) / 3_600_000;
      expect(hours).toBeGreaterThan(11);
      expect(hours).toBeLessThan(13.2);
    }
  });
});

describe('day parts', () => {
  const sunrise = new Date('2025-01-06T00:30:00Z'); // 06:00 IST
  const sunset = new Date('2025-01-06T12:30:00Z'); // 18:00 IST
  const ist = (i: { start: number; end: number }) => [formatClock(new Date(i.start), 330), formatClock(new Date(i.end), 330)];

  it('places Rahu Kalam by weekday', () => {
    expect(ist(dayPart('rahu', 1, sunrise, sunset))).toEqual(['7:30 AM', '9:00 AM']); // Monday
    expect(ist(dayPart('rahu', 0, sunrise, sunset))).toEqual(['4:30 PM', '6:00 PM']); // Sunday
  });

  it('places Yamagandam and Kuligai on Sunday', () => {
    expect(ist(dayPart('yama', 0, sunrise, sunset))).toEqual(['12:00 PM', '1:30 PM']);
    expect(ist(dayPart('kuligai', 0, sunrise, sunset))).toEqual(['3:00 PM', '4:30 PM']);
  });

  it('puts Abhijit around midday and skips Wednesday', () => {
    expect(ist(abhijit(1, sunrise, sunset)!)).toEqual(['11:36 AM', '12:24 PM']);
    expect(abhijit(3, sunrise, sunset)).toBeNull();
  });

  it('runs the hora sequence from the day lord into the next day', () => {
    const next = new Date('2025-01-07T00:30:00Z');
    const sunday = horas(0, sunrise, sunset, next);
    expect(sunday.slice(0, 4).map((h) => h.planet)).toEqual([0, 5, 3, 1]); // Sun, Venus, Mercury, Moon
    expect(sunday).toHaveLength(24);
    const monday = horas(1, next, new Date('2025-01-07T12:30:00Z'), new Date('2025-01-08T00:30:00Z'));
    expect(monday[0].planet).toBe(1); // Moon
    expect((sunday[23].planet + 0) % 7).toBe(3); // Mercury, then the Moon starts Monday
  });

  it('matches printed Tamil calendar Nalla Neram and Gowri Nalla Neram for Sunday 22 Nov 2026', () => {
    const d = { y: 2026, m: 11, d: 22 }; // Sunday
    const nn = traditionalNallaNeram(d, weekdayOf(d), 330);
    const gowri = gowriNallaNeram(d, weekdayOf(d), 330);
    expect(ist(nn.morning!)).toEqual(['7:45 AM', '8:45 AM']);
    expect(ist(nn.evening!)).toEqual(['3:15 PM', '4:15 PM']);
    expect(ist(gowri.morning!)).toEqual(['10:45 AM', '11:45 AM']);
    expect(ist(gowri.evening!)).toEqual(['1:30 PM', '2:30 PM']);
  });
});

describe('intervals', () => {
  it('merges and subtracts', () => {
    expect(mergeIntervals([{ start: 5, end: 8 }, { start: 1, end: 3 }, { start: 2, end: 4 }])).toEqual([
      { start: 1, end: 4 },
      { start: 5, end: 8 },
    ]);
    expect(subtractIntervals([{ start: 0, end: 10 }], [{ start: 2, end: 3 }, { start: 8, end: 12 }])).toEqual([
      { start: 0, end: 2 },
      { start: 3, end: 8 },
    ]);
  });
});

describe('Tamil calendar', () => {
  it('starts Thai on Pongal day 2026', () => {
    const t = tamilDate({ y: 2026, m: 1, d: 14 }, chennai);
    expect(t.month).toBe(9);
    expect(t.day).toBe(1);
    expect(tamilDate({ y: 2026, m: 1, d: 13 }, chennai).month).toBe(8); // Margazhi
  });

  it('starts Chithirai and the new Tamil year on 14 April', () => {
    const t2025 = tamilDate({ y: 2025, m: 4, d: 14 }, chennai);
    expect([t2025.month, t2025.day, t2025.yearIndex]).toEqual([0, 1, 38]); // Viswavasu
    const t2026 = tamilDate({ y: 2026, m: 4, d: 14 }, chennai);
    expect([t2026.month, t2026.day, t2026.yearIndex]).toEqual([0, 1, 39]); // Parabhava
    expect(tamilDate({ y: 2026, m: 4, d: 13 }, chennai).yearIndex).toBe(38);
  });

  it('counts days within the month', () => {
    expect(tamilDate({ y: 2025, m: 4, d: 20 }, chennai).day).toBe(7);
  });
});

describe('dayPanchang', () => {
  it('returns consistent elements covering sunrise to next sunrise', () => {
    const p = dayPanchang({ y: 2025, m: 10, d: 21 }, chennai);
    for (const list of [p.tithi, p.nakshatra, p.yoga, p.karana]) {
      expect(list.length).toBeGreaterThan(0);
      expect(list[list.length - 1].end.getTime()).toBeGreaterThanOrEqual(p.nextSunrise.getTime());
    }
    expect(p.tithi[0].index).toBe(29);
  });

  it('computes monotonic lagnaSpans across a full day', () => {
    for (const id of ['chennai', 'delhi']) {
      const place = placeById(id);
      const { sunrise } = sunTimes({ y: 2026, m: 6, d: 21 }, place);
      const nextSunrise = sunTimes({ y: 2026, m: 6, d: 22 }, place).sunrise;
      const spans = lagnaSpans(place, sunrise, nextSunrise);
      expect(spans.length).toBeGreaterThanOrEqual(12);
      expect(spans.length).toBeLessThanOrEqual(14);
      let prev = sunrise.getTime();
      for (const s of spans) {
        const durMin = (s.end.getTime() - prev) / MIN;
        expect(durMin).toBeGreaterThan(0);
        expect(durMin).toBeLessThan(210);
        prev = s.end.getTime();
      }
      expect(spans[spans.length - 1].end.getTime()).toBeGreaterThanOrEqual(nextSunrise.getTime());
    }
  });
});

describe('date helpers', () => {
  it('computes weekdays and day differences', () => {
    expect(weekdayOf({ y: 2025, m: 1, d: 6 })).toBe(1);
    expect(addDays({ y: 2025, m: 12, d: 31 }, 1)).toEqual({ y: 2026, m: 1, d: 1 });
    expect(daysBetween({ y: 2025, m: 1, d: 1 }, { y: 2025, m: 3, d: 1 })).toBe(59);
  });
});
