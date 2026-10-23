import { GREGORIAN_MONTHS, NAKSHATRAS, RASHIS, SPECIAL_DAYS, TAMIL_MONTHS, WEEKDAYS, YOGAS, karanaName, tithiName } from '@core/astro/names';
import { isAvoidedTithi } from '@core/astro/inauspicious';
import type { Place } from '@core/astro/sunrise';
import { addDays } from '@core/astro/time';
import PlacePicker from '@core/components/PlacePicker';
import { AppText, Button, Card, Chip, Stepper } from '@core/components/ui';
import { useLang } from '@core/hooks/useLang';
import { useNow } from '@core/hooks/useNow';
import { usePlace } from '@core/hooks/usePlace';
import { useAppDispatch, useAppSelector } from '@core/store/hooks';
import { setBirthNakshatra, setBirthRashi } from '@core/store/profileSlice';
import { colors, spacing } from '@core/theme';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import DayTimes from '../../nalla-neram/components/DayTimes';
import { nallaNeramDay } from '../../nalla-neram/logic';
import { PURPOSES, PURPOSE_BY_ID, type PurposeId } from '../data/purposes';
import { judgeMonth, type DayVerdict, type Grade } from '../logic';

const GRADE_COLOR: Record<Grade, string> = {
  excellent: colors.good,
  good: colors.good,
  fair: colors.ok,
  poor: colors.bad,
};

/** The Nalla Neram of one day, computed only when the day is opened. */
function DayDetail({ verdict, place }: { verdict: DayVerdict; place: Place }) {
  const { t } = useTranslation('nallaNaal');
  const day = useMemo(() => nallaNeramDay(verdict.date, place), [verdict.date, place]);
  return (
    <View style={styles.gap}>
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
  const [onlyGood, setOnlyGood] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [personalise, setPersonalise] = useState(false);

  const month = cursor ?? { y: todayLocal.y, m: todayLocal.m };
  const shiftMonth = (delta: number) => {
    const first = addDays({ y: month.y, m: month.m, d: 1 }, delta > 0 ? 32 : -1);
    setCursor({ y: first.y, m: first.m });
    setExpanded(null);
  };

  const verdicts = useMemo(
    () => judgeMonth(month.y, month.m, place, PURPOSE_BY_ID[purposeId], { birthNakshatra, birthRashi }),
    [month.y, month.m, place, purposeId, birthNakshatra, birthRashi],
  );
  const visible = onlyGood ? verdicts.filter((v) => v.score >= 60) : verdicts;

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
      />

      <View style={styles.row}>
        <AppText style={styles.flex}>{t('onlyGood')}</AppText>
        <Switch value={onlyGood} onValueChange={(v) => { setOnlyGood(v); }} trackColor={{ true: colors.primary }} />
      </View>

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
                <Pressable key={i} onPress={() => dispatch(setBirthNakshatra(birthNakshatra === i ? null : i))}>
                  <Chip label={tr(n)} color={birthNakshatra === i ? colors.primary : colors.neutral} style={birthNakshatra === i ? styles.chipOn : undefined} textStyle={birthNakshatra === i ? styles.chipOnText : undefined} />
                </Pressable>
              ))}
            </View>
            <AppText bold size={14}>
              {t('profile.rashi')}
            </AppText>
            <View style={styles.wrap}>
              {RASHIS.map((r, i) => (
                <Pressable key={i} onPress={() => dispatch(setBirthRashi(birthRashi === i ? null : i))}>
                  <Chip label={tr(r)} color={birthRashi === i ? colors.primary : colors.neutral} style={birthRashi === i ? styles.chipOn : undefined} textStyle={birthRashi === i ? styles.chipOnText : undefined} />
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

      {visible.length === 0 ? (
        <AppText color={colors.muted} center>
          {t('noGoodDays')}
        </AppText>
      ) : (
        visible.map((v) => {
          const color = GRADE_COLOR[v.grade];
          const open = expanded === v.date.d;
          const isToday = v.date.y === todayLocal.y && v.date.m === todayLocal.m && v.date.d === todayLocal.d;
          return (
            <Pressable
              key={v.date.d}
              accessibilityRole="button"
              onPress={() => setExpanded(open ? null : v.date.d)}
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
                      <AppText size={12} color={isAvoidedTithi(v.tithi) ? colors.bad : colors.muted} bold={isAvoidedTithi(v.tithi)}>
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
                      <Chip key={s.id} label={`🪔 ${tr(SPECIAL_DAYS[s.id])}`} color={colors.primary} />
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
                    <DayDetail verdict={v} place={place} />
                  </View>
                ) : (
                  <AppText size={11} color={colors.muted}>
                    {t('details.tapHint')}
                  </AppText>
                )}
              </Card>
            </Pressable>
          );
        })
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
});
