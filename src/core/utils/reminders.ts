import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { chandrashtamaRashi } from '../astro/dayExtras';
import { RASHIS, SPECIAL_DAYS } from '../astro/names';
import { daySummary, moonRashiAt } from '../astro/panchang';
import { specialDays } from '../astro/specialDays';
import type { Place } from '../astro/sunrise';
import { addDays, julianDay, toLocal } from '../astro/time';
import type { Lang } from '../i18n';

const REMIND_SPECIALS = new Set([
  'tamilNewYear', 'pongal', 'thaiPoosam', 'mahaShivaratri', 'panguniUthiram',
  'aadiPerukku', 'saraswatiPooja', 'vijayadashami', 'deepavali',
  'pournami', 'amavasai', 'ekadashi', 'pradosham', 'shashti', 'karthigai', 'karthigaiDeepam',
]);

/**
 * Schedules offline morning (7:00 AM local) notifications for upcoming Viratham /
 * observance days and (if birthRashi is set) personal Chandrashtamam days over
 * the next 30 days.
 */
export async function syncReminders(
  enabled: boolean,
  place: Place,
  birthRashi: number | null,
  lang: Lang,
): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!enabled) return true;

  const perm = await Notifications.requestPermissionsAsync();
  if (!perm.granted) return false;

  const today = toLocal(new Date(), place.utcOffsetMin).date;
  const nowMs = Date.now();

  for (let offset = 1; offset <= 30; offset++) {
    const date = addDays(today, offset);
    const summary = daySummary(date, place);
    const specials = specialDays(summary).filter((s) => REMIND_SPECIALS.has(s.id));
    const noonJd = julianDay(new Date((summary.sunrise.getTime() + summary.sunset.getTime()) / 2));
    const isChandrashtama = birthRashi !== null && chandrashtamaRashi(moonRashiAt(noonJd)) === birthRashi;

    if (specials.length === 0 && !isChandrashtama) continue;

    const parts: string[] = [];
    if (specials.length > 0) parts.push(specials.map((s) => SPECIAL_DAYS[s.id][lang]).join(', '));
    if (isChandrashtama && birthRashi !== null) {
      parts.push(
        lang === 'ta'
          ? `${RASHIS[birthRashi].ta} ராசிக்கு சந்திராஷ்டமம்`
          : `Chandrashtamam for ${RASHIS[birthRashi].en}`,
      );
    }

    // 7:00 AM on that local date (or 1 hour after sunrise if earlier).
    const triggerDate = new Date(summary.sunrise.getTime() + 45 * 60_000);
    if (triggerDate.getTime() <= nowMs) continue;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: lang === 'ta' ? 'பலன் அறிவோம் — இன்றைய நினைவூட்டல்' : 'Palan Arivom — Today',
        body: parts.join(' · '),
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
    });
  }
  return true;
}
