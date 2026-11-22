import { BAD_NAKSHATRAS, BAD_YOGAS, MILD_BAD_TITHI_POSITIONS, STRONG_BAD_TITHI_POSITIONS } from '@core/astro/inauspicious';
import { daySummary, isVishti, karanaIndexAt, moonRashiAt, nakshatraIndexAt, tithiIndexAt, tithiPosition, yogaIndexAt, type DaySummary, type TamilDate } from '@core/astro/panchang';
import { specialDays, type SpecialDay } from '@core/astro/specialDays';
import type { Place } from '@core/astro/sunrise';
import { julianDay, weekdayOf, type CivilDate } from '@core/astro/time';
import type { Bilingual } from '@core/i18n';
import { NAKSHATRAS, RASHIS, TAMIL_MONTHS, WEEKDAYS, YOGAS, karanaName, tithiName } from '@core/astro/names';

import type { Purpose } from './data/purposes';


export type ReasonCode =
  | 'goodTithi' | 'badTithi' | 'amavasai'
  | 'goodNakshatra' | 'badNakshatra' | 'badYoga' | 'vishti'
  | 'goodWeekday' | 'badWeekday' | 'avoidMonth' | 'cautionMonth'
  | 'karinaal' | 'taraGood' | 'taraBad' | 'chandraGood' | 'chandraBad' | 'chandrashtama';

export type Reason = { code: ReasonCode; good: boolean; name?: Bilingual };

export type Grade = 'excellent' | 'good' | 'fair' | 'poor';

export type Profile = { birthNakshatra: number | null; birthRashi: number | null };

export type DayVerdict = {
  date: CivilDate;
  weekday: number;
  tamil: TamilDate;
  tithi: number;
  nakshatra: number;
  yoga: number;
  karana: number;
  score: number;
  grade: Grade;
  reasons: Reason[];
  /** Observance days (Pournami, Pradosham …); they do not change the score. */
  specials: SpecialDay[];
};

export const gradeOf = (score: number): Grade =>
  score >= 75 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'poor';

/** Tarabalam: 1-based count from the birth star, folded into groups of nine. */
const TARA_BAD = [1, 3, 5, 7];

export function judgeDay(
  panchang: DaySummary,
  purpose: Purpose,
  profile: Profile,
  observances: SpecialDay[] = specialDays(panchang),
): DayVerdict {
  const { date, sunrise, sunset } = panchang;
  const weekday = weekdayOf(date);
  // Functions are judged by the panchangam of the morning (about 9 AM, a quarter of the way
  // through the daytime), when most auspicious events begin. On the 2026 muhurtham list of
  // tamildailycalendar.com this sampling shows no Ashtami, Navami, Pournami, Amavasai or
  // fierce-nakshatra dates, which sampling the whole daytime does not.
  const morning = new Date(sunrise.getTime() + 0.25 * (sunset.getTime() - sunrise.getTime()));
  const tithi = tithiIndexAt(morning);
  const nakshatra = nakshatraIndexAt(morning);
  const yoga = yogaIndexAt(morning);
  const karana = karanaIndexAt(morning);
  const month = panchang.tamil.month;

  let score = 50;
  let hardAvoid = false;
  const reasons: Reason[] = [];
  const add = (code: ReasonCode, good: boolean, delta: number, name?: Bilingual) => {
    score += delta;
    reasons.push({ code, good, name });
  };

  const position = tithiPosition(tithi);
  const tithiLabel = tithiName(tithi);
  if (tithi === 29) {
    hardAvoid = true;
    add('amavasai', false, -40, tithiLabel);
  } else if (STRONG_BAD_TITHI_POSITIONS.includes(position) || purpose.avoidTithis?.includes(position)) {
    add('badTithi', false, -20, tithiLabel);
  } else if (MILD_BAD_TITHI_POSITIONS.includes(position)) {
    add('badTithi', false, -10, tithiLabel);
  } else if (purpose.goodTithis.includes(position)) {
    add('goodTithi', true, 15, tithiLabel);
  }

  const star = NAKSHATRAS[nakshatra];
  if (purpose.goodNakshatras.includes(nakshatra)) add('goodNakshatra', true, 20, star);
  else if (BAD_NAKSHATRAS.includes(nakshatra)) add('badNakshatra', false, -20, star);

  // Unfavourable yogas and Bhadra karanam still appear on about one in ten of the listed 2026
  // wedding dates, so they count against a day without ruling it out.
  if (BAD_YOGAS.includes(yoga)) add('badYoga', false, -15, YOGAS[yoga]);
  if (isVishti(karana)) add('vishti', false, -10, karanaName(karana));

  if (purpose.goodWeekdays.includes(weekday)) add('goodWeekday', true, 10, WEEKDAYS[weekday]);
  else if (purpose.badWeekdays.includes(weekday)) add('badWeekday', false, -15, WEEKDAYS[weekday]);

  const monthName = TAMIL_MONTHS[month];
  if (purpose.avoidMonths.includes(month)) {
    // Printed Tamil calendars (Vakya) can start a month a day later than this app, so the first
    // day of an avoided month is a caution rather than a hard avoid.
    if (panchang.tamil.day === 1) {
      add('cautionMonth', false, -15, monthName);
    } else {
      hardAvoid = true;
      add('avoidMonth', false, -40, monthName);
    }
  } else if (purpose.cautionMonths.includes(month)) {
    add('cautionMonth', false, -15, monthName);
  }

  const specials = observances;
  if (specials.some((x) => x.id === 'karinaal')) {
    hardAvoid = true;
    add('karinaal', false, -30);
  }

  if (profile.birthNakshatra !== null) {
    const count = ((nakshatra - profile.birthNakshatra + 27) % 27) + 1;
    const tara = count % 9 === 0 ? 9 : count % 9;
    if (TARA_BAD.includes(tara)) add('taraBad', false, -20);
    else add('taraGood', true, 10);
  }

  if (profile.birthRashi !== null) {
    const midday = julianDay(morning);
    const position12 = ((moonRashiAt(midday) - profile.birthRashi + 12) % 12) + 1;
    if (position12 === 8) {
      hardAvoid = true;
      add('chandrashtama', false, -30, RASHIS[moonRashiAt(midday)]);
    } else if ([4, 12].includes(position12)) add('chandraBad', false, -20, RASHIS[moonRashiAt(midday)]);
    else if ([1, 3, 6, 7, 10, 11].includes(position12)) add('chandraGood', true, 5, RASHIS[moonRashiAt(midday)]);
  }

  score = Math.max(0, Math.min(100, score));
  if (hardAvoid) score = Math.min(score, 30);
  return {
    date,
    weekday,
    tamil: panchang.tamil,
    tithi,
    nakshatra,
    yoga,
    karana,
    score,
    grade: gradeOf(score),
    reasons,
    specials,
  };
}

export type MonthDay = { panchang: DaySummary; specials: SpecialDay[] };

/** The sun times, Tamil date and observance days of every day of a month. Independent of purpose, so it can be reused. */
export function monthDays(year: number, month: number, place: Place): MonthDay[] {
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return Array.from({ length: days }, (_, i) => {
    const panchang = daySummary({ y: year, m: month, d: i + 1 }, place);
    return { panchang, specials: specialDays(panchang) };
  });
}

export const judgeMonthDays = (days: MonthDay[], purpose: Purpose, profile: Profile): DayVerdict[] =>
  days.map((d) => judgeDay(d.panchang, purpose, profile, d.specials));

export function judgeMonth(year: number, month: number, place: Place, purpose: Purpose, profile: Profile): DayVerdict[] {
  return judgeMonthDays(monthDays(year, month, place), purpose, profile);
}
