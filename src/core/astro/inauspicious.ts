/** Tithi positions within a paksha that are avoided: Chaturthi, Ashtami, Navami, Chaturdashi. */
export const AVOIDED_TITHI_POSITIONS = [4, 8, 9, 14];

/** Nakshatras traditionally avoided for new beginnings (fierce / sharp types). */
export const BAD_NAKSHATRAS = [1, 2, 5, 8, 10, 17, 19, 24];

/** Yogas considered inauspicious: Vishkumbha, Atiganda, Shoola, Ganda, Vyaghata, Vajra, Vyatipata, Parigha, Vaidhriti. */
export const BAD_YOGAS = [0, 5, 8, 9, 12, 14, 16, 18, 26];

/** Tithi index 0-29 (29 = Amavasai). */
export const isAmavasai = (tithiIndex: number): boolean => tithiIndex === 29;

export const isAvoidedTithi = (tithiIndex: number): boolean =>
  isAmavasai(tithiIndex) || AVOIDED_TITHI_POSITIONS.includes((tithiIndex % 15) + 1);

export const isBadYoga = (yogaIndex: number): boolean => BAD_YOGAS.includes(yogaIndex);
