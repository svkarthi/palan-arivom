import { useIsFocused } from '@react-navigation/native';
import { useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import CompassDial from '../components/CompassDial';
import BottomSheet from '@core/components/BottomSheet';
import { AppText, Button, Card, IconBadge, SectionHeader, useBottomInset } from '@core/components/ui';
import { ROOMS } from '../data/rooms';
import { ZONE_BY_ID } from '../data/zones';
import { useHeading } from '../hooks/useHeading';
import { useLang } from '@core/hooks/useLang';
import { clearReadings, lockReading, setDeclination } from '../store/compassSlice';
import { useAppDispatch, useAppSelector } from '@core/store/hooks';
import { placeRoom, setRotation } from '../store/planSlice';
import { colors, spacing } from '@core/theme';
import { hapticImpact, hapticSuccess } from '@core/utils/haptics';
import { normalizeDegrees, zoneForHeading } from '../utils/heading';
import { speak } from '@core/utils/speech';

function cardinalOf(deg: number): 'N' | 'E' | 'S' | 'W' {
  const n = normalizeDegrees(deg);
  if (n >= 315 || n < 45) return 'N';
  if (n < 135) return 'E';
  if (n < 225) return 'S';
  return 'W';
}

export default function CompassScreen() {
  const { t } = useTranslation('vastu');
  const { lang, tr } = useLang();
  const dispatch = useAppDispatch();
  const focused = useIsFocused();
  const { width } = useWindowDimensions();
  const bottomInset = useBottomInset();
  const voice = useAppSelector((s) => s.settings.voice);
  const { declination, history } = useAppSelector((s) => s.compass);
  const { heading, available, source, accuracy } = useHeading(focused, declination);
  const [message, setMessage] = useState<string | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);

  const dial = Math.min(width - spacing.md * 2, 320);
  const zone = heading === null ? null : zoneForHeading(heading);
  const cardinal = heading === null ? null : cardinalOf(heading);

  const lock = () => {
    if (heading === null || zone === null) return;
    hapticImpact();
    const rounded = Math.round(heading);
    dispatch(lockReading({ id: String(Date.now()), heading: rounded, zone: zone.id, at: Date.now() }));
    setMessage(t('compass.locked', { zone: tr(zone.name), deg: rounded }));
    if (voice) speak(t('compass.speakFacing', { zone: tr(zone.name) }), lang);
  };

  const stepDeclination = (delta: number) =>
    dispatch(setDeclination(Math.round((declination + delta) * 10) / 10));

  const useAsPlanTop = () => {
    if (heading === null) return;
    hapticSuccess();
    const rotation = normalizeDegrees(-heading);
    dispatch(setRotation(rotation));
    setMessage(t('compass.planTopSet', { deg: Math.round(heading) }));
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingBottom: bottomInset }]}>
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

          {cardinal ? (
            <Card variant="tinted" style={styles.declination}>
              <SectionHeader icon="home-outline" title={t('compass.facingGuide')} />
              <AppText size={13} color={colors.muted}>
                {t(`compass.facingSummary.${cardinal}`)}
              </AppText>
            </Card>
          ) : null}

          <View style={styles.row}>
            <Button title={t('compass.lock')} icon="lock-outline" onPress={lock} disabled={heading === null} style={styles.flex} />
            <Button
              title={t('compass.useAsPlanTop')}
              icon="compass-outline"
              onPress={useAsPlanTop}
              variant="outline"
              disabled={heading === null}
              style={styles.flex}
            />
          </View>

          <Button
            title={t('compass.assignRoom')}
            icon="map-marker-plus-outline"
            variant="outline"
            disabled={zone === null}
            onPress={() => setAssignOpen(true)}
          />

          {message ? (
            <AppText size={14} color={colors.good}>
              {message}
            </AppText>
          ) : null}
          {source === 'magnetometer' && declination !== 0 ? (
            <AppText size={12} color={colors.muted}>
              {t('compass.declinationApplied', { deg: declination })}
            </AppText>
          ) : null}

          {source === 'magnetometer' ? (
            <AppText size={13} color={colors.ok}>
              {t('compass.fallback')}
            </AppText>
          ) : null}
          {accuracy !== null && accuracy <= 1 ? (
            <AppText size={13} color={colors.bad}>
              {t('compass.lowAccuracy')}
            </AppText>
          ) : null}
          <AppText size={13} color={colors.muted}>
            {t('compass.calibrate')}
          </AppText>
        </>
      )}

      {source === 'magnetometer' ? (
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
      ) : null}

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
              {new Date(h.at).toLocaleTimeString(lang === 'ta' ? 'ta-IN' : 'en-IN')}
            </AppText>
          </Card>
        ))
      )}

      <BottomSheet
        visible={assignOpen && zone !== null}
        title={zone ? t('compass.assignTitle', { zone: tr(zone.name) }) : undefined}
        onClose={() => setAssignOpen(false)}
        maxHeight="70%"
      >
        {zone ? (
          <>
            <FlatList
              data={ROOMS}
              keyExtractor={(r) => r.id}
              style={styles.list}
              renderItem={({ item }) => (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    hapticSuccess();
                    dispatch(placeRoom({ roomId: item.id, zone: zone.id }));
                    setMessage(t('compass.roomAssigned', { room: tr(item.name), zone: tr(zone.name) }));
                    setAssignOpen(false);
                  }}
                  style={({ pressed }) => [styles.option, pressed && { opacity: 0.7 }]}
                >
                  <IconBadge icon={item.icon} size={36} color={colors.primary} bg={colors.primaryBg} />
                  <AppText bold style={styles.flex}>
                    {tr(item.name)}
                  </AppText>
                </Pressable>
              )}
            />
            <Button title={t('common.cancel', { ns: 'translation' })} variant="outline" onPress={() => setAssignOpen(false)} />
          </>
        ) : null}
      </BottomSheet>
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
  list: { flexGrow: 0 },
  option: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm, paddingHorizontal: spacing.sm },
});
