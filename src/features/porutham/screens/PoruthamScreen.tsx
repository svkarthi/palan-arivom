import { NAKSHATRAS, RASHIS } from '@core/astro/names';
import { AppText, Button, Card, Chip } from '@core/components/ui';
import { useLang } from '@core/hooks/useLang';
import { colors, spacing } from '@core/theme';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  defaultRashiForNakshatra,
  evaluatePorutham,
  PORUTHAM_NAMES,
  rashisForNakshatra,
  type MatchStatus,
} from '../logic';

const STATUS_COLOR: Record<MatchStatus, string> = {
  good: colors.good,
  moderate: colors.ok,
  bad: colors.bad,
};

function PersonPicker({
  title,
  nakshatra,
  rashi,
  onSelectNakshatra,
  onSelectRashi,
}: {
  title: string;
  nakshatra: number;
  rashi: number;
  onSelectNakshatra: (n: number) => void;
  onSelectRashi: (r: number) => void;
}) {
  const { t } = useTranslation('porutham');
  const { tr } = useLang();
  const [open, setOpen] = useState(false);
  const possibleRashis = rashisForNakshatra(nakshatra);

  return (
    <Card style={styles.gap}>
      <View style={styles.row}>
        <View style={styles.flex}>
          <AppText bold color={colors.primaryDark}>
            {title}
          </AppText>
          <AppText size={13} color={colors.muted}>
            {tr(NAKSHATRAS[nakshatra])} · {tr(RASHIS[rashi])}
          </AppText>
        </View>
        <Button
          title={open ? '▴' : '▾'}
          variant="outline"
          onPress={() => setOpen((v) => !v)}
        />
      </View>
      {possibleRashis.length > 1 ? (
        <View style={styles.wrap}>
          {possibleRashis.map((r) => (
            <Pressable
              key={r}
              accessibilityRole="button"
              accessibilityState={{ selected: rashi === r }}
              onPress={() => onSelectRashi(r)}
            >
              <Chip
                label={tr(RASHIS[r])}
                color={rashi === r ? colors.primary : colors.neutral}
                style={rashi === r ? styles.chipOn : undefined}
                textStyle={rashi === r ? styles.chipOnText : undefined}
              />
            </Pressable>
          ))}
        </View>
      ) : null}
      {open ? (
        <>
          <AppText bold size={13}>
            {t('nakshatra')}
          </AppText>
          <View style={styles.wrap}>
            {NAKSHATRAS.map((n, i) => (
              <Pressable
                key={i}
                accessibilityRole="button"
                accessibilityState={{ selected: nakshatra === i }}
                onPress={() => {
                  onSelectNakshatra(i);
                  onSelectRashi(defaultRashiForNakshatra(i));
                  setOpen(false);
                }}
              >
                <Chip
                  label={tr(n)}
                  color={nakshatra === i ? colors.primary : colors.neutral}
                  style={nakshatra === i ? styles.chipOn : undefined}
                  textStyle={nakshatra === i ? styles.chipOnText : undefined}
                />
              </Pressable>
            ))}
          </View>
        </>
      ) : null}
    </Card>
  );
}

export default function PoruthamScreen() {
  const { t } = useTranslation('porutham');
  const { tr } = useLang();
  const [brideNak, setBrideNak] = useState(3); // Rohini
  const [brideRashi, setBrideRashi] = useState(1); // Rishabha
  const [groomNak, setGroomNak] = useState(20); // Uthiradam
  const [groomRashi, setGroomRashi] = useState(9); // Makara

  const result = useMemo(
    () => evaluatePorutham(brideNak, brideRashi, groomNak, groomRashi),
    [brideNak, brideRashi, groomNak, groomRashi],
  );

  const verdictColor =
    result.verdict === 'excellent' || result.verdict === 'good'
      ? colors.good
      : result.verdict === 'caution'
        ? colors.ok
        : colors.bad;

  const shareResult = () => {
    const lines = [
      `💍 ${t('title')}`,
      `${t('bride')}: ${tr(NAKSHATRAS[brideNak])} (${tr(RASHIS[brideRashi])})`,
      `${t('groom')}: ${tr(NAKSHATRAS[groomNak])} (${tr(RASHIS[groomRashi])})`,
      `✨ ${t('score', { score: result.score })} — ${t(`verdict.${result.verdict}`)}`,
      '',
      ...result.items.map(
        (i) => `${i.status === 'good' ? '✅' : i.status === 'moderate' ? '⚠️' : '❌'} ${tr(PORUTHAM_NAMES[i.id])}: ${t(`status.${i.status}`)}`,
      ),
    ];
    void Share.share({ message: lines.join('\n') });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AppText size={13} color={colors.muted}>
        {t('subtitle')}
      </AppText>

      <PersonPicker
        title={`👰 ${t('bride')}`}
        nakshatra={brideNak}
        rashi={brideRashi}
        onSelectNakshatra={setBrideNak}
        onSelectRashi={setBrideRashi}
      />
      <PersonPicker
        title={`🤵 ${t('groom')}`}
        nakshatra={groomNak}
        rashi={groomRashi}
        onSelectNakshatra={setGroomNak}
        onSelectRashi={setGroomRashi}
      />

      <Card style={[styles.center, { borderColor: verdictColor, borderWidth: 2 }]}>
        <AppText bold size={26} color={verdictColor} center>
          {t('score', { score: result.score })}
        </AppText>
        <AppText bold size={15} color={verdictColor} center>
          {t(`verdict.${result.verdict}`)}
        </AppText>
        <Button
          title={`📤 ${t('common.share', { ns: 'translation' })}`}
          variant="outline"
          onPress={shareResult}
        />
      </Card>

      <AppText bold size={17}>
        {t('breakdown')}
      </AppText>
      <Card style={styles.gap}>
        {result.items.map((item) => {
          const color = STATUS_COLOR[item.status];
          return (
            <View key={item.id} style={styles.row}>
              <AppText bold style={styles.flex}>
                {tr(PORUTHAM_NAMES[item.id])}
                {item.critical ? ` ★` : ''}
              </AppText>
              <Chip label={t(`status.${item.status}`)} color={color} style={styles.noMargin} />
            </View>
          );
        })}
      </Card>

      <AppText size={12} color={colors.muted}>
        {t('note')}
      </AppText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, gap: spacing.md, backgroundColor: colors.bg },
  center: { alignItems: 'center', gap: spacing.sm },
  gap: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  flex: { flex: 1 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  chipOn: { backgroundColor: colors.primary },
  chipOnText: { color: '#fff' },
  noMargin: { marginRight: 0, marginBottom: 0 },
});
