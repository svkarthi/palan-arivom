import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Interval } from '@core/astro/intervals';
import type { Place } from '@core/astro/sunrise';
import { formatClock } from '@core/astro/time';
import { AppText, Card } from '@core/components/ui';
import { colors, spacing } from '@core/theme';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { NallaNeramDay } from '../logic';

type Props = {
  day: NallaNeramDay;
  place: Place;
  /** Current timestamp in ms when viewing today, or `null` for other dates. */
  nowMs: number | null;
};

type Segment = { leftPct: number; widthPct: number; color: string; key: string };

function clipToSpan(interval: Interval, start: number, end: number): { leftPct: number; widthPct: number } | null {
  const s = Math.max(interval.start, start);
  const e = Math.min(interval.end, end);
  if (e <= s || end <= start) return null;
  const total = end - start;
  return {
    leftPct: ((s - start) / total) * 100,
    widthPct: Math.max(1.2, ((e - s) / total) * 100),
  };
}

/**
 * Compact sunrise-to-sunset horizontal bar showing good windows (green),
 * Rahu / Yamagandam / Kuligai avoid blocks (red), and a live "now" marker.
 */
export default function DaylightTimeline({ day, place, nowMs }: Props) {
  const { t } = useTranslation('nallaNeram');
  const start = day.panchang.sunrise.getTime();
  const end = day.panchang.sunset.getTime();
  const total = end - start;
  if (total <= 0) return null;

  const clock = (ms: number) => formatClock(new Date(ms), place.utcOffsetMin);

  const goodIntervals: Interval[] = [
    ...day.goodWindows,
    ...(day.calendarNallaNeram.morning ? [day.calendarNallaNeram.morning] : []),
    ...(day.calendarNallaNeram.evening ? [day.calendarNallaNeram.evening] : []),
  ];
  const avoidIntervals: { key: string; interval: Interval; color: string }[] = [
    { key: 'rahu', interval: day.rahu, color: colors.bad },
    { key: 'yama', interval: day.yama, color: colors.bad },
    { key: 'kuligai', interval: day.kuligai, color: '#D96B52' },
  ];

  const goodSegments: Segment[] = goodIntervals
    .map((w, idx) => {
      const c = clipToSpan(w, start, end);
      return c ? { ...c, color: colors.good, key: `g-${idx}-${w.start}` } : null;
    })
    .filter((s): s is Segment => s !== null);

  const avoidSegments: Segment[] = avoidIntervals
    .map(({ key, interval, color }) => {
      const c = clipToSpan(interval, start, end);
      return c ? { ...c, color, key: `a-${key}` } : null;
    })
    .filter((s): s is Segment => s !== null);

  const nowPct =
    nowMs !== null && nowMs >= start && nowMs <= end ? ((nowMs - start) / total) * 100 : null;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="weather-sunny" size={16} color={colors.primary} />
        <AppText bold size={13} color={colors.primaryDark} style={styles.flex}>
          {t('timeline.title')}
        </AppText>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: colors.good }]} />
            <AppText size={10} color={colors.muted}>
              {t('timeline.good')}
            </AppText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: colors.bad }]} />
            <AppText size={10} color={colors.muted}>
              {t('timeline.avoid')}
            </AppText>
          </View>
          {nowPct !== null ? (
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: colors.primaryDark }]} />
              <AppText size={10} bold color={colors.primaryDark}>
                {t('timeline.now')}
              </AppText>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.trackWrap}>
        <View style={styles.track}>
          {goodSegments.map((seg) => (
            <View
              key={seg.key}
              style={[
                styles.segment,
                { left: `${seg.leftPct}%`, width: `${seg.widthPct}%`, backgroundColor: seg.color },
              ]}
            />
          ))}
          {avoidSegments.map((seg) => (
            <View
              key={seg.key}
              style={[
                styles.segment,
                { left: `${seg.leftPct}%`, width: `${seg.widthPct}%`, backgroundColor: seg.color },
              ]}
            />
          ))}
        </View>
        {nowPct !== null ? (
          <View pointerEvents="none" style={[styles.nowPin, { left: `${nowPct}%` }]}>
            <View style={styles.nowDot} />
            <View style={styles.nowLine} />
          </View>
        ) : null}
      </View>

      <View style={styles.ticks}>
        <AppText size={11} color={colors.muted}>
          {clock(start)}
        </AppText>
        <AppText size={11} color={colors.muted}>
          {clock((start + end) / 2)}
        </AppText>
        <AppText size={11} color={colors.muted}>
          {clock(end)}
        </AppText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.xs + 2, paddingVertical: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  flex: { flex: 1 },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  trackWrap: { position: 'relative', justifyContent: 'center', paddingVertical: 5 },
  track: {
    height: 16,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    position: 'relative',
  },
  segment: { position: 'absolute', top: 0, bottom: 0, opacity: 0.9 },
  nowPin: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    marginLeft: -5,
    width: 10,
    alignItems: 'center',
  },
  nowDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primaryDark,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  nowLine: { width: 2, flex: 1, backgroundColor: colors.primaryDark, borderRadius: 1 },
  ticks: { flexDirection: 'row', justifyContent: 'space-between' },
});
