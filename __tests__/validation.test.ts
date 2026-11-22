/**
 * Regression checks against the 2026 lists published by tamildailycalendar.com
 * (Pournami, Amavasai, Pradosham, Karinal and muhurtham dates), read on 23 Oct 2026.
 * They are Vakya-style printed-calendar data, so small differences are expected;
 * the thresholds below record how closely this app agrees today.
 */
import { dayYoga, type DayYoga } from '../src/core/astro/dayExtras';
import { dayPanchang } from '../src/core/astro/panchang';
import { placeById } from '../src/core/astro/places';
import { specialDays, type SpecialId } from '../src/core/astro/specialDays';
import { addDays, type CivilDate } from '../src/core/astro/time';
import { PURPOSE_BY_ID } from '../src/features/nalla-naal/data/purposes';
import { judgeDay } from '../src/features/nalla-naal/logic';
import { nallaNeramDay } from '../src/features/nalla-neram/logic';

const chennai = placeById('chennai');

const SITE = {
  pournami: '1-3 2-1 3-3 4-1 5-1 5-31 6-29 7-29 8-27 9-26 10-25 11-24 12-23',
  amavasai: '1-18 2-17 3-18 4-17 5-16 6-14 7-14 8-12 9-10 10-10 11-8 12-8',
  pradosham: '1-1 1-16 1-30 2-14 3-1 3-16 3-30 4-15 4-29 5-14 5-28 6-12 6-27 7-12 7-26 8-10 8-25 9-8 9-24 10-8 10-23 11-6 11-22 12-6 12-21',
  karinaal:
    '1-15 1-16 1-17 1-25 1-31 2-27 2-28 3-1 3-20 3-29 4-2 4-19 4-28 5-21 5-30 5-31 6-15 6-20 7-18 7-26 8-5 8-19 8-26 9-14 10-3 10-16 10-23 11-6 11-17 11-23 11-26 12-3 12-21 12-24',
  muhurtham:
    '1-28 2-6 2-8 2-13 2-15 2-16 2-20 3-5 3-6 3-8 3-15 3-16 3-25 4-6 4-12 4-13 4-16 4-20 4-23 4-30 5-8 5-13 5-14 5-18 5-28 5-29 6-4 6-7 6-17 6-18 6-24 6-25 7-2 7-5 7-12 8-23 8-30 8-31 9-7 9-13 9-17 10-25 10-30 11-1 11-11 11-13 11-15 11-16 11-20 11-29 12-4 12-6 12-10 12-13 12-14',
};
const list = (s: string) => s.split(' ');

const year = (() => {
  const out: { id: string; date: CivilDate; panchang: ReturnType<typeof dayPanchang>; specials: SpecialId[] }[] = [];
  let date: CivilDate = { y: 2026, m: 1, d: 1 };
  while (date.y === 2026) {
    const panchang = dayPanchang(date, chennai);
    out.push({ id: `${date.m}-${date.d}`, date, panchang, specials: specialDays(panchang).map((s) => s.id) });
    date = addDays(date, 1);
  }
  return out;
})();

const ours = (id: SpecialId) => year.filter((d) => d.specials.includes(id)).map((d) => d.id);
const overlap = (a: string[], b: string[]) => a.filter((x) => b.includes(x)).length;

describe('2026 observance days vs tamildailycalendar.com', () => {
  it('matches every Amavasai date', () => {
    expect(ours('amavasai').sort()).toEqual(list(SITE.amavasai).sort());
  });

  it('matches all but at most one Pournami date', () => {
    const mine = ours('pournami');
    expect(mine).toHaveLength(13);
    expect(overlap(mine, list(SITE.pournami))).toBeGreaterThanOrEqual(12);
  });

  it('matches at least 24 of the 25 Pradosham dates with no more than one extra', () => {
    const mine = ours('pradosham');
    expect(overlap(mine, list(SITE.pradosham))).toBeGreaterThanOrEqual(24);
    expect(mine.length - overlap(mine, list(SITE.pradosham))).toBeLessThanOrEqual(1);
  });

  it('agrees with the October 2026 special days', () => {
    const id = (s: SpecialId) => ours(s).filter((x) => x.startsWith('10-'));
    expect(id('vinayakaChaturthi')).toEqual(['10-14']);
    expect(id('shashti')).toEqual(['10-16']);
    expect(id('sankashti')).toEqual(['10-29']);
    expect(id('karthigai')).toEqual(['10-27']);
  });

  it('flags 23 Oct 2026 as Pradosham and Karinaal, as the daily page does', () => {
    const d = year.find((x) => x.id === '10-23')!;
    expect(d.specials).toEqual(expect.arrayContaining(['pradosham', 'karinaal']));
    expect(d.panchang.tamil).toMatchObject({ month: 6, day: 6, yearIndex: 39 });
  });

  it('flags at least 30 of the 34 Karinal dates, with few extras', () => {
    const mine = ours('karinaal');
    expect(overlap(mine, list(SITE.karinaal))).toBeGreaterThanOrEqual(30);
    expect(mine.length - overlap(mine, list(SITE.karinaal))).toBeLessThanOrEqual(6);
  });
});

describe('2026 muhurtham dates vs Nalla Naal marriage rules', () => {
  const marriage = PURPOSE_BY_ID.marriage;
  const none = { birthNakshatra: null, birthRashi: null };
  const verdict = (id: string) => {
    const d = year.find((x) => x.id === id)!;
    return judgeDay(d.panchang, marriage, none, specialDays(d.panchang));
  };

  it('rates most of the listed wedding dates as fair or better, and none as Amavasai', () => {
    const listed = list(SITE.muhurtham).map(verdict);
    expect(listed.filter((v) => v.score >= 60).length / listed.length).toBeGreaterThanOrEqual(0.85);
    expect(listed.some((v) => v.reasons.some((r) => r.code === 'amavasai'))).toBe(false);
  });

  it('never lists a Tuesday or Saturday, which the rules rate as unfavourable', () => {
    const weekdays = list(SITE.muhurtham).map((id) => verdict(id).weekday);
    expect(weekdays).not.toContain(2);
    expect(weekdays).not.toContain(6);
  });

  it('does not rate any listed wedding date as a hard avoid', () => {
    const hard = list(SITE.muhurtham).filter((id) => verdict(id).score <= 30);
    expect(hard).toEqual([]);
  });

  it('treats the first day of an avoided month as a caution (printed calendars may start the month a day later)', () => {
    // 17 Sep 2026 is Purattasi 1 here but Aavani 31 on the site, which lists it as a wedding date.
    const v = verdict('9-17');
    expect(v.tamil).toMatchObject({ month: 5, day: 1 });
    expect(v.reasons.map((r) => r.code)).toContain('cautionMonth');
    expect(v.reasons.map((r) => r.code)).not.toContain('avoidMonth');
  });

  it('is more selective than the site list is permissive: under a third of the year is rated good', () => {
    const good = year.filter((d) => judgeDay(d.panchang, marriage, none, specialDays(d.panchang)).score >= 60);
    expect(good.length / year.length).toBeLessThan(0.45);
  });
});

describe('Thirukanitha Panchangam sunrise-scaled timings (22–28 Nov 2026, Chennai)', () => {
  const toMin = (ms: number) => {
    const m = Math.floor((ms + chennai.utcOffsetMin * 60_000) / 60_000) % 1440;
    return (m + 1440) % 1440;
  };
  const parseMin = (hhmm: string) => {
    const [, hStr, mStr, ap] = hhmm.match(/^(\d+):(\d+)\s+(AM|PM)$/)!;
    let h = Number(hStr) % 12;
    if (ap === 'PM') h += 12;
    return h * 60 + Number(mStr);
  };
  const expectRangeClose = (actual: { start: number; end: number } | null, expected: [string, string] | null) => {
    if (expected === null) {
      expect(actual).toBeNull();
      return;
    }
    expect(actual).not.toBeNull();
    expect(Math.abs(toMin(actual!.start) - parseMin(expected[0]))).toBeLessThanOrEqual(1);
    expect(Math.abs(toMin(actual!.end) - parseMin(expected[1]))).toBeLessThanOrEqual(1);
  };

  // Expected Thirukanitha values for Chennai (22–28 Nov 2026).
  const CASES: {
    d: number;
    bm: [string, string];
    nnM: [string, string];
    nnE: [string, string] | null;
    g1: [string, string];
    g2: [string, string];
    yoga: DayYoga;
  }[] = [
    { d: 22, bm: ['4:34 AM', '5:22 AM'], nnM: ['7:37 AM', '8:34 AM'], nnE: null, g1: ['7:36 AM', '9:02 AM'], g2: ['10:28 AM', '11:54 AM'], yoga: 'siddha' },
    { d: 23, bm: ['4:35 AM', '5:23 AM'], nnM: ['6:40 AM', '7:37 AM'], nnE: ['4:13 PM', '5:10 PM'], g1: ['6:11 AM', '7:37 AM'], g2: ['11:55 AM', '1:21 PM'], yoga: 'siddha' },
    { d: 24, bm: ['4:35 AM', '5:23 AM'], nnM: ['7:38 AM', '8:35 AM'], nnE: ['4:13 PM', '5:11 PM'], g1: ['7:37 AM', '9:03 AM'], g2: ['4:13 PM', '5:39 PM'], yoga: 'siddha' },
    { d: 25, bm: ['4:36 AM', '5:24 AM'], nnM: ['9:33 AM', '10:30 AM'], nnE: ['4:13 PM', '5:11 PM'], g1: ['6:12 AM', '7:38 AM'], g2: ['2:47 PM', '4:13 PM'], yoga: 'siddha' },
    { d: 26, bm: ['4:36 AM', '5:24 AM'], nnM: ['10:30 AM', '11:27 AM'], nnE: ['4:14 PM', '5:11 PM'], g1: ['11:56 AM', '1:21 PM'], g2: ['4:13 PM', '5:39 PM'], yoga: 'marana' },
    { d: 27, bm: ['4:37 AM', '5:25 AM'], nnM: ['9:33 AM', '10:31 AM'], nnE: ['4:14 PM', '5:11 PM'], g1: ['11:56 AM', '1:22 PM'], g2: ['4:13 PM', '5:39 PM'], yoga: 'siddha' },
    { d: 28, bm: ['4:37 AM', '5:25 AM'], nnM: ['7:40 AM', '8:37 AM'], nnE: ['4:14 PM', '5:11 PM'], g1: ['10:30 AM', '11:56 AM'], g2: ['2:48 PM', '4:13 PM'], yoga: 'siddha' },
  ];

  it('matches Brahma Muhurtham, sunrise-scaled Nalla Neram, Gowri Nalla Neram, and Amirthadi Yogam within 1 min across all 7 weekdays', () => {
    for (const c of CASES) {
      const day = nallaNeramDay({ y: 2026, m: 11, d: c.d }, chennai, 'sun');
      expectRangeClose(day.brahmaMuhurtham, c.bm);
      expectRangeClose(day.calendarNallaNeram.morning, c.nnM);
      expectRangeClose(day.calendarNallaNeram.evening, c.nnE);
      expectRangeClose(day.gowriNallaNeram.morning, c.g1);
      expectRangeClose(day.gowriNallaNeram.evening, c.g2);
      expect(dayYoga(day.weekday, day.panchang.nakshatra[0].index)).toBe(c.yoga);
    }
  });
});
