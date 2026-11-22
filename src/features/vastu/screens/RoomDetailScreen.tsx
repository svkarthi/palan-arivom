import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import ZoneMap from '../components/ZoneMap';
import { AppText, Button, Card, Chip, IconBadge, useBottomInset } from '@core/components/ui';
import { ROOM_BY_ID } from '../data/rooms';
import { ZONE_BY_ID, type ZoneId } from '../data/zones';
import { useLang } from '@core/hooks/useLang';
import type { VastuStackParamList } from '../navigation/types';
import { useAppSelector } from '@core/store/hooks';
import { colors, spacing } from '@core/theme';
import { speak, stopSpeaking } from '@core/utils/speech';

type Props = NativeStackScreenProps<VastuStackParamList, 'RoomDetail'>;

const IDEAL_FILL = 'rgba(46,125,50,0.55)';
const OK_FILL = 'rgba(183,121,31,0.5)';
const AVOID_FILL = 'rgba(198,40,40,0.5)';

export default function RoomDetailScreen({ route }: Props) {
  const { t } = useTranslation('vastu');
  const { lang, tr } = useLang();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const room = ROOM_BY_ID[route.params.roomId];
  const voice = useAppSelector((s) => s.settings.voice);
  const [speaking, setSpeaking] = useState(false);
  const bottomInset = useBottomInset();

  useEffect(() => {
    navigation.setOptions({ title: tr(room.name) });
    return () => stopSpeaking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, room.id]);

  const fills = useMemo(() => {
    const map: Partial<Record<ZoneId, string>> = {};
    room.avoid.forEach((z) => (map[z] = AVOID_FILL));
    room.acceptable.forEach((z) => (map[z] = OK_FILL));
    room.ideal.forEach((z) => (map[z] = IDEAL_FILL));
    return map;
  }, [room]);

  const read = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    const ideal = room.ideal.map((z) => tr(ZONE_BY_ID[z].name)).join(', ');
    speak(`${tr(room.name)}. ${t('guide.ideal')}: ${ideal}. ${tr(room.why)} ${tr(room.remedy)}`, lang, () =>
      setSpeaking(false),
    );
    setSpeaking(true);
  };

  const zoneChips = (zones: ZoneId[], color: string) => (
    <View style={styles.chips}>
      {zones.map((z) => (
        <Chip key={z} label={tr(ZONE_BY_ID[z].name)} color={color} />
      ))}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingBottom: bottomInset }]}>
      <View style={styles.center}>
        <IconBadge icon={room.icon} size={62} color={colors.primaryDark} bg={colors.primaryBg} />
        <AppText bold size={22} color={colors.primaryDark} center>
          {tr(room.name)}
        </AppText>
      </View>

      <View style={styles.center}>
        <ZoneMap
          size={Math.min(width - spacing.md * 2, 300)}
          mode="16"
          lang={lang}
          fills={fills}
        />
      </View>

      <Card>
        <AppText bold color={colors.good}>
          {t('guide.ideal')}
        </AppText>
        {zoneChips(room.ideal, colors.good)}
        {room.acceptable.length > 0 ? (
          <>
            <AppText bold color={colors.ok}>
              {t('guide.acceptable')}
            </AppText>
            {zoneChips(room.acceptable, colors.ok)}
          </>
        ) : null}
        <AppText bold color={colors.bad}>
          {t('guide.avoid')}
        </AppText>
        {zoneChips(room.avoid, colors.bad)}
      </Card>

      <Card>
        <AppText bold>{t('guide.why')}</AppText>
        <AppText>{tr(room.why)}</AppText>
      </Card>
      <Card>
        <AppText bold>{t('guide.remedy')}</AppText>
        <AppText>{tr(room.remedy)}</AppText>
      </Card>

      {voice ? (
        <Button title={speaking ? t('guide.stop') : t('guide.readAloud')} variant="outline" onPress={read} />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, gap: spacing.md, backgroundColor: colors.bg },
  center: { alignItems: 'center', gap: spacing.xs },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: spacing.xs },
});
