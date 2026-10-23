import type { Bilingual } from '@core/i18n';

export type PurposeId = 'marriage' | 'griha' | 'business' | 'vehicle' | 'travel' | 'baby' | 'education';

export type Purpose = {
  id: PurposeId;
  icon: string;
  name: Bilingual;
  /** Tithi positions within a paksha (1-15) that suit the purpose. */
  goodTithis: number[];
  /** Nakshatra indices 0-26 that suit the purpose. */
  goodNakshatras: number[];
  goodWeekdays: number[];
  badWeekdays: number[];
  /** Tamil months (0 = Chithirai) to avoid outright. */
  avoidMonths: number[];
  /** Tamil months to treat with caution. */
  cautionMonths: number[];
};

const TITHIS = [2, 3, 5, 7, 10, 11, 13];
const AADI = 3;
const PURATTASI = 5;
const MARGAZHI = 8;

// Nakshatra indices: 0 Ashwini 1 Bharani 2 Krittika 3 Rohini 4 Mrigashira 5 Ardra 6 Punarvasu 7 Pushya
// 8 Ashlesha 9 Magha 10 P.Phalguni 11 U.Phalguni 12 Hasta 13 Chitra 14 Swati 15 Vishakha 16 Anuradha
// 17 Jyeshtha 18 Mula 19 P.Ashadha 20 U.Ashadha 21 Shravana 22 Dhanishta 23 Shatabhisha 24 P.Bhadra
// 25 U.Bhadra 26 Revati
export const PURPOSES: Purpose[] = [
  {
    id: 'marriage',
    icon: '💍',
    name: { ta: 'திருமணம்', en: 'Marriage' },
    goodTithis: [...TITHIS, 12],
    goodNakshatras: [3, 4, 9, 11, 12, 14, 16, 18, 20, 25, 26],
    goodWeekdays: [1, 3, 4, 5],
    badWeekdays: [2, 6],
    avoidMonths: [AADI, MARGAZHI],
    cautionMonths: [PURATTASI],
  },
  {
    id: 'griha',
    icon: '🏡',
    name: { ta: 'கிரகப்பிரவேசம்', en: 'House-warming' },
    goodTithis: TITHIS,
    goodNakshatras: [3, 4, 6, 7, 11, 13, 16, 20, 22, 23, 25, 26],
    goodWeekdays: [1, 3, 4, 5],
    badWeekdays: [2, 6],
    avoidMonths: [AADI, MARGAZHI],
    cautionMonths: [PURATTASI],
  },
  {
    id: 'business',
    icon: '🏪',
    name: { ta: 'புதிய தொழில் / கடை', en: 'New business' },
    goodTithis: [...TITHIS, 12, 15],
    goodNakshatras: [0, 3, 4, 6, 7, 11, 12, 13, 14, 16, 20, 21, 22, 26],
    goodWeekdays: [3, 4, 5],
    badWeekdays: [2, 6],
    avoidMonths: [],
    cautionMonths: [AADI, MARGAZHI],
  },
  {
    id: 'vehicle',
    icon: '🚗',
    name: { ta: 'வாகனம் / நகை வாங்க', en: 'Buying vehicle / gold' },
    goodTithis: [...TITHIS, 6, 12],
    goodNakshatras: [0, 3, 4, 6, 7, 12, 13, 14, 16, 21, 22, 26],
    goodWeekdays: [1, 3, 4, 5],
    badWeekdays: [2, 6],
    avoidMonths: [],
    cautionMonths: [AADI],
  },
  {
    id: 'travel',
    icon: '✈️',
    name: { ta: 'பயணம்', en: 'Travel' },
    goodTithis: [...TITHIS, 1],
    goodNakshatras: [0, 4, 6, 7, 12, 14, 16, 21, 22, 26],
    goodWeekdays: [1, 3, 4, 5],
    badWeekdays: [2],
    avoidMonths: [],
    cautionMonths: [],
  },
  {
    id: 'baby',
    icon: '👶',
    name: { ta: 'குழந்தை சடங்குகள் (பெயர்சூட்டு, காது குத்து)', en: 'Baby ceremonies (naming, ear-piercing)' },
    goodTithis: [...TITHIS, 6, 12],
    goodNakshatras: [0, 3, 4, 6, 7, 12, 13, 14, 16, 21, 22, 26],
    goodWeekdays: [1, 3, 4, 5],
    badWeekdays: [2, 6],
    avoidMonths: [],
    cautionMonths: [AADI],
  },
  {
    id: 'education',
    icon: '📚',
    name: { ta: 'கல்வி தொடக்கம் (வித்யாரம்பம்)', en: 'Starting education' },
    goodTithis: [...TITHIS, 12],
    goodNakshatras: [0, 4, 6, 7, 12, 13, 14, 21, 22, 26],
    goodWeekdays: [3, 4, 5],
    badWeekdays: [2, 6],
    avoidMonths: [],
    cautionMonths: [],
  },
];

export const PURPOSE_BY_ID = Object.fromEntries(PURPOSES.map((p) => [p.id, p])) as Record<PurposeId, Purpose>;
