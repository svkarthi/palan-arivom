import type { Bilingual } from '@core/i18n';

export type { Bilingual };

export type ZoneId =
  | 'N' | 'NNE' | 'NE' | 'ENE'
  | 'E' | 'ESE' | 'SE' | 'SSE'
  | 'S' | 'SSW' | 'SW' | 'WSW'
  | 'W' | 'WNW' | 'NW' | 'NNW'
  | 'C';

export type Zone = {
  id: ZoneId;
  /** Clockwise degrees from north to the centre of the zone. `null` for the centre. */
  angle: number | null;
  name: Bilingual;
  short: Bilingual;
};

export const ZONES: Zone[] = [
  { id: 'N', angle: 0, name: { ta: 'வடக்கு', en: 'North' }, short: { ta: 'வ', en: 'N' } },
  { id: 'NNE', angle: 22.5, name: { ta: 'வட-வடகிழக்கு', en: 'North-northeast' }, short: { ta: '', en: 'NNE' } },
  { id: 'NE', angle: 45, name: { ta: 'வடகிழக்கு (ஈசான்யம்)', en: 'Northeast (Eshanya)' }, short: { ta: 'வகி', en: 'NE' } },
  { id: 'ENE', angle: 67.5, name: { ta: 'கிழக்கு-வடகிழக்கு', en: 'East-northeast' }, short: { ta: '', en: 'ENE' } },
  { id: 'E', angle: 90, name: { ta: 'கிழக்கு', en: 'East' }, short: { ta: 'கி', en: 'E' } },
  { id: 'ESE', angle: 112.5, name: { ta: 'கிழக்கு-தென்கிழக்கு', en: 'East-southeast' }, short: { ta: '', en: 'ESE' } },
  { id: 'SE', angle: 135, name: { ta: 'தென்கிழக்கு (ஆக்னேயம்)', en: 'Southeast (Agneya)' }, short: { ta: 'தகி', en: 'SE' } },
  { id: 'SSE', angle: 157.5, name: { ta: 'தெற்கு-தென்கிழக்கு', en: 'South-southeast' }, short: { ta: '', en: 'SSE' } },
  { id: 'S', angle: 180, name: { ta: 'தெற்கு', en: 'South' }, short: { ta: 'தெ', en: 'S' } },
  { id: 'SSW', angle: 202.5, name: { ta: 'தெற்கு-தென்மேற்கு', en: 'South-southwest' }, short: { ta: '', en: 'SSW' } },
  { id: 'SW', angle: 225, name: { ta: 'தென்மேற்கு (நைருதி)', en: 'Southwest (Nairuthi)' }, short: { ta: 'தமே', en: 'SW' } },
  { id: 'WSW', angle: 247.5, name: { ta: 'மேற்கு-தென்மேற்கு', en: 'West-southwest' }, short: { ta: '', en: 'WSW' } },
  { id: 'W', angle: 270, name: { ta: 'மேற்கு', en: 'West' }, short: { ta: 'மே', en: 'W' } },
  { id: 'WNW', angle: 292.5, name: { ta: 'மேற்கு-வடமேற்கு', en: 'West-northwest' }, short: { ta: '', en: 'WNW' } },
  { id: 'NW', angle: 315, name: { ta: 'வடமேற்கு (வாயவ்யம்)', en: 'Northwest (Vayavya)' }, short: { ta: 'வமே', en: 'NW' } },
  { id: 'NNW', angle: 337.5, name: { ta: 'வட-வடமேற்கு', en: 'North-northwest' }, short: { ta: '', en: 'NNW' } },
];

export const CENTER_ZONE: Zone = {
  id: 'C',
  angle: null,
  name: { ta: 'பிரம்மஸ்தானம் (மையம்)', en: 'Brahmasthan (centre)' },
  short: { ta: 'மையம்', en: 'C' },
};

export const ALL_ZONES: Zone[] = [...ZONES, CENTER_ZONE];

export const ZONE_BY_ID: Record<ZoneId, Zone> = Object.fromEntries(
  ALL_ZONES.map((z) => [z.id, z]),
) as Record<ZoneId, Zone>;

/** Cell layout of the 3x3 grid, row by row from the top (north-up plan). */
export const GRID_9: ZoneId[][] = [
  ['NW', 'N', 'NE'],
  ['W', 'C', 'E'],
  ['SW', 'S', 'SE'],
];

export type DirectionInfo = {
  id: ZoneId;
  element: Bilingual;
  about: Bilingual;
};

/** The eight main directions with their element and a short note. */
export const DIRECTION_INFO: DirectionInfo[] = [
  {
    id: 'N',
    element: { ta: 'நீர்', en: 'Water' },
    about: {
      ta: 'செல்வம் மற்றும் வாய்ப்புகளுக்கான திசை (குபேரன்). வரவேற்பறை, முன்வாசல், திறந்த இடம் ஆகியவற்றுக்கு ஏற்றது.',
      en: 'Direction of wealth and opportunity (Kubera). Suits the living room, entrance and open space.',
    },
  },
  {
    id: 'NE',
    element: { ta: 'நீர் / ஆகாயம்', en: 'Water / Space' },
    about: {
      ta: 'மிகவும் புனிதமான மூலை (ஈசான்யம்). பூஜை அறை, நீர்த்தொட்டி, திறந்த வெளிக்கு சிறந்தது. கழிவறை, சமையலறை தவிர்க்கவும்.',
      en: 'The most sacred corner (Eshanya). Best for the pooja room, water source and open space. Avoid toilets and kitchens here.',
    },
  },
  {
    id: 'E',
    element: { ta: 'காற்று / சூரிய ஒளி', en: 'Air / Sunlight' },
    about: {
      ta: 'சூரிய உதயத் திசை (இந்திரன்). ஆரோக்கியத்துக்கும் புதிய தொடக்கத்துக்கும் நல்லது. முன்வாசல், வரவேற்பறை ஏற்றது.',
      en: 'Direction of sunrise (Indra). Good for health and new beginnings. Suits the entrance and living room.',
    },
  },
  {
    id: 'SE',
    element: { ta: 'நெருப்பு', en: 'Fire' },
    about: {
      ta: 'நெருப்பின் திசை (அக்னி). சமையலறைக்கு மிகவும் ஏற்றது. படுக்கையறை, நீர்த்தொட்டி தவிர்க்கவும்.',
      en: 'Direction of fire (Agni). Ideal for the kitchen. Avoid bedrooms and water tanks here.',
    },
  },
  {
    id: 'S',
    element: { ta: 'பூமி', en: 'Earth' },
    about: {
      ta: 'நிலைப்புத்தன்மையின் திசை (யமன்). கனமான அமைப்புகள், படுக்கையறைகளுக்கு ஏற்றது; முன்வாசலுக்கு ஏற்றதல்ல.',
      en: 'Direction of stability (Yama). Suits heavy structures and bedrooms; not recommended for the main entrance.',
    },
  },
  {
    id: 'SW',
    element: { ta: 'பூமி', en: 'Earth' },
    about: {
      ta: 'நிலைத்தன்மையின் மூலை (நைருதி). முதன்மை படுக்கையறைக்கு சிறந்தது. வாசல், கழிவறை, பூஜை அறை தவிர்க்கவும்.',
      en: 'Corner of stability (Nairuthi). Best for the master bedroom. Avoid the entrance, toilet and pooja room.',
    },
  },
  {
    id: 'W',
    element: { ta: 'நீர் / காற்று', en: 'Water / Air' },
    about: {
      ta: 'வருணனின் திசை. சாப்பாட்டு அறை, படிக்கும் அறை, குழந்தைகள் அறைக்கு ஏற்றது.',
      en: 'Direction of Varuna. Suits the dining room, study and children’s room.',
    },
  },
  {
    id: 'NW',
    element: { ta: 'காற்று', en: 'Air' },
    about: {
      ta: 'காற்றின் மூலை (வாயவ்யம்). விருந்தினர் அறை, கழிவறை, பொருள் சேமிப்பு, வாகன நிறுத்தத்துக்கு ஏற்றது.',
      en: 'Corner of air (Vayavya). Suits the guest room, toilet, storage and parking.',
    },
  },
];
