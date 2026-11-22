import { MaterialCommunityIcons } from '@expo/vector-icons';
import { chandrashtamaRashi, DAY_YOGA_NAMES, dayYoga, DIRECTION_NAMES, nakshatrasOfRashi, NOKKU_NAMES, nokkuNaal, PARIHARAM } from '@core/astro/dayExtras';
import { BAD_NAKSHATRAS, isBadYoga, tithiSeverity, type Severity } from '@core/astro/inauspicious';
import { karanaName, NAKSHATRAS, PLANETS, RASHIS, SPECIAL_DAYS, tithiName, YOGAS } from '@core/astro/names';
import { isVishti, pakshaOf, type Span } from '@core/astro/panchang';
import type { Place } from '@core/astro/sunrise';
import { formatClock, sameDate, toLocal, type CivilDate } from '@core/astro/time';
import ObservanceIcon, { OBSERVANCE_COLOR } from '@core/components/ObservanceIcon';
import { AppText, Card, Chip, SectionHeader } from '@core/components/ui';
import { useLang } from '@core/hooks/useLang';
import { useAppSelector } from '@core/store/hooks';
import { colors, spacing } from '@core/theme';
import { hapticTap } from '@core/utils/haptics';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { NallaNeramDay } from '../logic';

type Props = {
  day: NallaNeramDay;
  date: CivilDate;
  place: Place;
  /** When true (e.g. inside Nalla Naal expanded cards), secondary sections start collapsed. */
  compact?: boolean;
};

/**
 * Compact Tamil daily calendar sheet + detailed panchangam of one day.
 * Used by Nalla Neram and inside each expanded day of Nalla Naal.
 */
export default function DayTimes({ day, date, place, compact = false }: Props) {
  const { t } = useTranslation('nallaNeram');
  const { tr } = useLang();
  const birthRashi = useAppSelector((s) => s.profile.birthRashi);
  const [showAllLagna, setShowAllLagna] = useState(false);
  const [openChandra, setOpenChandra] = useState(!compact);
  const [openLagna, setOpenLagna] = useState(!compact);
  const [openPanchang, setOpenPanchang] = useState(!compact);

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
      <AppText size={12} color={colors.muted} style={styles.spanLabel}>
        {label}
      </AppText>
      <View style={styles.flex}>
        <AppText bold size={14} color={flag === 'avoid' ? colors.bad : flag === 'caution' ? colors.ok : colors.text}>
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
  const dy = dayYoga(day.weekday, nakshatra[0].index);

  return (
    <View style={styles.stack}>
      {day.specials.length > 0 ? (
        <>
          <SectionHeader icon="candle" title={t('special.title')} color={colors.primary} bg={colors.primaryBg} />
          <Card variant="tinted" style={styles.gap}>
            {day.specials.map((s) => (
              <View key={s.id} style={styles.row}>
                <ObservanceIcon id={s.id} size={20} />
                <AppText bold size={14} color={OBSERVANCE_COLOR[s.id]} style={styles.flex}>
                  {tr(SPECIAL_DAYS[s.id])}
                </AppText>
                {s.window ? <AppText size={12} color={colors.muted}>{range(s.window)}</AppText> : null}
              </View>
            ))}
            <AppText size={12} color={colors.muted}>
              {t('special.note')}
            </AppText>
          </Card>
        </>
      ) : null}

      <SectionHeader icon="clock-check-outline" title={t('good.calendarTitle')} color={colors.good} bg={colors.goodBg} />
      <Card style={styles.sheetCard}>
        <View style={styles.twoCol}>
          <View style={styles.colBox}>
            <View style={styles.colHeadGood}>
              <AppText bold size={13} color={colors.good} center>
                {t('good.nallaNeram')}
              </AppText>
            </View>
            <View style={styles.colBody}>
              <AppText size={11} color={colors.muted}>{t('good.morning')}</AppText>
              <AppText bold size={13} color={colors.good}>
                {day.calendarNallaNeram.morning ? range(day.calendarNallaNeram.morning) : '—'}
              </AppText>
              <AppText size={11} color={colors.muted} style={styles.mtXs}>{t('good.evening')}</AppText>
              <AppText bold size={13} color={colors.good}>
                {day.calendarNallaNeram.evening ? range(day.calendarNallaNeram.evening) : '—'}
              </AppText>
            </View>
          </View>
          <View style={styles.colDivider} />
          <View style={styles.colBox}>
            <View style={styles.colHeadGood}>
              <AppText bold size={13} color={colors.good} center>
                {t('good.gowriNallaNeram')}
              </AppText>
            </View>
            <View style={styles.colBody}>
              <AppText size={11} color={colors.muted}>{t('good.morning')}</AppText>
              <AppText bold size={13} color={colors.good}>
                {day.gowriNallaNeram.morning ? range(day.gowriNallaNeram.morning) : '—'}
              </AppText>
              <AppText size={11} color={colors.muted} style={styles.mtXs}>{t('good.evening')}</AppText>
              <AppText bold size={13} color={colors.good}>
                {day.gowriNallaNeram.evening ? range(day.gowriNallaNeram.evening) : '—'}
              </AppText>
            </View>
          </View>
        </View>
      </Card>

      <SectionHeader icon="alert-octagon-outline" title={t('avoid.title')} color={colors.bad} bg={colors.badBg} />
      <View style={styles.avoidStrip}>
        {(['rahu', 'yama', 'kuligai'] as const).map((k) => (
          <View key={k} style={styles.avoidPill}>
            <AppText size={11} bold color={colors.primaryDark} center numberOfLines={1}>
              {t(`avoid.${k}`)}
            </AppText>
            <AppText bold size={12} color={colors.bad} center>
              {clock(day[k].start)}
            </AppText>
            <AppText size={11} color={colors.bad} center>
              {clock(day[k].end)}
            </AppText>
          </View>
        ))}
      </View>

      <Card style={styles.gap}>
        {day.thiyajyam.map((w) => (
          <View key={w.start} style={styles.row}>
            <AppText bold size={14} style={styles.flex}>
              {t('avoid.thiyajyam')}
            </AppText>
            <AppText bold size={13} color={colors.bad}>
              {range(w)}
            </AppText>
          </View>
        ))}
        <View style={styles.row}>
          <AppText bold size={14} style={styles.flex}>
            {t('sulam.title')}
          </AppText>
          <Chip label={tr(DIRECTION_NAMES[day.sulam.direction])} color={colors.bad} style={styles.noMargin} />
        </View>
        <AppText size={12} color={colors.muted}>
          {t('sulam.remedy', { item: tr(PARIHARAM[day.sulam.remedy]) })}
        </AppText>
        <AppText size={12} color={colors.muted}>
          {t('avoid.kuligaiNote')}
        </AppText>
      </Card>

      <Card style={styles.gap}>
        <View style={styles.row}>
          <MaterialCommunityIcons name="lamp" size={18} color={colors.primary} />
          <AppText bold size={15} color={colors.primaryDark} style={styles.flex}>
            {t('good.muhurtham')}
          </AppText>
        </View>
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
                <AppText bold size={14} color={colors.good} style={styles.flex}>
                  {range(w)}
                </AppText>
                {activeLagna ? (
                  <Chip label={tr(RASHIS[activeLagna.index])} color={colors.primary} style={styles.noMargin} />
                ) : null}
              </View>
            );
          })
        )}
        <AppText size={12} color={colors.muted}>
          {t('good.muhurthamHint')}
        </AppText>
        <View style={styles.divider} />
        <View style={styles.row}>
          <MaterialCommunityIcons name="weather-sunset-up" size={18} color={colors.primary} />
          <AppText bold size={14} style={styles.flex}>
            {t('good.brahmaMuhurtham')}
          </AppText>
          <AppText bold size={13} color={colors.good}>
            {range(day.brahmaMuhurtham)}
          </AppText>
        </View>
        <AppText size={12} color={colors.muted}>
          {t('good.brahmaMuhurthamNote')}
        </AppText>
        <View style={styles.divider} />
        <View style={styles.row}>
          <MaterialCommunityIcons name="star-outline" size={18} color={colors.ok} />
          <AppText bold size={14} style={styles.flex}>
            {t('good.abhijit')}
          </AppText>
          {day.abhijit ? (
            <AppText bold size={13} color={colors.good}>
              {range(day.abhijit)}
            </AppText>
          ) : null}
        </View>
        <AppText size={12} color={colors.muted}>
          {day.abhijit ? t('good.abhijitNote') : t('good.wednesdayNote')}
        </AppText>
      </Card>

      <SectionHeader
        icon="white-balance-sunny"
        title={`${t('good.title')} (${t('good.horaTitle')})`}
        color={colors.good}
        bg={colors.goodBg}
      />
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
                <AppText bold size={14} color={colors.good} style={styles.flex}>
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

      <SectionHeader
        icon="moon-waning-crescent"
        title={t('chandrashtama.title')}
        color={colors.bad}
        bg={colors.badBg}
        right={
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              hapticTap();
              setOpenChandra((v) => !v);
            }}
            style={({ pressed }) => [styles.togglePill, pressed && { opacity: 0.7 }]}
          >
            <AppText size={12} bold color={colors.primary}>
              {openChandra ? t('section.hide') : t('section.show')}
            </AppText>
          </Pressable>
        }
      />
      {openChandra ? (
        <Card style={styles.gap}>
          {day.moonRashi.map((s) => {
            const rashi = chandrashtamaRashi(s.index);
            const isMine = birthRashi === rashi;
            return (
              <View key={`${s.index}-${s.end.getTime()}`} style={[styles.gapXs, isMine && styles.mineBox]}>
                <View style={styles.row}>
                  <AppText bold size={14} color={colors.bad} style={styles.flex}>
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
      ) : (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            hapticTap();
            setOpenChandra(true);
          }}
        >
          <Card style={styles.compactSummary}>
            <AppText size={13} bold color={colors.bad} style={styles.flex} numberOfLines={1}>
              {day.moonRashi.map((s) => tr(RASHIS[chandrashtamaRashi(s.index)])).join(' · ')}
            </AppText>
            <MaterialCommunityIcons name="chevron-down" size={18} color={colors.muted} />
          </Card>
        </Pressable>
      )}

      <SectionHeader
        icon="zodiac-aries"
        title={t('lagna.title')}
        color={colors.primary}
        bg={colors.primaryBg}
        right={
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              hapticTap();
              if (!openLagna) {
                setOpenLagna(true);
              } else {
                setShowAllLagna((v) => !v);
              }
            }}
            style={({ pressed }) => [styles.togglePill, pressed && { opacity: 0.7 }]}
          >
            <AppText size={12} bold color={colors.primary}>
              {!openLagna ? t('section.show') : showAllLagna ? t('hora.hide') : t('hora.show')}
            </AppText>
          </Pressable>
        }
      />
      {openLagna ? (
        <Card style={styles.gap}>
          <AppText size={13} bold color={colors.primaryDark}>
            {t('lagna.balance', { rashi: day.lagna.length ? tr(RASHIS[day.lagna[0].index]) : '', n: balanceNazhigai, v: balanceVinadi })}
          </AppText>
          {(showAllLagna ? day.lagna : day.lagna.slice(0, 3)).map((s) => (
            <View key={`${s.index}-${s.end.getTime()}`} style={styles.row}>
              <AppText bold size={14} style={styles.flex}>
                {tr(RASHIS[s.index])}
              </AppText>
              <AppText size={13} color={colors.muted}>{untilText(s)}</AppText>
            </View>
          ))}
          <AppText size={12} color={colors.muted}>
            {t('lagna.hint')}
          </AppText>
        </Card>
      ) : (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            hapticTap();
            setOpenLagna(true);
          }}
        >
          <Card style={styles.compactSummary}>
            <AppText size={13} bold color={colors.primaryDark} style={styles.flex} numberOfLines={1}>
              {day.lagna.length ? `${tr(RASHIS[day.lagna[0].index])} · ${untilText(day.lagna[0])}` : '—'}
            </AppText>
            <MaterialCommunityIcons name="chevron-down" size={18} color={colors.muted} />
          </Card>
        </Pressable>
      )}

      <SectionHeader
        icon="script-text-outline"
        title={t('panchang.title')}
        color={colors.primaryDark}
        bg={colors.surface}
        right={
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              hapticTap();
              setOpenPanchang((v) => !v);
            }}
            style={({ pressed }) => [styles.togglePill, pressed && { opacity: 0.7 }]}
          >
            <AppText size={12} bold color={colors.primary}>
              {openPanchang ? t('section.hide') : t('section.show')}
            </AppText>
          </Pressable>
        }
      />
      {openPanchang ? (
        <Card style={styles.gap}>
          {tithi.map((s) =>
            spanRow(t('panchang.tithi'), tr(tithiName(s.index)), s, tithiSeverity(s.index), t(`panchang.${pakshaOf(s.index)}`)),
          )}
          <View style={styles.divider} />
          {nakshatra.map((s) => spanRow(t('panchang.nakshatra'), tr(NAKSHATRAS[s.index]), s, BAD_NAKSHATRAS.includes(s.index) ? 'avoid' : null))}
          <View style={styles.divider} />
          {yoga.map((s) => spanRow(t('panchang.yoga'), tr(YOGAS[s.index]), s, isBadYoga(s.index) ? 'avoid' : null))}
          <View style={styles.divider} />
          {karana.map((s) => spanRow(t('panchang.karana'), tr(karanaName(s.index)), s, isVishti(s.index) ? 'avoid' : null))}
          <View style={styles.divider} />
          <View style={styles.row}>
            <AppText size={12} color={colors.muted} style={styles.spanLabel}>
              {t('panchang.nokku')}
            </AppText>
            <AppText bold size={14} style={styles.flex}>
              {tr(NOKKU_NAMES[nokkuNaal(nakshatra[0].index)])}
            </AppText>
          </View>
          <View style={styles.row}>
            <AppText size={12} color={colors.muted} style={styles.spanLabel}>
              {t('panchang.dayYoga')}
            </AppText>
            <AppText bold size={14} color={dy === 'marana' ? colors.bad : colors.good} style={styles.flex}>
              {tr(DAY_YOGA_NAMES[dy])}
            </AppText>
            {dy === 'marana' ? (
              <Chip label={t('panchang.avoidFlag')} color={colors.bad} style={styles.noMargin} />
            ) : null}
          </View>
          <AppText size={12} color={colors.muted}>
            {t('panchang.flagNote')}
          </AppText>
        </Card>
      ) : (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            hapticTap();
            setOpenPanchang(true);
          }}
        >
          <Card style={styles.compactSummary}>
            <AppText size={13} color={colors.text} style={styles.flex} numberOfLines={1}>
              {tr(tithiName(tithi[0].index))} · {tr(NAKSHATRAS[nakshatra[0].index])} · {tr(DAY_YOGA_NAMES[dy])}
            </AppText>
            <MaterialCommunityIcons name="chevron-down" size={18} color={colors.muted} />
          </Card>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.md },
  gap: { gap: spacing.sm },
  gapXs: { gap: 4 },
  flex: { flex: 1 },
  mtXs: { marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  spanRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  spanLabel: { width: 78 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 2 },
  noMargin: { marginRight: 0, marginBottom: 0 },
  sheetCard: { padding: 0, overflow: 'hidden' },
  twoCol: { flexDirection: 'row' },
  colBox: { flex: 1 },
  colHeadGood: { backgroundColor: colors.goodBg, paddingVertical: 8, paddingHorizontal: spacing.sm },
  colBody: { padding: 12 },
  colDivider: { width: 1, backgroundColor: colors.border },
  avoidStrip: { flexDirection: 'row', gap: spacing.sm },
  avoidPill: {
    flex: 1,
    backgroundColor: colors.badBg,
    borderWidth: 1,
    borderColor: '#F2C6C6',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    gap: 2,
  },
  mineBox: {
    backgroundColor: colors.badBg,
    borderRadius: 10,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: '#F2C6C6',
  },
  togglePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.primaryBg,
  },
  compactSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 10,
  },
});
