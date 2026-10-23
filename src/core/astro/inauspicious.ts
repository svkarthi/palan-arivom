/**
 * Tithi positions within a paksha. Ashtami and Navami are avoided outright; Chaturthi and
 * Chaturdashi (the other Rikta tithis) are treated as a caution, because the 2026 muhurtham
 * list of tamildailycalendar.com includes days with them while it has none with Ashtami or Navami.
 */
export const STRONG_BAD_TITHI_POSITIONS = [8, 9];
export const MILD_BAD_TITHI_POSITIONS = [4, 14];

/** Nakshatras traditionally avoided for new beginnings (fierce / sharp types). */
export const BAD_NAKSHATRAS = [1, 2, 5, 8, 10, 17, 19, 24];

/** Yogas considered inauspicious: Vishkumbha, Atiganda, Shoola, Ganda, Vyaghata, Vajra, Vyatipata, Parigha, Vaidhriti. */
export const BAD_YOGAS = [0, 5, 8, 9, 12, 14, 16, 18, 26];

/** Tithi index 0-29 (29 = Amavasai). */
export const isAmavasai = (tithiIndex: number): boolean => tithiIndex === 29;

export type Severity = 'avoid' | 'caution';

export function tithiSeverity(tithiIndex: number): Severity | null {
  const position = (tithiIndex % 15) + 1;
  if (isAmavasai(tithiIndex) || STRONG_BAD_TITHI_POSITIONS.includes(position)) return 'avoid';
  if (MILD_BAD_TITHI_POSITIONS.includes(position)) return 'caution';
  return null;
}

export const isBadYoga = (yogaIndex: number): boolean => BAD_YOGAS.includes(yogaIndex);
