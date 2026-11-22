import type { Interval } from './intervals';
import { isKarinaal } from './karinaal';
import { nakshatraIndexAt, rashiAt, tithiIndexAt, tithiSpans, type DaySummary } from './panchang';
import { julianDay } from './time';

export type SpecialId =
  | 'tamilNewYear'
  | 'pongal'
  | 'mattuPongal'
  | 'thaiPoosam'
  | 'mahaShivaratri'
  | 'panguniUthiram'
  | 'aadiPerukku'
  | 'navarathri'
  | 'saraswatiPooja'
  | 'vijayadashami'
  | 'deepavali'
  | 'pournami'
  | 'amavasai'
  | 'ekadashi'
  | 'pradosham'
  | 'sankashti'
  | 'vinayakaChaturthi'
  | 'shashti'
  | 'karthigai'
  | 'karthigaiDeepam'
  | 'karinaal';

export type SpecialDay = { id: SpecialId; window?: Interval };

const MIN = 60_000;
const HOUR = 60 * MIN;
const PRADOSHAM_LENGTH_MIN = 144; // 2 h 24 min, three muhurtas after sunset
const TRAYODASHI = [12, 27];
const KRITTIKA = 2;
const POOSAM = 7;
const UTHIRAM = 11;
const KARTHIGAI_MONTH = 7;

const at = (ms: number) => new Date(ms);

/** True when Trayodashi is present at some time in the 2 h 24 min after `sunset`. A tithi lasts about a day, so the two ends are enough. */
function trayodashiPresent(sunset: number): boolean {
  return (
    TRAYODASHI.includes(tithiIndexAt(at(sunset))) ||
    TRAYODASHI.includes(tithiIndexAt(at(sunset + PRADOSHAM_LENGTH_MIN * MIN)))
  );
}

/** How much of the 2 h 24 min after `sunset` has Trayodashi. */
function trayodashiOverlap(sunset: number): number {
  if (!trayodashiPresent(sunset)) return 0;
  const end = sunset + PRADOSHAM_LENGTH_MIN * MIN;
  let overlap = 0;
  let cursor = sunset;
  for (const span of tithiSpans(at(sunset), at(end))) {
    const stop = Math.min(span.end.getTime(), end);
    if (TRAYODASHI.includes(span.index)) overlap += Math.max(0, stop - cursor);
    cursor = Math.max(cursor, stop);
  }
  return overlap;
}

/**
 * True when a Shukla Paksha day (`tithi` 0..14) belongs to the Ashwin (Purattasi)
 * lunar month: the preceding New Moon occurred in Kanya (rashi 5) and the next
 * New Moon occurs in Thulam (rashi 6, handling Adhika Ashwin automatically).
 */
function isAshwinShukla(noonMs: number, tithi: number): boolean {
  if (tithi < 0 || tithi > 14) return false;
  const approxPrevAmavasaiJd = julianDay(at(noonMs - (tithi + 0.5) * 24 * HOUR));
  const approxNextAmavasaiJd = julianDay(at(noonMs + (29.5 - tithi) * 24 * HOUR));
  return rashiAt(approxPrevAmavasaiJd) === 5 && rashiAt(approxNextAmavasaiJd) === 6;
}

/**
 * Observance days and major annual Tamil festivals, found from the solar date
 * and the tithi or nakshatra at the time of day each one is reckoned by.
 */
export function specialDays(p: DaySummary): SpecialDay[] {
  const sunset = p.sunset.getTime();
  const sunrise = p.sunrise.getTime();
  const noonMs = (sunrise + sunset) / 2;
  const noon = at(noonMs);
  const aparahna = at(sunrise + 0.7 * (sunset - sunrise));
  const arunodaya = at(sunrise - 60 * MIN);
  const midnight = at(sunset + 6 * HOUR);
  const found: SpecialDay[] = [];

  const aparahnaTithi = tithiIndexAt(aparahna);
  const noonTithi = tithiIndexAt(noon);
  const sunriseTithi = tithiIndexAt(p.sunrise);
  const arunodayaTithi = tithiIndexAt(arunodaya);
  const midnightTithi = tithiIndexAt(midnight);

  // --- Major Annual Tamil Solar Festivals ---
  if (p.tamil.month === 0 && p.tamil.day === 1) found.push({ id: 'tamilNewYear' });
  if (p.tamil.month === 9 && p.tamil.day === 1) found.push({ id: 'pongal' });
  if (p.tamil.month === 9 && p.tamil.day === 2) found.push({ id: 'mattuPongal' });
  if (p.tamil.month === 3 && p.tamil.day === 18) found.push({ id: 'aadiPerukku' });

  // --- Major Annual Lunar / Star Festivals ---
  // Thai Poosam: Poosam nakshatra around Pournami in Thai (month 9).
  if (
    p.tamil.month === 9 &&
    (nakshatraIndexAt(noon) === POOSAM || nakshatraIndexAt(aparahna) === POOSAM) &&
    (noonTithi === 13 || noonTithi === 14 || noonTithi === 15)
  ) {
    found.push({ id: 'thaiPoosam' });
  }

  // Panguni Uthiram: Uthiram nakshatra around Pournami in Panguni (month 11).
  if (
    p.tamil.month === 11 &&
    (nakshatraIndexAt(noon) === UTHIRAM || nakshatraIndexAt(aparahna) === UTHIRAM) &&
    (noonTithi === 13 || noonTithi === 14 || noonTithi === 15)
  ) {
    found.push({ id: 'panguniUthiram' });
  }

  // Maha Shivaratri: Krishna Chaturdashi (28) at Nishita (midnight) in Maasi (month 10).
  if (p.tamil.month === 10 && midnightTithi === 28) {
    found.push({ id: 'mahaShivaratri' });
  }

  // Navarathri (days 1-8), Saraswati / Ayudha Pooja (Navami), Vijayadashami (Dashami).
  if (isAshwinShukla(noonMs, aparahnaTithi)) {
    if (aparahnaTithi >= 0 && aparahnaTithi <= 7) {
      found.push({ id: 'navarathri' });
    } else if (aparahnaTithi === 8) {
      found.push({ id: 'saraswatiPooja' });
    } else if (aparahnaTithi === 9) {
      found.push({ id: 'vijayadashami' });
    }
  } else if (isAshwinShukla(noonMs, noonTithi)) {
    if (noonTithi === 8) found.push({ id: 'saraswatiPooja' });
    else if (noonTithi === 9) found.push({ id: 'vijayadashami' });
  }

  // Deepavali (Tamil Nadu Naraka Chaturdashi): Krishna Chaturdashi (28) at Arunodaya
  // (before sunrise) when the Sun at the upcoming New Moon is in Thulam (rashi 6 = Aippasi).
  if (arunodayaTithi === 28) {
    const upcomingNewMoonRashi = rashiAt(julianDay(at(sunrise + 36 * HOUR)));
    const prevDayArunodaya = tithiIndexAt(at(arunodaya.getTime() - 24 * HOUR));
    if (upcomingNewMoonRashi === 6 && prevDayArunodaya !== 28) {
      found.push({ id: 'deepavali' });
    }
  }

  // --- Monthly Observance Days ---
  if (aparahnaTithi === 14) found.push({ id: 'pournami' });
  if (aparahnaTithi === 29) found.push({ id: 'amavasai' });
  // Ekadashi: tithi 10 (Shukla) or 25 (Krishna) prevailing at sunrise or midday.
  if (sunriseTithi === 10 || sunriseTithi === 25 || (sunriseTithi !== 9 && sunriseTithi !== 24 && (noonTithi === 10 || noonTithi === 25))) {
    found.push({ id: 'ekadashi' });
  }

  // Neighbouring evenings only matter when this one has Trayodashi too.
  const today = trayodashiOverlap(sunset);
  const before = today > 0 ? trayodashiOverlap(sunset - 24 * HOUR) : 0;
  const after = today > 0 ? trayodashiOverlap(sunset + 24 * HOUR) : 0;
  if (today > 0 && today > before && today >= after) {
    found.push({ id: 'pradosham', window: { start: sunset, end: sunset + PRADOSHAM_LENGTH_MIN * MIN } });
  }

  // Waning Chaturthi (index 18) during roughly 2-4 hours after sunset.
  if (tithiIndexAt(at(sunset + 120 * MIN)) === 18 || tithiIndexAt(at(sunset + 240 * MIN)) === 18) {
    found.push({ id: 'sankashti', window: { start: sunset + 120 * MIN, end: sunset + 240 * MIN } });
  }

  if (noonTithi === 3) found.push({ id: 'vinayakaChaturthi' });
  if (noonTithi === 5) found.push({ id: 'shashti' });

  const pradoshaEnd = sunset + PRADOSHAM_LENGTH_MIN * MIN;
  if (nakshatraIndexAt(p.sunset) === KRITTIKA || nakshatraIndexAt(at(pradoshaEnd)) === KRITTIKA) {
    found.push({ id: p.tamil.month === KARTHIGAI_MONTH ? 'karthigaiDeepam' : 'karthigai' });
  }

  if (isKarinaal(p.tamil.month, p.tamil.day)) found.push({ id: 'karinaal' });
  return found;
}
