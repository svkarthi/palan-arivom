import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import birthStarEn from '../../features/birth-star/i18n/en';
import birthStarTa from '../../features/birth-star/i18n/ta';
import nallaNaalEn from '../../features/nalla-naal/i18n/en';
import nallaNaalTa from '../../features/nalla-naal/i18n/ta';
import nallaNeramEn from '../../features/nalla-neram/i18n/en';
import nallaNeramTa from '../../features/nalla-neram/i18n/ta';
import padhigamEn from '../../features/padhigam/i18n/en';
import padhigamTa from '../../features/padhigam/i18n/ta';
import poruthamEn from '../../features/porutham/i18n/en';
import poruthamTa from '../../features/porutham/i18n/ta';
import vastuEn from '../../features/vastu/i18n/en';
import vastuTa from '../../features/vastu/i18n/ta';
import en from './en';
import ta from './ta';

export type Lang = 'ta' | 'en';
export const DEFAULT_LANG: Lang = 'ta';

/** Text that exists in both supported languages. */
export type Bilingual = Record<Lang, string>;

/**
 * Core strings live in the default `translation` namespace; every feature adds
 * its own namespace (e.g. `vastu`) and falls back to core for shared keys.
 */
void i18n.use(initReactI18next).init({
  resources: {
    ta: { translation: ta, vastu: vastuTa, nallaNeram: nallaNeramTa, nallaNaal: nallaNaalTa, porutham: poruthamTa, birthStar: birthStarTa, padhigam: padhigamTa },
    en: { translation: en, vastu: vastuEn, nallaNeram: nallaNeramEn, nallaNaal: nallaNaalEn, porutham: poruthamEn, birthStar: birthStarEn, padhigam: padhigamEn },
  },
  lng: DEFAULT_LANG,
  fallbackLng: 'en',
  defaultNS: 'translation',
  fallbackNS: 'translation',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;
