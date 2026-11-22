import type { Bilingual } from '../i18n';

const pair = (ta: string, en: string): Bilingual => ({ ta, en });

export const WEEKDAYS: Bilingual[] = [
  pair('ஞாயிறு', 'Sunday'), pair('திங்கள்', 'Monday'), pair('செவ்வாய்', 'Tuesday'),
  pair('புதன்', 'Wednesday'), pair('வியாழன்', 'Thursday'), pair('வெள்ளி', 'Friday'), pair('சனி', 'Saturday'),
];

/** Tamil solar months, indexed by the Sun's sidereal rashi (0 = Mesha = Chithirai). */
export const TAMIL_MONTHS: Bilingual[] = [
  pair('சித்திரை', 'Chithirai'), pair('வைகாசி', 'Vaikasi'), pair('ஆனி', 'Aani'), pair('ஆடி', 'Aadi'),
  pair('ஆவணி', 'Aavani'), pair('புரட்டாசி', 'Purattasi'), pair('ஐப்பசி', 'Aippasi'), pair('கார்த்திகை', 'Karthigai'),
  pair('மார்கழி', 'Margazhi'), pair('தை', 'Thai'), pair('மாசி', 'Maasi'), pair('பங்குனி', 'Panguni'),
];

export const RASHIS: Bilingual[] = [
  pair('மேஷம்', 'Mesha'), pair('ரிஷபம்', 'Rishabha'), pair('மிதுனம்', 'Mithuna'), pair('கடகம்', 'Kataka'),
  pair('சிம்மம்', 'Simha'), pair('கன்னி', 'Kanni'), pair('துலாம்', 'Thulam'), pair('விருச்சிகம்', 'Vrischika'),
  pair('தனுசு', 'Dhanus'), pair('மகரம்', 'Makara'), pair('கும்பம்', 'Kumbha'), pair('மீனம்', 'Meena'),
];

export const NAKSHATRAS: Bilingual[] = [
  pair('அசுவினி', 'Ashwini'), pair('பரணி', 'Bharani'), pair('கார்த்திகை', 'Krittika'), pair('ரோகிணி', 'Rohini'),
  pair('மிருகசீரிடம்', 'Mrigashira'), pair('திருவாதிரை', 'Thiruvadirai'), pair('புனர்பூசம்', 'Punarpoosam'),
  pair('பூசம்', 'Poosam'), pair('ஆயில்யம்', 'Ayilyam'), pair('மகம்', 'Magam'), pair('பூரம்', 'Pooram'),
  pair('உத்திரம்', 'Uthiram'), pair('அஸ்தம்', 'Hastham'), pair('சித்திரை', 'Chithirai'), pair('சுவாதி', 'Swathi'),
  pair('விசாகம்', 'Visakam'), pair('அனுஷம்', 'Anusham'), pair('கேட்டை', 'Kettai'), pair('மூலம்', 'Moolam'),
  pair('பூராடம்', 'Pooradam'), pair('உத்திராடம்', 'Uthiradam'), pair('திருவோணம்', 'Thiruvonam'),
  pair('அவிட்டம்', 'Avittam'), pair('சதயம்', 'Sathayam'), pair('பூரட்டாதி', 'Poorattathi'),
  pair('உத்திரட்டாதி', 'Uthirattathi'), pair('ரேவதி', 'Revathi'),
];

/** Tithi names for positions 1-15 within a paksha. 15 is Pournami (waxing) or Amavasai (waning). */
const TITHI_BASE: Bilingual[] = [
  pair('பிரதமை', 'Prathamai'), pair('துவிதியை', 'Dwitiyai'), pair('திருதியை', 'Tritiyai'),
  pair('சதுர்த்தி', 'Chaturthi'), pair('பஞ்சமி', 'Panchami'), pair('சஷ்டி', 'Shashti'),
  pair('சப்தமி', 'Saptami'), pair('அஷ்டமி', 'Ashtami'), pair('நவமி', 'Navami'), pair('தசமி', 'Dashami'),
  pair('ஏகாதசி', 'Ekadashi'), pair('துவாதசி', 'Dwadashi'), pair('திரயோதசி', 'Trayodashi'),
  pair('சதுர்த்தசி', 'Chaturdashi'),
];
const POURNAMI = pair('பௌர்ணமி', 'Pournami');
const AMAVASAI = pair('அமாவாசை', 'Amavasai');

/** Name for a tithi index 0-29 (0 = Shukla Pratipada, 29 = Amavasai). */
export function tithiName(index: number): Bilingual {
  const position = (index % 15) + 1;
  if (position === 15) return index === 14 ? POURNAMI : AMAVASAI;
  return TITHI_BASE[position - 1];
}

export const PAKSHA = {
  shukla: pair('வளர்பிறை', 'Waxing'),
  krishna: pair('தேய்பிறை', 'Waning'),
};

export const YOGAS: Bilingual[] = [
  pair('விஷ்கும்பம்', 'Vishkumbha'), pair('ப்ரீதி', 'Preeti'), pair('ஆயுஷ்மான்', 'Ayushman'),
  pair('சௌபாக்யம்', 'Saubhagya'), pair('சோபனம்', 'Shobhana'), pair('அதிகண்டம்', 'Atiganda'),
  pair('சுகர்மம்', 'Sukarma'), pair('திருதி', 'Dhriti'), pair('சூலம்', 'Shoola'), pair('கண்டம்', 'Ganda'),
  pair('விருத்தி', 'Vriddhi'), pair('துருவம்', 'Dhruva'), pair('வியாகாதம்', 'Vyaghata'),
  pair('ஹர்ஷணம்', 'Harshana'), pair('வஜ்ரம்', 'Vajra'), pair('சித்தி', 'Siddhi'),
  pair('வியதீபாதம்', 'Vyatipata'), pair('வரீயான்', 'Variyan'), pair('பரிகம்', 'Parigha'),
  pair('சிவம்', 'Shiva'), pair('சித்தம்', 'Siddha'), pair('சாத்தியம்', 'Sadhya'), pair('சுபம்', 'Shubha'),
  pair('சுப்ரம்', 'Shukla'), pair('பிராம்மம்', 'Brahma'), pair('ஐந்திரம்', 'Aindra'), pair('வைதிருதி', 'Vaidhriti'),
];

const KARANA_CYCLE: Bilingual[] = [
  pair('பவம்', 'Bava'), pair('பாலவம்', 'Balava'), pair('கௌலவம்', 'Kaulava'), pair('தைதுலை', 'Taitila'),
  pair('கரசை', 'Garaja'), pair('வணிசை', 'Vanija'), pair('பத்திரை', 'Vishti (Bhadra)'),
];

/** Karana for an index 0-59 counted from the start of Shukla Pratipada. */
export function karanaName(index: number): Bilingual {
  if (index === 0) return pair('கிம்ஸ்துக்னம்', 'Kimstughna');
  if (index === 57) return pair('சகுனி', 'Shakuni');
  if (index === 58) return pair('சதுஷ்பாதம்', 'Chatushpada');
  if (index === 59) return pair('நாகவம்', 'Naga');
  return KARANA_CYCLE[(index - 1) % 7];
}
export const VISHTI_CYCLE_INDEX = 6;

export const PLANETS: Bilingual[] = [
  pair('சூரியன்', 'Sun'), pair('சந்திரன்', 'Moon'), pair('செவ்வாய்', 'Mars'), pair('புதன்', 'Mercury'),
  pair('குரு', 'Jupiter'), pair('சுக்கிரன்', 'Venus'), pair('சனி', 'Saturn'),
];

/** The 60-year Tamil cycle, starting with Prabhava (the year that began in April 1987). */
export const TAMIL_YEARS: Bilingual[] = [
  pair('பிரபவ', 'Prabhava'), pair('விபவ', 'Vibhava'), pair('சுக்ல', 'Shukla'), pair('பிரமோதூத', 'Pramodoota'),
  pair('பிரசோற்பத்தி', 'Prajotpatti'), pair('ஆங்கீரச', 'Angirasa'), pair('ஸ்ரீமுக', 'Srimukha'), pair('பவ', 'Bhava'),
  pair('யுவ', 'Yuva'), pair('தாது', 'Dhatu'), pair('ஈஸ்வர', 'Eeswara'), pair('வெகுதானிய', 'Vegudhanya'),
  pair('பிரமாதி', 'Pramathi'), pair('விக்கிரம', 'Vikrama'), pair('விஷு', 'Vishu'), pair('சித்திரபானு', 'Chitrabhanu'),
  pair('சுபானு', 'Subhanu'), pair('தாரண', 'Tarana'), pair('பார்த்திப', 'Parthiba'), pair('விய', 'Viya'),
  pair('சர்வசித்து', 'Sarvajit'), pair('சர்வதாரி', 'Sarvadhari'), pair('விரோதி', 'Virodhi'), pair('விக்ருதி', 'Vikruthi'),
  pair('கர', 'Khara'), pair('நந்தன', 'Nandana'), pair('விஜய', 'Vijaya'), pair('ஜய', 'Jaya'),
  pair('மன்மத', 'Manmatha'), pair('துன்முகி', 'Dunmuki'), pair('ஹேவிளம்பி', 'Hevilambi'), pair('விளம்பி', 'Vilambi'),
  pair('விகாரி', 'Vikari'), pair('சார்வரி', 'Sarvari'), pair('பிலவ', 'Plava'), pair('சுபகிருது', 'Subakrithu'),
  pair('சோபகிருது', 'Sobakrithu'), pair('குரோதி', 'Krodhi'), pair('விசுவாசுவ', 'Visuvasuva'), pair('பராபவ', 'Parabhava'),
  pair('பிலவங்க', 'Plavanga'), pair('கீலக', 'Keelaka'), pair('சௌமிய', 'Saumya'), pair('சாதாரண', 'Sadharana'),
  pair('விரோதிகிருது', 'Virodhikrithu'), pair('பரிதாபி', 'Paridhabi'), pair('பிரமாதீச', 'Pramadeesa'), pair('ஆனந்த', 'Anandha'),
  pair('ராட்சச', 'Rakshasa'), pair('நள', 'Nala'), pair('பிங்கள', 'Pingala'), pair('காளயுக்தி', 'Kalayukthi'),
  pair('சித்தார்த்தி', 'Siddharthi'), pair('ரௌத்திரி', 'Raudri'), pair('துன்மதி', 'Dunmathi'), pair('துந்துபி', 'Dundubi'),
  pair('ருத்ரோத்காரி', 'Rudhrothgari'), pair('ரக்தாட்சி', 'Rakthakshi'), pair('குரோதன', 'Krodhana'), pair('அட்சய', 'Akshaya'),
];

export const SPECIAL_DAYS: Record<string, Bilingual> = {
  pournami: pair('பௌர்ணமி', 'Pournami'),
  amavasai: pair('அமாவாசை', 'Amavasai'),
  ekadashi: pair('ஏகாதசி', 'Ekadashi'),
  pradosham: pair('பிரதோஷம்', 'Pradosham'),
  sankashti: pair('சங்கடஹர சதுர்த்தி', 'Sankashta Chaturthi'),
  vinayakaChaturthi: pair('வளர்பிறை சதுர்த்தி (விநாயகர்)', 'Vinayaka Chaturthi'),
  shashti: pair('சஷ்டி', 'Shashti'),
  karthigai: pair('கார்த்திகை (முருகன்)', 'Karthigai (Murugan)'),
  karthigaiDeepam: pair('கார்த்திகை தீபம்', 'Karthigai Deepam'),
  karinaal: pair('கரிநாள்', 'Karinaal (avoid)'),
};

export const GREGORIAN_MONTHS: Bilingual[] = [
  pair('ஜனவரி', 'Jan'), pair('பிப்ரவரி', 'Feb'), pair('மார்ச்', 'Mar'), pair('ஏப்ரல்', 'Apr'),
  pair('மே', 'May'), pair('ஜூன்', 'Jun'), pair('ஜூலை', 'Jul'), pair('ஆகஸ்ட்', 'Aug'),
  pair('செப்டம்பர்', 'Sep'), pair('அக்டோபர்', 'Oct'), pair('நவம்பர்', 'Nov'), pair('டிசம்பர்', 'Dec'),
];
