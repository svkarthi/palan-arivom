import * as ImagePicker from 'expo-image-picker';
import { useContext, useMemo, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import ZoneMap from '../components/ZoneMap';
import { AppText, Button, Segmented } from '@core/components/ui';
import { ROOMS, ROOM_BY_ID } from '../data/rooms';
import { ZONE_BY_ID, type ZoneId } from '../data/zones';
import { useLang } from '@core/hooks/useLang';
import { useAppDispatch, useAppSelector } from '@core/store/hooks';
import {
  clearPlacements,
  clearZone,
  placeRoom,
  removeRoom,
  setImage,
  setMode,
  setRotation,
  type PlanMode,
} from '../store/planSlice';
import { colors, spacing } from '@core/theme';
import { verdictFor, type Verdict } from '../utils/scoring';

const VERDICT_FILL: Record<Verdict, string> = {
  ideal: 'rgba(46,125,50,0.5)',
  acceptable: 'rgba(183,121,31,0.5)',
  neutral: 'rgba(141,123,104,0.4)',
  avoid: 'rgba(198,40,40,0.5)',
};
const VERDICT_COLOR: Record<Verdict, string> = {
  ideal: colors.good,
  acceptable: colors.ok,
  neutral: colors.neutral,
  avoid: colors.bad,
};
const SEVERITY: Verdict[] = ['ideal', 'acceptable', 'neutral', 'avoid'];

export default function PlanScreen() {
  const { t } = useTranslation('vastu');
  const { lang, tr } = useLang();
  const dispatch = useAppDispatch();
  const { width } = useWindowDimensions();
  const { imageUri, mode, rotation, placements } = useAppSelector((s) => s.plan);
  const [activeZone, setActiveZone] = useState<ZoneId | null>(null);
  const insets = useContext(SafeAreaInsetsContext);

  const size = Math.min(width - spacing.md * 2, 420);

  const { fills, labels } = useMemo(() => {
    const fills: Partial<Record<ZoneId, string>> = {};
    const labels: Partial<Record<ZoneId, string>> = {};
    const worst: Partial<Record<ZoneId, Verdict>> = {};
    for (const room of ROOMS) {
      const zone = placements[room.id];
      if (!zone) continue;
      const verdict = verdictFor(room, zone);
      labels[zone] = (labels[zone] ?? '') + room.icon;
      const current = worst[zone];
      if (!current || SEVERITY.indexOf(verdict) > SEVERITY.indexOf(current)) worst[zone] = verdict;
    }
    for (const [zone, verdict] of Object.entries(worst)) fills[zone as ZoneId] = VERDICT_FILL[verdict];
    return { fills, labels };
  }, [placements]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) dispatch(setImage(result.assets[0].uri));
    } catch {
      Alert.alert(t('plan.pickFailed'));
    }
  };

  const confirmClearAll = () =>
    Alert.alert(t('plan.clearAllConfirm'), undefined, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => dispatch(clearPlacements()) },
    ]);

  const nudge = (delta: number) => dispatch(setRotation(rotation + delta));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Segmented<PlanMode>
        value={mode}
        onChange={(m) => dispatch(setMode(m))}
        options={[
          { value: '16', label: t('plan.mode16') },
          { value: '9', label: t('plan.mode9') },
        ]}
      />

      <View style={styles.center}>
        <ZoneMap
          size={size}
          mode={mode}
          rotation={rotation}
          lang={lang}
          fills={fills}
          labels={labels}
          imageUri={imageUri}
          onPressZone={setActiveZone}
        />
      </View>
      <AppText size={13} color={colors.muted} center>
        {t('plan.tapZone')}
      </AppText>

      <View style={styles.row}>
        <Button title={t('plan.pickImage')} onPress={pickImage} style={styles.flex} />
        {imageUri ? (
          <Button title={t('plan.removeImage')} variant="outline" onPress={() => dispatch(setImage(null))} style={styles.flex} />
        ) : null}
      </View>

      {mode === '16' ? (
        <View style={styles.rotation}>
          <AppText bold>{t('plan.rotation', { deg: rotation })}</AppText>
          <View style={styles.row}>
            {[-15, -1, 1, 15].map((d) => (
              <Button
                key={d}
                title={d > 0 ? `+${d}°` : `${d}°`}
                variant="outline"
                onPress={() => nudge(d)}
                style={styles.flex}
              />
            ))}
          </View>
          <Button title={t('plan.resetRotation')} variant="outline" onPress={() => dispatch(setRotation(0))} />
          <AppText size={12} color={colors.muted}>
            {t('plan.rotationHint')}
          </AppText>
        </View>
      ) : (
        <AppText size={12} color={colors.muted}>
          {t('plan.gridHint')}
        </AppText>
      )}

      {Object.keys(placements).length > 0 ? (
        <Button title={t('plan.clearAll')} variant="danger" onPress={confirmClearAll} />
      ) : null}

      <Modal visible={activeZone !== null} transparent animationType="slide" onRequestClose={() => setActiveZone(null)}>
        <Pressable style={styles.backdrop} onPress={() => setActiveZone(null)} />
        {activeZone ? (
          <View style={[styles.sheet, { paddingBottom: Math.max(insets?.bottom ?? 0, spacing.md) }]}>
            <AppText bold size={17} color={colors.primaryDark}>
              {t('plan.chooseRoom', { zone: tr(ZONE_BY_ID[activeZone].name) })}
            </AppText>
            <FlatList
              data={ROOMS}
              keyExtractor={(r) => r.id}
              style={styles.list}
              renderItem={({ item }) => {
                const placedAt = placements[item.id];
                const here = placedAt === activeZone;
                const verdict = verdictFor(ROOM_BY_ID[item.id], activeZone);
                return (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() =>
                      dispatch(here ? removeRoom(item.id) : placeRoom({ roomId: item.id, zone: activeZone }))
                    }
                    style={[styles.option, here && styles.optionActive]}
                  >
                    <AppText size={24}>{item.icon}</AppText>
                    <View style={styles.flex}>
                      <AppText bold>{tr(item.name)}</AppText>
                      <AppText size={12} color={VERDICT_COLOR[verdict]}>
                        {t(`report.verdict.${verdict}`)}
                        {placedAt && !here ? `  ·  ${t('plan.placedElsewhere')}` : ''}
                      </AppText>
                    </View>
                    {here ? (
                      <AppText bold color={colors.good}>
                        ✓ {t('plan.placedHere')}
                      </AppText>
                    ) : null}
                  </Pressable>
                );
              }}
            />
            <View style={styles.row}>
              <Button
                title={t('plan.clearZone')}
                variant="outline"
                onPress={() => dispatch(clearZone(activeZone))}
                style={styles.flex}
              />
              <Button title={t('common.ok')} onPress={() => setActiveZone(null)} style={styles.flex} />
            </View>
          </View>
        ) : null}
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, gap: spacing.md, backgroundColor: colors.bg },
  center: { alignItems: 'center' },
  row: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
  rotation: { gap: spacing.sm },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: colors.bg,
    padding: spacing.md,
    gap: spacing.sm,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  list: { flexGrow: 0 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 12,
  },
  optionActive: { backgroundColor: '#E8F5E9' },
});
