import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GREGORIAN_MONTHS, NAKSHATRAS, RASHIS, tithiName } from '@core/astro/names';
import { daysInMonth } from '@core/astro/time';
import BottomSheet from '@core/components/BottomSheet';
import PlacePicker from '@core/components/PlacePicker';
import { AppText, Button, Card, IconBadge, SectionHeader, Segmented, Stepper, useBottomInset } from '@core/components/ui';
import { useLang } from '@core/hooks/useLang';
import { usePlace } from '@core/hooks/usePlace';
import { useAppDispatch } from '@core/store/hooks';
import { setBirthNakshatra, setBirthRashi } from '@core/store/profileSlice';
import { colors, spacing } from '@core/theme';
import { hapticSuccess, hapticTap } from '@core/utils/haptics';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { computeBirthStar } from '../logic';

const DECADES = [1920, 1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];
const MAX_YEAR = 2035;

export default function BirthStarScreen() {
  const { t } = useTranslation('birthStar');
  const { tr } = useLang();
  const place = usePlace();
  const dispatch = useAppDispatch();
  const bottomInset = useBottomInset();

  const [year, setYear] = useState(1995);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(15);
  const [hour12, setHour12] = useState(9);
  const [minute, setMinute] = useState(30);
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');
  const [savedMsg, setSavedMsg] = useState(false);

  const [dateSheetOpen, setDateSheetOpen] = useState(false);
  const [draftYear, setDraftYear] = useState(1995);
  const [draftMonth, setDraftMonth] = useState(1);
  const [draftDay, setDraftDay] = useState(15);
  const [draftDecade, setDraftDecade] = useState(1990);

  const maxDay = daysInMonth(year, month);
  const clampedDay = Math.min(day, maxDay);
  const hour24 = period === 'AM' ? (hour12 === 12 ? 0 : hour12) : hour12 === 12 ? 12 : hour12 + 12;

  const result = useMemo(
    () => computeBirthStar({ y: year, m: month, d: clampedDay }, hour24, minute, place),
    [year, month, clampedDay, hour24, minute, place],
  );

  const openDateSheet = () => {
    hapticTap();
    setDraftYear(year);
    setDraftMonth(month);
    setDraftDay(clampedDay);
    setDraftDecade(Math.min(2020, Math.floor(year / 10) * 10));
    setDateSheetOpen(true);
  };

  const applyDraftDate = (y = draftYear, m = draftMonth, d = draftDay) => {
    const safeDay = Math.min(d, daysInMonth(y, m));
    setYear(y);
    setMonth(m);
    setDay(safeDay);
    setSavedMsg(false);
    setDateSheetOpen(false);
  };

  const decadeYears = useMemo(() => {
    const end = draftDecade === 2020 ? MAX_YEAR : draftDecade + 9;
    return Array.from({ length: end - draftDecade + 1 }, (_, i) => draftDecade + i);
  }, [draftDecade]);

  const draftMaxDay = daysInMonth(draftYear, draftMonth);
  const clampedDraftDay = Math.min(draftDay, draftMaxDay);

  const saveToProfile = () => {
    hapticSuccess();
    dispatch(setBirthNakshatra(result.nakshatra));
    dispatch(setBirthRashi(result.rashi));
    setSavedMsg(true);
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingBottom: bottomInset }]}>
      <AppText size={13} color={colors.muted}>
        {t('subtitle')}
      </AppText>

      <PlacePicker />

      <Pressable
        accessibilityRole="button"
        onPress={openDateSheet}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <Card style={styles.dateSummaryCard}>
          <IconBadge icon="calendar-account-outline" color={colors.primary} bg={colors.primaryBg} size={44} />
          <View style={styles.flex}>
            <AppText size={12} bold color={colors.muted}>
              {t('birthDate')}
            </AppText>
            <AppText bold size={18} color={colors.primaryDark}>
              {clampedDay} {tr(GREGORIAN_MONTHS[month - 1])} {year}
            </AppText>
            <AppText size={11} color={colors.primary}>
              {t('tapToChange')}
            </AppText>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.primary} />
        </Card>
      </Pressable>

      <Card style={styles.gap}>
        <SectionHeader icon="clock-outline" title={t('birthTime')} />
        <View style={styles.row}>
          <View style={styles.flex}>
            <Stepper
              label={`${String(hour12).padStart(2, '0')} ${t('hour')}`}
              onPrev={() => { setHour12((h) => (h <= 1 ? 12 : h - 1)); setSavedMsg(false); }}
              onNext={() => { setHour12((h) => (h >= 12 ? 1 : h + 1)); setSavedMsg(false); }}
            />
          </View>
          <View style={styles.flex}>
            <Stepper
              label={`${String(minute).padStart(2, '0')} ${t('minute')}`}
              onPrev={() => { setMinute((m) => (m - 5 + 60) % 60); setSavedMsg(false); }}
              onNext={() => { setMinute((m) => (m + 5) % 60); setSavedMsg(false); }}
            />
          </View>
        </View>
        <Segmented<'AM' | 'PM'>
          value={period}
          onChange={(p) => { setPeriod(p); setSavedMsg(false); }}
          options={[
            { value: 'AM', label: t('am') },
            { value: 'PM', label: t('pm') },
          ]}
        />
      </Card>

      <Card variant="hero" style={styles.gap}>
        <AppText bold size={17} color={colors.heroAccent}>
          {t('resultTitle')}
        </AppText>
        <View style={styles.row}>
          <AppText size={13} color={colors.heroMuted} style={styles.label}>
            {t('nakshatra')}
          </AppText>
          <AppText bold color={colors.heroText} style={styles.flex}>
            {tr(NAKSHATRAS[result.nakshatra])} ({t('pada', { value: result.pada })})
          </AppText>
        </View>
        <View style={styles.row}>
          <AppText size={13} color={colors.heroMuted} style={styles.label}>
            {t('rashi')}
          </AppText>
          <AppText bold color={colors.heroText} style={styles.flex}>
            {tr(RASHIS[result.rashi])}
          </AppText>
        </View>
        <View style={styles.row}>
          <AppText size={13} color={colors.heroMuted} style={styles.label}>
            {t('lagna')}
          </AppText>
          <AppText bold color={colors.heroText} style={styles.flex}>
            {tr(RASHIS[result.lagna])}
          </AppText>
        </View>
        <View style={styles.row}>
          <AppText size={13} color={colors.heroMuted} style={styles.label}>
            {t('tithi')}
          </AppText>
          <AppText bold color={colors.heroText} style={styles.flex}>
            {tr(tithiName(result.tithi))}
          </AppText>
        </View>

        <Button title={t('saveProfile')} icon="content-save-outline" onPress={saveToProfile} />
        {savedMsg ? (
          <AppText size={13} bold color="#A5F3AC">
            ✓ {t('saved')}
          </AppText>
        ) : null}
      </Card>

      <AppText size={12} color={colors.muted}>
        {t('note')}
      </AppText>

      <BottomSheet visible={dateSheetOpen} title={t('pickDate')} onClose={() => setDateSheetOpen(false)} maxHeight="88%">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetBody}>
          <AppText size={12} bold color={colors.muted}>
            {t('decade')}
          </AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.decadeRow}>
            {DECADES.map((dec) => {
              const active = draftDecade === dec;
              return (
                <Pressable
                  key={dec}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => {
                    hapticTap();
                    setDraftDecade(dec);
                  }}
                  style={[styles.decadePill, active && styles.cellActive]}
                >
                  <AppText size={12} bold={active} color={active ? '#fff' : colors.primaryDark}>
                    {dec}s
                  </AppText>
                </Pressable>
              );
            })}
          </ScrollView>

          <AppText size={12} bold color={colors.muted}>
            {t('year')}
          </AppText>
          <View style={styles.yearGrid}>
            {decadeYears.map((yVal) => {
              const active = draftYear === yVal;
              return (
                <Pressable
                  key={yVal}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => {
                    hapticTap();
                    setDraftYear(yVal);
                  }}
                  style={[styles.yearCell, active && styles.cellActive]}
                >
                  <AppText size={12} bold={active} color={active ? '#fff' : colors.text} center>
                    {yVal}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          <AppText size={12} bold color={colors.muted}>
            {t('month')}
          </AppText>
          <View style={styles.monthGrid}>
            {GREGORIAN_MONTHS.map((gm, i) => {
              const m = i + 1;
              const active = draftMonth === m;
              return (
                <Pressable
                  key={m}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => {
                    hapticTap();
                    setDraftMonth(m);
                  }}
                  style={[styles.cell, active && styles.cellActive]}
                >
                  <AppText size={12} bold={active} color={active ? '#fff' : colors.text} center>
                    {tr(gm)}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          <AppText size={12} bold color={colors.muted}>
            {t('day')}
          </AppText>
          <View style={styles.dayGrid}>
            {Array.from({ length: draftMaxDay }, (_, i) => i + 1).map((dd) => {
              const active = clampedDraftDay === dd;
              return (
                <Pressable
                  key={dd}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => {
                    hapticTap();
                    applyDraftDate(draftYear, draftMonth, dd);
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
        </ScrollView>

        <View style={styles.row}>
          <Button
            title={t('common.cancel', { ns: 'translation' })}
            variant="outline"
            onPress={() => setDateSheetOpen(false)}
            style={styles.flex}
          />
          <Button
            title={t('common.ok', { ns: 'translation' })}
            onPress={() => {
              hapticTap();
              applyDraftDate();
            }}
            style={styles.flex}
          />
        </View>
      </BottomSheet>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, gap: spacing.md, backgroundColor: colors.bg },
  pressed: { opacity: 0.86, transform: [{ scale: 0.99 }] },
  dateSummaryCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  gap: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  flex: { flex: 1 },
  label: { width: 120 },
  sheetBody: { gap: spacing.sm, paddingBottom: spacing.xs },
  decadeRow: { gap: 6, paddingVertical: 2 },
  decadePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  yearGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  yearCell: {
    width: '18%',
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cell: {
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
