import type { IconName } from '@core/components/ui';
import type { Bilingual } from '@core/i18n';
import { colors } from '@core/theme';

import type { ReliefCategory, SaintId, TraditionId } from './types';

export type CategoryMeta = {
  id: ReliefCategory;
  icon: IconName;
  color: string;
  bg: string;
  label: Bilingual;
};

export const RELIEF_CATEGORIES: CategoryMeta[] = [
  {
    id: 'planetary',
    icon: 'orbit',
    color: colors.primaryDark,
    bg: colors.primaryBg,
    label: { ta: 'கிரக தோஷம்', en: 'Planetary' },
  },
  {
    id: 'health',
    icon: 'heart-pulse',
    color: colors.good,
    bg: colors.goodBg,
    label: { ta: 'ஆரோக்கியம்', en: 'Health' },
  },
  {
    id: 'fear',
    icon: 'shield-check-outline',
    color: colors.primary,
    bg: colors.primaryBg,
    label: { ta: 'பயம் & பாதுகாப்பு', en: 'Protection' },
  },
  {
    id: 'peace',
    icon: 'meditation',
    color: '#5E35B1',
    bg: '#EDE7F6',
    label: { ta: 'மன அமைதி', en: 'Peace' },
  },
  {
    id: 'financial',
    icon: 'hand-coin-outline',
    color: colors.ok,
    bg: colors.okBg,
    label: { ta: 'பொருளாதாரம்', en: 'Prosperity' },
  },
  {
    id: 'family',
    icon: 'home-heart',
    color: '#AD1457',
    bg: '#FCE4EC',
    label: { ta: 'திருமணம் & குடும்பம்', en: 'Marriage & Family' },
  },
  {
    id: 'worship',
    icon: 'fire',
    color: '#8D4B0A',
    bg: colors.surface,
    label: { ta: 'தினசரி வழிபாடு', en: 'Daily Worship' },
  },
];

export const CATEGORY_BY_ID: Record<ReliefCategory, CategoryMeta> = Object.fromEntries(
  RELIEF_CATEGORIES.map((c) => [c.id, c]),
) as Record<ReliefCategory, CategoryMeta>;

export type SaintMeta = {
  id: SaintId;
  shortLabel: Bilingual;
  fullName: Bilingual;
  tradition: TraditionId;
};

export const SAINTS: SaintMeta[] = [
  {
    id: 'sambandar',
    shortLabel: { ta: 'சம்பந்தர்', en: 'Sambandar' },
    fullName: { ta: 'திருஞானசம்பந்த சுவாமிகள்', en: 'Thirugnanasambandar' },
    tradition: 'thevaram',
  },
  {
    id: 'appar',
    shortLabel: { ta: 'அப்பர்', en: 'Appar' },
    fullName: { ta: 'திருநாவுக்கரசு சுவாமிகள் (அப்பர்)', en: 'Thirunavukkarasar (Appar)' },
    tradition: 'thevaram',
  },
  {
    id: 'sundarar',
    shortLabel: { ta: 'சுந்தரர்', en: 'Sundarar' },
    fullName: { ta: 'சுந்தரமூர்த்தி சுவாமிகள்', en: 'Sundaramoorthy Nayanar' },
    tradition: 'thevaram',
  },
  {
    id: 'manikkavacakar',
    shortLabel: { ta: 'மாணிக்கவாசகர்', en: 'Manikkavacakar' },
    fullName: { ta: 'மாணிக்கவாசக சுவாமிகள்', en: 'Manikkavacakar' },
    tradition: 'thiruvasagam',
  },
];

export type TraditionMeta = {
  id: TraditionId;
  label: Bilingual;
};

/**
 * Full tradition registry. Phase 1 populates Thevaram & Thiruvasagam;
 * Phase 2 traditions stay hidden in the UI until their hymn files contain entries.
 */
export const TRADITIONS: TraditionMeta[] = [
  { id: 'thevaram', label: { ta: 'தேவாரம்', en: 'Thevaram' } },
  { id: 'thiruvasagam', label: { ta: 'திருவாசகம்', en: 'Thiruvasagam' } },
  { id: 'murugan', label: { ta: 'முருகன் பாடல்கள்', en: 'Murugan Hymns' } },
  { id: 'vinayagar', label: { ta: 'விநாயகர் பாடல்கள்', en: 'Vinayagar Hymns' } },
  { id: 'amman', label: { ta: 'அம்மன் பாடல்கள்', en: 'Amman Hymns' } },
  { id: 'perumal', label: { ta: 'பெருமாள் பாடல்கள்', en: 'Perumal Hymns' } },
];
