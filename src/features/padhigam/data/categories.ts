import type { SpecialId } from '@core/astro/specialDays';
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
  shortLabel: Bilingual;
  invocation: Bilingual;
  icon: IconName;
  color: string;
  bg: string;
  heroGradient: readonly [string, string, string];
};

/** Full deity & scripture tradition registry; UI shows every populated tradition automatically. */
export const TRADITIONS: TraditionMeta[] = [
  {
    id: 'thevaram',
    label: { ta: 'தேவாரம் (சிவன்)', en: 'Thevaram (Shiva)' },
    shortLabel: { ta: 'தேவாரம்', en: 'Thevaram' },
    invocation: { ta: 'திருச்சிற்றம்பலம்', en: 'Thiruchitrambalam' },
    icon: 'fire',
    color: colors.primaryDark,
    bg: colors.primaryBg,
    heroGradient: ['#982A1E', '#7A1F1F', '#551414'],
  },
  {
    id: 'thiruvasagam',
    label: { ta: 'திருவாசகம் (சிவன்)', en: 'Thiruvasagam (Shiva)' },
    shortLabel: { ta: 'திருவாசகம்', en: 'Thiruvasagam' },
    invocation: { ta: 'திருச்சிற்றம்பலம்', en: 'Thiruchitrambalam' },
    icon: 'book-open-variant',
    color: '#8D4B0A',
    bg: colors.surface,
    heroGradient: ['#982A1E', '#7A1F1F', '#551414'],
  },
  {
    id: 'vinayagar',
    label: { ta: 'விநாயகர் பாடல்கள்', en: 'Lord Vinayagar' },
    shortLabel: { ta: 'விநாயகர்', en: 'Vinayagar' },
    invocation: { ta: 'ஸ்ரீ விநாயகர் துணை', en: 'Sri Vinayagar Thunai' },
    icon: 'star-four-points',
    color: '#C65D07',
    bg: '#FFF3E0',
    heroGradient: ['#C65D07', '#9A3F06', '#6D2A04'],
  },
  {
    id: 'murugan',
    label: { ta: 'முருகன் பாடல்கள்', en: 'Lord Murugan' },
    shortLabel: { ta: 'முருகன்', en: 'Murugan' },
    invocation: { ta: 'வெற்றிவேல் முருகனுக்கு அரோகரா', en: 'Vetrivel Muruganukku Arohara' },
    icon: 'shield-star-outline',
    color: colors.primary,
    bg: colors.primaryBg,
    heroGradient: ['#B4410B', '#8E2F06', '#611D04'],
  },
  {
    id: 'amman',
    label: { ta: 'அம்மன் (அபிராமி அந்தாதி)', en: 'Amman (Abirami Andhadhi)' },
    shortLabel: { ta: 'அம்மன்', en: 'Amman' },
    invocation: { ta: 'ஸ்ரீ அபிராமி அன்னை துணை', en: 'Sri Abirami Annai Thunai' },
    icon: 'flower-tulip-outline',
    color: '#AD1457',
    bg: '#FCE4EC',
    heroGradient: ['#AD1457', '#880E4F', '#560027'],
  },
  {
    id: 'perumal',
    label: { ta: 'பெருமாள் (திவ்யப் பிரபந்தம்)', en: 'Perumal (Divya Prabandham)' },
    shortLabel: { ta: 'பெருமாள்', en: 'Perumal' },
    invocation: { ta: 'ஸ்ரீமன் நாராயணாய நமஹ', en: 'Sriman Narayanaya Namaha' },
    icon: 'white-balance-sunny',
    color: '#1565C0',
    bg: '#E3F2FD',
    heroGradient: ['#1E5AA8', '#154380', '#0D2B57'],
  },
];

export const TRADITION_BY_ID: Record<TraditionId, TraditionMeta> = Object.fromEntries(
  TRADITIONS.map((t) => [t.id, t]),
) as Record<TraditionId, TraditionMeta>;

export type DeityId = 'shiva' | 'vinayagar' | 'murugan' | 'amman' | 'perumal';

export type DeityMeta = {
  id: DeityId;
  label: Bilingual;
  shortLabel: Bilingual;
  traditions: TraditionId[];
  observanceId: SpecialId;
  icon: IconName;
  color: string;
};

/** Deity filter groups shown under "அனைத்து தெய்வங்கள்" (groups Thevaram & Thiruvasagam under Lord Shiva). */
export const DEITIES: DeityMeta[] = [
  {
    id: 'shiva',
    label: { ta: 'சிவபெருமான்', en: 'Lord Shiva' },
    shortLabel: { ta: 'சிவபெருமான்', en: 'Shiva' },
    traditions: ['thevaram', 'thiruvasagam'],
    observanceId: 'pradosham',
    icon: 'fire',
    color: colors.primaryDark,
  },
  {
    id: 'vinayagar',
    label: { ta: 'விநாயகர்', en: 'Lord Vinayagar' },
    shortLabel: { ta: 'விநாயகர்', en: 'Vinayagar' },
    traditions: ['vinayagar'],
    observanceId: 'vinayakaChaturthi',
    icon: 'star-four-points',
    color: '#C65D07',
  },
  {
    id: 'murugan',
    label: { ta: 'முருகன்', en: 'Lord Murugan' },
    shortLabel: { ta: 'முருகன்', en: 'Murugan' },
    traditions: ['murugan'],
    observanceId: 'shashti',
    icon: 'shield-star-outline',
    color: colors.primary,
  },
  {
    id: 'amman',
    label: { ta: 'அம்மன்', en: 'Amman' },
    shortLabel: { ta: 'அம்மன்', en: 'Amman' },
    traditions: ['amman'],
    observanceId: 'navarathri',
    icon: 'flower-tulip-outline',
    color: '#AD1457',
  },
  {
    id: 'perumal',
    label: { ta: 'பெருமாள்', en: 'Lord Perumal' },
    shortLabel: { ta: 'பெருமாள்', en: 'Perumal' },
    traditions: ['perumal'],
    observanceId: 'ekadashi',
    icon: 'white-balance-sunny',
    color: '#1565C0',
  },
];

export const DEITY_BY_ID: Record<DeityId, DeityMeta> = Object.fromEntries(
  DEITIES.map((d) => [d.id, d]),
) as Record<DeityId, DeityMeta>;
