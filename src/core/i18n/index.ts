import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

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
    ta: { translation: ta, vastu: vastuTa },
    en: { translation: en, vastu: vastuEn },
  },
  lng: DEFAULT_LANG,
  fallbackLng: 'en',
  defaultNS: 'translation',
  fallbackNS: 'translation',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;
