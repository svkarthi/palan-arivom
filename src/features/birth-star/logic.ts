import { siderealMoon } from '@core/astro/ephemeris';
import { siderealAscendant, tithiIndexAt } from '@core/astro/panchang';
import type { Place } from '@core/astro/sunrise';
import { civilToUtcMidnight, julianDay, type CivilDate } from '@core/astro/time';

export type BirthChartResult = {
  nakshatra: number;
  /** 1 to 4 */
  pada: number;
  rashi: number;
  lagna: number;
  tithi: number;
};

/**
 * Computes Janma Nakshatra, Pada, Rashi, Lagna, and Tithi for a birth date,
 * local time (24h `hour` 0-23, `minute` 0-59), and place.
 */
export function computeBirthStar(
  date: CivilDate,
  hour24: number,
  minute: number,
  place: Place,
): BirthChartResult {
  const localMidnightUtc = civilToUtcMidnight(date) - place.utcOffsetMin * 60_000;
  const instant = new Date(localMidnightUtc + (hour24 * 60 + minute) * 60_000);
  const jd = julianDay(instant);
  const moonDeg = siderealMoon(jd);
  const nakWidth = 360 / 27;
  const nakshatra = Math.floor(moonDeg / nakWidth) % 27;
  const pada = Math.floor((moonDeg % nakWidth) / (nakWidth / 4)) + 1;
  const rashi = Math.floor(moonDeg / 30) % 12;
  const lagna = Math.floor(siderealAscendant(instant, place) / 30) % 12;
  const tithi = tithiIndexAt(instant);
  return { nakshatra, pada, rashi, lagna, tithi };
}
