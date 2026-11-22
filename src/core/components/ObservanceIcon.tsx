import type { SpecialDay, SpecialId } from '../astro/specialDays';
import { colors } from '../theme';
import Svg, { Circle, Line, Path, Polygon } from 'react-native-svg';

/** Display priority when a single compact calendar cell has multiple observances. */
const PRIORITY: SpecialId[] = [
  'karthigaiDeepam',
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

/** Picks the primary non-karinaal observance for a calendar grid cell (or null). */
export function primaryObservance(specials: SpecialDay[]): SpecialId | null {
  for (const id of PRIORITY) {
    if (id === 'karinaal') continue;
    if (specials.some((s) => s.id === id)) return id;
  }
  return null;
}

export const OBSERVANCE_COLOR: Record<SpecialId, string> = {
  pradosham: '#6A1B9A', // Shiva (Pradosham)
  vinayakaChaturthi: '#D84315', // Ganesha (Chaturthi)
  sankashti: '#D84315', // Ganesha (Sankashti)
  shashti: '#B4410B', // Murugan (Shashti)
  karthigai: '#B4410B', // Murugan (Karthigai)
  karthigaiDeepam: '#E65100', // Karthigai Deepam
  ekadashi: '#1565C0', // Perumal (Ekadashi)
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
 * Traditional Tamil calendar devotional emblems:
 * - Pradosham (Shiva): Trishul
 * - Chaturthi / Sankashti (Ganesha): Pillaiyar silhouette
 * - Shashti / Karthigai (Murugan): Vel
 * - Karthigai Deepam: Agal Vilakku (lamp)
 * - Ekadashi (Perumal): Thirunamam
 * - Pournami: Full Moon
 * - Amavasai: New Moon
 * - Karinaal: Warning triangle
 */
export default function ObservanceIcon({ id, size = 18, onDark = false }: Props) {
  const accent = onDark ? colors.heroAccent : OBSERVANCE_COLOR[id];

  switch (id) {
    case 'pradosham':
      // Lord Shiva — Trishul (திரிசூலம்)
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Line x1="12" y1="3" x2="12" y2="22" stroke={accent} strokeWidth="2.2" strokeLinecap="round" />
          <Polygon points="12,1.8 9.8,6 14.2,6" fill={accent} />
          <Path
            d="M5.5 6.5 C5.5 11.5 8 13.5 12 13.5 C16 13.5 18.5 11.5 18.5 6.5"
            fill="none"
            stroke={accent}
            strokeWidth="2.1"
            strokeLinecap="round"
          />
          <Polygon points="5.5,4.2 3.8,7.4 7.2,7.4" fill={accent} />
          <Polygon points="18.5,4.2 16.8,7.4 20.2,7.4" fill={accent} />
          <Line x1="9" y1="16.8" x2="15" y2="16.8" stroke={accent} strokeWidth="1.8" strokeLinecap="round" />
        </Svg>
      );

    case 'vinayakaChaturthi':
    case 'sankashti':
      // Lord Ganesha — Pillaiyar emblem (கணபதி)
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          {/* Crown */}
          <Polygon points="12,2 8.5,6.2 15.5,6.2" fill={accent} />
          {/* Ears */}
          <Path d="M6.5 8.5 C3 8.5 2.5 13.5 5.5 15 C6.5 15.5 7 14 7 12.5 Z" fill={accent} opacity={0.85} />
          <Path d="M17.5 8.5 C21 8.5 21.5 13.5 18.5 15 C17.5 15.5 17 14 17 12.5 Z" fill={accent} opacity={0.85} />
          {/* Head */}
          <Circle cx="12" cy="11" r="5" fill={accent} />
          {/* Curved Trunk */}
          <Path
            d="M12 13.5 C12 17.5 12.5 20.2 15.6 20.2 C17 20.2 17.8 19.3 17.4 18.2"
            fill="none"
            stroke={accent}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Forehead Tilak */}
          <Line x1="12" y1="7.8" x2="12" y2="10.2" stroke={onDark ? colors.heroBg : '#FFF8EC'} strokeWidth="1.4" strokeLinecap="round" />
        </Svg>
      );

    case 'shashti':
    case 'karthigai':
      // Lord Murugan — Vel (வேல்)
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M12 1.8 C15.8 6.4 16.5 10 12 14.2 C7.5 10 8.2 6.4 12 1.8 Z" fill={accent} />
          <Line x1="12" y1="13.5" x2="12" y2="22.2" stroke={accent} strokeWidth="2.3" strokeLinecap="round" />
          <Line x1="9.2" y1="15.4" x2="14.8" y2="15.4" stroke={accent} strokeWidth="1.8" strokeLinecap="round" />
          {/* Three sacred vibhuti lines on the Vel */}
          <Line x1="10.1" y1="8.2" x2="13.9" y2="8.2" stroke={onDark ? colors.heroBg : '#FFF8EC'} strokeWidth="1.1" strokeLinecap="round" />
          <Line x1="9.8" y1="10.1" x2="14.2" y2="10.1" stroke={onDark ? colors.heroBg : '#FFF8EC'} strokeWidth="1.1" strokeLinecap="round" />
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
          {/* Base padam */}
          <Line x1="12" y1="19.5" x2="12" y2="22" stroke={accent} strokeWidth="2.6" strokeLinecap="round" />
          {/* Central red Srichurnam */}
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
