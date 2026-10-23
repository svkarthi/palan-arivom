import { useIsFocused } from '@react-navigation/native';
import { useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import CompassDial from '../components/CompassDial';
import { AppText, Button, Card } from '@core/components/ui';
import { ZONE_BY_ID } from '../data/zones';
import { useHeading } from '../hooks/useHeading';
import { useLang } from '@core/hooks/useLang';
import { clearReadings, lockReading, setDeclination } from '../store/compassSlice';
import { useAppDispatch, useAppSelector } from '@core/store/hooks';
import { setRotation } from '../store/planSlice';
import { colors, spacing } from '@core/theme';
import { normalizeDegrees, zoneForHeading } from '../utils/heading';
import { speak } from '@core/utils/speech';

export default function CompassScreen() {
  const { t } = useTranslation('vastu');
  const { lang, tr } = useLang();
  const dispatch = useAppDispatch();
  const focused = useIsFocused();
  const { width } = useWindowDimensions();
  const voice = useAppSelector((s) => s.settings.voice);
  const { declination, history } = useAppSelector((s) => s.compass);
  const { heading, available } = useHeading(focused, declination);
  const [message, setMessage] = useState<string | null>(null);

  const dial = Math.min(width - spacing.md * 2, 320);
  const zone = heading === null ? null : zoneForHeading(heading);

  const lock = () => {
    if (heading === null || zone === null) return;
    const rounded = Math.round(heading);
    dispatch(lockReading({ id: String(Date.now()), heading: rounded, zone: zone.id, at: Date.now() }));
    setMessage(t('compass.locked', { zone: tr(zone.name), deg: rounded }));
    if (voice) speak(t('compass.speakFacing', { zone: tr(zone.name) }), lang);
  };

  const stepDeclination = (delta: number) =>
    dispatch(setDeclination(Math.round((declination + delta) * 10) / 10));

  const useAsPlanTop = () => {
    if (heading === null) return;
    // If the top of the plan faces `heading`, north lies at -heading from the top.
    const rotation = normalizeDegrees(-heading);
    dispatch(setRotation(rotation));
    setMessage(t('compass.planTopSet', { deg: Math.round(heading) }));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {available === false ? (
        <Card>
          <AppText color={colors.bad}>{t('compass.unavailable')}</AppText>
        </Card>
      ) : (
        <>
          <View style={styles.center}>
            <CompassDial size={dial} heading={heading ?? 0} lang={lang} />
          </View>

          <Card style={styles.center}>
            <AppText size={13} color={colors.muted}>
              {t('compass.facing')}
            </AppText>
            <AppText bold size={24} color={colors.primaryDark} center>
              {zone ? tr(zone.name) : '—'}
            </AppText>
            <AppText size={18} color={colors.primary}>
              {heading === null ? '' : t('common.degrees', { value: Math.round(heading) })}
            </AppText>
          </Card>

          <View style={styles.row}>
            <Button title={t('compass.lock')} onPress={lock} disabled={heading === null} style={styles.flex} />
            <Button
              title={t('compass.useAsPlanTop')}
              onPress={useAsPlanTop}
              variant="outline"
              disabled={heading === null}
              style={styles.flex}
            />
          </View>

          {message ? (
            <AppText size={14} color={colors.good}>
              {message}
            </AppText>
          ) : null}
          {declination !== 0 ? (
            <AppText size={12} color={colors.muted}>
              {t('compass.declinationApplied', { deg: declination })}
            </AppText>
          ) : null}

          <AppText size={13} color={colors.muted}>
            {t('compass.holdFlat')}
          </AppText>
          <AppText size={13} color={colors.muted}>
            {t('compass.calibrate')}
          </AppText>
        </>
      )}

      <Card style={styles.declination}>
        <AppText bold>{t('compass.declination')}</AppText>
        <View style={styles.row}>
          <Button title="−0.5" variant="outline" onPress={() => stepDeclination(-0.5)} style={styles.flex} />
          <AppText bold size={20} center style={styles.declinationValue}>
            {declination}°
          </AppText>
          <Button title="+0.5" variant="outline" onPress={() => stepDeclination(0.5)} style={styles.flex} />
        </View>
        <AppText size={12} color={colors.muted}>
          {t('compass.declinationHint')}
        </AppText>
      </Card>

      <View style={styles.historyHeader}>
        <AppText bold size={17}>
          {t('compass.history')}
        </AppText>
        {history.length > 0 ? (
          <Button title={t('compass.clearHistory')} variant="outline" onPress={() => dispatch(clearReadings())} />
        ) : null}
      </View>
      {history.length === 0 ? (
        <AppText color={colors.muted}>{t('compass.noHistory')}</AppText>
      ) : (
        history.map((h) => (
          <Card key={h.id} style={styles.historyItem}>
            <AppText bold style={styles.flex}>
              {tr(ZONE_BY_ID[h.zone].name)}
            </AppText>
            <AppText color={colors.primary}>{t('common.degrees', { value: h.heading })}</AppText>
            <AppText size={12} color={colors.muted}>
              {new Date(h.at).toLocaleTimeString()}
            </AppText>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, gap: spacing.md, backgroundColor: colors.bg },
  center: { alignItems: 'center' },
  row: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
  declination: { gap: spacing.sm },
  declinationValue: { minWidth: 70 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
});
