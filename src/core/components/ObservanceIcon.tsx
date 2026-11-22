import type { SpecialDay, SpecialId } from '../astro/specialDays';
import { colors } from '../theme';
import Svg, { Circle, Ellipse, Line, Path, Polygon } from 'react-native-svg';

/** Display priority when a single compact calendar cell has multiple observances/festivals. */
const PRIORITY: SpecialId[] = [
  'deepavali',
  'pongal',
  'mattuPongal',
  'tamilNewYear',
  'saraswatiPooja',
  'vijayadashami',
  'thaiPoosam',
  'mahaShivaratri',
  'panguniUthiram',
  'aadiPerukku',
  'karthigaiDeepam',
  'navarathri',
  'pradosham',
  'ekadashi',
  'pournami',
  'amavasai',
  'vinayakaChaturthi',
  'sankashti',
  'shashti',
  'karthigai',
  'karinaal',
];

/** Picks the primary non-karinaal observance/festival for a calendar grid cell (or null). */
export function primaryObservance(specials: SpecialDay[]): SpecialId | null {
  for (const id of PRIORITY) {
    if (id === 'karinaal') continue;
    if (specials.some((s) => s.id === id)) return id;
  }
  return null;
}

export const OBSERVANCE_COLOR: Record<SpecialId, string> = {
  tamilNewYear: '#B4410B',
  pongal: '#C65102',
  mattuPongal: '#B7791F',
  thaiPoosam: '#B4410B', // Murugan
  mahaShivaratri: '#6A1B9A', // Shiva
  panguniUthiram: '#B4410B', // Murugan
  aadiPerukku: '#0277BD', // River water
  navarathri: '#AD1457', // Devi / Shakti
  saraswatiPooja: '#8E24AA', // Saraswati / Ayudha Pooja
  vijayadashami: '#C68B00', // Victory
  deepavali: '#E65100', // Festival of Lights
  pradosham: '#6A1B9A', // Shiva
  vinayakaChaturthi: '#D84315', // Ganesha
  sankashti: '#D84315', // Ganesha
  shashti: '#B4410B', // Murugan
  karthigai: '#B4410B', // Murugan
  karthigaiDeepam: '#E65100', // Lamp
  ekadashi: '#1565C0', // Perumal
  pournami: '#C68B00', // Full Moon
  amavasai: '#37474F', // New Moon
  karinaal: colors.bad,
};

type Props = {
  id: SpecialId;
  size?: number;
  /** Use light/gold palette when rendered on dark hero cards. */
  onDark?: boolean;
};

/**
 * Traditional Tamil calendar devotional & festival SVG emblems:
 * - Pradosham / Maha Shivaratri (Shiva): Vibhuti (Tripundra — 3 sacred ash stripes + kumkum)
 * - Chaturthi / Sankashti (Ganesha): Pillaiyar emblem
 * - Shashti / Karthigai / Thai Poosam / Panguni Uthiram (Murugan): Vel
 * - Ekadashi (Perumal): Thirunamam
 * - Deepavali: Glowing Diya + Sparkles
 * - Karthigai Deepam: Agal Vilakku
 * - Pongal / Mattu Pongal: Overflowing Pongal Pot + Sun
 * - Aadi Perukku: Sacred River Waves + Flame
 * - Navarathri / Vijayadashami: Devi Lotus
 * - Saraswati & Ayudha Pooja: Sacred Veena & Book / Lotus
 * - Tamil New Year: Purnakumbha (Kalasam)
 * - Pournami / Amavasai: Full & New Moon
 */
export default function ObservanceIcon({ id, size = 18, onDark = false }: Props) {
  const accent = onDark ? colors.heroAccent : OBSERVANCE_COLOR[id];
  const contrast = onDark ? colors.heroBg : '#FFF8EC';

  switch (id) {
    case 'pradosham':
    case 'mahaShivaratri':
      // Lord Shiva — Vibhuti / Tripundra (திருநீறு + குங்குமப் பொட்டு)
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Line x1="3.5" y1="6.5" x2="20.5" y2="6.5" stroke={accent} strokeWidth="2.8" strokeLinecap="round" />
          <Line x1="3.5" y1="12" x2="20.5" y2="12" stroke={accent} strokeWidth="2.8" strokeLinecap="round" />
          <Line x1="3.5" y1="17.5" x2="20.5" y2="17.5" stroke={accent} strokeWidth="2.8" strokeLinecap="round" />
          <Circle
            cx="12"
            cy="12"
            r="2.7"
            fill={onDark ? '#FF8A80' : '#D32F2F'}
            stroke={contrast}
            strokeWidth="0.9"
          />
        </Svg>
      );

    case 'vinayakaChaturthi':
    case 'sankashti':
      // Lord Vinayagar — Pillaiyar face with crown, ears, curved trunk & tilak (விநாயகர்)
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          {/* Crown / Mukutam */}
          <Polygon points="12,1.6 8.4,6.4 15.6,6.4" fill={accent} />
          {/* Large elephant ears */}
          <Path d="M6.6 7.8 C2.4 7.8 2 14 5.6 15.2 C6.6 15.5 7.2 14 7.2 12.2 Z" fill={accent} opacity={0.9} />
          <Path d="M17.4 7.8 C21.6 7.8 22 14 18.4 15.2 C17.4 15.5 16.8 14 16.8 12.2 Z" fill={accent} opacity={0.9} />
          {/* Head */}
          <Circle cx="12" cy="10.8" r="5.2" fill={accent} />
          {/* Curved trunk */}
          <Path
            d="M12 13.4 C12 17.8 12.6 20.8 16 20.8 C17.6 20.8 18.4 19.8 18 18.5"
            fill="none"
            stroke={accent}
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          {/* Forehead tilak */}
          <Line x1="10.4" y1="9.2" x2="13.6" y2="9.2" stroke={contrast} strokeWidth="1.2" strokeLinecap="round" />
          <Circle cx="12" cy="11.1" r="1.0" fill={onDark ? '#FF8A80' : '#FFF8EC'} />
        </Svg>
      );

    case 'shashti':
    case 'karthigai':
    case 'thaiPoosam':
    case 'panguniUthiram':
      // Lord Murugan — Vel (வேல்)
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M12 1.8 C15.8 6.4 16.5 10 12 14.2 C7.5 10 8.2 6.4 12 1.8 Z" fill={accent} />
          <Line x1="12" y1="13.5" x2="12" y2="22.2" stroke={accent} strokeWidth="2.3" strokeLinecap="round" />
          <Line x1="9.2" y1="15.4" x2="14.8" y2="15.4" stroke={accent} strokeWidth="1.8" strokeLinecap="round" />
          <Line x1="10.1" y1="8.2" x2="13.9" y2="8.2" stroke={contrast} strokeWidth="1.1" strokeLinecap="round" />
          <Line x1="9.8" y1="10.1" x2="14.2" y2="10.1" stroke={contrast} strokeWidth="1.1" strokeLinecap="round" />
        </Svg>
      );

    case 'deepavali':
      // Deepavali — Glowing Diya with festival sparkles (தீபாவளி)
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          {/* Sparkles */}
          <Line x1="4.5" y1="5" x2="4.5" y2="8" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
          <Line x1="3" y1="6.5" x2="6" y2="6.5" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
          <Line x1="19.5" y1="5" x2="19.5" y2="8" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
          <Line x1="18" y1="6.5" x2="21" y2="6.5" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
          {/* Flame */}
          <Path d="M12 2.4 C14.8 6 15.2 9 12 11.8 C8.8 9 9.2 6 12 2.4 Z" fill="#F59E0B" />
          <Path d="M12 6 C13.2 7.6 13.4 9.2 12 10.6 C10.6 9.2 10.8 7.6 12 6 Z" fill="#FEF08A" />
          {/* Diya bowl */}
          <Path d="M3.2 13.8 C4.8 19.2 8.4 20.8 12 20.8 C15.6 20.8 19.2 19.2 20.8 13.8 Z" fill={accent} />
          <Path d="M7 16.2 Q12 18 17 16.2" fill="none" stroke={contrast} strokeWidth="1.2" strokeLinecap="round" />
        </Svg>
      );

    case 'karthigaiDeepam':
      // Agal Vilakku (கார்த்திகை தீபம்)
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M12 2.2 C14.6 5.6 15 8.5 12 11.2 C9 8.5 9.4 5.6 12 2.2 Z" fill="#F59E0B" />
          <Path d="M12 5.5 C13.2 7.2 13.4 8.8 12 10.2 C10.6 8.8 10.8 7.2 12 5.5 Z" fill="#FEF08A" />
          <Path d="M3.5 13.5 C5 18.8 8.5 20.5 12 20.5 C15.5 20.5 19 18.8 20.5 13.5 Z" fill={accent} />
          <Line x1="8.5" y1="21.5" x2="15.5" y2="21.5" stroke={accent} strokeWidth="1.8" strokeLinecap="round" />
        </Svg>
      );

    case 'pongal':
    case 'mattuPongal':
      // Thai Pongal — Overflowing Pongal Pot with Sun rays (பொங்கல் பானை)
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          {/* Overflowing milk foam */}
          <Circle cx="9.2" cy="7.5" r="2.2" fill={onDark ? '#FFFBEB' : '#F59E0B'} />
          <Circle cx="12" cy="6.2" r="2.6" fill={onDark ? '#FFFBEB' : '#F59E0B'} />
          <Circle cx="14.8" cy="7.5" r="2.2" fill={onDark ? '#FFFBEB' : '#F59E0B'} />
          {/* Pot neck & rim */}
          <Line x1="7.5" y1="9.8" x2="16.5" y2="9.8" stroke={accent} strokeWidth="2.4" strokeLinecap="round" />
          {/* Rounded clay pot body */}
          <Ellipse cx="12" cy="15.8" rx="6.8" ry="5.5" fill={accent} />
          {/* Decorative kolams/band on pot */}
          <Path d="M6.8 15.2 Q12 17.4 17.2 15.2" fill="none" stroke={contrast} strokeWidth="1.3" strokeLinecap="round" />
        </Svg>
      );

    case 'tamilNewYear':
      // Purnakumbha / Kalasam with mango leaves & coconut (தமிழ் புத்தாண்டு)
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          {/* Mango leaves */}
          <Path d="M12 8 C8 5 5.5 6 4.5 8.5 C7.5 8.5 9.5 9.5 12 9.5 Z" fill="#2E7D32" />
          <Path d="M12 8 C16 5 18.5 6 19.5 8.5 C16.5 8.5 14.5 9.5 12 9.5 Z" fill="#2E7D32" />
          {/* Coconut */}
          <Circle cx="12" cy="6.6" r="3.2" fill="#8D5524" />
          {/* Brass pot */}
          <Ellipse cx="12" cy="15.5" rx="6.2" ry="5.5" fill={accent} />
          <Line x1="8.5" y1="10.2" x2="15.5" y2="10.2" stroke={accent} strokeWidth="2" strokeLinecap="round" />
          <Circle cx="12" cy="15.2" r="1.4" fill={contrast} />
        </Svg>
      );

    case 'aadiPerukku':
      // Aadi Perukku — Sacred River Waves + Floating Lamp (ஆடிப்பெருக்கு)
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M12 2.8 C14 5.5 14.2 7.8 12 9.8 C9.8 7.8 10 5.5 12 2.8 Z" fill="#F59E0B" />
          <Path d="M7.5 10.6 C8.6 13.4 10.2 14 12 14 C13.8 14 15.4 13.4 16.5 10.6 Z" fill="#E65100" />
          <Path d="M3 16.8 Q6 14.6 9 16.8 T15 16.8 T21 16.8" fill="none" stroke={accent} strokeWidth="2.1" strokeLinecap="round" />
          <Path d="M3 20.4 Q6 18.2 9 20.4 T15 20.4 T21 20.4" fill="none" stroke={accent} strokeWidth="2.1" strokeLinecap="round" />
        </Svg>
      );

    case 'saraswatiPooja':
      // Saraswati & Ayudha Pooja — Open Sacred Book + Lotus/Veena spark (சரஸ்வதி / ஆயுத பூஜை)
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          {/* Sacred Lotus bloom above */}
          <Path d="M12 2.5 C14 5.2 14 7.5 12 9.5 C10 7.5 10 5.2 12 2.5 Z" fill="#F59E0B" />
          <Path d="M12 9.5 C9.2 8.2 7.5 6.8 6.8 5.2 C9 5.4 10.8 6.8 12 9.5 Z" fill={accent} opacity={0.85} />
          <Path d="M12 9.5 C14.8 8.2 16.5 6.8 17.2 5.2 C15 5.4 13.2 6.8 12 9.5 Z" fill={accent} opacity={0.85} />
          {/* Open book (Saraswati) */}
          <Path
            d="M3.5 11.8 Q7.8 10.6 12 12.6 Q16.2 10.6 20.5 11.8 L20.5 19.6 Q16.2 18.4 12 20.4 Q7.8 18.4 3.5 19.6 Z"
            fill={accent}
          />
          <Line x1="12" y1="12.6" x2="12" y2="20.2" stroke={contrast} strokeWidth="1.4" />
        </Svg>
      );

    case 'navarathri':
    case 'vijayadashami':
      // Devi Lotus (நவராத்திரி / விஜயதசமி)
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M12 3.2 C14.8 7.5 14.8 12 12 15.8 C9.2 12 9.2 7.5 12 3.2 Z" fill={accent} />
          <Path d="M12 15.8 C7.8 14 5.5 10.8 5 7.2 C8.5 8 10.8 11.2 12 15.8 Z" fill={accent} opacity={0.85} />
          <Path d="M12 15.8 C16.2 14 18.5 10.8 19 7.2 C15.5 8 13.2 11.2 12 15.8 Z" fill={accent} opacity={0.85} />
          <Path d="M12 17.2 C6.5 17 3.2 14.8 2.5 12 C6 12.5 9.2 14.2 12 17.2 Z" fill={accent} opacity={0.65} />
          <Path d="M12 17.2 C17.5 17 20.8 14.8 21.5 12 C18 12.5 14.8 14.2 12 17.2 Z" fill={accent} opacity={0.65} />
          <Line x1="7.5" y1="19.8" x2="16.5" y2="19.8" stroke={accent} strokeWidth="1.8" strokeLinecap="round" />
        </Svg>
      );

    case 'ekadashi':
      // Lord Perumal — Thirunamam (திருநாமம்)
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path
            d="M6.2 4.2 L6.2 13.5 C6.2 17.5 9 19.5 12 19.5 C15 19.5 17.8 17.5 17.8 13.5 L17.8 4.2"
            fill="none"
            stroke={accent}
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Line x1="12" y1="19.5" x2="12" y2="22" stroke={accent} strokeWidth="2.6" strokeLinecap="round" />
          <Line x1="12" y1="4.8" x2="12" y2="15.8" stroke={onDark ? '#FF8A80' : '#D32F2F'} strokeWidth="2.4" strokeLinecap="round" />
        </Svg>
      );

    case 'pournami':
      // Full Moon (பௌர்ணமி)
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx="12" cy="12" r="9.5" fill={onDark ? '#FDE68A' : '#FFF3C4'} stroke={accent} strokeWidth="2" />
          <Circle cx="12" cy="12" r="6" fill={onDark ? '#FFFBEB' : '#FFE082'} opacity={0.7} />
        </Svg>
      );

    case 'amavasai':
      // New Moon (அமாவாசை)
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle
            cx="12"
            cy="12"
            r="9.2"
            fill={onDark ? '#1F2937' : '#263238'}
            stroke={onDark ? colors.heroAccent : '#90A4AE'}
            strokeWidth="1.8"
          />
        </Svg>
      );

    case 'karinaal':
    default:
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Polygon points="12,3 21.5,19.5 2.5,19.5" fill="none" stroke={accent} strokeWidth="2.2" strokeLinejoin="round" />
          <Line x1="12" y1="9" x2="12" y2="14" stroke={accent} strokeWidth="2.2" strokeLinecap="round" />
          <Circle cx="12" cy="16.8" r="1.1" fill={accent} />
        </Svg>
      );
  }
}
