import type { Interval } from './intervals';
import { nakshatraSpans, tithiIndexAt, tithiSpans, type DayPanchang } from './panchang';

export type SpecialId =
  | 'pournami'
  | 'amavasai'
  | 'pradosham'
  | 'sankashti'
  | 'vinayakaChaturthi'
  | 'shashti'
  | 'karthigai'
  | 'karthigaiDeepam';

export type SpecialDay = { id: SpecialId; window?: Interval };

const MIN = 60_000;
const PRADOSHAM_LENGTH_MIN = 144; // 2 h 24 min, three muhurtas after sunset
const TRAYODASHI = [12, 27];
const KRITTIKA = 2;
const KARTHIGAI_MONTH = 7;

const at = (ms: number) => new Date(ms);

/**
 * Observance days of the Tamil calendar, found from the tithi or nakshatra at the
 * time of day each one is reckoned by:
 * - Pournami: Pournami tithi at sunset (full moon rises as the sun sets).
 * - Amavasai: Amavasai tithi in the afternoon (aparahna).
 * - Pradosham: Trayodashi covering at least half of the 2 h 24 min after sunset.
 * - Sankashti Chaturthi: waning Chaturthi during the first hours of the night,
 *   when the moon rises (moonrise is approximated, not computed).
 * - Vinayaka Chaturthi (monthly): waxing Chaturthi at midday.
 * - Shashti: Shashthi tithi at midday, either paksha.
 * - Karthigai: Krittika present during the evening (sunset to 2 h 24 min later); in the
 *   month of Karthigai it is Karthigai Deepam.
 */
export function specialDays(p: DayPanchang): SpecialDay[] {
  const sunset = p.sunset.getTime();
  const noon = at((p.sunrise.getTime() + sunset) / 2);
  const found: SpecialDay[] = [];

  const sunsetTithi = tithiIndexAt(p.sunset);
  const noonTithi = tithiIndexAt(noon);

  if (sunsetTithi === 14) found.push({ id: 'pournami' });

  // Amavasai is reckoned by the tithi in the afternoon (aparahna, about 70% into the day).
  const dayLength = sunset - p.sunrise.getTime();
  if (tithiIndexAt(at(p.sunrise.getTime() + 0.7 * dayLength)) === 29) found.push({ id: 'amavasai' });

  const pradoshaEnd = sunset + PRADOSHAM_LENGTH_MIN * MIN;
  const evening = tithiSpans(p.sunset, at(pradoshaEnd));
  let trayodashiOverlap = 0;
  let cursor = sunset;
  for (const span of evening) {
    const end = Math.min(span.end.getTime(), pradoshaEnd);
    if (TRAYODASHI.includes(span.index)) trayodashiOverlap += Math.max(0, end - cursor);
    cursor = Math.max(cursor, end);
  }
  if (trayodashiOverlap >= (PRADOSHAM_LENGTH_MIN * MIN) / 2) {
    found.push({ id: 'pradosham', window: { start: sunset, end: pradoshaEnd } });
  }

  // Waning Chaturthi (index 18) during roughly 2-4 hours after sunset.
  const moonriseWindow = tithiSpans(at(sunset + 120 * MIN), at(sunset + 240 * MIN));
  const chaturthiAtNight = moonriseWindow.some((s) => s.index === 18);
  if (chaturthiAtNight) found.push({ id: 'sankashti', window: { start: sunset + 120 * MIN, end: sunset + 240 * MIN } });

  if (noonTithi === 3) found.push({ id: 'vinayakaChaturthi' });
  if (noonTithi === 5 || noonTithi === 20) found.push({ id: 'shashti' });

  if (nakshatraSpans(p.sunset, at(pradoshaEnd)).some((s) => s.index === KRITTIKA)) {
    found.push({ id: p.tamil.month === KARTHIGAI_MONTH ? 'karthigaiDeepam' : 'karthigai' });
  }
  return found;
}
