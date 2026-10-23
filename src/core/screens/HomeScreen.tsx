import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { FEATURES } from '../../features/registry';
import { AppText, Card, Chip } from '../components/ui';
import { useLang } from '../hooks/useLang';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { tr } = useLang();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AppText color={colors.muted}>{t('home.subtitle')}</AppText>
      <View style={styles.grid}>
        {FEATURES.map((f) => {
          const route = f.route;
          return (
            <Pressable
              key={f.id}
              accessibilityRole="button"
              accessibilityState={{ disabled: route === null }}
              disabled={route === null}
              onPress={() => route && navigation.navigate(route)}
              style={styles.cell}
            >
              <Card style={[styles.tile, route === null && styles.disabled]}>
                <AppText size={40}>{f.icon}</AppText>
                <AppText bold size={18} color={colors.primaryDark} center>
                  {tr(f.title)}
                </AppText>
                <AppText size={12} color={colors.muted} center>
                  {tr(f.description)}
                </AppText>
                {route === null ? <Chip label={t('home.comingSoon')} color={colors.neutral} /> : null}
              </Card>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, gap: spacing.md, backgroundColor: colors.bg, flexGrow: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -spacing.xs },
  cell: { width: '50%', padding: spacing.xs },
  tile: { alignItems: 'center', gap: spacing.xs, minHeight: 190, justifyContent: 'center' },
  disabled: { opacity: 0.6 },
});
