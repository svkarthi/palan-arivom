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
    description: { ta: 'தினசரி நல்ல நேரம், ராகு காலம், எமகண்டம், பஞ்சாங்கம்', en: 'Daily good times, Rahu Kalam, Yamagandam, panchangam' },
    route: 'NallaNeram',
  },
  {
    id: 'nalla-naal',
    icon: '📅',
    title: { ta: 'நல்ல நாள்', en: 'Nalla Naal' },
    description: { ta: 'திருமணம், கிரகப்பிரவேசம் போன்றவற்றுக்கான நல்ல நாட்கள்', en: 'Auspicious days for marriage, house-warming and more' },
    route: 'NallaNaal',
  },
  {
    id: 'porutham',
    icon: '💍',
    title: { ta: 'திருமணப் பொருத்தம்', en: '10 Porutham' },
    description: { ta: 'பெண், மாப்பிள்ளை நட்சத்திரம் கொண்டு 10 பொருத்தம் பார்க்க', en: '10-point Tamil marriage compatibility by star & rashi' },
    route: 'Porutham',
  },
  {
    id: 'birth-star',
    icon: '🌟',
    title: { ta: 'ஜன்ம நட்சத்திரம்', en: 'Birth Star' },
    description: { ta: 'பிறந்த தேதி, நேரத்திலிருந்து நட்சத்திரம், ராசி, லக்னம் அறிக', en: 'Find Janma Nakshatra, Pada, Rashi & Lagna from birth time' },
    route: 'BirthStar',
  },
];
