import { GREGORIAN_MONTHS, NAKSHATRAS, RASHIS, SPECIAL_DAYS, TAMIL_MONTHS, WEEKDAYS, YOGAS, karanaName, tithiName } from '@core/astro/names';
import { tithiSeverity } from '@core/astro/inauspicious';
import type { Place } from '@core/astro/sunrise';
import { addDays, formatClock } from '@core/astro/time';
import PlacePicker from '@core/components/PlacePicker';
import { AppText, Button, Card, Chip, Segmented, Stepper } from '@core/components/ui';
import { useLang } from '@core/hooks/useLang';
import { useNow } from '@core/hooks/useNow';
import { usePlace } from '@core/hooks/usePlace';
import { useAppDispatch, useAppSelector } from '@core/store/hooks';
import { setBirthNakshatra, setBirthRashi } from '@core/store/profileSlice';
import { colors, spacing } from '@core/theme';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import DayTimes from '../../nalla-neram/components/DayTimes';
import { nallaNeramDay } from '../../nalla-neram/logic';
import { PURPOSES, PURPOSE_BY_ID, type PurposeId } from '../data/purposes';
import { judgeMonthDays, monthDays, type DayVerdict, type Grade, type MonthDay } from '../logic';

const GRADE_COLOR: Record<Grade, string> = {
  excellent: colors.good,
  good: colors.good,
  fair: colors.ok,
  poor: colors.bad,
};

type FilterMode = 'all' | 'good' | 'viratham';
type ViewMode = 'list' | 'calendar';

/** The Nalla Neram of one day, computed only when the day is opened. */
function DayDetail({ verdict, place, purposeName }: { verdict: DayVerdict; place: Place; purposeName: string }) {
  const { t } = useTranslation('nallaNaal');
  const { t: tn } = useTranslation('nallaNeram');
  const { tr } = useLang();
  const basis = useAppSelector((s) => s.profile.dayPartBasis) ?? 'sun';
  const day = useMemo(() => nallaNeramDay(verdict.date, place, basis), [verdict.date, place, basis]);

  const clock = (ms: number | Date) => formatClock(new Date(ms), place.utcOffsetMin);
  const range = (i: { start: number; end: number }) => `${clock(i.start)} – ${clock(i.end)}`;

  const shareVerdict = () => {
    const lines = [
      `📅 ${verdict.date.d} ${tr(GREGORIAN_MONTHS[verdict.date.m - 1])} ${verdict.date.y} (${tr(WEEKDAYS[verdict.weekday])})`,
      `🗓 ${tr(TAMIL_MONTHS[verdict.tamil.month])} ${verdict.tamil.day} · ${tr(place.name)}`,
      `✨ ${purposeName}: ${t(`grade.${verdict.grade}`)} (${verdict.score}/100)`,
      `📜 ${tr(tithiName(verdict.tithi))} · ${tr(NAKSHATRAS[verdict.nakshatra])}`,
      ...(verdict.specials.length > 0 ? [`🪔 ${verdict.specials.map((s) => tr(SPECIAL_DAYS[s.id])).join(', ')}`] : []),
      ...(day.muhurthaWindows.length > 0
        ? [`🪔 ${tn('good.muhurtham')}: ${day.muhurthaWindows.map(range).join(', ')}`]
        : []),
      `⛔ ${tn('avoid.rahu')}: ${range(day.rahu)}`,
    ];
    void Share.share({ message: lines.join('\n') });
  };

  return (
    <View style={styles.gap}>
      <Button
        title={`📤 ${t('common.share', { ns: 'translation' })}`}
        variant="outline"
        onPress={shareVerdict}
      />
      <AppText bold size={16} color={colors.primaryDark}>
        {t('details.timesTitle')}
      </AppText>
      <DayTimes day={day} date={verdict.date} place={place} />
    </View>
  );
}

export default function NallaNaalScreen() {
  const { t } = useTranslation('nallaNaal');
  const { tr } = useLang();
  const dispatch = useAppDispatch();
  const place = usePlace();
  const now = useNow(3_600_000);
  const { birthNakshatra, birthRashi } = useAppSelector((s) => s.profile);

  const todayLocal = useMemo(() => {
    const shifted = new Date(now.getTime() + place.utcOffsetMin * 60_000);
    return { y: shifted.getUTCFullYear(), m: shifted.getUTCMonth() + 1, d: shifted.getUTCDate() };
  }, [now, place.utcOffsetMin]);

  const [purposeId, setPurposeId] = useState<PurposeId>('marriage');
  const [cursor, setCursor] = useState<{ y: number; m: number } | null>(null);
  const [filter, setFilter] = useState<FilterMode>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [personalise, setPersonalise] = useState(false);

  const month = cursor ?? { y: todayLocal.y, m: todayLocal.m };
  const shiftMonth = (delta: number) => {
    const first = addDays({ y: month.y, m: month.m, d: 1 }, delta > 0 ? 32 : -1);
    setCursor({ y: first.y, m: first.m });
    setExpanded(null);
  };

  // The month's summary does not depend on the purpose, so it is computed once per
  // month and city and only the scoring is redone on a change.
  const monthKey = `${month.y}-${month.m}-${place.id}`;
  const [data, setData] = useState<{ key: string; days: MonthDay[] } | null>(null);
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      const days = monthDays(month.y, month.m, place);
      if (!cancelled) setData({ key: monthKey, days });
    }, 30);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthKey]);

  const verdicts = useMemo(
    () =>
      data && data.key === monthKey
        ? judgeMonthDays(data.days, PURPOSE_BY_ID[purposeId], { birthNakshatra, birthRashi })
        : null,
    [data, monthKey, purposeId, birthNakshatra, birthRashi],
  );

  const visible = useMemo(() => {
    if (verdicts === null) return [];
    if (filter === 'good') return verdicts.filter((v) => v.score >= 60);
    if (filter === 'viratham') return verdicts.filter((v) => v.specials.some((s) => s.id !== 'karinaal'));
    return verdicts;
  }, [verdicts, filter]);

  const selectedVerdict = useMemo(
    () => (verdicts && expanded !== null ? verdicts.find((v) => v.date.d === expanded) ?? null : null),
    [verdicts, expanded],
  );

  const purposeName = tr(PURPOSE_BY_ID[purposeId].name);

  const renderCard = (v: DayVerdict, forceOpen = false) => {
    const color = GRADE_COLOR[v.grade];
    const open = forceOpen || expanded === v.date.d;
    const isToday = v.date.y === todayLocal.y && v.date.m === todayLocal.m && v.date.d === todayLocal.d;
    return (
      <Pressable
        key={v.date.d}
        accessibilityRole="button"
        onPress={() => setExpanded(expanded === v.date.d && !forceOpen ? null : v.date.d)}
      >
        <Card style={[styles.gap, isToday && { borderColor: colors.primary, borderWidth: 2 }]}>
          <View style={styles.row}>
            <View style={styles.dateBox}>
              <AppText bold size={22} color={colors.primaryDark} center>
                {v.date.d}
              </AppText>
              <AppText size={11} color={colors.muted} center>
                {tr(WEEKDAYS[v.weekday])}
              </AppText>
            </View>
            <View style={styles.flex}>
              <AppText size={13} bold>
                {t('tamilShort', { month: tr(TAMIL_MONTHS[v.tamil.month]), day: v.tamil.day })}
              </AppText>
              <AppText size={12} color={colors.muted}>
                <AppText
                  size={12}
                  color={tithiSeverity(v.tithi) === 'avoid' ? colors.bad : tithiSeverity(v.tithi) === 'caution' ? colors.ok : colors.muted}
                  bold={tithiSeverity(v.tithi) !== null}
                >
                  {tr(tithiName(v.tithi))}
                </AppText>
                {' · '}
                {tr(NAKSHATRAS[v.nakshatra])}
              </AppText>
            </View>
            <View style={styles.badge}>
              <Chip label={t(`grade.${v.grade}`)} color={color} style={styles.noMargin} />
              <AppText size={12} color={color} bold>
                {v.score}
              </AppText>
            </View>
          </View>
          {v.specials.length > 0 ? (
            <View style={styles.wrap}>
              {v.specials.map((s) => (
                <Chip
                  key={s.id}
                  label={`${s.id === 'karinaal' ? '⚠️' : '🪔'} ${tr(SPECIAL_DAYS[s.id])}`}
                  color={s.id === 'karinaal' ? colors.bad : colors.primary}
                />
              ))}
            </View>
          ) : null}
          {open ? (
            <View style={styles.gap}>
              <View style={styles.wrap}>
                {v.reasons.length === 0 ? (
                  <AppText size={13} color={colors.muted}>
                    {t('details.noReasons')}
                  </AppText>
                ) : (
                  v.reasons.map((r) => (
                    <Chip
                      key={r.code}
                      label={t(`reason.${r.code}`, { name: r.name ? tr(r.name) : '' })}
                      color={r.good ? colors.good : colors.bad}
                    />
                  ))
                )}
              </View>
              <AppText size={12} color={colors.muted}>
                {t('details.yoga')}: {tr(YOGAS[v.yoga])} · {t('details.karana')}: {tr(karanaName(v.karana))}
              </AppText>
              <DayDetail verdict={v} place={place} purposeName={purposeName} />
            </View>
          ) : (
            <AppText size={11} color={colors.muted}>
              {t('details.tapHint')}
            </AppText>
          )}
        </Card>
      </Pressable>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <PlacePicker />

      <AppText bold>{t('purpose')}</AppText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {PURPOSES.map((p) => {
          const active = p.id === purposeId;
          return (
            <Pressable
              key={p.id}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => {
                setPurposeId(p.id);
                setExpanded(null);
              }}
              style={[styles.purpose, active && styles.purposeActive]}
            >
              <AppText size={13} bold={active} color={active ? '#fff' : colors.primary}>
                {p.icon} {tr(p.name)}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>

      <Stepper
        label={`${tr(GREGORIAN_MONTHS[month.m - 1])} ${month.y}`}
        onPrev={() => shiftMonth(-1)}
        onNext={() => shiftMonth(1)}
        onReset={month.y === todayLocal.y && month.m === todayLocal.m ? undefined : () => { setCursor(null); setExpanded(null); }}
        resetLabel={t('goCurrentMonth')}
      />

      <Segmented<ViewMode>
        value={viewMode}
        onChange={setViewMode}
        options={[
          { value: 'list', label: `📋 ${t('viewList')}` },
          { value: 'calendar', label: `📅 ${t('viewCalendar')}` },
        ]}
      />

      <Segmented<FilterMode>
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'all', label: t('filterAll') },
          { value: 'good', label: t('filterGood') },
          { value: 'viratham', label: t('filterViratham') },
        ]}
      />

      <Card style={styles.gap}>
        <View style={styles.row}>
          <AppText bold style={styles.flex}>
            {t('profile.title')}
          </AppText>
          <Button
            title={personalise ? t('profile.hide') : t('profile.show')}
            variant="outline"
            onPress={() => setPersonalise((v) => !v)}
          />
        </View>
        <AppText size={12} color={colors.muted}>
          {t('profile.hint')}
        </AppText>
        {personalise ? (
          <>
            <AppText bold size={14}>
              {t('profile.nakshatra')}
            </AppText>
            <View style={styles.wrap}>
              {NAKSHATRAS.map((n, i) => (
                <Pressable
                  key={i}
                  accessibilityRole="button"
                  accessibilityState={{ selected: birthNakshatra === i }}
                  onPress={() => dispatch(setBirthNakshatra(birthNakshatra === i ? null : i))}
                >
                  <Chip
                    label={tr(n)}
                    color={birthNakshatra === i ? colors.primary : colors.neutral}
                    style={birthNakshatra === i ? styles.chipOn : undefined}
                    textStyle={birthNakshatra === i ? styles.chipOnText : undefined}
                  />
                </Pressable>
              ))}
            </View>
            <AppText bold size={14}>
              {t('profile.rashi')}
            </AppText>
            <View style={styles.wrap}>
              {RASHIS.map((r, i) => (
                <Pressable
                  key={i}
                  accessibilityRole="button"
                  accessibilityState={{ selected: birthRashi === i }}
                  onPress={() => dispatch(setBirthRashi(birthRashi === i ? null : i))}
                >
                  <Chip
                    label={tr(r)}
                    color={birthRashi === i ? colors.primary : colors.neutral}
                    style={birthRashi === i ? styles.chipOn : undefined}
                    textStyle={birthRashi === i ? styles.chipOnText : undefined}
                  />
                </Pressable>
              ))}
            </View>
            {birthNakshatra !== null || birthRashi !== null ? (
              <Button
                title={t('profile.clear')}
                variant="outline"
                onPress={() => {
                  dispatch(setBirthNakshatra(null));
                  dispatch(setBirthRashi(null));
                }}
              />
            ) : null}
          </>
        ) : null}
      </Card>

      {verdicts === null ? (
        <ActivityIndicator color={colors.primary} size="large" />
      ) : viewMode === 'calendar' ? (
        <>
          <Card style={styles.gap}>
            <View style={styles.calRow}>
              {WEEKDAYS.map((w, idx) => (
                <View key={idx} style={styles.calCell}>
                  <AppText size={11} bold color={colors.muted} center>
                    {tr(w).slice(0, 3)}
                  </AppText>
                </View>
              ))}
            </View>
            <View style={styles.calGrid}>
              {Array.from({ length: verdicts[0].weekday }, (_, i) => (
                <View key={`empty-${i}`} style={styles.calCell} />
              ))}
              {verdicts.map((v) => {
                const matched =
                  filter === 'all' ||
                  (filter === 'good' && v.score >= 60) ||
                  (filter === 'viratham' && v.specials.some((s) => s.id !== 'karinaal'));
                const gradeColor = GRADE_COLOR[v.grade];
                const selected = expanded === v.date.d;
                const isToday = v.date.y === todayLocal.y && v.date.m === todayLocal.m && v.date.d === todayLocal.d;
                const hasSpecial = v.specials.some((s) => s.id !== 'karinaal');
                return (
                  <Pressable
                    key={v.date.d}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => setExpanded(v.date.d)}
                    style={[
                      styles.calCell,
                      styles.calDay,
                      matched && { backgroundColor: gradeColor + '22', borderColor: gradeColor },
                      !matched && styles.calDim,
                      isToday && { borderWidth: 2, borderColor: colors.primary },
                      selected && { backgroundColor: colors.primary, borderColor: colors.primary },
                    ]}
                  >
                    <AppText size={13} bold color={selected ? '#fff' : colors.text} center>
                      {v.date.d}
                    </AppText>
                    <AppText size={9} color={selected ? '#fff' : colors.muted} center>
                      {hasSpecial ? '🪔' : `${v.tamil.day}`}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </Card>
          {selectedVerdict ? renderCard(selectedVerdict, true) : null}
        </>
      ) : visible.length === 0 ? (
        <AppText color={colors.muted} center>
          {filter === 'viratham' ? t('noVirathamDays') : t('noGoodDays')}
        </AppText>
      ) : (
        visible.map((v) => renderCard(v))
      )}

      <AppText size={12} color={colors.muted}>
        {t('note')}
      </AppText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, gap: spacing.md, backgroundColor: colors.bg },
  chips: { gap: spacing.sm, paddingVertical: 2 },
  purpose: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.card,
  },
  purposeActive: { backgroundColor: colors.primary },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  flex: { flex: 1 },
  gap: { gap: spacing.sm },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  dateBox: { width: 52, alignItems: 'center' },
  badge: { alignItems: 'flex-end' },
  noMargin: { marginRight: 0, marginBottom: 2 },
  chipOn: { backgroundColor: colors.primary },
  chipOnText: { color: '#fff' },
  calRow: { flexDirection: 'row' },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCell: { width: '14.285%', padding: 2 },
  calDay: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 4,
    alignItems: 'center',
  },
  calDim: { opacity: 0.3 },
});
