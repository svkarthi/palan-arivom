import type ta from './ta';

const en: typeof ta = {
  title: 'Nalla Neram',
  date: {
    tamilDate: '{{year}} year, {{month}} {{day}}',
    weekdayFull: '{{weekday}}, {{day}} {{month}} {{year}}',
    sunrise: 'Sunrise',
    sunset: 'Sunset',
    goToday: 'Go to today',
  },
  now: {
    good: 'Good time now — until {{time}}',
    rahu: 'Rahu Kalam now — avoid until {{time}}',
    yama: 'Yamagandam now — avoid until {{time}}',
    kuligai: 'Kuligai now — until {{time}}',
    neutral: 'An ordinary time right now',
  },
  good: {
    title: 'Good times',
    hint: 'Auspicious horas with Rahu Kalam, Yamagandam and Kuligai removed.',
    none: 'No suitable good time today.',
    abhijit: 'Abhijit Muhurta',
    abhijitNote: 'The strong midday muhurta',
    wednesdayNote: 'There is no Abhijit Muhurta on Wednesdays.',
  },
  avoid: {
    title: 'Times to avoid',
    rahu: 'Rahu Kalam',
    yama: 'Yamagandam',
    kuligai: 'Kuligai',
    kuligaiNote: 'Kuligai suits things meant to repeat; avoid it for fresh starts.',
  },
  panchang: {
    title: 'Panchangam',
    tithi: 'Tithi',
    nakshatra: 'Nakshatra',
    yoga: 'Yogam',
    karana: 'Karanam',
    until: 'until {{time}}',
    untilNext: 'until {{time}} ({{nextDay}})',
    shukla: 'Waxing',
    krishna: 'Waning',
  },
  hora: {
    title: 'Hora',
    show: 'Show table',
    hide: 'Hide table',
    day: 'Day',
    night: 'Night',
    quality: { good: 'Good', mixed: 'Mixed', avoid: 'Avoid' },
  },
  note: 'Calculated with the Thirukanitha method (Lahiri ayanamsa) from sunrise at the chosen city. Traditional Vakya panchangams can differ by a few minutes; check your family almanac for important events.',
};

export default en;
