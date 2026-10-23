import type { Bilingual } from '@core/i18n';
import type { RootStackParamList } from '@core/navigation/types';

export type FeatureTile = {
  id: string;
  icon: string;
  title: Bilingual;
  description: Bilingual;
  /** Root route to open, or `null` while the feature is not built yet. */
  route: Exclude<keyof RootStackParamList, 'Home' | 'Settings'> | null;
};

/** Everything shown on the home screen, in display order. */
export const FEATURES: FeatureTile[] = [
  {
    id: 'vastu',
    icon: '🧭',
    title: { ta: 'வாஸ்து', en: 'Vastu' },
    description: {
      ta: 'திசைகாட்டி, அறை வழிகாட்டி, வீட்டு வரைபடம் மற்றும் மதிப்பெண்',
      en: 'Compass, room guide, floor-plan overlay and score',
    },
    route: 'Vastu',
  },
  {
    id: 'nalla-neram',
    icon: '⏰',
    title: { ta: 'நல்ல நேரம்', en: 'Nalla Neram' },
    description: { ta: 'தினசரி நல்ல நேரம், ராகு காலம், எமகண்டம்', en: 'Daily auspicious times, Rahu Kalam, Yamagandam' },
    route: null,
  },
  {
    id: 'nalla-naal',
    icon: '📅',
    title: { ta: 'நல்ல நாள்', en: 'Nalla Naal' },
    description: { ta: 'சுப காரியங்களுக்கான நல்ல நாட்கள்', en: 'Auspicious days for important events' },
    route: null,
  },
];
