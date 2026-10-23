import { useNavigation } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import ScoreRing from '../components/ScoreRing';
import { AppText, Button, Card, Chip } from '@core/components/ui';
import { ROOM_BY_ID } from '../data/rooms';
import { ZONE_BY_ID } from '../data/zones';
import { useLang } from '@core/hooks/useLang';
import { useAppSelector } from '@core/store/hooks';
import { colors, spacing } from '@core/theme';
import { buildReportHtml } from '../utils/reportHtml';
import { analyse, gradeFor, type Verdict } from '../utils/scoring';

const VERDICT_COLOR: Record<Verdict, string> = {
  ideal: colors.good,
  acceptable: colors.ok,
  neutral: colors.neutral,
  avoid: colors.bad,
};

export default function ReportScreen() {
  const { t } = useTranslation('vastu');
  const { lang, tr } = useLang();
  const navigation = useNavigation();
  const placements = useAppSelector((s) => s.plan.placements);
  const analysis = useMemo(() => analyse(placements), [placements]);
  const [busy, setBusy] = useState(false);

  const exportPdf = async () => {
    setBusy(true);
    try {
      const html = buildReportHtml(analysis, lang, new Date().toLocaleDateString());
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'application/pdf' });
      else Alert.alert(t('report.exportFailed'));
    } catch {
      Alert.alert(t('report.exportFailed'));
    } finally {
      setBusy(false);
    }
  };

  if (analysis.score === null) {
    return (
      <View style={[styles.container, styles.empty]}>
        <AppText center color={colors.muted}>
          {t('report.noData')}
        </AppText>
        <Button title={t('report.goToPlan')} onPress={() => navigation.navigate('Plan' as never)} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.scoreCard}>
        <ScoreRing score={analysis.score} />
        <AppText bold size={20} color={colors.primaryDark}>
          {t(`report.grade.${gradeFor(analysis.score)}`)}
        </AppText>
      </Card>

      <AppText bold size={17}>
        {t('report.findings')}
      </AppText>
      {analysis.findings.map((f) => {
        const room = ROOM_BY_ID[f.roomId];
        const color = VERDICT_COLOR[f.verdict];
        return (
          <Card key={f.roomId} style={styles.finding}>
            <View style={styles.findingHead}>
              <AppText size={26}>{room.icon}</AppText>
              <View style={styles.flex}>
                <AppText bold>{tr(room.name)}</AppText>
                <AppText size={13} color={colors.muted}>
                  {t('report.placedIn', { zone: tr(ZONE_BY_ID[f.zone].name) })}
                </AppText>
              </View>
              <Chip label={t(`report.verdict.${f.verdict}`)} color={color} />
            </View>
            {f.verdict === 'avoid' || f.verdict === 'neutral' ? (
              <AppText size={14} color={colors.muted}>
                {tr(room.remedy)}
              </AppText>
            ) : null}
          </Card>
        );
      })}

      {analysis.unplaced.length > 0 ? (
        <>
          <AppText bold size={17}>
            {t('report.unplaced')}
          </AppText>
          <View style={styles.wrap}>
            {analysis.unplaced.map((id) => (
              <Chip key={id} label={`${ROOM_BY_ID[id].icon} ${tr(ROOM_BY_ID[id].name)}`} color={colors.neutral} />
            ))}
          </View>
        </>
      ) : null}

      <Button title={busy ? t('report.exporting') : t('report.exportPdf')} onPress={exportPdf} disabled={busy} />
      <AppText size={12} color={colors.muted}>
        {t('report.disclaimer')}
      </AppText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, gap: spacing.md, backgroundColor: colors.bg, flexGrow: 1 },
  empty: { justifyContent: 'center', alignItems: 'stretch' },
  scoreCard: { alignItems: 'center', gap: spacing.sm },
  finding: { gap: spacing.sm },
  findingHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  flex: { flex: 1 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
});
