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

/**
 * Complete Padhigam catalogue across all traditions.
 * Phase 1 populates Thevaram & Thiruvasagam; Phase 2 hymn arrays plug in seamlessly here.
 */
export const PADHIGAMS: Padhigam[] = [
  ...THEVARAM_HYMNS,
  ...THIRUVASAGAM_HYMNS,
  ...MURUGAN_HYMNS,
  ...VINAYAGAR_HYMNS,
  ...AMMAN_HYMNS,
  ...PERUMAL_HYMNS,
];

export const PADHIGAM_BY_ID: Record<string, Padhigam> = Object.fromEntries(
  PADHIGAMS.map((p) => [p.id, p]),
);

/** Traditions that currently have at least one hymn populated (Phase 1: thevaram, thiruvasagam). */
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

const WEEKDAY_DEFAULT_ID: Record<number, string> = {
  0: 'kolaru-padhigam',
  1: 'thiruneetru-padhigam',
  2: 'sotrunai-vedhiyan',
  3: 'vaasi-theerave',
  4: 'thiru-angamaalai',
  5: 'kallur-perumanam',
  6: 'achappathu',
};

const pickById = (id: string): Padhigam => PADHIGAM_BY_ID[id] ?? PADHIGAMS[0];

/**
 * Contextual daily Padhigam suggestion — strictly scoped to Thevaram & Thiruvasagam in Phase 1.
 * Phase 2 hooks for Murugan / Vinayagar / Amman / Perumal observances can be added here once
 * their respective `hymns/*.ts` arrays are populated.
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

  if (day.panchang.tamil.month === MARGAZHI_MONTH && (localHour === undefined || localHour < 10)) {
    return {
      padhigam: pickById('thiruppalliezhuchi'),
      badge: { ta: 'மார்கழி அதிகாலை', en: 'Margazhi Dawn' },
      reason: {
        ta: 'மார்கழி அதிகாலைப் பாராயணம் — நாள் மங்கலமாகத் தொடங்க',
        en: 'Margazhi morning recitation to begin the day auspiciously',
      },
    };
  }

  if (day.weekday === 1) {
    const id = day.panchang.tamil.day % 2 === 0 ? 'thiruneetru-padhigam' : 'matru-patru';
    return {
      padhigam: pickById(id),
      badge: { ta: 'சோமவார வழிபாடு', en: 'Somavaram Worship' },
      reason: {
        ta: 'சோமவாரம் (திங்கள்) — சிவ வழிபாட்டுக்கு உகந்த பதிகம்',
        en: 'Somavaram (Monday) — auspicious Thevaram for Shiva worship',
      },
    };
  }

  const fallbackId = WEEKDAY_DEFAULT_ID[day.weekday] ?? 'kolaru-padhigam';
  return {
    padhigam: pickById(fallbackId),
    badge: { ta: 'இன்றைய பதிகம்', en: 'Today’s Padhigam' },
    reason: {
      ta: 'இன்றைய தினசரி தேவாரம் / திருவாசகம் பாராயணம்',
      en: 'Today’s daily Thevaram / Thiruvasagam recitation',
    },
  };
}

export type FilterCategory = ReliefCategory | 'all' | 'favorites';
export type FilterSaint = SaintId | 'all';

/** Pure search & filter helper for PadhigamLibraryScreen. */
export function filterPadhigams(
  list: Padhigam[],
  opts: {
    query: string;
    category: FilterCategory;
    saint: FilterSaint;
    favorites: readonly string[];
  },
): Padhigam[] {
  const q = opts.query.trim().toLowerCase();
  const favSet = opts.category === 'favorites' ? new Set(opts.favorites) : null;

  return list.filter((p) => {
    if (favSet && !favSet.has(p.id)) return false;
    if (opts.category !== 'all' && opts.category !== 'favorites' && !p.categories.includes(opts.category)) {
      return false;
    }
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
