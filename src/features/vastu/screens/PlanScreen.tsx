import { File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import ZoneMap from '../components/ZoneMap';
import BottomSheet from '@core/components/BottomSheet';
import { AppText, Button, IconBadge, Segmented, useBottomInset } from '@core/components/ui';
import { hapticImpact, hapticSuccess } from '@core/utils/haptics';
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
  const bottomInset = useBottomInset();

  const size = Math.min(width - spacing.md * 2, 420);

  const { fills, labels } = useMemo(() => {
    const fills: Partial<Record<ZoneId, string>> = {};
    const labels: Partial<Record<ZoneId, string>> = {};
    const worst: Partial<Record<ZoneId, Verdict>> = {};
    for (const room of ROOMS) {
      const zone = placements[room.id];
      if (!zone) continue;
      const verdict = verdictFor(room, zone);
      const short = room.short[lang];
      labels[zone] = labels[zone] ? `${labels[zone]}·${short}` : short;
      const current = worst[zone];
      if (!current || SEVERITY.indexOf(verdict) > SEVERITY.indexOf(current)) worst[zone] = verdict;
    }
    for (const [zone, verdict] of Object.entries(worst)) fills[zone as ZoneId] = VERDICT_FILL[verdict];
    return { fills, labels };
  }, [placements, lang]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        const pickedUri = result.assets[0].uri;
        try {
          const dest = new File(Paths.document, `floor-plan-${Date.now()}.jpg`);
          new File(pickedUri).copy(dest);
          dispatch(setImage(dest.uri));
        } catch {
          dispatch(setImage(pickedUri));
        }
      }
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
    <ScrollView contentContainerStyle={[styles.container, { paddingBottom: bottomInset }]}>
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
          interactive
          onRotateBy={(delta) => dispatch(setRotation(rotation + delta))}
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

      <BottomSheet
        visible={activeZone !== null}
        title={activeZone ? t('plan.chooseRoom', { zone: tr(ZONE_BY_ID[activeZone].name) }) : undefined}
        onClose={() => setActiveZone(null)}
        maxHeight="72%"
      >
        {activeZone ? (
          <>
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
                    onPress={() => {
                      hapticImpact();
                      dispatch(here ? removeRoom(item.id) : placeRoom({ roomId: item.id, zone: activeZone }));
                    }}
                    style={({ pressed }) => [styles.option, here && styles.optionActive, pressed && { opacity: 0.75 }]}
                  >
                    <IconBadge icon={item.icon} size={38} color={colors.primary} bg={colors.primaryBg} />
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
              <Button title={t('common.ok')} onPress={() => { hapticSuccess(); setActiveZone(null); }} style={styles.flex} />
            </View>
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
  rotation: { gap: spacing.sm },
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
