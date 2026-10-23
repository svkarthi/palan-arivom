import { useAppSelector } from '../store/hooks';
import type { Bilingual } from '../i18n';

/** Picks the text for the active language from a bilingual value. */
export function useLang() {
  const lang = useAppSelector((s) => s.settings.language);
  return { lang, tr: (text: Bilingual) => text[lang] };
}
