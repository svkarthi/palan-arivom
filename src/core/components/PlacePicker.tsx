import * as Location from 'expo-location';
import { useContext, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { nearestPlace, PLACES } from '../astro/places';
import { useLang } from '../hooks/useLang';
import { usePlace } from '../hooks/usePlace';
import { setPlace } from '../store/profileSlice';
import { useAppDispatch } from '../store/hooks';
import { colors, spacing } from '../theme';
import { AppText, Button } from './ui';

/** Compact button showing the chosen city that opens a list to change it. */
export default function PlacePicker() {
  const { t } = useTranslation();
  const { tr } = useLang();
  const dispatch = useAppDispatch();
  const place = usePlace();
  const [open, setOpen] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const insets = useContext(SafeAreaInsetsContext);

  const detectCity = async () => {
    setDetecting(true);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(t('place.detectFailed'));
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const closest = nearestPlace(pos.coords.latitude, pos.coords.longitude);
      dispatch(setPlace(closest.id));
      setOpen(false);
    } catch {
      Alert.alert(t('place.detectFailed'));
    } finally {
      setDetecting(false);
    }
  };

  return (
    <>
      <Pressable accessibilityRole="button" onPress={() => setOpen(true)} style={styles.button}>
        <AppText size={14} color={colors.primary} bold>
          📍 {tr(place.name)} ▾
        </AppText>
      </Pressable>
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets?.bottom ?? 0, spacing.md) }]}>
          <AppText bold size={17} color={colors.primaryDark}>
            {t('place.choose')}
          </AppText>
          <Button
            title={`🎯 ${detecting ? t('place.detecting') : t('place.detect')}`}
            variant="outline"
            disabled={detecting}
            onPress={detectCity}
          />
          <FlatList
            data={PLACES}
            keyExtractor={(p) => p.id}
            style={styles.list}
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  dispatch(setPlace(item.id));
                  setOpen(false);
                }}
                style={[styles.option, item.id === place.id && styles.active]}
              >
                <AppText bold={item.id === place.id}>{tr(item.name)}</AppText>
              </Pressable>
            )}
          />
          <Button title={t('common.cancel')} variant="outline" onPress={() => setOpen(false)} />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.card,
  },
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
  option: { paddingVertical: spacing.sm, paddingHorizontal: spacing.sm, borderRadius: 10 },
  active: { backgroundColor: '#FFE9D2' },
});
