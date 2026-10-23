/**
 * Karinaal (கரிநாள்): days of each Tamil month traditionally avoided for new
 * beginnings, listed by Tamil day number. Indexed by Tamil month (0 = Chithirai).
 *
 * Taken from the 2024-2026 Karinal lists on tamildailycalendar.com and mapped
 * through this app's Tamil dates. Printed calendars follow the Vakya system, whose
 * month starts can differ from this app's by a day in some months, so a Karinaal
 * day can appear one day earlier or later than on a printed calendar.
 */
export const KARINAAL_DAYS: number[][] = [
  [6, 15], // Chithirai
  [7, 16, 17], // Vaikasi
  [1, 6], // Aani
  [2, 10, 20], // Aadi
  [3, 10, 29], // Aavani
  [17, 30], // Purattasi
  [6, 20], // Aippasi
  [1, 10, 17], // Karthigai
  [6, 9, 11], // Margazhi
  [2, 3, 4, 12, 18], // Thai
  [15, 16, 17], // Maasi
  [6, 15, 19], // Panguni
];

export const isKarinaal = (tamilMonth: number, tamilDay: number): boolean =>
  KARINAAL_DAYS[tamilMonth]?.includes(tamilDay) ?? false;
