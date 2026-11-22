/**
 * Comprehensive Thirukanitha (Drik Panchang, Lahiri ayanamsa) validation suite
 * covering 2026–2027 Tamil month starts, major annual festivals, daily panchangam
 * snapshots (including Karana & Lagna), historical Birth Star dates, and multi-timezone
 * sanity checks.
 */
import { chandrashtamaRashi, dayYoga, nakshatrasOfRashi } from '../src/core/astro/dayExtras';
import { dayPanchang, lagnaSpans, rashiAt } from '../src/core/astro/panchang';
import { placeById } from '../src/core/astro/places';
import { specialDays, type SpecialId } from '../src/core/astro/specialDays';
import { addDays, julianDay, toLocal, type CivilDate } from '../src/core/astro/time';
import { computeBirthStar } from '../src/features/birth-star/logic';
import { nallaNeramDay } from '../src/features/nalla-neram/logic';

const chennai = placeById('chennai');

const iso = (d: CivilDate) =>
  `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;

const localMinutes = (at: Date | number, utcOffsetMin: number) =>
  toLocal(new Date(at), utcOffsetMin).minutes;

function scanYear(year: number, place = chennai) {
  const monthStarts: Record<number, string> = {};
  const festivals: Partial<Record<SpecialId, string[]>> = {};
  let d: CivilDate = { y: year, m: 1, d: 1 };
  while (d.y === year) {
    const p = dayPanchang(d, place);
    const key = iso(d);
    if (p.tamil.day === 1) monthStarts[p.tamil.month] = key;
    for (const s of specialDays(p)) {
      (festivals[s.id] ??= []).push(key);
    }
    d = addDays(d, 1);
  }
  return { monthStarts, festivals };
}

const y2026 = scanYear(2026);
const y2027 = scanYear(2027);

describe('Thirukanitha (Drik Panchang) — Tamil month starts (Chennai)', () => {
  // Tamil month index: 0=Chithirai, 1=Vaikasi, ..., 9=Thai, 10=Maasi, 11=Panguni
  it('matches all 12 Tamil month start dates in 2026', () => {
    expect(y2026.monthStarts).toEqual({
      9: '2026-01-14', // Thai (Makara Sankranti ~3:13 PM IST, before sunset)
      10: '2026-02-13', // Maasi
      11: '2026-03-15', // Panguni (Meena Sankranti early AM Mar 15)
      0: '2026-04-14', // Chithirai (Puthandu)
      1: '2026-05-15', // Vaikasi
      2: '2026-06-15', // Aani
      3: '2026-07-17', // Aadi (Karka Sankranti evening Jul 16 after sunset -> Jul 17)
      4: '2026-08-17', // Aavani
      5: '2026-09-17', // Purattasi
      6: '2026-10-18', // Aippasi (Tula Sankranti evening Oct 17 after sunset -> Oct 18)
      7: '2026-11-17', // Karthigai (Vrishchika Sankranti evening Nov 16 after sunset -> Nov 17)
      8: '2026-12-16', // Margazhi
    });
  });

  it('matches all 12 Tamil month start dates in 2027', () => {
    expect(y2027.monthStarts).toEqual({
      9: '2027-01-15', // Thai (Makara Sankranti 9:14 PM IST Jan 14 -> after sunset -> Jan 15)
      10: '2027-02-13', // Maasi
      11: '2027-03-15', // Panguni
      0: '2027-04-14', // Chithirai (Puthandu, Sankranti ~3:33 PM IST)
      1: '2027-05-15', // Vaikasi
      2: '2027-06-16', // Aani (Mithuna Sankranti after sunset Jun 15 -> Jun 16)
      3: '2027-07-17', // Aadi (Karka Sankranti after sunset Jul 16 -> Jul 17)
      4: '2027-08-17', // Aavani
      5: '2027-09-17', // Purattasi
      6: '2027-10-18', // Aippasi
      7: '2027-11-17', // Karthigai (Vrishchika Sankranti after sunset Nov 16 -> Nov 17)
      8: '2027-12-16', // Margazhi
    });
  });
});

describe('Thirukanitha (Drik Panchang) — Major annual Tamil festivals (Chennai)', () => {
  it('matches 2026 major Tamil festivals', () => {
    expect(y2026.festivals.pongal).toEqual(['2026-01-14']);
    expect(y2026.festivals.mattuPongal).toEqual(['2026-01-15']);
    expect(y2026.festivals.thaiPoosam).toContain('2026-02-01');
    expect(y2026.festivals.mahaShivaratri).toEqual(['2026-02-15']);
    expect(y2026.festivals.panguniUthiram).toContain('2026-04-01');
    expect(y2026.festivals.tamilNewYear).toEqual(['2026-04-14']);
    expect(y2026.festivals.aadiPerukku).toEqual(['2026-08-03']);
    expect(y2026.festivals.navarathri?.[0]).toBe('2026-10-11');
    expect(y2026.festivals.saraswatiPooja).toContain('2026-10-19');
    expect(y2026.festivals.vijayadashami).toContain('2026-10-20');
    expect(y2026.festivals.deepavali).toEqual(['2026-11-08']);
    expect(y2026.festivals.karthigaiDeepam).toEqual(['2026-11-24']);
  });

  it('matches 2027 major Tamil festivals', () => {
    expect(y2027.festivals.pongal).toEqual(['2027-01-15']);
    expect(y2027.festivals.mattuPongal).toEqual(['2027-01-16']);
    expect(y2027.festivals.thaiPoosam).toContain('2027-01-22');
    expect(y2027.festivals.mahaShivaratri).toEqual(['2027-03-06']);
    expect(y2027.festivals.panguniUthiram).toContain('2027-03-22');
    expect(y2027.festivals.tamilNewYear).toEqual(['2027-04-14']);
    expect(y2027.festivals.aadiPerukku).toEqual(['2027-08-03']);
    expect(y2027.festivals.navarathri?.[0]).toBe('2027-09-30');
    expect(y2027.festivals.saraswatiPooja).toContain('2027-10-08');
    expect(y2027.festivals.vijayadashami).toContain('2027-10-09');
    expect(y2027.festivals.deepavali).toEqual(['2027-10-28']);
    expect(y2027.festivals.karthigaiDeepam).toEqual(['2027-12-11']);
  });
});

describe('Thirukanitha (Drik Panchang) — Daily panchangam snapshots (Chennai)', () => {
  it('matches 2026-11-22 sunrise, sunset, and Rahu Kalam', () => {
    const day = nallaNeramDay({ y: 2026, m: 11, d: 22 }, chennai);
    // Drik Panchang Chennai: Sunrise 06:11 AM (371m), Sunset 05:39 PM (1059m), Rahu 4:13–5:39 PM (973–1059m)
    expect(Math.abs(localMinutes(day.panchang.sunrise, 330) - (6 * 60 + 11))).toBeLessThan(2);
    expect(Math.abs(localMinutes(day.panchang.sunset, 330) - (17 * 60 + 39))).toBeLessThan(2);
    expect(Math.abs(localMinutes(day.rahu.start, 330) - (16 * 60 + 13))).toBeLessThan(2);
    expect(Math.abs(localMinutes(day.rahu.end, 330) - (17 * 60 + 39))).toBeLessThan(2);
  });

  it('matches 2026-11-24 (Karthigai Deepam) Pournami and Krittika end times', () => {
    const p = dayPanchang({ y: 2026, m: 11, d: 24 }, chennai);
    // Karthigai 8 (month 7, day 9 or 8 depending on Nov 16 start -> Nov 16 is day 1, Nov 24 is day 9)
    expect(p.tamil.month).toBe(7);
    // Drik Panchang: Pournami (index 14) ends ~8:23 PM (1223m), Krittika (index 2) ends ~11:25 PM (1405m)
    expect(p.tithi[0].index).toBe(14);
    expect(Math.abs(localMinutes(p.tithi[0].end, 330) - (20 * 60 + 23))).toBeLessThan(5);
    expect(p.nakshatra[0].index).toBe(2);
    expect(Math.abs(localMinutes(p.nakshatra[0].end, 330) - (23 * 60 + 25))).toBeLessThan(5);
  });

  it('matches 2027-04-14 (Puthandu / Plavanga Chithirai 1) full panchangam including Karana & Lagna', () => {
    const p = dayPanchang({ y: 2027, m: 4, d: 14 }, chennai);
    // Plavanga = yearIndex 40 (1987 + 40 = 2027), Chithirai 1
    expect(p.tamil).toMatchObject({ yearStartGregorian: 2027, yearIndex: 40, month: 0, day: 1 });
    // Sunrise ~05:57 AM (357m), Sunset ~06:21 PM (1101m)
    expect(Math.abs(localMinutes(p.sunrise, 330) - (5 * 60 + 57))).toBeLessThan(2);
    expect(Math.abs(localMinutes(p.sunset, 330) - (18 * 60 + 21))).toBeLessThan(2);
    // Tithi: Shukla Ashtami (7) until ~3:23 PM (923m), then Navami (8)
    expect(p.tithi[0].index).toBe(7);
    expect(Math.abs(localMinutes(p.tithi[0].end, 330) - (15 * 60 + 23))).toBeLessThan(5);
    expect(p.tithi[1].index).toBe(8);
    // Nakshatra: Punarpoosam (6) until ~10:52 AM (652m), then Poosam (7)
    expect(p.nakshatra[0].index).toBe(6);
    expect(Math.abs(localMinutes(p.nakshatra[0].end, 330) - (10 * 60 + 52))).toBeLessThan(5);
    expect(p.nakshatra[1].index).toBe(7);
    // Yoga: Sukarma (6) until ~11:09 AM (669m), then Dhriti (7)
    expect(p.yoga[0].index).toBe(6);
    expect(Math.abs(localMinutes(p.yoga[0].end, 330) - (11 * 60 + 9))).toBeLessThan(5);
    expect(p.yoga[1].index).toBe(7);
    // Karana: Bava (15 -> (15-1)%7 = 0 = Bava) until ~3:23 PM, then Balava (16) until ~2:22 AM next day
    expect(p.karana[0].index).toBe(15);
    expect(Math.abs(localMinutes(p.karana[0].end, 330) - (15 * 60 + 23))).toBeLessThan(5);
    expect(p.karana[1].index).toBe(16);
    expect(Math.abs(localMinutes(p.karana[1].end, 330) - (2 * 60 + 22))).toBeLessThan(5);

    // Lagna: cycles through all 12 signs from sunrise to next sunrise; at sunrise matches Sun's rashi (Meena=11, entering Mesha=0 at 3:33 PM)
    const lagnas = lagnaSpans(chennai, p.sunrise, p.nextSunrise);
    expect(lagnas.length).toBeGreaterThanOrEqual(12);
    expect(lagnas[0].index).toBe(rashiAt(julianDay(p.sunrise)));
  });
});

describe('Thirukanitha — Day extras & historical Birth Star', () => {
  it('computes Chandrashtamam as the Janma Rashi for which Moon is in the 8th house', () => {
    // If Moon is in Viruchigam (7), Mesham (0) has Moon in 8th house -> (7 + 5) % 12 = 0
    expect(chandrashtamaRashi(7)).toBe(0);
    expect(chandrashtamaRashi(0)).toBe(5); // Moon in Mesham -> Kanni (5) has Chandrashtamam
    expect(nakshatrasOfRashi(0).map((s) => s.nakshatra)).toEqual([0, 1, 2]); // Ashwini, Bharani, Krittika
  });

  it('matches classical Amirtha / Siddha / Marana yoga rules', () => {
    expect(dayYoga(4, 7)).toBe('amirtha'); // Thursday + Poosam
    expect(dayYoga(3, 16)).toBe('amirtha'); // Wednesday + Anusham
    expect(dayYoga(0, 1)).toBe('marana'); // Sunday + Bharani
  });

  it('matches historical Birth Star for 1995-01-15 09:30 IST (Chennai)', () => {
    // Drik Panchang: Thiruvathirai (Ardra = 5), Mithuna Rashi (2), Shukla Chaturdashi (13)
    const res = computeBirthStar({ y: 1995, m: 1, d: 15 }, 9, 30, chennai);
    expect(res.nakshatra).toBe(5);
    expect(res.rashi).toBe(2);
    expect(res.tithi).toBe(13);
  });

  it('matches historical Birth Star for 1965-08-15 (Chennai)', () => {
    // Drik Panchang: Morning Poorattathi (24) / Kumbha (10), later Uthirattathi (25) / Meena (11)
    const morning = computeBirthStar({ y: 1965, m: 8, d: 15 }, 6, 0, chennai);
    const evening = computeBirthStar({ y: 1965, m: 8, d: 15 }, 21, 0, chennai);
    expect([24, 25]).toContain(morning.nakshatra);
    expect([10, 11]).toContain(morning.rashi);
    expect(evening.nakshatra).toBe(25);
    expect(evening.rashi).toBe(11);
  });
});

describe('Thirukanitha — Multi-timezone sanity (Singapore, London, New York)', () => {
  it('computes valid Tamil New Year 2026 & sunrise/sunset ordering across global time zones', () => {
    for (const id of ['singapore', 'dubai', 'london', 'new-york']) {
      const place = placeById(id);
      const p = dayPanchang({ y: 2026, m: 4, d: 14 }, place);
      expect(p.sunset.getTime()).toBeGreaterThan(p.sunrise.getTime());
      expect(p.nextSunrise.getTime()).toBeGreaterThan(p.sunset.getTime());
      // Mesha Sankranti is ~09:38 AM IST (04:08 UTC) on Apr 14, 2026 -> before sunset in all 4 cities -> Chithirai 1
      expect(p.tamil).toMatchObject({ month: 0, day: 1, yearStartGregorian: 2026 });
    }
  });
});
