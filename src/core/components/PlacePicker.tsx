import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useState } from 'react';
import { Alert, FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { nearestPlace, PLACES } from '../astro/places';
import { useLang } from '../hooks/useLang';
import { usePlace } from '../hooks/usePlace';
import { setPlace } from '../store/profileSlice';
import { useAppDispatch } from '../store/hooks';
import { colors, spacing } from '../theme';
import { AppText, Button, useBottomInset } from './ui';

/** Compact button showing the chosen city that opens a list to change it. */
export default function PlacePicker() {
  const { t } = useTranslation();
  const { tr } = useLang();
  const dispatch = useAppDispatch();
  const place = usePlace();
  const [open, setOpen] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const bottomInset = useBottomInset(spacing.sm);

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
      <Pressable
        accessibilityRole="button"
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.button, pressed && { opacity: 0.75 }]}
      >
        <Ionicons name="location-sharp" size={15} color={colors.primary} />
        <AppText size={13} color={colors.primaryDark} bold>
          {tr(place.name)}
        </AppText>
        <Ionicons name="chevron-down" size={14} color={colors.primary} />
      </Pressable>
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <View style={[styles.sheet, { paddingBottom: bottomInset }]}>
          <View style={styles.handle} />
          <AppText bold size={17} color={colors.primaryDark}>
            {t('place.choose')}
          </AppText>
          <Button
            title={detecting ? t('place.detecting') : t('place.detect')}
            icon="crosshairs-gps"
            variant="outline"
            disabled={detecting}
            onPress={detectCity}
          />
          <FlatList
            data={PLACES}
            keyExtractor={(p) => p.id}
            style={styles.list}
            renderItem={({ item }) => {
              const selected = item.id === place.id;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => {
                    dispatch(setPlace(item.id));
                    setOpen(false);
                  }}
                  style={({ pressed }) => [
                    styles.option,
                    selected && styles.active,
                    pressed && { opacity: 0.75 },
                  ]}
                >
                  <AppText bold={selected} color={selected ? colors.primaryDark : colors.text} style={styles.flex}>
                    {tr(item.name)}
                  </AppText>
                  {selected ? <Ionicons name="checkmark-circle" size={18} color={colors.primary} /> : null}
                </Pressable>
              );
            }}
          />
          <Button title={t('common.cancel')} variant="outline" onPress={() => setOpen(false)} />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  backdrop: { flex: 1, backgroundColor: 'rgba(20,10,5,0.45)' },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 4,
  },
  sheet: {
    backgroundColor: colors.bg,
    padding: spacing.md,
    gap: spacing.sm,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '72%',
  },
  list: { flexGrow: 0 },
  flex: { flex: 1 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  active: { backgroundColor: colors.surface },
});
