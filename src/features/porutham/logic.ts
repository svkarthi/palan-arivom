import type { Bilingual } from '@core/i18n';

export type PoruthamId =
  | 'dina'
  | 'gana'
  | 'mahendra'
  | 'streeDeergha'
  | 'yoni'
  | 'rashi'
  | 'rashiAdhipathi'
  | 'vasyam'
  | 'rajju'
  | 'vedhai';

export type MatchStatus = 'good' | 'moderate' | 'bad';

export type PoruthamItem = {
  id: PoruthamId;
  status: MatchStatus;
  critical?: boolean;
};

export type PoruthamResult = {
  items: PoruthamItem[];
  score: number;
  verdict: 'excellent' | 'good' | 'caution' | 'avoid';
};

// 0 = Deva, 1 = Manushya, 2 = Rakshasa (27 nakshatras)
const GANA = [
  0, 1, 2, 1, 0, 1, 0, 0, 2,
  2, 1, 1, 0, 2, 0, 2, 0, 2,
  2, 1, 1, 0, 2, 2, 1, 1, 0,
];

// Yoni animal index (0-13): Horse, Elephant, Sheep, Serpent, Dog, Cat, Rat, Cow, Buffalo, Tiger, Deer, Monkey, Mongoose, Lion
const YONI = [
  0, 1, 2, 3, 3, 4, 5, 2, 5,
  6, 6, 7, 8, 9, 8, 9, 10, 10,
  4, 11, 12, 11, 13, 0, 13, 7, 1,
];

// Classical sworn enemy Yoni pairs
const YONI_ENEMIES: [number, number][] = [
  [0, 8], // Horse - Buffalo
  [1, 13], // Elephant - Lion
  [2, 11], // Sheep - Monkey
  [3, 12], // Serpent - Mongoose
  [4, 10], // Dog - Deer
  [5, 6], // Cat - Rat
  [7, 9], // Cow - Tiger
];

// Rashi lord (0=Mars, 1=Venus, 2=Mercury, 3=Moon, 4=Sun, 5=Jupiter, 6=Saturn)
const RASHI_LORD = [0, 1, 2, 3, 4, 2, 1, 0, 5, 6, 6, 5];

// Planetary friends (symmetric approximation of classical Parashara friendship)
const FRIEND_PAIRS: [number, number][] = [
  [0, 3], [0, 4], [0, 5], // Mars
  [1, 2], [1, 6], // Venus
  [2, 4], // Mercury
  [3, 4], [3, 2], // Moon
  [4, 5], // Sun
];

// Vasyam rashis for each bride rashi (0-11)
const VASYAM: number[][] = [
  [4, 7], // Mesha -> Simha, Vrischika
  [3, 6], // Rishabha -> Kataka, Thulam
  [5], // Mithuna -> Kanni
  [7, 8], // Kataka -> Vrischika, Dhanus
  [6], // Simha -> Thulam
  [2, 11], // Kanni -> Mithuna, Meena
  [5, 9], // Thulam -> Kanni, Makara
  [3], // Vrischika -> Kataka
  [11], // Dhanus -> Meena
  [0, 10], // Makara -> Mesha, Kumbha
  [0], // Kumbha -> Mesha
  [9], // Meena -> Makara
];

// Rajju groups (0=Paada, 1=Kati, 2=Nabhi, 3=Kanta, 4=Siro)
const RAJJU = [
  0, 1, 2, 3, 4, 3, 2, 1, 0,
  0, 1, 2, 3, 4, 3, 2, 1, 0,
  0, 1, 2, 3, 4, 3, 2, 1, 0,
];

// Classical Vedhai (affliction) star pairs
const VEDHAI_PAIRS: [number, number][] = [
  [0, 17], [1, 16], [2, 15], [3, 14], [5, 21],
  [6, 20], [7, 19], [8, 18], [9, 26], [10, 25],
  [11, 24], [12, 23], [4, 13], [4, 22], [13, 22],
];

const hasPair = (pairs: [number, number][], a: number, b: number) =>
  pairs.some(([x, y]) => (x === a && y === b) || (x === b && y === a));

/** Default primary rashi (0-11) for a nakshatra (0-26), used to pre-select rashi when a star is tapped. */
export const defaultRashiForNakshatra = (nakshatra: number): number => Math.floor((nakshatra * 4) / 9);

/** All rashis (1 or 2) that a nakshatra spans. */
export function rashisForNakshatra(nakshatra: number): number[] {
  const r0 = Math.floor((nakshatra * 4) / 9);
  const r1 = Math.floor((nakshatra * 4 + 3) / 9);
  return r0 === r1 ? [r0] : [r0, r1];
}

export function evaluatePorutham(
  brideNakshatra: number,
  brideRashi: number,
  groomNakshatra: number,
  groomRashi: number,
): PoruthamResult {
  const starCount = ((groomNakshatra - brideNakshatra + 27) % 27) + 1;
  const rashiCount = ((groomRashi - brideRashi + 12) % 12) + 1;

  // 1. Dina
  const dinaMod = starCount % 9 === 0 ? 9 : starCount % 9;
  const dina: MatchStatus = [2, 4, 6, 8, 9].includes(dinaMod) ? 'good' : starCount === 27 ? 'moderate' : 'bad';

  // 2. Gana
  const bg = GANA[brideNakshatra];
  const gg = GANA[groomNakshatra];
  const gana: MatchStatus =
    bg === gg ? 'good' : (bg === 0 && gg === 1) || (bg === 1 && gg === 0) ? 'good' : bg === 2 && gg !== 2 ? 'bad' : 'moderate';

  // 3. Mahendra
  const mahendra: MatchStatus = [4, 7, 10, 13, 16, 19, 22, 25].includes(starCount) ? 'good' : 'bad';

  // 4. Stree Deergha
  const streeDeergha: MatchStatus = starCount >= 13 ? 'good' : starCount >= 7 ? 'moderate' : 'bad';

  // 5. Yoni
  const by = YONI[brideNakshatra];
  const gy = YONI[groomNakshatra];
  const yoni: MatchStatus = by === gy ? 'good' : hasPair(YONI_ENEMIES, by, gy) ? 'bad' : 'moderate';

  // 6. Rashi
  let rashi: MatchStatus;
  if ([7, 9, 10, 11, 12].includes(rashiCount)) rashi = 'good';
  else if (rashiCount === 1) rashi = groomNakshatra >= brideNakshatra ? 'good' : 'moderate';
  else if ([2, 6, 8].includes(rashiCount)) rashi = 'bad';
  else rashi = 'moderate';

  // 7. Rashi Adhipathi
  const bl = RASHI_LORD[brideRashi];
  const gl = RASHI_LORD[groomRashi];
  const rashiAdhipathi: MatchStatus =
    bl === gl || hasPair(FRIEND_PAIRS, bl, gl) ? 'good' : 'moderate';

  // 8. Vasyam
  const vasyam: MatchStatus =
    VASYAM[brideRashi].includes(groomRashi) || VASYAM[groomRashi].includes(brideRashi) ? 'good' : 'bad';

  // 9. Rajju (critical)
  const rajju: MatchStatus = RAJJU[brideNakshatra] !== RAJJU[groomNakshatra] ? 'good' : 'bad';

  // 10. Vedhai (critical)
  const vedhai: MatchStatus = !hasPair(VEDHAI_PAIRS, brideNakshatra, groomNakshatra) ? 'good' : 'bad';

  const items: PoruthamItem[] = [
    { id: 'dina', status: dina, critical: true },
    { id: 'gana', status: gana },
    { id: 'mahendra', status: mahendra },
    { id: 'streeDeergha', status: streeDeergha },
    { id: 'yoni', status: yoni, critical: true },
    { id: 'rashi', status: rashi, critical: true },
    { id: 'rashiAdhipathi', status: rashiAdhipathi },
    { id: 'vasyam', status: vasyam },
    { id: 'rajju', status: rajju, critical: true },
    { id: 'vedhai', status: vedhai, critical: true },
  ];

  const score = items.reduce((sum, i) => sum + (i.status === 'good' ? 1 : i.status === 'moderate' ? 0.5 : 0), 0);
  const criticalFail = rajju === 'bad' || vedhai === 'bad';
  const verdict = criticalFail
    ? 'avoid'
    : score >= 7.5
      ? 'excellent'
      : score >= 5.5
        ? 'good'
        : 'caution';

  return { items, score, verdict };
}

export const PORUTHAM_NAMES: Record<PoruthamId, Bilingual> = {
  dina: { ta: 'தினப் பொருத்தம்', en: 'Dina Porutham' },
  gana: { ta: 'கணப் பொருத்தம்', en: 'Gana Porutham' },
  mahendra: { ta: 'மகேந்திரப் பொருத்தம்', en: 'Mahendra Porutham' },
  streeDeergha: { ta: 'ஸ்திரீ தீர்க்கம்', en: 'Stree Deergha' },
  yoni: { ta: 'யோனிப் பொருத்தம்', en: 'Yoni Porutham' },
  rashi: { ta: 'ராசிப் பொருத்தம்', en: 'Rashi Porutham' },
  rashiAdhipathi: { ta: 'ராசி அதிபதி', en: 'Rashi Adhipathi' },
  vasyam: { ta: 'வசியப் பொருத்தம்', en: 'Vasyam Porutham' },
  rajju: { ta: 'ரஜ்ஜுப் பொருத்தம்', en: 'Rajju Porutham' },
  vedhai: { ta: 'வேதைப் பொருத்தம்', en: 'Vedhai Porutham' },
};
