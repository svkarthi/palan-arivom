import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText, Card, Chip, IconBadge, Segmented, useBottomInset } from '@core/components/ui';
import { ROOMS } from '../data/rooms';
import { DIRECTION_INFO, ZONE_BY_ID } from '../data/zones';
import { useLang } from '@core/hooks/useLang';
import type { VastuStackParamList } from '../navigation/types';
import { colors, spacing } from '@core/theme';
import { hapticTap } from '@core/utils/haptics';

type Section = 'rooms' | 'directions';

export default function GuideScreen() {
  const { t } = useTranslation('vastu');
  const { tr } = useLang();
  const navigation = useNavigation<NativeStackNavigationProp<VastuStackParamList>>();
  const [section, setSection] = useState<Section>('rooms');
  const bottomInset = useBottomInset();

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingBottom: bottomInset }]}>
      <Segmented
        value={section}
        onChange={setSection}
        options={[
          { value: 'rooms', label: t('guide.rooms') },
          { value: 'directions', label: t('guide.directions') },
        ]}
      />

      {section === 'rooms'
        ? ROOMS.map((room) => (
            <Pressable
              key={room.id}
              accessibilityRole="button"
              onPress={() => {
                hapticTap();
                navigation.navigate('RoomDetail', { roomId: room.id });
              }}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <Card style={styles.roomCard}>
                <IconBadge icon={room.icon} size={42} color={colors.primary} bg={colors.primaryBg} />
                <View style={styles.flex}>
                  <AppText bold>{tr(room.name)}</AppText>
                  <AppText size={13} color={colors.muted}>
                    {room.ideal
                      .slice(0, 3)
                      .map((z) => tr(ZONE_BY_ID[z].name))
                      .join(' · ')}
                  </AppText>
                </View>
                {room.weight === 2 ? <Chip label={t('guide.critical')} color={colors.primary} style={styles.noMargin} /> : null}
                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.muted} />
              </Card>
            </Pressable>
          ))
        : DIRECTION_INFO.map((d) => (
            <Card key={d.id} style={styles.dirCard}>
              <AppText bold size={18} color={colors.primaryDark}>
                {tr(ZONE_BY_ID[d.id].name)}
              </AppText>
              <Chip label={t('guide.element', { value: tr(d.element) })} color={colors.primary} />
              <AppText size={14}>{tr(d.about)}</AppText>
            </Card>
          ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, gap: spacing.md, backgroundColor: colors.bg },
  flex: { flex: 1 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.985 }] },
  roomCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 2 },
  dirCard: { gap: spacing.xs, alignItems: 'flex-start' },
  noMargin: { marginRight: 0, marginBottom: 0 },
});
