import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AYANA, chandrashtamaRashi, DAY_YOGA_NAMES, dayYoga, DIRECTION_NAMES, isDakshinayana, PARIHARAM, ritu, sakaYear } from '@core/astro/dayExtras';
import { GREGORIAN_MONTHS, PLANETS, RASHIS, SPECIAL_DAYS, TAMIL_MONTHS, TAMIL_YEARS, WEEKDAYS } from '@core/astro/names';
import { addDays, daysInMonth, formatClock, sameDate, toLocal, type CivilDate } from '@core/astro/time';
import PlacePicker from '@core/components/PlacePicker';
import { AppText, Button, Card, Chip, SectionHeader, Segmented, Stepper, useBottomInset } from '@core/components/ui';
import { useLang } from '@core/hooks/useLang';
import { useNow } from '@core/hooks/useNow';
import { usePlace } from '@core/hooks/usePlace';
import { useAppDispatch, useAppSelector } from '@core/store/hooks';
import { setDayPartBasis } from '@core/store/profileSlice';
import { colors, spacing } from '@core/theme';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import DayTimes from '../components/DayTimes';
import { nallaNeramDay, statusAt } from '../logic';

const QUALITY_COLOR = { good: colors.good, mixed: colors.ok, avoid: colors.bad };

export default function NallaNeramScreen() {
  const { t } = useTranslation('nallaNeram');
  const { tr } = useLang();
  const place = usePlace();
  const dispatch = useAppDispatch();
  const basis = useAppSelector((s) => s.profile.dayPartBasis) ?? 'sun';
  const birthRashi = useAppSelector((s) => s.profile.birthRashi);
  const now = useNow();
  const bottomInset = useBottomInset();
  const today = useMemo(() => toLocal(now, place.utcOffsetMin).date, [now, place.utcOffsetMin]);
  const [picked, setPicked] = useState<CivilDate | null>(null);
  const [showHoras, setShowHoras] = useState(false);
  const [jumpOpen, setJumpOpen] = useState(false);
  const [draft, setDraft] = useState<CivilDate>(today);

  const date = picked ?? today;
  const isToday = sameDate(date, today);
  const { y, m, d } = date;
  const day = useMemo(() => nallaNeramDay({ y, m, d }, place, basis), [y, m, d, place, basis]);
  const status = isToday ? statusAt(day, now.getTime()) : null;

  const clock = (ms: number | Date) => formatClock(new Date(ms), place.utcOffsetMin);
  const range = (i: { start: number; end: number }) => `${clock(i.start)} – ${clock(i.end)}`;
  const { tamil } = day.panchang;
  const heading = t('date.weekdayFull', {
    weekday: tr(WEEKDAYS[day.weekday]),
    day: date.d,
    month: tr(GREGORIAN_MONTHS[date.m - 1]),
    year: date.y,
  });

  const statusTone = !status
    ? { fg: colors.muted, bg: colors.surface, border: colors.border }
    : status.kind === 'good'
      ? { fg: colors.good, bg: colors.goodBg, border: colors.good }
      : status.kind === 'neutral'
        ? { fg: colors.muted, bg: colors.surface, border: colors.border }
        : { fg: colors.bad, bg: colors.badBg, border: colors.bad };
  const statusText = !status ? '' : t(`now.${status.kind}`, { time: 'until' in status ? clock(status.until) : '' });
  const myChandrashtama =
    birthRashi !== null ? day.moonRashi.find((s) => chandrashtamaRashi(s.index) === birthRashi) : undefined;
  const myChandrashtamaUntil = myChandrashtama
    ? sameDate(toLocal(myChandrashtama.end, place.utcOffsetMin).date, date)
      ? t('panchang.until', { time: clock(myChandrashtama.end) })
      : t('panchang.untilNext', {
          time: clock(myChandrashtama.end),
          nextDay: t('datetime.nextDay', { ns: 'translation' }),
        })
    : '';

  const shareDay = () => {
    const tamilLine = t('date.tamilDate', {
      year: tr(TAMIL_YEARS[tamil.yearIndex]),
      month: tr(TAMIL_MONTHS[tamil.month]),
      day: tamil.day,
    });
    const nnM = day.calendarNallaNeram.morning ? range(day.calendarNallaNeram.morning) : '—';
    const nnE = day.calendarNallaNeram.evening ? range(day.calendarNallaNeram.evening) : '—';
    const gM = day.gowriNallaNeram.morning ? range(day.gowriNallaNeram.morning) : '—';
    const gE = day.gowriNallaNeram.evening ? range(day.gowriNallaNeram.evening) : '—';
    const dy = dayYoga(day.weekday, day.panchang.nakshatra[0].index);
    const lines = [
      `📅 ${heading} (${tr(place.name)})`,
      `🗓 ${tamilLine} · ${tr(DAY_YOGA_NAMES[dy])}`,
      ...(day.specials.length > 0 ? [`🪔 ${day.specials.map((s) => tr(SPECIAL_DAYS[s.id])).join(', ')}`] : []),
      '',
      `✅ ${t('good.nallaNeram')}: ${t('good.morning')} ${nnM} | ${t('good.evening')} ${nnE}`,
      `✅ ${t('good.gowriNallaNeram')}: ${t('good.morning')} ${gM} | ${t('good.evening')} ${gE}`,
      ...(day.muhurthaWindows.length > 0
        ? [`🪔 ${t('good.muhurtham')}: ${day.muhurthaWindows.map(range).join(', ')}`]
        : []),
      '',
      `⛔ ${t('avoid.rahu')}: ${range(day.rahu)}`,
      `⛔ ${t('avoid.yama')}: ${range(day.yama)}`,
      `⛔ ${t('avoid.kuligai')}: ${range(day.kuligai)}`,
      `🧭 ${t('sulam.title')}: ${tr(DIRECTION_NAMES[day.sulam.direction])} (${tr(PARIHARAM[day.sulam.remedy])})`,
    ];
    void Share.share({ message: lines.join('\n') });
  };

  const openJump = () => {
    setDraft(date);
    setJumpOpen(true);
  };

  const maxDay = daysInMonth(draft.y, draft.m);

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingBottom: bottomInset }]}>
      <View style={styles.topBar}>
        <PlacePicker />
        <View style={styles.topActions}>
          <Pressable
            accessibilityRole="button"
            onPress={openJump}
            style={({ pressed }) => [styles.pillBtn, pressed && { opacity: 0.7 }]}
          >
            <MaterialCommunityIcons name="calendar-search" size={15} color={colors.primary} />
            <AppText size={12} color={colors.primaryDark} bold>
              {t('date.pickDate')}
            </AppText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={shareDay}
            style={({ pressed }) => [styles.pillBtn, pressed && { opacity: 0.7 }]}
          >
            <MaterialCommunityIcons name="share-variant-outline" size={15} color={colors.primary} />
            <AppText size={12} color={colors.primaryDark} bold>
              {t('common.share', { ns: 'translation' })}
            </AppText>
          </Pressable>
        </View>
      </View>

      <Stepper
        label={heading}
        onPrev={() => setPicked(addDays(date, -1))}
        onNext={() => setPicked(addDays(date, 1))}
        onReset={isToday ? undefined : () => setPicked(null)}
        resetLabel={t('date.goToday')}
      />

      <Card variant="hero" style={styles.heroCenter}>
        <AppText bold size={19} color={colors.heroText} center>
          {t('date.tamilDate', {
            year: tr(TAMIL_YEARS[tamil.yearIndex]),
            month: tr(TAMIL_MONTHS[tamil.month]),
            day: tamil.day,
          })}
        </AppText>
        <AppText size={12} color={colors.heroAccent} center>
          {t('calendar.ritu', {
            ayana: tr(isDakshinayana(tamil.month) ? AYANA.dakshinayana : AYANA.uttarayana),
            ritu: tr(ritu(tamil.month).sanskrit),
            season: tr(ritu(tamil.month).tamil),
            saka: sakaYear(tamil.yearStartGregorian),
          })}
        </AppText>
        <View style={styles.sunRow}>
          <View style={styles.sunPill}>
            <MaterialCommunityIcons name="weather-sunset-up" size={15} color={colors.heroAccent} />
            <AppText size={12} color={colors.heroText}>
              {t('date.sunrise')} {clock(day.panchang.sunrise)}
            </AppText>
          </View>
          <View style={styles.sunPill}>
            <MaterialCommunityIcons name="weather-sunset-down" size={15} color={colors.heroAccent} />
            <AppText size={12} color={colors.heroText}>
              {t('date.sunset')} {clock(day.panchang.sunset)}
            </AppText>
          </View>
        </View>
      </Card>

      {status ? (
        <Card style={[styles.statusCard, { borderColor: statusTone.border, backgroundColor: statusTone.bg }]}>
          <AppText bold size={14} color={statusTone.fg} center>
            {statusText}
          </AppText>
        </Card>
      ) : null}

      {myChandrashtama && birthRashi !== null ? (
        <Card style={styles.alertCard}>
          <View style={styles.row}>
            <MaterialCommunityIcons name="alert-circle" size={18} color={colors.bad} />
            <AppText bold size={13} color={colors.bad} style={styles.flex}>
              {t('chandrashtama.personalAlert', { rashi: tr(RASHIS[birthRashi]), until: myChandrashtamaUntil })}
            </AppText>
          </View>
        </Card>
      ) : null}

      <DayTimes day={day} date={date} place={place} />

      <Card style={styles.gap}>
        <AppText bold size={13} color={colors.primaryDark}>
          {t('basis.label')}
        </AppText>
        <Segmented
          value={basis}
          onChange={(v) => dispatch(setDayPartBasis(v))}
          options={[
            { value: 'sun', label: t('basis.sun') },
            { value: 'fixed', label: t('basis.fixed') },
          ]}
        />
        <AppText size={12} color={colors.muted}>
          {t('basis.hint')}
        </AppText>
      </Card>

      <SectionHeader
        icon="orbit"
        title={t('hora.title')}
        color={colors.primaryDark}
        bg={colors.surface}
        right={
          <Pressable
            accessibilityRole="button"
            onPress={() => setShowHoras((v) => !v)}
            style={({ pressed }) => [styles.togglePill, pressed && { opacity: 0.7 }]}
          >
            <AppText size={12} bold color={colors.primary}>
              {showHoras ? t('hora.hide') : t('hora.show')}
            </AppText>
          </Pressable>
        }
      />
      {showHoras ? (
        <Card style={styles.gap}>
          {day.horas.map((h, i) => (
            <View key={h.start} style={styles.row}>
              <AppText size={12} color={colors.muted}>
                {h.night ? t('hora.night') : t('hora.day')} {(i % 12) + 1}
              </AppText>
              <AppText bold size={14} style={styles.flex}>
                {tr(PLANETS[h.planet])}
              </AppText>
              <AppText size={12} color={colors.muted}>{range(h)}</AppText>
              <Chip label={t(`hora.quality.${h.quality}`)} color={QUALITY_COLOR[h.quality]} style={styles.noMargin} />
            </View>
          ))}
        </Card>
      ) : null}

      <AppText size={12} color={colors.muted}>
        {t('note')}
      </AppText>

      <Modal visible={jumpOpen} transparent animationType="slide" onRequestClose={() => setJumpOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setJumpOpen(false)} />
        <View style={[styles.sheet, { paddingBottom: bottomInset }]}>
          <View style={styles.handle} />
          <AppText bold size={17} color={colors.primaryDark}>
            {t('date.jumpTitle')}
          </AppText>
          <Stepper
            label={String(draft.y)}
            onPrev={() => setDraft((p) => ({ ...p, y: p.y - 1, d: Math.min(p.d, daysInMonth(p.y - 1, p.m)) }))}
            onNext={() => setDraft((p) => ({ ...p, y: p.y + 1, d: Math.min(p.d, daysInMonth(p.y + 1, p.m)) }))}
          />
          <View style={styles.monthGrid}>
            {GREGORIAN_MONTHS.map((gm, idx) => {
              const mm = idx + 1;
              const active = draft.m === mm;
              return (
                <Pressable
                  key={mm}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => setDraft((p) => ({ ...p, m: mm, d: Math.min(p.d, daysInMonth(p.y, mm)) }))}
                  style={[styles.monthCell, active && styles.cellActive]}
                >
                  <AppText size={12} bold={active} color={active ? '#fff' : colors.text} center>
                    {tr(gm)}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.dayGrid}>
            {Array.from({ length: maxDay }, (_, i) => i + 1).map((dd) => {
              const active = draft.d === dd;
              return (
                <Pressable
                  key={dd}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => {
                    setPicked({ y: draft.y, m: draft.m, d: dd });
                    setJumpOpen(false);
                  }}
                  style={[styles.dayCell, active && styles.cellActive]}
                >
                  <AppText size={13} bold={active} color={active ? '#fff' : colors.text} center>
                    {dd}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
          <Button title={t('common.cancel', { ns: 'translation' })} variant="outline" onPress={() => setJumpOpen(false)} />
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, gap: spacing.md, backgroundColor: colors.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.sm },
  topActions: { flexDirection: 'row', gap: spacing.xs },
  pillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  heroCenter: { alignItems: 'center', gap: 6 },
  sunRow: { flexDirection: 'row', gap: spacing.sm, marginTop: 4, flexWrap: 'wrap', justifyContent: 'center' },
  sunPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.heroSurface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusCard: { borderWidth: 1.5, paddingVertical: 10 },
  alertCard: { borderColor: colors.bad, borderWidth: 1.5, backgroundColor: colors.badBg, paddingVertical: 10 },
  gap: { gap: spacing.sm },
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  togglePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.primaryBg,
  },
  noMargin: { marginRight: 0, marginBottom: 0 },
  backdrop: { flex: 1, backgroundColor: 'rgba(20,10,5,0.45)' },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 4,
  },
  sheet: {
    backgroundColor: colors.bg,
    padding: spacing.md,
    gap: spacing.sm,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  monthCell: {
    width: '23%',
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  dayCell: {
    width: '13%',
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cellActive: { backgroundColor: colors.primary, borderColor: colors.primary },
});
