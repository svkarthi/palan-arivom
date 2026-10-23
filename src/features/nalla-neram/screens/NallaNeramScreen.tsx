import { PLANETS, TAMIL_MONTHS, TAMIL_YEARS, GREGORIAN_MONTHS, WEEKDAYS, NAKSHATRAS, YOGAS, karanaName, tithiName } from '@core/astro/names';
import { pakshaOf, type Span } from '@core/astro/panchang';
import { addDays, formatClock, sameDate, toLocal, type CivilDate } from '@core/astro/time';
import PlacePicker from '@core/components/PlacePicker';
import { AppText, Button, Card, Chip, Stepper } from '@core/components/ui';
import { useLang } from '@core/hooks/useLang';
import { useNow } from '@core/hooks/useNow';
import { usePlace } from '@core/hooks/usePlace';
import { colors, spacing } from '@core/theme';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { nallaNeramDay, statusAt } from '../logic';

const QUALITY_COLOR = { good: colors.good, mixed: colors.ok, avoid: colors.bad };

export default function NallaNeramScreen() {
  const { t } = useTranslation('nallaNeram');
  const { tr } = useLang();
  const place = usePlace();
  const now = useNow();
  const today = useMemo(() => toLocal(now, place.utcOffsetMin).date, [now, place.utcOffsetMin]);
  const [picked, setPicked] = useState<CivilDate | null>(null);
  const [showHoras, setShowHoras] = useState(false);

  const date = picked ?? today;
  const isToday = sameDate(date, today);
  const day = useMemo(() => nallaNeramDay(date, place), [date, place]);
  const status = isToday ? statusAt(day, now.getTime()) : null;

  const clock = (ms: number | Date) => formatClock(new Date(ms), place.utcOffsetMin);
  const range = (i: { start: number; end: number }) => `${clock(i.start)} – ${clock(i.end)}`;
  const untilText = (span: Span) => {
    const time = clock(span.end);
    const sameDay = sameDate(toLocal(span.end, place.utcOffsetMin).date, date);
    return sameDay
      ? t('panchang.until', { time })
      : t('panchang.untilNext', { time, nextDay: t('datetime.nextDay', { ns: 'translation' }) });
  };

  const { tamil, tithi, nakshatra, yoga, karana } = day.panchang;
  const heading = t('date.weekdayFull', {
    weekday: tr(WEEKDAYS[day.weekday]),
    day: date.d,
    month: tr(GREGORIAN_MONTHS[date.m - 1]),
    year: date.y,
  });

  const statusColor = !status ? colors.muted : status.kind === 'good' ? colors.good : status.kind === 'neutral' ? colors.muted : colors.bad;
  const statusText = !status ? '' : t(`now.${status.kind}`, { time: 'until' in status ? clock(status.until) : '' });

  const spanRow = (label: string, name: string, span: Span, extra?: string) => (
    <View key={`${label}-${span.index}-${span.end.getTime()}`} style={styles.spanRow}>
      <AppText size={13} color={colors.muted} style={styles.spanLabel}>
        {label}
      </AppText>
      <View style={styles.flex}>
        <AppText bold>
          {name}
          {extra ? ` · ${extra}` : ''}
        </AppText>
        <AppText size={12} color={colors.muted}>
          {untilText(span)}
        </AppText>
      </View>
    </View>
  );

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

      <AppText bold size={17}>
        ✅ {t('good.title')}
      </AppText>
      <Card style={styles.gap}>
        {day.goodWindows.length === 0 ? (
          <AppText color={colors.muted}>{t('good.none')}</AppText>
        ) : (
          day.goodWindows.map((w) => {
            const names = day.horas
              .filter((h) => h.quality === 'good' && h.start < w.end && h.end > w.start)
              .map((h) => tr(PLANETS[h.planet]))
              .join(' · ');
            return (
              <View key={w.start} style={styles.row}>
                <AppText bold color={colors.good} style={styles.flex}>
                  {range(w)}
                </AppText>
                <AppText size={12} color={colors.muted}>
                  {names}
                </AppText>
              </View>
            );
          })
        )}
        <AppText size={12} color={colors.muted}>
          {t('good.hint')}
        </AppText>
      </Card>

      <Card style={styles.gap}>
        <AppText bold>⭐ {t('good.abhijit')}</AppText>
        {day.abhijit ? (
          <>
            <AppText bold color={colors.good}>
              {range(day.abhijit)}
            </AppText>
            <AppText size={12} color={colors.muted}>
              {t('good.abhijitNote')}
            </AppText>
          </>
        ) : (
          <AppText size={13} color={colors.muted}>
            {t('good.wednesdayNote')}
          </AppText>
        )}
      </Card>

      <AppText bold size={17}>
        ⛔ {t('avoid.title')}
      </AppText>
      <Card style={styles.gap}>
        {(['rahu', 'yama', 'kuligai'] as const).map((k) => (
          <View key={k} style={styles.row}>
            <AppText bold style={styles.flex}>
              {t(`avoid.${k}`)}
            </AppText>
            <AppText bold color={colors.bad}>
              {range(day[k])}
            </AppText>
          </View>
        ))}
        <AppText size={12} color={colors.muted}>
          {t('avoid.kuligaiNote')}
        </AppText>
      </Card>

      <AppText bold size={17}>
        📜 {t('panchang.title')}
      </AppText>
      <Card style={styles.gap}>
        {tithi.map((s) =>
          spanRow(t('panchang.tithi'), tr(tithiName(s.index)), s, t(`panchang.${pakshaOf(s.index)}`)),
        )}
        {nakshatra.map((s) => spanRow(t('panchang.nakshatra'), tr(NAKSHATRAS[s.index]), s))}
        {yoga.map((s) => spanRow(t('panchang.yoga'), tr(YOGAS[s.index]), s))}
        {karana.map((s) => spanRow(t('panchang.karana'), tr(karanaName(s.index)), s))}
      </Card>

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
  spanRow: { flexDirection: 'row', gap: spacing.sm },
  spanLabel: { width: 78 },
  horaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  noMargin: { marginRight: 0, marginBottom: 0 },
});
