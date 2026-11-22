import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GREGORIAN_MONTHS, NAKSHATRAS, RASHIS, SPECIAL_DAYS, TAMIL_MONTHS, WEEKDAYS, YOGAS, karanaName, tithiName } from '@core/astro/names';
import { tithiSeverity } from '@core/astro/inauspicious';
import type { Place } from '@core/astro/sunrise';
import { addDays, formatClock } from '@core/astro/time';
import ObservanceIcon, { OBSERVANCE_COLOR, primaryObservance } from '@core/components/ObservanceIcon';
import PlacePicker from '@core/components/PlacePicker';
import { AppText, Button, Card, Chip, Segmented, Stepper, useBottomInset } from '@core/components/ui';
import { useLang } from '@core/hooks/useLang';
import { useNow } from '@core/hooks/useNow';
import { usePlace } from '@core/hooks/usePlace';
import { useAppDispatch, useAppSelector } from '@core/store/hooks';
import { setBirthNakshatra, setBirthRashi } from '@core/store/profileSlice';
import { colors, spacing } from '@core/theme';
import { hapticTap } from '@core/utils/haptics';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
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
        title={t('common.share', { ns: 'translation' })}
        icon="share-variant-outline"
        variant="outline"
        onPress={shareVerdict}
      />
      <AppText bold size={16} color={colors.primaryDark}>
        {t('details.timesTitle')}
      </AppText>
      <DayTimes day={day} date={verdict.date} place={place} compact />
    </View>
  );
}

export default function NallaNaalScreen() {
  const { t } = useTranslation('nallaNaal');
  const { tr } = useLang();
  const dispatch = useAppDispatch();
  const place = usePlace();
  const now = useNow(3_600_000);
  const bottomInset = useBottomInset();
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
  const profileSummary = [
    birthNakshatra !== null ? tr(NAKSHATRAS[birthNakshatra]) : null,
    birthRashi !== null ? tr(RASHIS[birthRashi]) : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const renderCard = (v: DayVerdict, forceOpen = false) => {
    const color = GRADE_COLOR[v.grade];
    const open = forceOpen || expanded === v.date.d;
    const isToday = v.date.y === todayLocal.y && v.date.m === todayLocal.m && v.date.d === todayLocal.d;
    return (
      <Animated.View key={v.date.d} layout={LinearTransition.springify().damping(18)}>
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          hapticTap();
          setExpanded(expanded === v.date.d && !forceOpen ? null : v.date.d);
        }}
        style={({ pressed }) => pressed && !open && { opacity: 0.88 }}
      >
        <Card style={[styles.gap, isToday && { borderColor: colors.primary, borderWidth: 2 }]}>
          <View style={styles.row}>
            <View style={[styles.dateBox, { backgroundColor: color + '14' }]}>
              <AppText bold size={21} color={colors.primaryDark} center>
                {v.date.d}
              </AppText>
              <AppText size={10} bold color={colors.muted} center numberOfLines={1}>
                {tr(WEEKDAYS[v.weekday])}
              </AppText>
            </View>
            <View style={styles.flex}>
              <AppText size={14} bold color={colors.primaryDark}>
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
              {v.specials.map((s) => {
                const c = OBSERVANCE_COLOR[s.id];
                return (
                  <View key={s.id} style={[styles.obsChip, { backgroundColor: c + '16', borderColor: c + '66' }]}>
                    <ObservanceIcon id={s.id} size={14} />
                    <AppText size={12} bold color={c}>
                      {tr(SPECIAL_DAYS[s.id])}
                    </AppText>
                  </View>
                );
              })}
            </View>
          ) : null}
          {open ? (
            <Animated.View entering={FadeInDown.duration(220)} style={styles.gap}>
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
            </Animated.View>
          ) : (
            <View style={styles.tapRow}>
              <AppText size={11} color={colors.muted}>
                {t('details.tapHint')}
              </AppText>
              <MaterialCommunityIcons name="chevron-down" size={16} color={colors.muted} />
            </View>
          )}
        </Card>
      </Pressable>
      </Animated.View>
    );
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingBottom: bottomInset }]}>
      <View style={styles.topBar}>
        <PlacePicker />
        <View style={styles.viewToggle}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: viewMode === 'list' }}
            onPress={() => setViewMode('list')}
            style={[styles.viewBtn, viewMode === 'list' && styles.viewBtnActive]}
          >
            <MaterialCommunityIcons
              name="format-list-bulleted"
              size={16}
              color={viewMode === 'list' ? '#fff' : colors.primaryDark}
            />
            <AppText size={12} bold={viewMode === 'list'} color={viewMode === 'list' ? '#fff' : colors.primaryDark}>
              {t('viewList')}
            </AppText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: viewMode === 'calendar' }}
            onPress={() => setViewMode('calendar')}
            style={[styles.viewBtn, viewMode === 'calendar' && styles.viewBtnActive]}
          >
            <MaterialCommunityIcons
              name="calendar-month-outline"
              size={16}
              color={viewMode === 'calendar' ? '#fff' : colors.primaryDark}
            />
            <AppText size={12} bold={viewMode === 'calendar'} color={viewMode === 'calendar' ? '#fff' : colors.primaryDark}>
              {t('viewCalendar')}
            </AppText>
          </Pressable>
        </View>
      </View>

      <View style={styles.gapXs}>
        <AppText bold size={13} color={colors.muted}>
          {t('purpose')}
        </AppText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {PURPOSES.map((p) => {
            const active = p.id === purposeId;
            return (
              <Pressable
                key={p.id}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => {
                  hapticTap();
                  setPurposeId(p.id);
                  setExpanded(null);
                }}
                style={({ pressed }) => [styles.purpose, active && styles.purposeActive, pressed && { opacity: 0.8 }]}
              >
                <MaterialCommunityIcons name={p.icon} size={15} color={active ? '#fff' : colors.primary} />
                <AppText size={13} bold={active} color={active ? '#fff' : colors.primaryDark}>
                  {tr(p.name)}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <Stepper
        label={`${tr(GREGORIAN_MONTHS[month.m - 1])} ${month.y}`}
        onPrev={() => shiftMonth(-1)}
        onNext={() => shiftMonth(1)}
        onReset={month.y === todayLocal.y && month.m === todayLocal.m ? undefined : () => { setCursor(null); setExpanded(null); }}
        resetLabel={t('goCurrentMonth')}
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

      <Card style={styles.profileCard}>
        <Pressable
          accessibilityRole="button"
          onPress={() => setPersonalise((v) => !v)}
          style={styles.row}
        >
          <MaterialCommunityIcons name="star-four-points-outline" size={18} color={colors.primary} />
          <AppText bold size={13} color={colors.primaryDark} style={styles.flex} numberOfLines={1}>
            {profileSummary ? profileSummary : t('profile.title')}
          </AppText>
          <AppText size={12} bold color={colors.primary}>
            {personalise ? t('profile.hide') : t('profile.show')}
          </AppText>
          <MaterialCommunityIcons
            name={personalise ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colors.primary}
          />
        </Pressable>
        {personalise ? (
          <View style={styles.gap}>
            <AppText size={12} color={colors.muted}>
              {t('profile.hint')}
            </AppText>
            <AppText bold size={13}>
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
            <AppText bold size={13}>
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
          </View>
        ) : null}
      </Card>

      {verdicts === null ? (
        <ActivityIndicator color={colors.primary} size="large" />
      ) : viewMode === 'calendar' ? (
        <>
          <Card style={styles.gap}>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: colors.good }]} />
                <AppText size={11} color={colors.muted}>{t('grade.good')}</AppText>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: colors.ok }]} />
                <AppText size={11} color={colors.muted}>{t('grade.fair')}</AppText>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: colors.bad }]} />
                <AppText size={11} color={colors.muted}>{t('grade.poor')}</AppText>
              </View>
            </View>
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
                const obs = primaryObservance(v.specials);
                return (
                  <Pressable
                    key={v.date.d}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => {
                      hapticTap();
                      setExpanded(v.date.d);
                    }}
                    style={[
                      styles.calCell,
                      styles.calDay,
                      matched && { backgroundColor: gradeColor + '1A', borderColor: gradeColor + '88' },
                      !matched && styles.calDim,
                      isToday && { borderWidth: 2, borderColor: colors.primary },
                      selected && { backgroundColor: colors.primary, borderColor: colors.primary },
                    ]}
                  >
                    <AppText size={13} bold color={selected ? '#fff' : colors.text} center>
                      {v.date.d}
                    </AppText>
                    <View style={styles.calSub}>
                      {obs ? (
                        <ObservanceIcon id={obs} size={14} onDark={selected} />
                      ) : (
                        <AppText size={9} color={selected ? '#fff' : colors.muted} center>
                          {v.tamil.day}
                        </AppText>
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.obsLegend}>
              {(
                [
                  { id: 'pradosham', label: SPECIAL_DAYS.pradosham },
                  { id: 'ekadashi', label: SPECIAL_DAYS.ekadashi },
                  { id: 'vinayakaChaturthi', label: { ta: 'சதுர்த்தி', en: 'Chaturthi' } },
                  { id: 'shashti', label: SPECIAL_DAYS.shashti },
                  { id: 'pournami', label: SPECIAL_DAYS.pournami },
                  { id: 'amavasai', label: SPECIAL_DAYS.amavasai },
                ] as const
              ).map((item) => (
                <View key={item.id} style={styles.legendItem}>
                  <ObservanceIcon id={item.id} size={13} />
                  <AppText size={10} color={colors.muted}>
                    {tr(item.label)}
                  </AppText>
                </View>
              ))}
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
  container: { padding: spacing.md, gap: spacing.sm + 4, backgroundColor: colors.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.sm },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 2,
    gap: 2,
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  viewBtnActive: { backgroundColor: colors.primary },
  chips: { gap: spacing.sm, paddingVertical: 2 },
  purpose: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 13,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  purposeActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  tapRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  flex: { flex: 1 },
  gap: { gap: spacing.sm },
  gapXs: { gap: 4 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  profileCard: { paddingVertical: 11, gap: spacing.sm },
  dateBox: { width: 54, paddingVertical: 4, borderRadius: 12, alignItems: 'center' },
  badge: { alignItems: 'flex-end' },
  noMargin: { marginRight: 0, marginBottom: 2 },
  chipOn: { backgroundColor: colors.primary },
  chipOnText: { color: '#fff' },
  legendRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 8, height: 8, borderRadius: 4 },
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
  calSub: { height: 15, alignItems: 'center', justifyContent: 'center' },
  calDim: { opacity: 0.28 },
  obsChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 2,
    marginRight: 6,
    marginBottom: 6,
  },
  obsLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
