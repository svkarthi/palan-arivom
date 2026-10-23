import { dayPanchang } from '../src/core/astro/panchang';
import { placeById } from '../src/core/astro/places';
import { PURPOSE_BY_ID } from '../src/features/nalla-naal/data/purposes';
import { gradeOf, judgeDay, judgeMonth } from '../src/features/nalla-naal/logic';
import { nallaNeramDay, statusAt } from '../src/features/nalla-neram/logic';

const chennai = placeById('chennai');
const none = { birthNakshatra: null, birthRashi: null };

describe('nallaNeramDay', () => {
  const day = nallaNeramDay({ y: 2025, m: 1, d: 6 }, chennai); // a Monday

  it('keeps good windows clear of the inauspicious parts', () => {
    expect(day.goodWindows.length).toBeGreaterThan(0);
    for (const w of day.goodWindows) {
      for (const bad of [day.rahu, day.yama, day.kuligai]) {
        expect(w.end <= bad.start || w.start >= bad.end).toBe(true);
      }
      expect(w.end - w.start).toBeGreaterThanOrEqual(15 * 60_000);
    }
  });

  it('has 24 horas starting with the Moon on Monday', () => {
    expect(day.horas).toHaveLength(24);
    expect(day.horas[0].planet).toBe(1);
  });

  it('reports what the current moment is', () => {
    const rahuMid = (day.rahu.start + day.rahu.end) / 2;
    expect(statusAt(day, rahuMid)?.kind).toBe('rahu');
    const goodMid = (day.goodWindows[0].start + day.goodWindows[0].end) / 2;
    expect(statusAt(day, goodMid)?.kind).toBe('good');
    expect(statusAt(day, day.panchang.nextSunrise.getTime() + 1000)).toBeNull();
  });
});

describe('nallaNaal scoring', () => {
  it('gives Amavasai a low score and flags it', () => {
    const p = dayPanchang({ y: 2025, m: 10, d: 21 }, chennai);
    const v = judgeDay(p, PURPOSE_BY_ID.marriage, none);
    expect(v.tithi).toBe(29);
    expect(v.score).toBeLessThanOrEqual(30);
    expect(v.reasons.some((r) => r.code === 'amavasai')).toBe(true);
  });

  it('rules out Aadi for marriage', () => {
    // 2025-07-25 falls in Aadi (the Sun is in Kataka).
    const v = judgeDay(dayPanchang({ y: 2025, m: 7, d: 25 }, chennai), PURPOSE_BY_ID.marriage, none);
    expect(v.tamil.month).toBe(3);
    expect(v.reasons.some((r) => r.code === 'avoidMonth')).toBe(true);
    expect(v.score).toBeLessThanOrEqual(30);
  });

  it('scores a whole month within range and includes some good days', () => {
    const month = judgeMonth(2026, 2, chennai, PURPOSE_BY_ID.business, none);
    expect(month).toHaveLength(28);
    expect(month.every((d) => d.score >= 0 && d.score <= 100)).toBe(true);
    expect(month.some((d) => d.score >= 60)).toBe(true);
    expect(month.some((d) => d.score < 40)).toBe(true);
  });

  it('adds Tarabalam and Chandrabalam only when a birth star / rashi is set', () => {
    const p = dayPanchang({ y: 2026, m: 2, d: 10 }, chennai);
    const plain = judgeDay(p, PURPOSE_BY_ID.travel, none);
    const personal = judgeDay(p, PURPOSE_BY_ID.travel, { birthNakshatra: 3, birthRashi: 1 });
    expect(plain.reasons.some((r) => r.code.startsWith('tara') || r.code.startsWith('chandra'))).toBe(false);
    expect(personal.reasons.some((r) => r.code.startsWith('tara'))).toBe(true);
  });

  it('grades by score band', () => {
    expect(gradeOf(80)).toBe('excellent');
    expect(gradeOf(65)).toBe('good');
    expect(gradeOf(45)).toBe('fair');
    expect(gradeOf(10)).toBe('poor');
  });
});
