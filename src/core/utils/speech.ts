import * as Speech from 'expo-speech';

import type { Lang } from '../i18n';

const VOICE_LOCALE: Record<Lang, string> = { ta: 'ta-IN', en: 'en-IN' };

export function speak(text: string, lang: Lang): void {
  Speech.stop();
  Speech.speak(text, { language: VOICE_LOCALE[lang], rate: 0.9 });
}

export function stopSpeaking(): void {
  Speech.stop();
}
