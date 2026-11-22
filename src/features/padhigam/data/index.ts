import { chandrashtamaRashi } from '@core/astro/dayExtras';
import type { Span } from '@core/astro/panchang';
import type { SpecialDay } from '@core/astro/specialDays';
import type { Bilingual } from '@core/i18n';

import { TRADITIONS, type TraditionMeta } from './categories';
import { AMMAN_HYMNS } from './hymns/amman';
import { MURUGAN_HYMNS } from './hymns/murugan';
import { PERUMAL_HYMNS } from './hymns/perumal';
import { THEVARAM_HYMNS } from './hymns/thevaram';
import { THIRUVASAGAM_HYMNS } from './hymns/thiruvasagam';
import { VINAYAGAR_HYMNS } from './hymns/vinayagar';
import type { Padhigam, ReliefCategory, SaintId, TraditionId } from './types';

/** Complete Padhigam catalogue across Thevaram, Thiruvasagam, Vinayagar, Murugan, Amman, and Perumal. */
export const PADHIGAMS: Padhigam[] = [
  ...THEVARAM_HYMNS,
  ...THIRUVASAGAM_HYMNS,
  ...VINAYAGAR_HYMNS,
  ...MURUGAN_HYMNS,
  ...AMMAN_HYMNS,
  ...PERUMAL_HYMNS,
];

export const PADHIGAM_BY_ID: Record<string, Padhigam> = Object.fromEntries(
  PADHIGAMS.map((p) => [p.id, p]),
);

/** Traditions that currently have at least one hymn populated. */
export function activeTraditions(): TraditionMeta[] {
  const present = new Set<TraditionId>(PADHIGAMS.map((p) => p.tradition));
  return TRADITIONS.filter((t) => present.has(t.id));
}

export type PadhigamRecommendation = {
  padhigam: Padhigam;
  reason: Bilingual;
  badge: Bilingual;
};

/** Minimal day context needed for contextual daily Padhigam suggestion (matches NallaNeramDay). */
export type PadhigamDayContext = {
  weekday: number;
  panchang: { tamil: { month: number; day: number } };
  specials: SpecialDay[];
  moonRashi: Span[];
};

const MARGAZHI_MONTH = 8;

const pickById = (id: string): Padhigam => PADHIGAM_BY_ID[id] ?? PADHIGAMS[0];

/**
 * Contextual daily Padhigam suggestion tied to today's Panchangam, personal Chandrashtamam,
 * monthly Viratham observances, Tamil festivals, and traditional weekday deity alignments.
 */
export function todayPadhigamRecommendation(
  day: PadhigamDayContext,
  birthRashi: number | null,
  localHour?: number,
): PadhigamRecommendation {
  const hasChandrashtama =
    birthRashi !== null && day.moonRashi.some((s) => chandrashtamaRashi(s.index) === birthRashi);
  const specialIds = new Set(day.specials.map((s) => s.id));

  if (hasChandrashtama) {
    return {
      padhigam: pickById('kolaru-padhigam'),
      badge: { ta: 'சந்திராஷ்டமப் பாதுகாப்பு', en: 'Chandrashtamam Shield' },
      reason: {
        ta: 'சந்திராஷ்டம நாள் — கிரக தோஷம் & தடை நீங்க கோளறு பதிகம் ஓதுக',
        en: 'Chandrashtamam day — recite Kolaru Padhigam for planetary protection',
      },
    };
  }

  if (specialIds.has('karinaal')) {
    return {
      padhigam: pickById('kolaru-padhigam'),
      badge: { ta: 'கரிநாள் பாதுகாப்பு', en: 'Karinaal Protection' },
      reason: {
        ta: 'இன்று கரிநாள் — கோளறு பதிகம் ஓதி நன்மை பெற',
        en: 'Karinaal today — recite Kolaru Padhigam for auspiciousness',
      },
    };
  }

  if (specialIds.has('mahaShivaratri')) {
    return {
      padhigam: pickById('sivapuranam'),
      badge: { ta: 'மகா சிவராத்திரி', en: 'Maha Shivaratri' },
      reason: {
        ta: 'இன்று மகா சிவராத்திரி — சிவபுராணப் பாராயணத்திற்கு மிக உகந்தது',
        en: 'Maha Shivaratri — especially auspicious for Sivapuranam recitation',
      },
    };
  }

  if (specialIds.has('pradosham')) {
    return {
      padhigam: pickById('sivapuranam'),
      badge: { ta: 'பிரதோஷப் பாராயணம்', en: 'Pradosham Recitation' },
      reason: {
        ta: 'இன்று பிரதோஷம் — சிவ வழிபாட்டுக்கு உகந்த திருவாசகம்',
        en: 'Pradosham today — auspicious Thiruvasagam for Shiva worship',
      },
    };
  }

  if (specialIds.has('thaiPoosam') || specialIds.has('panguniUthiram') || specialIds.has('shashti')) {
    return {
      padhigam: pickById('kanda-sashti-kavasam'),
      badge: { ta: 'முருகன் விரத நாள்', en: 'Murugan Observance' },
      reason: {
        ta: 'இன்று சஷ்டி / முருகன் திருநாள் — கந்த சஷ்டி கவசம் பாராயணம்',
        en: 'Murugan observance today — recite Kanda Sashti Kavasam for protection',
      },
    };
  }

  if (specialIds.has('karthigaiDeepam') || specialIds.has('karthigai')) {
    return {
      padhigam: pickById('kandar-alangaram-relief'),
      badge: { ta: 'கார்த்திகை வழிபாடு', en: 'Krittika Worship' },
      reason: {
        ta: 'இன்று கார்த்திகை — முருகன் அருளும் பாதுகாப்பும் பெற',
        en: 'Krittika today — recite Kandar Alangaram for Murugan’s shield',
      },
    };
  }

  if (specialIds.has('vinayakaChaturthi')) {
    return {
      padhigam: pickById('vinayagar-agaval'),
      badge: { ta: 'சதுர்த்தி வழிபாடு', en: 'Chaturthi Worship' },
      reason: {
        ta: 'இன்று சதுர்த்தி — தடை நீங்கி காரிய சித்தி பெற விநாயகர் அகவல்',
        en: 'Chaturthi today — recite Vinayagar Agaval for obstacle removal',
      },
    };
  }

  if (specialIds.has('sankashti')) {
    return {
      padhigam: pickById('mootha-nayanar-manimaalai'),
      badge: { ta: 'சங்கடஹர சதுர்த்தி', en: 'Sankashti Chaturthi' },
      reason: {
        ta: 'இன்று சங்கடஹர சதுர்த்தி — செய்கருமம் கைகூட விநாயகர் பதிகம்',
        en: 'Sankashti today — recite for removing hurdles and work success',
      },
    };
  }

  if (
    specialIds.has('navarathri') ||
    specialIds.has('saraswatiPooja') ||
    specialIds.has('vijayadashami') ||
    specialIds.has('aadiPerukku')
  ) {
    return {
      padhigam: pickById('abirami-andhadhi-prosperity'),
      badge: { ta: 'அம்மன் திருநாள்', en: 'Amman Festival' },
      reason: {
        ta: 'அம்மன் சிறப்பு நாள் — கல்வி, செல்வம் & ஐஸ்வர்யம் பெற அபிராமி அந்தாதி',
        en: 'Auspicious Amman day — recite Abirami Andhadhi for wisdom & prosperity',
      },
    };
  }

  if (specialIds.has('pournami')) {
    return {
      padhigam: pickById('abirami-padhigam'),
      badge: { ta: 'பௌர்ணமி வழிபாடு', en: 'Pournami Worship' },
      reason: {
        ta: 'இன்று பௌர்ணமி — அபிராமி அன்னையின் பதினாறு பேறு பெறப் பாராயணம்',
        en: 'Pournami today — recite Abirami Padhigam for longevity & blessings',
      },
    };
  }

  if (specialIds.has('ekadashi')) {
    const id = day.panchang.tamil.day % 2 === 0 ? 'thiruppallandu' : 'amalanadhipiran';
    return {
      padhigam: pickById(id),
      badge: { ta: 'ஏகாதசி வழிபாடு', en: 'Ekadashi Worship' },
      reason: {
        ta: 'இன்று ஏகாதசி — பெருமாள் அருளும் மங்கலமும் பெறப் பாசுரம்',
        en: 'Ekadashi today — auspicious Divya Prabandham for Perumal’s grace',
      },
    };
  }

  if (day.panchang.tamil.month === MARGAZHI_MONTH && (localHour === undefined || localHour < 10)) {
    const isEven = day.panchang.tamil.day % 2 === 0;
    return {
      padhigam: pickById(isEven ? 'thiruppavai' : 'thiruppalliezhuchi'),
      badge: { ta: 'மார்கழி அதிகாலை', en: 'Margazhi Dawn' },
      reason: {
        ta: isEven ? 'மார்கழி அதிகாலை — ஆண்டாள் திருப்பாவை பாராயணம்' : 'மார்கழி அதிகாலை — திருப்பள்ளியெழுச்சி பாராயணம்',
        en: isEven ? 'Margazhi morning — Andal’s Thiruppavai recitation' : 'Margazhi morning — Thiruppalliezhuchi dawn recitation',
      },
    };
  }

  // Traditional Tamil weekday deity rhythm
  switch (day.weekday) {
    case 1: {
      const id = day.panchang.tamil.day % 2 === 0 ? 'thiruneetru-padhigam' : 'matru-patru';
      return {
        padhigam: pickById(id),
        badge: { ta: 'சோமவார வழிபாடு', en: 'Somavaram (Mon)' },
        reason: {
          ta: 'திங்கட்கிழமை (சோமவாரம்) — சிவ வழிபாட்டுக்கு உகந்த தேவாரம்',
          en: 'Monday (Somavaram) — auspicious Thevaram for Lord Shiva',
        },
      };
    }
    case 2:
      return {
        padhigam: pickById('kanda-sashti-kavasam'),
        badge: { ta: 'செவ்வாய் வழிபாடு', en: 'Tuesday Worship' },
        reason: {
          ta: 'செவ்வாய்க்கிழமை — முருகன் அருளும் பாதுகாப்பும் பெற',
          en: 'Tuesday — auspicious Murugan recitation for courage & protection',
        },
      };
    case 3:
      return {
        padhigam: pickById('vinayagar-agaval'),
        badge: { ta: 'புதன் வழிபாடு', en: 'Wednesday Worship' },
        reason: {
          ta: 'புதன்கிழமை — அறிவு, கல்வி & காரிய சித்தி பெற விநாயகர் அகவல்',
          en: 'Wednesday — recite Vinayagar Agaval for wisdom & success',
        },
      };
    case 4:
      return {
        padhigam: pickById('thiru-angamaalai'),
        badge: { ta: 'வியாழன் வழிபாடு', en: 'Thursday Worship' },
        reason: {
          ta: 'வியாழக்கிழமை — மன ஒருமைப்பாடும் குரு அருளும் பெற',
          en: 'Thursday — recite for mindful devotion and steady calm',
        },
      };
    case 5:
      return {
        padhigam: pickById('abirami-andhadhi-prosperity'),
        badge: { ta: 'வெள்ளி வழிபாடு', en: 'Friday Worship' },
        reason: {
          ta: 'வெள்ளிக்கிழமை — அம்மன் அருளும் செல்வ வளமும் பெற அபிராமி அந்தாதி',
          en: 'Friday — recite Abirami Andhadhi for Goddess grace & abundance',
        },
      };
    case 6:
      return {
        padhigam: pickById('thiruppallandu'),
        badge: { ta: 'சனிக்கிழமை வழிபாடு', en: 'Saturday Worship' },
        reason: {
          ta: 'சனிக்கிழமை — பெருமாள் அருளும் குடும்ப மங்கலமும் பெற',
          en: 'Saturday — recite Thiruppallandu for Perumal’s blessings',
        },
      };
    default:
      return {
        padhigam: pickById('kolaru-padhigam'),
        badge: { ta: 'ஞாயிறு வழிபாடு', en: 'Sunday Worship' },
        reason: {
          ta: 'ஞாயிற்றுக்கிழமை — நவக்கிரக நன்மை பெற கோளறு திருப்பதிகம்',
          en: 'Sunday — recite Kolaru Padhigam for planetary grace',
        },
      };
  }
}

export type FilterCategory = ReliefCategory | 'all' | 'favorites';
export type FilterTradition = TraditionId | 'all';
export type FilterSaint = SaintId | 'all';

/** Pure search & filter helper for PadhigamLibraryScreen. */
export function filterPadhigams(
  list: Padhigam[],
  opts: {
    query: string;
    category: FilterCategory;
    tradition?: FilterTradition;
    saint: FilterSaint;
    favorites: readonly string[];
  },
): Padhigam[] {
  const q = opts.query.trim().toLowerCase();
  const favSet = opts.category === 'favorites' ? new Set(opts.favorites) : null;
  const tradition = opts.tradition ?? 'all';

  return list.filter((p) => {
    if (favSet && !favSet.has(p.id)) return false;
    if (opts.category !== 'all' && opts.category !== 'favorites' && !p.categories.includes(opts.category)) {
      return false;
    }
    if (tradition !== 'all' && p.tradition !== tradition) return false;
    if (opts.saint !== 'all' && p.saint !== opts.saint) return false;
    if (!q) return true;
    const haystack = [
      p.reliefTitle.ta,
      p.reliefTitle.en,
      p.title.ta,
      p.title.en,
      p.openingLineTa,
      p.blessingSummary.ta,
      p.blessingSummary.en,
      p.author.ta,
      p.author.en,
      p.source.ta,
      p.source.en,
      ...p.keywords,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function dateKeyOf(d: { y: number; m: number; d: number }): string {
  const mm = String(d.m).padStart(2, '0');
  const dd = String(d.d).padStart(2, '0');
  return `${d.y}-${mm}-${dd}`;
}
