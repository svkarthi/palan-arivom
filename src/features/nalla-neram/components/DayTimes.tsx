import { chandrashtamaRashi, DAY_YOGA_NAMES, dayYoga, DIRECTION_NAMES, nakshatrasOfRashi, NOKKU_NAMES, nokkuNaal, PARIHARAM } from '@core/astro/dayExtras';
import { BAD_NAKSHATRAS, isBadYoga, tithiSeverity, type Severity } from '@core/astro/inauspicious';
import { karanaName, NAKSHATRAS, PLANETS, RASHIS, SPECIAL_DAYS, tithiName, YOGAS } from '@core/astro/names';
import { isVishti, pakshaOf, type Span } from '@core/astro/panchang';
import type { Place } from '@core/astro/sunrise';
import { formatClock, sameDate, toLocal, type CivilDate } from '@core/astro/time';
import { AppText, Card, Chip } from '@core/components/ui';
import { useLang } from '@core/hooks/useLang';
import { useAppSelector } from '@core/store/hooks';
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
  const birthRashi = useAppSelector((s) => s.profile.birthRashi);
  const clock = (ms: number | Date) => formatClock(new Date(ms), place.utcOffsetMin);
  const range = (i: { start: number; end: number }) => `${clock(i.start)} – ${clock(i.end)}`;

  const untilText = (span: Span) => {
    const time = clock(span.end);
    const sameDay = sameDate(toLocal(span.end, place.utcOffsetMin).date, date);
    return sameDay
      ? t('panchang.until', { time })
      : t('panchang.untilNext', { time, nextDay: t('datetime.nextDay', { ns: 'translation' }) });
  };

  const spanRow = (label: string, name: string, span: Span, flag: Severity | null, extra?: string) => (
    <View key={`${label}-${span.index}-${span.end.getTime()}`} style={styles.spanRow}>
      <AppText size={13} color={colors.muted} style={styles.spanLabel}>
        {label}
      </AppText>
      <View style={styles.flex}>
        <AppText bold color={flag === 'avoid' ? colors.bad : flag === 'caution' ? colors.ok : colors.text}>
          {name}
          {extra ? ` · ${extra}` : ''}
        </AppText>
        <AppText size={12} color={colors.muted}>
          {untilText(span)}
        </AppText>
      </View>
      {flag ? (
        <Chip
          label={t(flag === 'avoid' ? 'panchang.avoidFlag' : 'panchang.cautionFlag')}
          color={flag === 'avoid' ? colors.bad : colors.ok}
          style={styles.noMargin}
        />
      ) : null}
    </View>
  );

  const { tithi, nakshatra, yoga, karana } = day.panchang;

  const starsOf = (rashi: number) =>
    nakshatrasOfRashi(rashi)
      .map((s) => tr(NAKSHATRAS[s.nakshatra]) + (s.padas.length < 4 ? ` (${s.padas.join(',')})` : ''))
      .join(', ');

  const balance = day.lagna.length
    ? (day.lagna[0].end.getTime() - day.panchang.sunrise.getTime()) / 60_000 / 24
    : 0;
  const balanceNazhigai = Math.floor(balance);
  const balanceVinadi = Math.floor((balance - balanceNazhigai) * 60);

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
                <AppText bold color={s.id === 'karinaal' ? colors.bad : colors.primaryDark} style={styles.flex}>
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
        ✅ {t('good.calendarTitle')}
      </AppText>
      <Card style={styles.gap}>
        <AppText bold color={colors.primaryDark}>
          {t('good.nallaNeram')}
        </AppText>
        <View style={styles.row}>
          <AppText size={13} color={colors.muted} style={styles.spanLabel}>
            {t('good.morning')}
          </AppText>
          <AppText bold color={colors.good} style={styles.flex}>
            {day.calendarNallaNeram.morning ? range(day.calendarNallaNeram.morning) : '—'}
          </AppText>
        </View>
        <View style={styles.row}>
          <AppText size={13} color={colors.muted} style={styles.spanLabel}>
            {t('good.evening')}
          </AppText>
          <AppText bold color={colors.good} style={styles.flex}>
            {day.calendarNallaNeram.evening ? range(day.calendarNallaNeram.evening) : '—'}
          </AppText>
        </View>

        <View style={styles.divider} />

        <AppText bold color={colors.primaryDark}>
          {t('good.gowriNallaNeram')}
        </AppText>
        <View style={styles.row}>
          <AppText size={13} color={colors.muted} style={styles.spanLabel}>
            {t('good.morning')}
          </AppText>
          <AppText bold color={colors.good} style={styles.flex}>
            {day.gowriNallaNeram.morning ? range(day.gowriNallaNeram.morning) : '—'}
          </AppText>
        </View>
        <View style={styles.row}>
          <AppText size={13} color={colors.muted} style={styles.spanLabel}>
            {t('good.evening')}
          </AppText>
          <AppText bold color={colors.good} style={styles.flex}>
            {day.gowriNallaNeram.evening ? range(day.gowriNallaNeram.evening) : '—'}
          </AppText>
        </View>
      </Card>

      <Card style={styles.gap}>
        <AppText bold color={colors.primaryDark}>
          🪔 {t('good.muhurtham')}
        </AppText>
        {day.muhurthaWindows.length === 0 ? (
          <AppText size={13} color={colors.muted}>
            {t('good.muhurthamNone')}
          </AppText>
        ) : (
          day.muhurthaWindows.map((w) => {
            const mid = (w.start + w.end) / 2;
            const activeLagna = day.lagna.find((s) => s.end.getTime() >= mid);
            return (
              <View key={w.start} style={styles.row}>
                <AppText bold color={colors.good} style={styles.flex}>
                  {range(w)}
                </AppText>
                {activeLagna ? (
                  <AppText size={12} color={colors.muted}>
                    {tr(RASHIS[activeLagna.index])}
                  </AppText>
                ) : null}
              </View>
            );
          })
        )}
        <AppText size={12} color={colors.muted}>
          {t('good.muhurthamHint')}
        </AppText>
      </Card>

      <AppText bold size={17}>
        ✅ {t('good.title')} ({t('good.horaTitle')})
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
        {day.thiyajyam.map((w) => (
          <View key={w.start} style={styles.row}>
            <AppText bold style={styles.flex}>
              {t('avoid.thiyajyam')}
            </AppText>
            <AppText bold color={colors.bad}>
              {range(w)}
            </AppText>
          </View>
        ))}
        <View style={styles.row}>
          <AppText bold style={styles.flex}>
            {t('sulam.title')}
          </AppText>
          <AppText bold color={colors.bad}>
            {tr(DIRECTION_NAMES[day.sulam.direction])}
          </AppText>
        </View>
        <AppText size={12} color={colors.muted}>
          {t('sulam.remedy', { item: tr(PARIHARAM[day.sulam.remedy]) })}
        </AppText>
        <AppText size={12} color={colors.muted}>
          {t('avoid.kuligaiNote')}
        </AppText>
      </Card>

      <AppText bold size={17}>
        🌙 {t('chandrashtama.title')}
      </AppText>
      <Card style={styles.gap}>
        {day.moonRashi.map((s) => {
          const rashi = chandrashtamaRashi(s.index);
          const isMine = birthRashi === rashi;
          return (
            <View key={`${s.index}-${s.end.getTime()}`} style={styles.gap}>
              <View style={styles.row}>
                <AppText bold color={colors.bad} style={styles.flex}>
                  {t('chandrashtama.row', { rashi: tr(RASHIS[rashi]) })}
                </AppText>
                {isMine ? <Chip label={t('chandrashtama.yours')} color={colors.bad} style={styles.noMargin} /> : null}
              </View>
              <AppText size={12} color={colors.muted}>
                {starsOf(rashi)}
              </AppText>
              <AppText size={12} color={colors.muted}>
                {t('chandrashtama.moonIn', { rashi: tr(RASHIS[s.index]) })} · {untilText(s)}
              </AppText>
            </View>
          );
        })}
        <AppText size={12} color={colors.muted}>
          {t('chandrashtama.hint')}
        </AppText>
      </Card>

      <AppText bold size={17}>
        ♈ {t('lagna.title')}
      </AppText>
      <Card style={styles.gap}>
        <AppText size={13} color={colors.muted}>
          {t('lagna.balance', { rashi: day.lagna.length ? tr(RASHIS[day.lagna[0].index]) : '', n: balanceNazhigai, v: balanceVinadi })}
        </AppText>
        {day.lagna.map((s) => (
          <View key={`${s.index}-${s.end.getTime()}`} style={styles.row}>
            <AppText bold style={styles.flex}>
              {tr(RASHIS[s.index])}
            </AppText>
            <AppText size={13}>{untilText(s)}</AppText>
          </View>
        ))}
        <AppText size={12} color={colors.muted}>
          {t('lagna.hint')}
        </AppText>
      </Card>

      <AppText bold size={17}>
        📜 {t('panchang.title')}
      </AppText>
      <Card style={styles.gap}>
        {tithi.map((s) =>
          spanRow(t('panchang.tithi'), tr(tithiName(s.index)), s, tithiSeverity(s.index), t(`panchang.${pakshaOf(s.index)}`)),
        )}
        {nakshatra.map((s) => spanRow(t('panchang.nakshatra'), tr(NAKSHATRAS[s.index]), s, BAD_NAKSHATRAS.includes(s.index) ? 'avoid' : null))}
        {yoga.map((s) => spanRow(t('panchang.yoga'), tr(YOGAS[s.index]), s, isBadYoga(s.index) ? 'avoid' : null))}
        {karana.map((s) => spanRow(t('panchang.karana'), tr(karanaName(s.index)), s, isVishti(s.index) ? 'avoid' : null))}
        <View style={styles.row}>
          <AppText size={13} color={colors.muted} style={styles.spanLabel}>
            {t('panchang.nokku')}
          </AppText>
          <AppText bold style={styles.flex}>
            {tr(NOKKU_NAMES[nokkuNaal(nakshatra[0].index)])}
          </AppText>
        </View>
        {(() => {
          const dy = dayYoga(day.weekday, nakshatra[0].index);
          return (
            <View style={styles.row}>
              <AppText size={13} color={colors.muted} style={styles.spanLabel}>
                {t('panchang.dayYoga')}
              </AppText>
              <AppText bold color={dy === 'marana' ? colors.bad : colors.good} style={styles.flex}>
                {tr(DAY_YOGA_NAMES[dy])}
              </AppText>
              {dy === 'marana' ? (
                <Chip label={t('panchang.avoidFlag')} color={colors.bad} style={styles.noMargin} />
              ) : null}
            </View>
          );
        })()}
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
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 2 },
  noMargin: { marginRight: 0, marginBottom: 0 },
});
