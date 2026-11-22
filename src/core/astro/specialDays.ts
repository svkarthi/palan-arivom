import type { Interval } from './intervals';
import { isKarinaal } from './karinaal';
import { nakshatraIndexAt, tithiIndexAt, tithiSpans, type DaySummary } from './panchang';

export type SpecialId =
  | 'pournami'
  | 'amavasai'
  | 'pradosham'
  | 'sankashti'
  | 'vinayakaChaturthi'
  | 'shashti'
  | 'karthigai'
  | 'karthigaiDeepam'
  | 'karinaal';

export type SpecialDay = { id: SpecialId; window?: Interval };

const MIN = 60_000;
const PRADOSHAM_LENGTH_MIN = 144; // 2 h 24 min, three muhurtas after sunset
const TRAYODASHI = [12, 27];
const KRITTIKA = 2;
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
 * Observance days of the Tamil calendar, found from the tithi or nakshatra at the
 * time of day each one is reckoned by. Checked against the Pournami, Amavasai and
 * Pradosham lists of tamildailycalendar.com for 2026.
 * - Pournami and Amavasai: the tithi in the afternoon (aparahna, about 70% into the day).
 * - Pradosham: Trayodashi present in the 2 h 24 min after sunset; when two days both
 *   qualify, the one with more of it.
 * - Sankashti Chaturthi: waning Chaturthi during the first hours of the night,
 *   when the moon rises (moonrise is approximated, not computed).
 * - Vinayaka Chaturthi (monthly): waxing Chaturthi at midday.
 * - Shashti: waxing Shashthi at midday.
 * - Karthigai: Krittika present during the evening (sunset to 2 h 24 min later); in the
 *   month of Karthigai it is Karthigai Deepam.
 * - Karinaal: by Tamil date, see `karinaal.ts`.
 */
export function specialDays(p: DaySummary): SpecialDay[] {
  const sunset = p.sunset.getTime();
  const sunrise = p.sunrise.getTime();
  const noon = at((sunrise + sunset) / 2);
  const aparahna = at(sunrise + 0.7 * (sunset - sunrise));
  const found: SpecialDay[] = [];

  const aparahnaTithi = tithiIndexAt(aparahna);
  const noonTithi = tithiIndexAt(noon);

  if (aparahnaTithi === 14) found.push({ id: 'pournami' });
  if (aparahnaTithi === 29) found.push({ id: 'amavasai' });

  // Neighbouring evenings only matter when this one has Trayodashi too.
  const today = trayodashiOverlap(sunset);
  const before = today > 0 ? trayodashiOverlap(sunset - 24 * 60 * MIN) : 0;
  const after = today > 0 ? trayodashiOverlap(sunset + 24 * 60 * MIN) : 0;
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
