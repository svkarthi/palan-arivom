import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { chandrashtamaRashi } from '../astro/dayExtras';
import { RASHIS, SPECIAL_DAYS, TAMIL_MONTHS, TAMIL_YEARS, WEEKDAYS } from '../astro/names';
import { formatClock, sameDate, toLocal } from '../astro/time';
import { FEATURES, type FeatureTile } from '../../features/registry';
import { nallaNeramDay, statusAt } from '../../features/nalla-neram/logic';
import ObservanceIcon from '../components/ObservanceIcon';
import PlacePicker from '../components/PlacePicker';
import { AppText, Card, Chip, IconBadge, useBottomInset } from '../components/ui';
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
  const bottomInset = useBottomInset();
  const basis = useAppSelector((s) => s.profile.dayPartBasis) ?? 'sun';
  const birthRashi = useAppSelector((s) => s.profile.birthRashi);

  const today = toLocal(now, place.utcOffsetMin).date;
  const { y, m, d } = today;
  const day = useMemo(() => nallaNeramDay({ y, m, d }, place, basis), [y, m, d, place, basis]);
  const status = statusAt(day, now.getTime());

  const clock = (ms: number | Date) => formatClock(new Date(ms), place.utcOffsetMin);
  const range = (i: { start: number; end: number }) => `${clock(i.start)} – ${clock(i.end)}`;
  const { tamil } = day.panchang;

  const statusTone =
    !status
      ? { fg: colors.heroMuted, bg: colors.heroSurface, dot: colors.heroAccent }
      : status.kind === 'good'
        ? { fg: '#D8F5DA', bg: '#1F5C27', dot: '#6EE77A' }
        : status.kind === 'neutral'
          ? { fg: colors.heroText, bg: colors.heroSurface, dot: colors.heroAccent }
          : { fg: '#FFD8D8', bg: '#8C1D1D', dot: '#FF8A8A' };
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

  const hasTrailingSingle = FEATURES.length % 2 === 1;
  const gridTiles = hasTrailingSingle ? FEATURES.slice(0, -1) : FEATURES;
  const bannerTile: FeatureTile | null = hasTrailingSingle ? FEATURES[FEATURES.length - 1] : null;

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingBottom: bottomInset }]}>
      <Pressable
        accessibilityRole="button"
        onPress={() => navigation.navigate('NallaNeram')}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <Card variant="hero" style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.flex}>
              <AppText bold size={19} color={colors.heroText}>
                {tr(TAMIL_MONTHS[tamil.month])} {tamil.day} · {tr(WEEKDAYS[day.weekday])}
              </AppText>
              <PlacePicker variant="hero" prefixText={`${tr(TAMIL_YEARS[tamil.yearIndex])} · `} />
            </View>
            <View style={styles.ctaPill}>
              <AppText size={11} bold color={colors.heroAccent}>
                {t('home.viewDay')}
              </AppText>
            </View>
          </View>

          {status ? (
            <View style={[styles.statusPill, { backgroundColor: statusTone.bg }]}>
              <View style={[styles.statusDot, { backgroundColor: statusTone.dot }]} />
              <AppText bold size={13} color={statusTone.fg} style={styles.flex}>
                {statusText}
              </AppText>
            </View>
          ) : null}

          {myChandrashtama && birthRashi !== null ? (
            <View style={styles.heroAlert}>
              <MaterialCommunityIcons name="alert-circle" size={16} color="#FFD8D8" />
              <AppText bold size={12} color="#FFD8D8" style={styles.flex}>
                {tn('chandrashtama.personalAlert', { rashi: tr(RASHIS[birthRashi]), until: myChandrashtamaUntil })}
              </AppText>
            </View>
          ) : null}

          <View style={styles.heroGrid}>
            <View style={styles.heroCol}>
              <AppText size={11} bold color={colors.heroAccent}>
                {tn('good.nallaNeram')}
              </AppText>
              <AppText bold size={12} color={colors.heroText}>
                {nnMorning}
              </AppText>
              <AppText size={12} color={colors.heroMuted}>
                {nnEvening}
              </AppText>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroCol}>
              <AppText size={11} bold color="#FFB4A9">
                {tn('avoid.rahu')}
              </AppText>
              <AppText bold size={13} color={colors.heroText}>
                {range(day.rahu)}
              </AppText>
              <AppText size={11} color={colors.heroMuted}>
                {tn('date.sunrise')} {clock(day.panchang.sunrise)}
              </AppText>
            </View>
          </View>

          {day.specials.length > 0 ? (
            <View style={styles.wrap}>
              {day.specials.map((s) => (
                <View
                  key={s.id}
                  style={[
                    styles.heroChip,
                    s.id === 'karinaal' && { backgroundColor: '#9E2A2B' },
                  ]}
                >
                  <ObservanceIcon id={s.id} size={14} onDark />
                  <AppText size={11} bold color={colors.heroText}>
                    {tr(SPECIAL_DAYS[s.id])}
                  </AppText>
                </View>
              ))}
            </View>
          ) : null}
        </Card>
      </Pressable>

      <AppText size={13} bold color={colors.muted}>
        {t('home.subtitle')}
      </AppText>

      <View style={styles.grid}>
        {gridTiles.map((f) => {
          const route = f.route;
          return (
            <Pressable
              key={f.id}
              accessibilityRole="button"
              accessibilityState={{ disabled: route === null }}
              disabled={route === null}
              onPress={() => route && navigation.navigate(route)}
              style={({ pressed }) => [styles.cell, pressed && styles.pressed]}
            >
              <Card style={[styles.tile, route === null && styles.disabled]}>
                <IconBadge icon={f.icon} color={f.tint} bg={f.tintBg} size={48} />
                <AppText bold size={16} color={colors.primaryDark}>
                  {tr(f.title)}
                </AppText>
                <AppText size={12} color={colors.muted} numberOfLines={3}>
                  {tr(f.description)}
                </AppText>
                {route === null ? <Chip label={t('home.comingSoon')} color={colors.neutral} /> : null}
              </Card>
            </Pressable>
          );
        })}
      </View>

      {bannerTile ? (
        <Pressable
          accessibilityRole="button"
          disabled={bannerTile.route === null}
          onPress={() => bannerTile.route && navigation.navigate(bannerTile.route)}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Card style={styles.bannerCard}>
            <IconBadge icon={bannerTile.icon} color={bannerTile.tint} bg={bannerTile.tintBg} size={48} />
            <View style={styles.flex}>
              <AppText bold size={16} color={colors.primaryDark}>
                {tr(bannerTile.title)}
              </AppText>
              <AppText size={12} color={colors.muted}>
                {tr(bannerTile.description)}
              </AppText>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.primary} />
          </Card>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, gap: spacing.md, backgroundColor: colors.bg, flexGrow: 1 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.985 }] },
  heroCard: { gap: spacing.sm + 2 },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  ctaPill: {
    backgroundColor: colors.heroSurface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  heroAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#5C1111',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  heroGrid: {
    flexDirection: 'row',
    backgroundColor: colors.heroSurface,
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  heroCol: { flex: 1, gap: 2 },
  heroDivider: { width: 1, backgroundColor: '#913838' },
  heroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.heroSurface,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    marginRight: 6,
    marginBottom: 4,
  },
  flex: { flex: 1 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -spacing.xs },
  cell: { width: '50%', padding: spacing.xs },
  tile: { alignItems: 'flex-start', gap: 6, minHeight: 168, justifyContent: 'flex-start' },
  bannerCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  disabled: { opacity: 0.6 },
});
