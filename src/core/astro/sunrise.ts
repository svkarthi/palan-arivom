import { solarDeclinationAndEquationOfTime } from './ephemeris';
import { civilToUtcMidnight, julianDay, type CivilDate } from './time';

export type Place = {
  id: string;
  name: { ta: string; en: string };
  lat: number;
  lon: number;
  /** Fixed offset from UTC in minutes (no daylight saving). */
  utcOffsetMin: number;
};

const RAD = Math.PI / 180;
const ZENITH = 90.833; // sunrise/sunset with atmospheric refraction

/** Minutes after 0h UT of `date` for sunrise (rising) or sunset, refined once. */
function eventMinutesUtc(date: CivilDate, place: Place, rising: boolean): number {
  const midnight = civilToUtcMidnight(date);
  let minutes = 720 - 4 * place.lon;
  for (let i = 0; i < 3; i++) {
    const jd = julianDay(new Date(midnight + minutes * 60_000));
    const { declination, eqTime } = solarDeclinationAndEquationOfTime(jd);
    const cosH =
      Math.cos(ZENITH * RAD) / (Math.cos(place.lat * RAD) * Math.cos(declination * RAD)) -
      Math.tan(place.lat * RAD) * Math.tan(declination * RAD);
    const clamped = Math.max(-1, Math.min(1, cosH));
    const hourAngle = Math.acos(clamped) / RAD;
    const signed = rising ? hourAngle : -hourAngle;
    minutes = 720 - 4 * (place.lon + signed) - eqTime;
  }
  return minutes;
}

export type SunTimes = { sunrise: Date; sunset: Date };

export function sunTimes(date: CivilDate, place: Place): SunTimes {
  const midnight = civilToUtcMidnight(date);
  return {
    sunrise: new Date(midnight + eventMinutesUtc(date, place, true) * 60_000),
    sunset: new Date(midnight + eventMinutesUtc(date, place, false) * 60_000),
  };
}
