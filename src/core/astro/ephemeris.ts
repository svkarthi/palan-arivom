import { normalize360 } from './time';

const RAD = Math.PI / 180;
const DELTA_T_SECONDS = 69; // TT - UT, close enough for 2020s

/** Julian centuries from J2000.0 in dynamical time. */
const centuries = (jdUt: number): number => (jdUt + DELTA_T_SECONDS / 86400 - 2451545) / 36525;

const sin = (deg: number) => Math.sin(deg * RAD);

/** Nutation in longitude, accurate to about 0.0005°. */
const nutationLongitude = (T: number): number => -0.004778 * sin(125.04 - 1934.136 * T);

/** Geometric true longitude of the Sun (Meeus ch. 25), degrees. */
function sunTrueLongitude(T: number): number {
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * sin(M) +
    (0.019993 - 0.000101 * T) * sin(2 * M) +
    0.000289 * sin(3 * M);
  return L0 + C;
}

/** Apparent tropical longitude of the Sun, degrees. */
export function sunLongitude(jdUt: number): number {
  const T = centuries(jdUt);
  return normalize360(sunTrueLongitude(T) - 0.00569 + nutationLongitude(T));
}

// [D, M, M', F, coefficient in 1e-6 degrees] — Meeus table 47.A, longitude terms.
const MOON_TERMS: [number, number, number, number, number][] = [
  [0, 0, 1, 0, 6288774], [2, 0, -1, 0, 1274027], [2, 0, 0, 0, 658314], [0, 0, 2, 0, 213618],
  [0, 1, 0, 0, -185116], [0, 0, 0, 2, -114332], [2, 0, -2, 0, 58793], [2, -1, -1, 0, 57066],
  [2, 0, 1, 0, 53322], [2, -1, 0, 0, 45758], [0, 1, -1, 0, -40923], [1, 0, 0, 0, -34720],
  [0, 1, 1, 0, -30383], [2, 0, 0, -2, 15327], [0, 0, 1, 2, -12528], [0, 0, 1, -2, 10980],
  [4, 0, -1, 0, 10675], [0, 0, 3, 0, 10034], [4, 0, -2, 0, 8548], [2, 1, -1, 0, -7888],
  [2, 1, 0, 0, -6766], [1, 0, -1, 0, -5163], [1, 1, 0, 0, 4987], [2, -1, 1, 0, 4036],
  [2, 0, 2, 0, 3994], [4, 0, 0, 0, 3861], [2, 0, -3, 0, 3665], [0, 1, -2, 0, -2689],
  [2, 0, -1, 2, -2602], [2, -1, -2, 0, 2390], [1, 0, 1, 0, -2348], [2, -2, 0, 0, 2236],
  [0, 1, 2, 0, -2120], [0, 2, 0, 0, -2069], [2, -2, -1, 0, 2048], [2, 0, 1, -2, -1773],
  [2, 0, 0, 2, -1595], [4, -1, -1, 0, 1215], [0, 0, 2, 2, -1110], [3, 0, -1, 0, -892],
  [2, 1, 1, 0, -810], [4, -1, -2, 0, 759], [0, 2, -1, 0, -713], [2, 2, -1, 0, -700],
  [2, 1, -2, 0, 691], [2, -1, 0, -2, 596], [4, 0, 1, 0, 549], [0, 0, 4, 0, 537],
  [4, -1, 0, 0, 520], [1, 0, -2, 0, -487], [2, 1, 0, -2, -399], [0, 0, 2, -2, -381],
  [1, 1, 1, 0, 351], [3, 0, -2, 0, -340], [4, 0, -3, 0, 330], [2, -1, 2, 0, 327],
  [0, 2, 1, 0, -323], [1, 1, -1, 0, 299], [2, 0, 3, 0, 294],
];

/** Mean (nutation-free) geocentric longitude of the Moon (Meeus ch. 47), degrees. */
export function moonMeanTrueLongitude(jdUt: number): number {
  const T = centuries(jdUt);
  const T2 = T * T;
  const T3 = T2 * T;
  const T4 = T3 * T;
  const Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T2 + T3 / 538841 - T4 / 65194000;
  const D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T2 + T3 / 545868 - T4 / 113065000;
  const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T2 + T3 / 24490000;
  const Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T2 + T3 / 69699 - T4 / 14712000;
  const F = 93.272095 + 483202.0175233 * T - 0.0036539 * T2 - T3 / 3526000 + T4 / 863310000;
  const E = 1 - 0.002516 * T - 0.0000074 * T2;

  let sum = 0;
  for (const [d, m, mp, f, coef] of MOON_TERMS) {
    const arg = d * D + m * M + mp * Mp + f * F;
    const eFactor = Math.abs(m) === 2 ? E * E : Math.abs(m) === 1 ? E : 1;
    sum += coef * eFactor * sin(arg);
  }
  const A1 = 119.75 + 131.849 * T;
  const A2 = 53.09 + 479264.29 * T;
  sum += 3958 * sin(A1) + 1962 * sin(Lp - F) + 318 * sin(A2);

  return normalize360(Lp + sum / 1e6);
}

/** Apparent tropical longitude of the Moon, degrees. */
export function moonLongitude(jdUt: number): number {
  return normalize360(moonMeanTrueLongitude(jdUt) + nutationLongitude(centuries(jdUt)));
}

/** Lahiri (Chitrapaksha) ayanamsa, degrees. */
export function lahiriAyanamsa(jdUt: number): number {
  const T = centuries(jdUt);
  return 23.853 + (5028.796195 * T + 1.1054348 * T * T) / 3600;
}

export const siderealSun = (jdUt: number): number => normalize360(sunLongitude(jdUt) - lahiriAyanamsa(jdUt));
export const siderealMoon = (jdUt: number): number => normalize360(moonLongitude(jdUt) - lahiriAyanamsa(jdUt));

/** Declination (deg) and equation of time (minutes) for the sunrise calculation. */
export function solarDeclinationAndEquationOfTime(jdUt: number): { declination: number; eqTime: number } {
  const T = centuries(jdUt);
  const L0 = normalize360(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const e = 0.016708634 - 0.000042037 * T - 0.0000001267 * T * T;
  const omega = 125.04 - 1934.136 * T;
  const lambda = sunTrueLongitude(T) - 0.00569 - 0.00478 * sin(omega);
  const eps0 = 23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60;
  const eps = eps0 + 0.00256 * Math.cos(omega * RAD);
  const declination = Math.asin(sin(eps) * sin(lambda)) / RAD;
  const y = Math.tan((eps * RAD) / 2) ** 2;
  const eq =
    y * Math.sin(2 * L0 * RAD) -
    2 * e * sin(M) +
    4 * e * y * sin(M) * Math.cos(2 * L0 * RAD) -
    0.5 * y * y * Math.sin(4 * L0 * RAD) -
    1.25 * e * e * sin(2 * M);
  return { declination, eqTime: (4 * eq) / RAD };
}
