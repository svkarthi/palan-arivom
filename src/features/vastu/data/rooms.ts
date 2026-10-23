import type { Bilingual, ZoneId } from './zones';

export type RoomId =
  | 'entrance' | 'living' | 'pooja' | 'kitchen' | 'master' | 'kids'
  | 'guest' | 'dining' | 'toilet' | 'bath' | 'stairs' | 'study'
  | 'store' | 'underTank' | 'overTank' | 'parking';

export type Room = {
  id: RoomId;
  icon: string;
  /** Rooms with weight 2 count double in the overall score. */
  weight: 1 | 2;
  name: Bilingual;
  ideal: ZoneId[];
  acceptable: ZoneId[];
  avoid: ZoneId[];
  why: Bilingual;
  remedy: Bilingual;
};

export const ROOMS: Room[] = [
  {
    id: 'entrance',
    icon: '🚪',
    weight: 2,
    name: { ta: 'முன்வாசல்', en: 'Main entrance' },
    ideal: ['N', 'NNE', 'NE', 'ENE', 'E'],
    acceptable: ['NNW', 'ESE'],
    avoid: ['S', 'SSW', 'SW', 'WSW', 'SSE'],
    why: {
      ta: 'வடக்கு, வடகிழக்கு, கிழக்கு திசை வாசல்கள் நேர்மறை ஆற்றலையும் சூரிய ஒளியையும் வீட்டுக்குள் கொண்டு வரும்.',
      en: 'Entrances facing north, northeast or east bring positive energy and sunlight into the home.',
    },
    remedy: {
      ta: 'வாசலை மாற்ற முடியாவிட்டால் வாசல் முன் நல்ல வெளிச்சம், சுத்தம், தோரணம் வைக்கவும். வாசல் கதவு உள்நோக்கித் திறக்க வேண்டும்.',
      en: 'If the door cannot be moved, keep the entrance bright, clean and decorated. The door should open inwards.',
    },
  },
  {
    id: 'living',
    icon: '🛋️',
    weight: 1,
    name: { ta: 'வரவேற்பறை', en: 'Living room' },
    ideal: ['N', 'NNE', 'NE', 'ENE', 'E', 'NNW'],
    acceptable: ['NW', 'W', 'WNW'],
    avoid: ['SW', 'SSW', 'C'],
    why: {
      ta: 'வடக்கு அல்லது கிழக்கில் உள்ள வரவேற்பறை இயற்கை வெளிச்சத்தையும் நல்ல உறவுகளையும் தரும்.',
      en: 'A living room in the north or east gets natural light and supports good relationships.',
    },
    remedy: {
      ta: 'கனமான மரச்சாமான்களை தென்மேற்கு பக்கம் வைக்கவும்; வடகிழக்கை திறந்தும் இலகுவாகவும் வைக்கவும்.',
      en: 'Place heavy furniture on the southwest side and keep the northeast open and light.',
    },
  },
  {
    id: 'pooja',
    icon: '🪔',
    weight: 2,
    name: { ta: 'பூஜை அறை', en: 'Pooja room' },
    ideal: ['NE', 'ENE', 'NNE'],
    acceptable: ['N', 'E'],
    avoid: ['S', 'SSE', 'SE', 'SW', 'SSW', 'WSW', 'C'],
    why: {
      ta: 'வடகிழக்கு (ஈசான்யம்) தெய்வீக ஆற்றலுக்கான திசை. கிழக்கு நோக்கி வழிபடுவது சிறந்தது.',
      en: 'The northeast (Eshanya) is the direction of divine energy. Praying facing east is preferred.',
    },
    remedy: {
      ta: 'வடகிழக்கில் ஒரு சிறிய பூஜை மூலை அமைக்கவும். படுக்கையறை அல்லது கழிவறைச் சுவருடன் ஒட்டி பூஜை அறை வேண்டாம்.',
      en: 'Create a small prayer corner in the northeast. Avoid sharing a wall with a bedroom or toilet.',
    },
  },
  {
    id: 'kitchen',
    icon: '🍳',
    weight: 2,
    name: { ta: 'சமையலறை', en: 'Kitchen' },
    ideal: ['SE', 'SSE', 'ESE'],
    acceptable: ['NW', 'NNW'],
    avoid: ['NE', 'NNE', 'ENE', 'SW', 'SSW', 'C'],
    why: {
      ta: 'தென்கிழக்கு நெருப்பின் (அக்னி) திசை; சமையல் அடுப்பு இங்கு இருப்பது ஏற்றது.',
      en: 'The southeast is the direction of fire (Agni), which suits the cooking stove.',
    },
    remedy: {
      ta: 'அடுப்பை சமையலறையின் தென்கிழக்கு பக்கம் வைத்து, சமைப்பவர் கிழக்கு நோக்கி நிற்கும்படி அமைக்கவும். நீர் குழாயை வடகிழக்கில் வைக்கவும்.',
      en: 'Put the stove on the southeast side of the kitchen so the cook faces east. Keep the water tap on the northeast side.',
    },
  },
  {
    id: 'master',
    icon: '🛏️',
    weight: 2,
    name: { ta: 'முதன்மை படுக்கையறை', en: 'Master bedroom' },
    ideal: ['SW', 'SSW', 'WSW'],
    acceptable: ['S', 'W'],
    avoid: ['NE', 'NNE', 'ENE', 'SE', 'C'],
    why: {
      ta: 'தென்மேற்கு நிலைத்தன்மையும் ஆழ்ந்த உறக்கமும் தரும் மூலை; குடும்பத் தலைவருக்கு ஏற்றது.',
      en: 'The southwest gives stability and sound sleep, and suits the head of the household.',
    },
    remedy: {
      ta: 'தலையை தெற்கு அல்லது கிழக்கு நோக்கி வைத்து உறங்கவும். படுக்கைக்கு எதிரே கண்ணாடி வேண்டாம்.',
      en: 'Sleep with your head towards the south or east. Avoid a mirror facing the bed.',
    },
  },
  {
    id: 'kids',
    icon: '🧸',
    weight: 1,
    name: { ta: 'குழந்தைகள் அறை', en: 'Children’s room' },
    ideal: ['W', 'WNW', 'NW'],
    acceptable: ['N', 'NNW', 'E', 'WSW'],
    avoid: ['SE', 'SSE', 'C'],
    why: {
      ta: 'மேற்கு அல்லது வடமேற்கு குழந்தைகளின் கவனத்துக்கும் வளர்ச்சிக்கும் ஏற்றது.',
      en: 'The west or northwest supports children’s focus and growth.',
    },
    remedy: {
      ta: 'படிக்கும் மேசையை கிழக்கு அல்லது வடக்கு நோக்கி அமைக்கவும். மின்னணு சாதனங்களை குறைவாக வைக்கவும்.',
      en: 'Face the study desk east or north. Keep electronic devices to a minimum.',
    },
  },
  {
    id: 'guest',
    icon: '🧳',
    weight: 1,
    name: { ta: 'விருந்தினர் அறை', en: 'Guest room' },
    ideal: ['NW', 'NNW', 'WNW'],
    acceptable: ['N', 'W'],
    avoid: ['SW', 'SSW', 'NE', 'C'],
    why: {
      ta: 'வடமேற்கு இயக்கத்துக்கான திசை; விருந்தினர் தங்குவதற்கு ஏற்றது.',
      en: 'The northwest is the direction of movement, which suits temporary stays.',
    },
    remedy: {
      ta: 'அறையை லேசான நிறங்களால் அலங்கரித்து காற்றோட்டம் வைக்கவும்.',
      en: 'Use light colours and keep the room well ventilated.',
    },
  },
  {
    id: 'dining',
    icon: '🍽️',
    weight: 1,
    name: { ta: 'சாப்பாட்டு அறை', en: 'Dining room' },
    ideal: ['W', 'WNW', 'E'],
    acceptable: ['N', 'NW', 'ENE', 'ESE'],
    avoid: ['SW', 'SSW', 'S', 'C'],
    why: {
      ta: 'சமையலறைக்கு அருகில் மேற்கு அல்லது கிழக்கில் இருப்பது வசதி; உணவு உண்ணும் போது கிழக்கு அல்லது வடக்கு நோக்குவது நல்லது.',
      en: 'Close to the kitchen on the west or east is convenient; face east or north while eating.',
    },
    remedy: {
      ta: 'சதுர அல்லது செவ்வக மேசையைப் பயன்படுத்தி, கிழக்கு நோக்கி அமரவும்.',
      en: 'Use a square or rectangular table and sit facing east.',
    },
  },
  {
    id: 'toilet',
    icon: '🚽',
    weight: 2,
    name: { ta: 'கழிவறை', en: 'Toilet' },
    ideal: ['NW', 'NNW', 'WNW'],
    acceptable: ['W', 'S', 'SSE'],
    avoid: ['NE', 'NNE', 'ENE', 'SW', 'SSW', 'C', 'E'],
    why: {
      ta: 'வடமேற்கு அல்லது மேற்கில் கழிவறை இருப்பது தூய்மையான ஆற்றல் ஓட்டத்தை பாதுகாக்கும். வடகிழக்கு, மையம் தவிர்க்கவும்.',
      en: 'A toilet in the northwest or west protects the flow of clean energy. Avoid the northeast and centre.',
    },
    remedy: {
      ta: 'கதவை எப்போதும் மூடி வைக்கவும்; நல்ல காற்றோட்டம் மற்றும் சுத்தம் வைக்கவும். கிழக்கு அல்லது வடக்கு நோக்கி அமரக்கூடாது.',
      en: 'Keep the door closed, ventilated and clean. Avoid sitting facing east or north.',
    },
  },
  {
    id: 'bath',
    icon: '🚿',
    weight: 1,
    name: { ta: 'குளியலறை', en: 'Bathroom' },
    ideal: ['E', 'ENE', 'ESE'],
    acceptable: ['W', 'WNW', 'N', 'NW'],
    avoid: ['SW', 'SSW', 'SE', 'C', 'NE'],
    why: {
      ta: 'கிழக்கு குளியலறை காலை சூரிய ஒளி மற்றும் புத்துணர்ச்சி தரும்.',
      en: 'An east-side bathroom gets morning sun and a fresh start.',
    },
    remedy: {
      ta: 'கீசர் மற்றும் மின்சாதனங்களை தென்கிழக்கு சுவரில் வைக்கவும்.',
      en: 'Fit the geyser and electrical items on the southeast wall.',
    },
  },
  {
    id: 'stairs',
    icon: '🪜',
    weight: 1,
    name: { ta: 'படிக்கட்டு', en: 'Staircase' },
    ideal: ['S', 'SSW', 'WSW', 'W'],
    acceptable: ['SW', 'SSE', 'WNW'],
    avoid: ['NE', 'NNE', 'ENE', 'C'],
    why: {
      ta: 'கனமான படிக்கட்டு தெற்கு அல்லது மேற்கில் இருப்பது சமநிலை தரும். வடகிழக்கையும் மையத்தையும் தவிர்க்கவும்.',
      en: 'A heavy staircase in the south or west balances the house. Avoid the northeast and centre.',
    },
    remedy: {
      ta: 'படிகள் கடிகார திசையில் ஏறுவதுபோல் அமைக்கவும்; படிகளின் எண்ணிக்கை ஒற்றைப்படையாக இருக்கலாம்.',
      en: 'Make the stairs climb clockwise; an odd number of steps is traditionally preferred.',
    },
  },
  {
    id: 'study',
    icon: '📚',
    weight: 1,
    name: { ta: 'படிக்கும் அறை', en: 'Study room' },
    ideal: ['W', 'WNW', 'N', 'E'],
    acceptable: ['NNE', 'ENE', 'NW', 'NNW'],
    avoid: ['SE', 'SSE', 'C'],
    why: {
      ta: 'மேற்கு, வடக்கு, கிழக்கு திசைகள் கவனத்தையும் கற்றலையும் மேம்படுத்தும்.',
      en: 'West, north and east support concentration and learning.',
    },
    remedy: {
      ta: 'கிழக்கு அல்லது வடக்கு நோக்கி அமர்ந்து படிக்கவும்; முதுகுக்குப் பின்னால் சுவர் இருக்கட்டும்.',
      en: 'Sit facing east or north with a solid wall behind you.',
    },
  },
  {
    id: 'store',
    icon: '📦',
    weight: 1,
    name: { ta: 'சேமிப்பு அறை', en: 'Store room' },
    ideal: ['NW', 'NNW', 'WSW'],
    acceptable: ['SW', 'W', 'S'],
    avoid: ['NE', 'NNE', 'ENE', 'C'],
    why: {
      ta: 'தானியம் மற்றும் பொருட்களை சேமிக்க வடமேற்கு அல்லது தென்மேற்கு ஏற்றது.',
      en: 'The northwest or southwest suits storing grain and household goods.',
    },
    remedy: {
      ta: 'கனமான பொருட்களை தென்மேற்கில் வைக்கவும்; வடகிழக்கை காலியாக வைக்கவும்.',
      en: 'Keep heavy items in the southwest and the northeast empty.',
    },
  },
  {
    id: 'underTank',
    icon: '💧',
    weight: 1,
    name: { ta: 'நிலத்தடி நீர்த்தொட்டி / கிணறு', en: 'Underground tank / well' },
    ideal: ['NE', 'NNE', 'ENE'],
    acceptable: ['N', 'E'],
    avoid: ['S', 'SSW', 'SW', 'SE', 'SSE', 'C'],
    why: {
      ta: 'நீர் ஆதாரம் வடகிழக்கில் இருப்பது செழிப்பைத் தரும்.',
      en: 'A water source in the northeast brings prosperity.',
    },
    remedy: {
      ta: 'புதிய நீர் ஆதாரம் தேவைப்பட்டால் வடகிழக்கு மூலையைத் தேர்வு செய்யவும்.',
      en: 'When adding a new water source, choose the northeast corner.',
    },
  },
  {
    id: 'overTank',
    icon: '🛢️',
    weight: 1,
    name: { ta: 'மேல்நிலை நீர்த்தொட்டி', en: 'Overhead tank' },
    ideal: ['W', 'WSW', 'SW', 'WNW'],
    acceptable: ['NW', 'S'],
    avoid: ['NE', 'NNE', 'ENE', 'SE', 'C'],
    why: {
      ta: 'மேல்நிலைத் தொட்டி மேற்கு அல்லது தென்மேற்கில் இருந்தால் கனம் சமநிலைப்படும்.',
      en: 'An overhead tank in the west or southwest balances the weight of the house.',
    },
    remedy: {
      ta: 'தொட்டியை கூரையின் தென்மேற்கு பகுதியில் வைத்து, வடகிழக்கை இலகுவாக வைக்கவும்.',
      en: 'Place the tank on the southwest of the roof and keep the northeast light.',
    },
  },
  {
    id: 'parking',
    icon: '🚗',
    weight: 1,
    name: { ta: 'வாகன நிறுத்தம்', en: 'Parking / garage' },
    ideal: ['NW', 'NNW', 'SE', 'SSE'],
    acceptable: ['W', 'WNW', 'ESE'],
    avoid: ['NE', 'NNE', 'ENE', 'SW', 'SSW', 'C'],
    why: {
      ta: 'வாகனங்கள் இயக்கத்தைக் குறிக்கும்; வடமேற்கு அல்லது தென்கிழக்கு ஏற்றது.',
      en: 'Vehicles represent movement; the northwest or southeast suits them.',
    },
    remedy: {
      ta: 'வடகிழக்கை வாகன நிறுத்தத்துக்கு பயன்படுத்தாமல் திறந்தவெளியாக வைக்கவும்.',
      en: 'Keep the northeast free of vehicles and use it as open space.',
    },
  },
];

export const ROOM_BY_ID: Record<RoomId, Room> = Object.fromEntries(
  ROOMS.map((r) => [r.id, r]),
) as Record<RoomId, Room>;
