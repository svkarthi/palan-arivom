import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { nearestPlace, PLACES } from '../astro/places';
import { useLang } from '../hooks/useLang';
import { usePlace } from '../hooks/usePlace';
import { setPlace } from '../store/profileSlice';
import { useAppDispatch } from '../store/hooks';
import { colors, spacing } from '../theme';
import { hapticSuccess, hapticTap } from '../utils/haptics';
import BottomSheet from './BottomSheet';
import { AppText, Button } from './ui';

type Props = {
  /** Use `'hero'` on dark temple-maroon hero cards (e.g. HomeScreen). */
  variant?: 'default' | 'hero';
  /** Optional prefix text shown before the city name (e.g. Tamil year). */
  prefixText?: string;
};

/** Compact button showing the chosen city that opens a swipeable sheet to change it. */
export default function PlacePicker({ variant = 'default', prefixText }: Props = {}) {
  const { t } = useTranslation();
  const { tr } = useLang();
  const dispatch = useAppDispatch();
  const place = usePlace();
  const [open, setOpen] = useState(false);
  const [detecting, setDetecting] = useState(false);

  const isHero = variant === 'hero';

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
      hapticSuccess();
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
        accessibilityLabel={t('place.choose')}
        onPress={(e) => {
          e.stopPropagation?.();
          hapticTap();
          setOpen(true);
        }}
        style={({ pressed }) => [
          isHero ? styles.heroButton : styles.button,
          pressed && { opacity: 0.75 },
        ]}
      >
        <Ionicons name="location-sharp" size={isHero ? 13 : 15} color={isHero ? colors.heroAccent : colors.primary} />
        <AppText
          size={isHero ? 12 : 13}
          color={isHero ? colors.heroMuted : colors.primaryDark}
          bold={!isHero}
        >
          {prefixText ? `${prefixText}${tr(place.name)}` : tr(place.name)}
        </AppText>
        <Ionicons name="chevron-down" size={isHero ? 12 : 14} color={isHero ? colors.heroAccent : colors.primary} />
      </Pressable>

      <BottomSheet visible={open} title={t('place.choose')} onClose={() => setOpen(false)} maxHeight="72%">
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
                  hapticTap();
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
      </BottomSheet>
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
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: 2,
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginLeft: -8,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 248, 236, 0.08)',
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
