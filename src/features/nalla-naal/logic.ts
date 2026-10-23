import { dayPanchang, dominantSpan, isVishti, moonRashiAt, tithiPosition, type DayPanchang, type TamilDate } from '@core/astro/panchang';
import type { Place } from '@core/astro/sunrise';
import { julianDay, weekdayOf, type CivilDate } from '@core/astro/time';
import type { Bilingual } from '@core/i18n';
import { NAKSHATRAS, RASHIS, TAMIL_MONTHS, WEEKDAYS, YOGAS, karanaName, tithiName } from '@core/astro/names';

import type { Purpose } from './data/purposes';

/** Nakshatras traditionally avoided for new beginnings (fierce / sharp types). */
const BAD_NAKSHATRAS = [1, 2, 5, 8, 10, 17, 19, 24];
/** Yogas considered inauspicious: Vishkumbha, Atiganda, Shoola, Ganda, Vyaghata, Vajra, Vyatipata, Parigha, Vaidhriti. */
const BAD_YOGAS = [0, 5, 8, 9, 12, 14, 16, 18, 26];
const RIKTA_AND_ASHTAMI = [4, 8, 9, 14];

export type ReasonCode =
  | 'goodTithi' | 'badTithi' | 'amavasai'
  | 'goodNakshatra' | 'badNakshatra' | 'badYoga' | 'vishti'
  | 'goodWeekday' | 'badWeekday' | 'avoidMonth' | 'cautionMonth'
  | 'taraGood' | 'taraBad' | 'chandraGood' | 'chandraBad' | 'chandrashtama';

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
};

export const gradeOf = (score: number): Grade =>
  score >= 75 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'poor';

/** Tarabalam: 1-based count from the birth star, folded into groups of nine. */
const TARA_BAD = [1, 3, 5, 7];

export function judgeDay(panchang: DayPanchang, purpose: Purpose, profile: Profile): DayVerdict {
  const { date, sunrise, sunset } = panchang;
  const weekday = weekdayOf(date);
  const tithi = dominantSpan(panchang.tithi, sunrise, sunset).index;
  const nakshatra = dominantSpan(panchang.nakshatra, sunrise, sunset).index;
  const yoga = dominantSpan(panchang.yoga, sunrise, sunset).index;
  const karana = dominantSpan(panchang.karana, sunrise, sunset).index;
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
  } else if (RIKTA_AND_ASHTAMI.includes(position)) {
    add('badTithi', false, -20, tithiLabel);
  } else if (purpose.goodTithis.includes(position)) {
    add('goodTithi', true, 15, tithiLabel);
  }

  const star = NAKSHATRAS[nakshatra];
  if (purpose.goodNakshatras.includes(nakshatra)) add('goodNakshatra', true, 20, star);
  else if (BAD_NAKSHATRAS.includes(nakshatra)) add('badNakshatra', false, -20, star);

  if (BAD_YOGAS.includes(yoga)) add('badYoga', false, -20, YOGAS[yoga]);
  if (isVishti(karana)) add('vishti', false, -15, karanaName(karana));

  if (purpose.goodWeekdays.includes(weekday)) add('goodWeekday', true, 10, WEEKDAYS[weekday]);
  else if (purpose.badWeekdays.includes(weekday)) add('badWeekday', false, -15, WEEKDAYS[weekday]);

  const monthName = TAMIL_MONTHS[month];
  if (purpose.avoidMonths.includes(month)) {
    hardAvoid = true;
    add('avoidMonth', false, -40, monthName);
  } else if (purpose.cautionMonths.includes(month)) {
    add('cautionMonth', false, -15, monthName);
  }

  if (profile.birthNakshatra !== null) {
    const count = ((nakshatra - profile.birthNakshatra + 27) % 27) + 1;
    const tara = count % 9 === 0 ? 9 : count % 9;
    if (TARA_BAD.includes(tara)) add('taraBad', false, -20);
    else add('taraGood', true, 10);
  }

  if (profile.birthRashi !== null) {
    const midday = julianDay(new Date((sunrise.getTime() + sunset.getTime()) / 2));
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
  };
}

export function judgeMonth(year: number, month: number, place: Place, purpose: Purpose, profile: Profile): DayVerdict[] {
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return Array.from({ length: days }, (_, i) =>
    judgeDay(dayPanchang({ y: year, m: month, d: i + 1 }, place), purpose, profile),
  );
}
