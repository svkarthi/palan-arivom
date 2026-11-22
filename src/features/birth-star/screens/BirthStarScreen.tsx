import { GREGORIAN_MONTHS, NAKSHATRAS, RASHIS, tithiName } from '@core/astro/names';
import { daysInMonth } from '@core/astro/time';
import PlacePicker from '@core/components/PlacePicker';
import { AppText, Button, Card, SectionHeader, Segmented, Stepper, useBottomInset } from '@core/components/ui';
import { useLang } from '@core/hooks/useLang';
import { usePlace } from '@core/hooks/usePlace';
import { useAppDispatch } from '@core/store/hooks';
import { setBirthNakshatra, setBirthRashi } from '@core/store/profileSlice';
import { colors, spacing } from '@core/theme';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { computeBirthStar } from '../logic';

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

  const maxDay = daysInMonth(year, month);
  const clampedDay = Math.min(day, maxDay);
  const hour24 = period === 'AM' ? (hour12 === 12 ? 0 : hour12) : hour12 === 12 ? 12 : hour12 + 12;

  const result = useMemo(
    () => computeBirthStar({ y: year, m: month, d: clampedDay }, hour24, minute, place),
    [year, month, clampedDay, hour24, minute, place],
  );

  const saveToProfile = () => {
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

      <Card style={styles.gap}>
        <SectionHeader icon="calendar-account-outline" title={t('birthDate')} />
        <Stepper
          label={`${t('year')}: ${year}`}
          onPrev={() => { setYear((y) => Math.max(1920, y - 1)); setSavedMsg(false); }}
          onNext={() => { setYear((y) => Math.min(2035, y + 1)); setSavedMsg(false); }}
        />
        <View style={styles.monthGrid}>
          {GREGORIAN_MONTHS.map((gm, i) => {
            const m = i + 1;
            const active = month === m;
            return (
              <Pressable
                key={m}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => { setMonth(m); setSavedMsg(false); }}
                style={[styles.cell, active && styles.cellActive]}
              >
                <AppText size={12} bold={active} color={active ? '#fff' : colors.text} center>
                  {tr(gm)}
                </AppText>
              </Pressable>
            );
          })}
        </View>
        <Stepper
          label={`${t('day')}: ${clampedDay}`}
          onPrev={() => { setDay(clampedDay <= 1 ? maxDay : clampedDay - 1); setSavedMsg(false); }}
          onNext={() => { setDay(clampedDay >= maxDay ? 1 : clampedDay + 1); setSavedMsg(false); }}
        />
      </Card>

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, gap: spacing.md, backgroundColor: colors.bg },
  gap: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  flex: { flex: 1 },
  label: { width: 120 },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cell: {
    width: '23%',
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cellActive: { backgroundColor: colors.primary, borderColor: colors.primary },
});
