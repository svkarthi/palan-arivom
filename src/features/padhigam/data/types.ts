import type { SpecialId } from '@core/astro/specialDays';
import type { Bilingual } from '@core/i18n';

/**
 * Devotional traditions supported by the Padhigam library.
 * Phase 1 populates `'thevaram'` and `'thiruvasagam'`;
 * `'murugan'`, `'vinayagar'`, `'amman'`, and `'perumal'` are reserved for Phase 2.
 */
export type TraditionId = 'thevaram' | 'thiruvasagam' | 'murugan' | 'vinayagar' | 'amman' | 'perumal';

/** Author / saint identifier (நால்வர் in Phase 1, extensible for Phase 2). */
export type SaintId = 'sambandar' | 'appar' | 'sundarar' | 'manikkavacakar' | 'other';

/** Relief or blessing category that helps users choose the right Padhigam for their need. */
export type ReliefCategory =
  | 'planetary'
  | 'health'
  | 'fear'
  | 'peace'
  | 'financial'
  | 'family'
  | 'worship';

export type Verse = {
  number: number;
  /** Optional stanza title (used for longer hymns such as Sivapuranam). */
  label?: Bilingual;
  /** Classical Tamil poetic lines, preserving traditional line breaks. */
  linesTa: string[];
  /** Concise verse meaning in Tamil (பொழிப்புரை) and English. */
  meaning?: Bilingual;
};

export type Padhigam = {
  id: string;
  tradition: TraditionId;
  saint: SaintId;
  /** Primary relief / blessing headline shown prominently on cards. */
  reliefTitle: Bilingual;
  /** Classical Padhigam title (e.g., கோளறு பதிகம்). */
  title: Bilingual;
  /** Famous opening Tamil line / hook. */
  openingLineTa: string;
  /** Short explanation of the relief and blessings associated with reciting this Padhigam. */
  blessingSummary: Bilingual;
  categories: ReliefCategory[];
  author: Bilingual;
  /** Thirumurai / scripture reference (e.g., 2ஆம் திருமுறை · 2.85). */
  source: Bilingual;
  /** Sacred temple / shrine where the hymn was sung (if applicable). */
  shrine?: Bilingual;
  /** Traditional guidance on when and how to recite. */
  howToRecite: Bilingual;
  /** Additional bilingual search keywords (Tamil & English). */
  keywords: string[];
  /** Suggested weekdays (0 = Sunday .. 6 = Saturday). */
  recommendedWeekdays?: number[];
  /** Suggested special observance / festival IDs. */
  recommendedSpecials?: SpecialId[];
  /** Whether this Padhigam is especially recommended on personal Chandrashtamam days. */
  recommendedOnChandrashtama?: boolean;
  verses: Verse[];
};
