import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText, Card, Chip, Segmented, useBottomInset } from '@core/components/ui';
import { ROOMS } from '../data/rooms';
import { DIRECTION_INFO, ZONE_BY_ID } from '../data/zones';
import { useLang } from '@core/hooks/useLang';
import type { VastuStackParamList } from '../navigation/types';
import { colors, spacing } from '@core/theme';

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
              onPress={() => navigation.navigate('RoomDetail', { roomId: room.id })}
            >
              <Card style={styles.roomCard}>
                <AppText size={30}>{room.icon}</AppText>
                <View style={styles.flex}>
                  <AppText bold>{tr(room.name)}</AppText>
                  <AppText size={13} color={colors.muted}>
                    {room.ideal
                      .slice(0, 3)
                      .map((z) => tr(ZONE_BY_ID[z].name))
                      .join(' · ')}
                  </AppText>
                </View>
                {room.weight === 2 ? <Chip label={t('guide.critical')} color={colors.primary} /> : null}
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
  roomCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  dirCard: { gap: spacing.xs, alignItems: 'flex-start' },
});
