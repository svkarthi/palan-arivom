import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { chandrashtamaRashi } from '../astro/dayExtras';
import { RASHIS, SPECIAL_DAYS, TAMIL_MONTHS, TAMIL_YEARS, WEEKDAYS } from '../astro/names';
import { formatClock, sameDate, toLocal } from '../astro/time';
import { FEATURES } from '../../features/registry';
import { nallaNeramDay, statusAt } from '../../features/nalla-neram/logic';
import { AppText, Card, Chip } from '../components/ui';
import { useLang } from '../hooks/useLang';
import { useNow } from '../hooks/useNow';
import { usePlace } from '../hooks/usePlace';
import type { RootStackParamList } from '../navigation/types';
import { useAppSelector } from '../store/hooks';
import { colors, spacing } from '../theme';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { t: tn } = useTranslation('nallaNeram');
  const { tr } = useLang();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const place = usePlace();
  const now = useNow();
  const basis = useAppSelector((s) => s.profile.dayPartBasis) ?? 'sun';
  const birthRashi = useAppSelector((s) => s.profile.birthRashi);

  const today = toLocal(now, place.utcOffsetMin).date;
  const { y, m, d } = today;
  const day = useMemo(() => nallaNeramDay({ y, m, d }, place, basis), [y, m, d, place, basis]);
  const status = statusAt(day, now.getTime());

  const clock = (ms: number | Date) => formatClock(new Date(ms), place.utcOffsetMin);
  const range = (i: { start: number; end: number }) => `${clock(i.start)} – ${clock(i.end)}`;
  const { tamil } = day.panchang;

  const statusColor = !status ? colors.muted : status.kind === 'good' ? colors.good : status.kind === 'neutral' ? colors.muted : colors.bad;
  const statusText = !status ? '' : tn(`now.${status.kind}`, { time: 'until' in status ? clock(status.until) : '' });

  const myChandrashtama =
    birthRashi !== null ? day.moonRashi.find((s) => chandrashtamaRashi(s.index) === birthRashi) : undefined;
  const myChandrashtamaUntil = myChandrashtama
    ? sameDate(toLocal(myChandrashtama.end, place.utcOffsetMin).date, today)
      ? tn('panchang.until', { time: clock(myChandrashtama.end) })
      : tn('panchang.untilNext', { time: clock(myChandrashtama.end), nextDay: t('datetime.nextDay') })
    : '';

  const nnMorning = day.calendarNallaNeram.morning ? range(day.calendarNallaNeram.morning) : '—';
  const nnEvening = day.calendarNallaNeram.evening ? range(day.calendarNallaNeram.evening) : '—';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable accessibilityRole="button" onPress={() => navigation.navigate('NallaNeram')}>
        <Card style={styles.todayCard}>
          <View style={styles.todayHeader}>
            <View style={styles.flex}>
              <AppText bold size={17} color={colors.primaryDark}>
                {tr(WEEKDAYS[day.weekday])} · {tr(TAMIL_MONTHS[tamil.month])} {tamil.day}
              </AppText>
              <AppText size={12} color={colors.muted}>
                {tr(TAMIL_YEARS[tamil.yearIndex])} · 📍 {tr(place.name)}
              </AppText>
            </View>
            <AppText size={12} bold color={colors.primary}>
              {t('home.viewDay')}
            </AppText>
          </View>

          {status ? (
            <View style={[styles.statusPill, { borderColor: statusColor }]}>
              <AppText bold size={13} color={statusColor} center>
                {statusText}
              </AppText>
            </View>
          ) : null}

          {myChandrashtama && birthRashi !== null ? (
            <View style={styles.alertBox}>
              <AppText bold size={13} color={colors.bad}>
                ⚠️ {tn('chandrashtama.personalAlert', { rashi: tr(RASHIS[birthRashi]), until: myChandrashtamaUntil })}
              </AppText>
            </View>
          ) : null}

          <View style={styles.row}>
            <AppText size={13} color={colors.muted} style={styles.label}>
              {tn('good.nallaNeram')}
            </AppText>
            <AppText bold size={13} color={colors.good} style={styles.flex}>
              {nnMorning} · {nnEvening}
            </AppText>
          </View>

          <View style={styles.row}>
            <AppText size={13} color={colors.muted} style={styles.label}>
              {tn('avoid.rahu')}
            </AppText>
            <AppText bold size={13} color={colors.bad} style={styles.flex}>
              {range(day.rahu)}
            </AppText>
          </View>

          {day.specials.length > 0 ? (
            <View style={styles.wrap}>
              {day.specials.map((s) => (
                <Chip
                  key={s.id}
                  label={`${s.id === 'karinaal' ? '⚠️' : '🪔'} ${tr(SPECIAL_DAYS[s.id])}`}
                  color={s.id === 'karinaal' ? colors.bad : colors.primary}
                />
              ))}
            </View>
          ) : null}
        </Card>
      </Pressable>

      <AppText color={colors.muted}>{t('home.subtitle')}</AppText>
      <View style={styles.grid}>
        {FEATURES.map((f) => {
          const route = f.route;
          return (
            <Pressable
              key={f.id}
              accessibilityRole="button"
              accessibilityState={{ disabled: route === null }}
              disabled={route === null}
              onPress={() => route && navigation.navigate(route)}
              style={styles.cell}
            >
              <Card style={[styles.tile, route === null && styles.disabled]}>
                <AppText size={40}>{f.icon}</AppText>
                <AppText bold size={18} color={colors.primaryDark} center>
                  {tr(f.title)}
                </AppText>
                <AppText size={12} color={colors.muted} center>
                  {tr(f.description)}
                </AppText>
                {route === null ? <Chip label={t('home.comingSoon')} color={colors.neutral} /> : null}
              </Card>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, gap: spacing.md, backgroundColor: colors.bg, flexGrow: 1 },
  todayCard: { gap: spacing.sm, borderColor: colors.primary, borderWidth: 1.5 },
  todayHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  label: { width: 96 },
  statusPill: { borderWidth: 1.5, borderRadius: 10, paddingVertical: 4, paddingHorizontal: spacing.sm },
  alertBox: { backgroundColor: '#FFF5F5', borderColor: colors.bad, borderWidth: 1, borderRadius: 10, padding: spacing.sm },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -spacing.xs },
  cell: { width: '50%', padding: spacing.xs },
  tile: { alignItems: 'center', gap: spacing.xs, minHeight: 190, justifyContent: 'center' },
  disabled: { opacity: 0.6 },
});
