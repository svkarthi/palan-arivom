import type { Bilingual } from '../i18n';
import { nakshatraStart, type Span } from './panchang';

const pair = (ta: string, en: string): Bilingual => ({ ta, en });

export type Direction = 'N' | 'E' | 'S' | 'W';

export const DIRECTION_NAMES: Record<Direction, Bilingual> = {
  N: pair('வடக்கு', 'North'),
  E: pair('கிழக்கு', 'East'),
  S: pair('தெற்கு', 'South'),
  W: pair('மேற்கு', 'West'),
};

/** Direction to avoid travelling towards (Sulam) for each weekday, Sunday first. */
const SULAM: Direction[] = ['W', 'E', 'N', 'N', 'S', 'W', 'E'];

/** What to offer or eat to counter the Sulam, by direction. */
export const PARIHARAM: Record<Direction, Bilingual> = {
  W: pair('வெல்லம்', 'Jaggery'),
  E: pair('தயிர்', 'Curd'),
  N: pair('பால்', 'Milk'),
  S: pair('தைலம்', 'Oil'),
};

export const sulamFor = (weekday: number): { direction: Direction; remedy: Direction } => ({
  direction: SULAM[weekday],
  remedy: SULAM[weekday],
});

/** Six Tamil seasons by Tamil month index 0-11, two months each. */
export const RITUS: { sanskrit: Bilingual; tamil: Bilingual }[] = [
  { sanskrit: pair('வசந்த ருது', 'Vasantha'), tamil: pair('இளவேனில் காலம்', 'Spring') },
  { sanskrit: pair('கிரீஷ்ம ருது', 'Greeshma'), tamil: pair('முதுவேனில் காலம்', 'Summer') },
  { sanskrit: pair('வர்ஷ ருது', 'Varsha'), tamil: pair('கார் காலம்', 'Monsoon') },
  { sanskrit: pair('ஷரத் ருது', 'Sharad'), tamil: pair('குளிர் காலம்', 'Autumn') },
  { sanskrit: pair('ஹேமந்த ருது', 'Hemantha'), tamil: pair('முன்பனிக் காலம்', 'Early winter') },
  { sanskrit: pair('சிசிர ருது', 'Sisira'), tamil: pair('பின்பனிக் காலம்', 'Late winter') },
];
export const ritu = (tamilMonth: number) => RITUS[Math.floor(tamilMonth / 2)];

/** Aadi to Margazhi (months 3-8) fall in Dakshinayana; the rest in Uttarayana. */
export const isDakshinayana = (tamilMonth: number): boolean => tamilMonth >= 3 && tamilMonth <= 8;
export const AYANA = { dakshinayana: pair('தட்சிணாயனம்', 'Dakshinayana'), uttarayana: pair('உத்தராயணம்', 'Uttarayana') };

/** Saka year for a Tamil year that began in April of `gregorianStartYear`. */
export const sakaYear = (gregorianStartYear: number): number => gregorianStartYear - 78;

/**
 * Start of the Thiyajyam (Varjyam) in each nakshatra, in ghatis (of 60) from the
 * beginning of that nakshatra. It lasts 4 of those 60 parts.
 */
const TYAJYA_GHATI = [
  50, 24, 30, 40, 14, 11, 30, 20, 32, 30, 20, 18, 22, 20, 14, 14, 10, 14, 20, 24, 20, 10, 10, 18, 16, 24, 30,
];

export type Thiyajyam = { nakshatra: number; start: number; end: number };

/** Thiyajyam windows overlapping [from, until], given the nakshatra spans of that period. */
export function thiyajyamWindows(spans: Span[], from: Date, until: Date): Thiyajyam[] {
  const windows: Thiyajyam[] = [];
  let begin = nakshatraStart(from).getTime();
  for (const span of spans) {
    const end = span.end.getTime();
    const length = end - begin;
    const start = begin + (TYAJYA_GHATI[span.index] / 60) * length;
    const stop = start + (4 / 60) * length;
    if (stop > from.getTime() && start < until.getTime()) windows.push({ nakshatra: span.index, start, end: stop });
    begin = end;
  }
  return windows;
}

export type Nokku = 'mel' | 'keezh' | 'sama';

// Nakshatra indices. Mel (upward-looking): Rohini, Thiruvathirai, Poosam, Uthiram, Uthiradam,
// Thiruvonam, Avittam, Sadayam, Uthirattathi. Keezh (downward-looking): Bharani, Karthigai, Ayilyam,
// Makam, Puram, Moolam, Pooradam, Poorattathi. The rest are Sama (level).
const MEL_NOKKU = [3, 5, 7, 11, 20, 21, 22, 23, 25];
const KEEZH_NOKKU = [1, 2, 8, 9, 10, 18, 19, 24];

/** Nokku Naal (the way a day "looks") from the nakshatra, as printed on Tamil calendars. */
export const nokkuNaal = (nakshatra: number): Nokku =>
  MEL_NOKKU.includes(nakshatra) ? 'mel' : KEEZH_NOKKU.includes(nakshatra) ? 'keezh' : 'sama';

export const NOKKU_NAMES: Record<Nokku, Bilingual> = {
  mel: pair('மேல் நோக்கு நாள்', 'Mel Nokku (upward-looking)'),
  keezh: pair('கீழ் நோக்கு நாள்', 'Keezh Nokku (downward-looking)'),
  sama: pair('சம நோக்கு நாள்', 'Sama Nokku (level)'),
};

export type DayYoga = 'amirtha' | 'siddha' | 'marana';

// Classical Thirukanitha Tamil weekday + nakshatra table (Amirtha, Siddha, Marana Yogam).
// Index 0 = Sunday … 6 = Saturday; values are 0-based nakshatra indices.
const AMIRTHA_YOGA: number[][] = [
  [11, 12, 18, 20, 25], // Sun: Uthiram, Hastham, Moolam, Uthiradam, Uthirattathi
  [3, 4, 6, 7, 12, 16, 21, 23, 25], // Mon
  [3, 11, 17, 18, 25, 26], // Tue
  [2, 7, 12, 16, 21, 25], // Wed
  [0, 3, 6, 7, 11, 14, 15, 16, 26], // Thu
  [0, 12, 16, 21, 26], // Fri
  [3, 4, 12, 14, 15, 16, 21, 23], // Sat
];

const MARANA_YOGA: number[][] = [
  [1, 2, 7, 9, 13, 15, 17, 22, 24], // Sun
  [2, 5, 8, 9, 10, 13, 15, 17, 18, 19, 24], // Mon
  [5, 7, 8, 10, 12, 13, 14, 15, 16, 21, 23], // Tue
  [0, 1, 5, 6, 8, 9, 10, 15, 17, 18, 19, 22, 24, 26], // Wed
  [1, 2, 4, 5, 8, 9, 10, 12, 13, 17, 18, 19, 22, 23, 24], // Thu
  [1, 2, 3, 7, 8, 9, 10, 13, 15, 17, 18, 19, 22, 24], // Fri
  [0, 1, 2, 5, 8, 9, 10, 11, 13, 17, 18, 19, 20, 24, 25, 26], // Sat
];

/** Tamil daily yoga (Amirtha, Siddha, or Marana Yogam) from weekday and sunrise nakshatra. */
export function dayYoga(weekday: number, nakshatra: number): DayYoga {
  if (AMIRTHA_YOGA[weekday]?.includes(nakshatra)) return 'amirtha';
  if (MARANA_YOGA[weekday]?.includes(nakshatra)) return 'marana';
  return 'siddha';
}

export const DAY_YOGA_NAMES: Record<DayYoga, Bilingual> = {
  amirtha: pair('அமிர்த யோகம்', 'Amirtha Yogam'),
  siddha: pair('சித்த யோகம்', 'Siddha Yogam'),
  marana: pair('மரண யோகம்', 'Marana Yogam'),
};

/** Janma rashi for whom the Moon in `moonRashi` gives Chandrashtamam (the Moon is their 8th). */
export const chandrashtamaRashi = (moonRashi: number): number => (moonRashi + 5) % 12;

export type RashiStar = { nakshatra: number; padas: number[] };

/** The nakshatras (with their padas) that make up a rashi: nine padas per rashi. */
export function nakshatrasOfRashi(rashi: number): RashiStar[] {
  const out: RashiStar[] = [];
  for (let p = rashi * 9; p < rashi * 9 + 9; p++) {
    const nakshatra = Math.floor(p / 4);
    const pada = (p % 4) + 1;
    const last = out[out.length - 1];
    if (last && last.nakshatra === nakshatra) last.padas.push(pada);
    else out.push({ nakshatra, padas: [pada] });
  }
  return out;
}
