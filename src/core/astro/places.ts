import type { Place } from './sunrise';

const IST = 330;

/** Cities for sunrise-based calculations. Offsets are fixed (none of these use daylight saving). */
export const PLACES: Place[] = [
  { id: 'chennai', name: { ta: 'சென்னை', en: 'Chennai' }, lat: 13.0827, lon: 80.2707, utcOffsetMin: IST },
  { id: 'madurai', name: { ta: 'மதுரை', en: 'Madurai' }, lat: 9.9252, lon: 78.1198, utcOffsetMin: IST },
  { id: 'coimbatore', name: { ta: 'கோயம்புத்தூர்', en: 'Coimbatore' }, lat: 11.0168, lon: 76.9558, utcOffsetMin: IST },
  { id: 'tiruchirappalli', name: { ta: 'திருச்சிராப்பள்ளி', en: 'Tiruchirappalli' }, lat: 10.7905, lon: 78.7047, utcOffsetMin: IST },
  { id: 'salem', name: { ta: 'சேலம்', en: 'Salem' }, lat: 11.6643, lon: 78.146, utcOffsetMin: IST },
  { id: 'tirunelveli', name: { ta: 'திருநெல்வேலி', en: 'Tirunelveli' }, lat: 8.7139, lon: 77.7567, utcOffsetMin: IST },
  { id: 'thanjavur', name: { ta: 'தஞ்சாவூர்', en: 'Thanjavur' }, lat: 10.787, lon: 79.1378, utcOffsetMin: IST },
  { id: 'vellore', name: { ta: 'வேலூர்', en: 'Vellore' }, lat: 12.9165, lon: 79.1325, utcOffsetMin: IST },
  { id: 'erode', name: { ta: 'ஈரோடு', en: 'Erode' }, lat: 11.341, lon: 77.7172, utcOffsetMin: IST },
  { id: 'kanyakumari', name: { ta: 'கன்னியாகுமரி', en: 'Kanyakumari' }, lat: 8.0883, lon: 77.5385, utcOffsetMin: IST },
  { id: 'puducherry', name: { ta: 'புதுச்சேரி', en: 'Puducherry' }, lat: 11.9416, lon: 79.8083, utcOffsetMin: IST },
  { id: 'bengaluru', name: { ta: 'பெங்களூரு', en: 'Bengaluru' }, lat: 12.9716, lon: 77.5946, utcOffsetMin: IST },
  { id: 'mumbai', name: { ta: 'மும்பை', en: 'Mumbai' }, lat: 19.076, lon: 72.8777, utcOffsetMin: IST },
  { id: 'delhi', name: { ta: 'புது தில்லி', en: 'New Delhi' }, lat: 28.6139, lon: 77.209, utcOffsetMin: IST },
  { id: 'colombo', name: { ta: 'கொழும்பு', en: 'Colombo' }, lat: 6.9271, lon: 79.8612, utcOffsetMin: IST },
  { id: 'jaffna', name: { ta: 'யாழ்ப்பாணம்', en: 'Jaffna' }, lat: 9.6615, lon: 80.0255, utcOffsetMin: IST },
  { id: 'singapore', name: { ta: 'சிங்கப்பூர்', en: 'Singapore' }, lat: 1.3521, lon: 103.8198, utcOffsetMin: 480 },
  { id: 'kualalumpur', name: { ta: 'கோலாலம்பூர்', en: 'Kuala Lumpur' }, lat: 3.139, lon: 101.6869, utcOffsetMin: 480 },
  { id: 'dubai', name: { ta: 'துபாய்', en: 'Dubai' }, lat: 25.2048, lon: 55.2708, utcOffsetMin: 240 },
  { id: 'london', name: { ta: 'லண்டன்', en: 'London' }, lat: 51.5074, lon: -0.1278, utcOffsetMin: 0 },
  { id: 'toronto', name: { ta: 'டொராண்டோ', en: 'Toronto' }, lat: 43.6532, lon: -79.3832, utcOffsetMin: -300 },
  { id: 'newyork', name: { ta: 'நியூயார்க்', en: 'New York' }, lat: 40.7128, lon: -74.006, utcOffsetMin: -300 },
  { id: 'dallas', name: { ta: 'டல்லாஸ்', en: 'Dallas' }, lat: 32.7767, lon: -96.797, utcOffsetMin: -360 },
  { id: 'sanjose', name: { ta: 'சான் ஜோஸ்', en: 'San Jose' }, lat: 37.3382, lon: -121.8863, utcOffsetMin: -480 },
  { id: 'sydney', name: { ta: 'சிட்னி', en: 'Sydney' }, lat: -33.8688, lon: 151.2093, utcOffsetMin: 600 },
  { id: 'melbourne', name: { ta: 'மெல்போர்ன்', en: 'Melbourne' }, lat: -37.8136, lon: 144.9631, utcOffsetMin: 600 },
];

export const DEFAULT_PLACE_ID = 'chennai';

export const placeById = (id: string): Place => PLACES.find((p) => p.id === id) ?? PLACES[0];

/** Closest city in PLACES to the given GPS coordinates (Haversine distance). */
export function nearestPlace(lat: number, lon: number): Place {
  const rad = Math.PI / 180;
  let best = PLACES[0];
  let bestDist = Infinity;
  for (const p of PLACES) {
    const dLat = (p.lat - lat) * rad;
    const dLon = (p.lon - lon) * rad;
    const a =
      Math.sin(dLat / 2) ** 2 + Math.cos(lat * rad) * Math.cos(p.lat * rad) * Math.sin(dLon / 2) ** 2;
    const d = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    if (d < bestDist) {
      bestDist = d;
      best = p;
    }
  }
  return best;
}
