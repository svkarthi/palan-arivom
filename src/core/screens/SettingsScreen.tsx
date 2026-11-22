import Constants from 'expo-constants';
import { Alert, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText, Button, Card, Segmented } from '../components/ui';
import { usePlace } from '../hooks/usePlace';
import type { Lang } from '../i18n';
import { resetAll } from '../store/actions';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setLanguage, setReminders, setVoice } from '../store/settingsSlice';
import { colors, spacing } from '../theme';
import { syncReminders } from '../utils/reminders';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const place = usePlace();
  const { language, voice, reminders } = useAppSelector((s) => s.settings);
  const birthRashi = useAppSelector((s) => s.profile.birthRashi);

  const toggleReminders = async (v: boolean) => {
    try {
      const ok = await syncReminders(v, place, birthRashi, language);
      if (ok) dispatch(setReminders(v));
      else Alert.alert(t('settings.remindersDenied'));
    } catch {
      Alert.alert(t('settings.remindersDenied'));
    }
  };

  const confirmReset = () =>
    Alert.alert(t('settings.resetConfirm'), undefined, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => dispatch(resetAll()) },
    ]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.gap}>
        <AppText bold>{t('settings.language')}</AppText>
        <Segmented<Lang>
          value={language}
          onChange={(l) => dispatch(setLanguage(l))}
          options={[
            { value: 'ta', label: t('settings.tamil') },
            { value: 'en', label: t('settings.english') },
          ]}
        />
      </Card>

      <Card style={styles.gap}>
        <View style={styles.row}>
          <AppText bold style={styles.flex}>
            {t('settings.voice')}
          </AppText>
          <Switch
            value={voice}
            onValueChange={(v) => {
              dispatch(setVoice(v));
            }}
            trackColor={{ true: colors.primary }}
          />
        </View>
        <AppText size={12} color={colors.muted}>
          {t('settings.voiceHint')}
        </AppText>
      </Card>

      <Card style={styles.gap}>
        <View style={styles.row}>
          <AppText bold style={styles.flex}>
            {t('settings.reminders')}
          </AppText>
          <Switch
            value={Boolean(reminders)}
            onValueChange={toggleReminders}
            trackColor={{ true: colors.primary }}
          />
        </View>
        <AppText size={12} color={colors.muted}>
          {t('settings.remindersHint')}
        </AppText>
      </Card>

      <Card style={styles.gap}>
        <AppText bold>{t('settings.about')}</AppText>
        <AppText size={14}>{t('settings.aboutText')}</AppText>
        <AppText size={12} color={colors.muted}>
          {t('settings.version', { value: Constants.expoConfig?.version ?? '1.0.0' })}
        </AppText>
      </Card>

      <Button title={t('settings.resetData')} variant="danger" onPress={confirmReset} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, gap: spacing.md, backgroundColor: colors.bg },
  gap: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  flex: { flex: 1 },
});
