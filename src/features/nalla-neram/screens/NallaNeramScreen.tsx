import { AYANA, chandrashtamaRashi, isDakshinayana, ritu, sakaYear } from '@core/astro/dayExtras';
import { GREGORIAN_MONTHS, PLANETS, RASHIS, TAMIL_MONTHS, TAMIL_YEARS, WEEKDAYS } from '@core/astro/names';
import { addDays, formatClock, sameDate, toLocal, type CivilDate } from '@core/astro/time';
import PlacePicker from '@core/components/PlacePicker';
import { AppText, Button, Card, Chip, Segmented, Stepper } from '@core/components/ui';
import { useLang } from '@core/hooks/useLang';
import { useNow } from '@core/hooks/useNow';
import { usePlace } from '@core/hooks/usePlace';
import { useAppDispatch, useAppSelector } from '@core/store/hooks';
import { setDayPartBasis } from '@core/store/profileSlice';
import { colors, spacing } from '@core/theme';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
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
  const today = useMemo(() => toLocal(now, place.utcOffsetMin).date, [now, place.utcOffsetMin]);
  const [picked, setPicked] = useState<CivilDate | null>(null);
  const [showHoras, setShowHoras] = useState(false);

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

  const statusColor = !status ? colors.muted : status.kind === 'good' ? colors.good : status.kind === 'neutral' ? colors.muted : colors.bad;
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <PlacePicker />
      <Stepper
        label={heading}
        onPrev={() => setPicked(addDays(date, -1))}
        onNext={() => setPicked(addDays(date, 1))}
        onReset={isToday ? undefined : () => setPicked(null)}
        resetLabel={t('date.goToday')}
      />

      <Card style={styles.center}>
        <AppText bold size={18} color={colors.primaryDark} center>
          {t('date.tamilDate', {
            year: tr(TAMIL_YEARS[tamil.yearIndex]),
            month: tr(TAMIL_MONTHS[tamil.month]),
            day: tamil.day,
          })}
        </AppText>
        <AppText size={13} color={colors.primary} center>
          {t('calendar.ritu', {
            ayana: tr(isDakshinayana(tamil.month) ? AYANA.dakshinayana : AYANA.uttarayana),
            ritu: tr(ritu(tamil.month).sanskrit),
            season: tr(ritu(tamil.month).tamil),
            saka: sakaYear(tamil.yearStartGregorian),
          })}
        </AppText>
        <AppText size={13} color={colors.muted}>
          🌅 {t('date.sunrise')} {clock(day.panchang.sunrise)}   🌇 {t('date.sunset')} {clock(day.panchang.sunset)}
        </AppText>
      </Card>

      {status ? (
        <Card style={{ borderColor: statusColor, borderWidth: 2 }}>
          <AppText bold color={statusColor} center>
            {statusText}
          </AppText>
        </Card>
      ) : null}

      {myChandrashtama && birthRashi !== null ? (
        <Card style={{ borderColor: colors.bad, borderWidth: 2, backgroundColor: '#FFF5F5' }}>
          <AppText bold color={colors.bad} center>
            ⚠️ {t('chandrashtama.personalAlert', { rashi: tr(RASHIS[birthRashi]), until: myChandrashtamaUntil })}
          </AppText>
        </Card>
      ) : null}

      <Card style={styles.gap}>
        <AppText bold size={14}>
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

      <DayTimes day={day} date={date} place={place} />

      <View style={styles.horaHeader}>
        <AppText bold size={17}>
          🪐 {t('hora.title')}
        </AppText>
        <Button
          title={showHoras ? t('hora.hide') : t('hora.show')}
          variant="outline"
          onPress={() => setShowHoras((v) => !v)}
        />
      </View>
      {showHoras ? (
        <Card style={styles.gap}>
          {day.horas.map((h, i) => (
            <View key={h.start} style={styles.row}>
              <AppText size={12} color={colors.muted}>
                {h.night ? t('hora.night') : t('hora.day')} {(i % 12) + 1}
              </AppText>
              <AppText bold style={styles.flex}>
                {tr(PLANETS[h.planet])}
              </AppText>
              <AppText size={12}>{range(h)}</AppText>
              <Chip label={t(`hora.quality.${h.quality}`)} color={QUALITY_COLOR[h.quality]} style={styles.noMargin} />
            </View>
          ))}
        </Card>
      ) : null}

      <AppText size={12} color={colors.muted}>
        {t('note')}
      </AppText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, gap: spacing.md, backgroundColor: colors.bg },
  center: { alignItems: 'center', gap: spacing.xs },
  gap: { gap: spacing.sm },
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  horaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  noMargin: { marginRight: 0, marginBottom: 0 },
});
