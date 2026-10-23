import { BAD_NAKSHATRAS, isAvoidedTithi, isBadYoga } from '@core/astro/inauspicious';
import { karanaName, NAKSHATRAS, PLANETS, SPECIAL_DAYS, tithiName, YOGAS } from '@core/astro/names';
import { isVishti, pakshaOf, type Span } from '@core/astro/panchang';
import type { Place } from '@core/astro/sunrise';
import { formatClock, sameDate, toLocal, type CivilDate } from '@core/astro/time';
import { AppText, Card, Chip } from '@core/components/ui';
import { useLang } from '@core/hooks/useLang';
import { colors, spacing } from '@core/theme';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { NallaNeramDay } from '../logic';

type Props = { day: NallaNeramDay; date: CivilDate; place: Place };

/**
 * Good times, times to avoid and the panchangam timeline of one day. Used by the
 * Nalla Neram screen and inside each day of Nalla Naal. Inauspicious tithis
 * (Chaturthi, Ashtami, Navami, Chaturdashi, Amavasai), yogas, nakshatras and the
 * Bhadra karanam are flagged.
 */
export default function DayTimes({ day, date, place }: Props) {
  const { t } = useTranslation('nallaNeram');
  const { tr } = useLang();
  const clock = (ms: number | Date) => formatClock(new Date(ms), place.utcOffsetMin);
  const range = (i: { start: number; end: number }) => `${clock(i.start)} – ${clock(i.end)}`;

  const untilText = (span: Span) => {
    const time = clock(span.end);
    const sameDay = sameDate(toLocal(span.end, place.utcOffsetMin).date, date);
    return sameDay
      ? t('panchang.until', { time })
      : t('panchang.untilNext', { time, nextDay: t('datetime.nextDay', { ns: 'translation' }) });
  };

  const spanRow = (label: string, name: string, span: Span, avoid: boolean, extra?: string) => (
    <View key={`${label}-${span.index}-${span.end.getTime()}`} style={styles.spanRow}>
      <AppText size={13} color={colors.muted} style={styles.spanLabel}>
        {label}
      </AppText>
      <View style={styles.flex}>
        <AppText bold color={avoid ? colors.bad : colors.text}>
          {name}
          {extra ? ` · ${extra}` : ''}
        </AppText>
        <AppText size={12} color={colors.muted}>
          {untilText(span)}
        </AppText>
      </View>
      {avoid ? <Chip label={t('panchang.avoidFlag')} color={colors.bad} style={styles.noMargin} /> : null}
    </View>
  );

  const { tithi, nakshatra, yoga, karana } = day.panchang;

  return (
    <View style={styles.stack}>
      {day.specials.length > 0 ? (
        <>
          <AppText bold size={17}>
            🪔 {t('special.title')}
          </AppText>
          <Card style={styles.gap}>
            {day.specials.map((s) => (
              <View key={s.id} style={styles.row}>
                <AppText bold color={colors.primaryDark} style={styles.flex}>
                  {tr(SPECIAL_DAYS[s.id])}
                </AppText>
                {s.window ? <AppText size={12}>{range(s.window)}</AppText> : null}
              </View>
            ))}
            <AppText size={12} color={colors.muted}>
              {t('special.note')}
            </AppText>
          </Card>
        </>
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
          spanRow(t('panchang.tithi'), tr(tithiName(s.index)), s, isAvoidedTithi(s.index), t(`panchang.${pakshaOf(s.index)}`)),
        )}
        {nakshatra.map((s) => spanRow(t('panchang.nakshatra'), tr(NAKSHATRAS[s.index]), s, BAD_NAKSHATRAS.includes(s.index)))}
        {yoga.map((s) => spanRow(t('panchang.yoga'), tr(YOGAS[s.index]), s, isBadYoga(s.index)))}
        {karana.map((s) => spanRow(t('panchang.karana'), tr(karanaName(s.index)), s, isVishti(s.index)))}
        <AppText size={12} color={colors.muted}>
          {t('panchang.flagNote')}
        </AppText>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.md },
  gap: { gap: spacing.sm },
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  spanRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  spanLabel: { width: 78 },
  noMargin: { marginRight: 0, marginBottom: 0 },
});
