import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NAKSHATRAS, RASHIS } from '@core/astro/names';
import BottomSheet from '@core/components/BottomSheet';
import ScoreRing from '@core/components/ScoreRing';
import { AppText, Button, Card, Chip, IconBadge, SectionHeader, useBottomInset, type IconName } from '@core/components/ui';
import { useLang } from '@core/hooks/useLang';
import { colors, spacing } from '@core/theme';
import { hapticTap } from '@core/utils/haptics';
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
  icon,
  tint,
  tintBg,
  nakshatra,
  rashi,
  onSelectNakshatra,
  onSelectRashi,
}: {
  title: string;
  icon: IconName;
  tint: string;
  tintBg: string;
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
    <>
      <Card style={styles.gap}>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            hapticTap();
            setOpen(true);
          }}
          style={({ pressed }) => [styles.row, pressed && { opacity: 0.78 }]}
        >
          <IconBadge icon={icon} color={tint} bg={tintBg} size={42} />
          <View style={styles.flex}>
            <AppText bold color={colors.primaryDark}>
              {title}
            </AppText>
            <AppText size={13} color={colors.muted}>
              {tr(NAKSHATRAS[nakshatra])} · {tr(RASHIS[rashi])}
            </AppText>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color={tint} />
        </Pressable>

        {possibleRashis.length > 1 ? (
          <View style={styles.rashiRow}>
            <AppText size={11} bold color={colors.muted}>
              {t('rashi')}:
            </AppText>
            <View style={styles.wrap}>
              {possibleRashis.map((r) => (
                <Pressable
                  key={r}
                  accessibilityRole="button"
                  accessibilityState={{ selected: rashi === r }}
                  onPress={() => {
                    hapticTap();
                    onSelectRashi(r);
                  }}
                >
                  <Chip
                    label={tr(RASHIS[r])}
                    color={rashi === r ? tint : colors.neutral}
                    style={rashi === r ? { backgroundColor: tint, borderColor: tint } : undefined}
                    textStyle={rashi === r ? styles.chipOnText : undefined}
                  />
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}
      </Card>

      <BottomSheet
        visible={open}
        title={`${title} — ${t('chooseStar')}`}
        onClose={() => setOpen(false)}
        maxHeight="78%"
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetGrid}>
          {NAKSHATRAS.map((n, i) => {
            const active = nakshatra === i;
            return (
              <Pressable
                key={i}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => {
                  hapticTap();
                  onSelectNakshatra(i);
                  onSelectRashi(defaultRashiForNakshatra(i));
                  setOpen(false);
                }}
                style={({ pressed }) => [
                  styles.starCell,
                  active && { backgroundColor: tint, borderColor: tint },
                  pressed && !active && { opacity: 0.72 },
                ]}
              >
                <AppText size={13} bold={active} color={active ? '#fff' : colors.text} center numberOfLines={1}>
                  {tr(n)}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>
        <Button title={t('common.cancel', { ns: 'translation' })} variant="outline" onPress={() => setOpen(false)} />
      </BottomSheet>
    </>
  );
}

export default function PoruthamScreen() {
  const { t } = useTranslation('porutham');
  const { tr } = useLang();
  const bottomInset = useBottomInset();
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
    <ScrollView contentContainerStyle={[styles.container, { paddingBottom: bottomInset }]}>
      <AppText size={13} color={colors.muted}>
        {t('subtitle')}
      </AppText>

      <PersonPicker
        title={t('bride')}
        icon="face-woman"
        tint="#AD1457"
        tintBg="#FCE4EC"
        nakshatra={brideNak}
        rashi={brideRashi}
        onSelectNakshatra={setBrideNak}
        onSelectRashi={setBrideRashi}
      />
      <PersonPicker
        title={t('groom')}
        icon="face-man"
        tint="#1565C0"
        tintBg="#E3F2FD"
        nakshatra={groomNak}
        rashi={groomRashi}
        onSelectNakshatra={setGroomNak}
        onSelectRashi={setGroomRashi}
      />

      <Card style={[styles.center, { borderColor: verdictColor, borderWidth: 1.5, backgroundColor: verdictColor + '0D' }]}>
        <ScoreRing score={result.score} max={10} size={126} color={verdictColor} label={`${result.score}/10`} />
        <AppText bold size={16} color={verdictColor} center>
          {t('score', { score: result.score })}
        </AppText>
        <View style={styles.segmentBar}>
          {result.items.map((item) => (
            <View
              key={item.id}
              style={[styles.segmentTick, { backgroundColor: STATUS_COLOR[item.status] }]}
            />
          ))}
        </View>
        <AppText bold size={13} color={verdictColor} center>
          {t(`verdict.${result.verdict}`)}
        </AppText>
        <Button
          title={t('common.share', { ns: 'translation' })}
          icon="share-variant-outline"
          variant="outline"
          onPress={shareResult}
        />
      </Card>

      <SectionHeader icon="format-list-checks" title={t('breakdown')} color="#AD1457" bg="#FCE4EC" />
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
  rashiRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingTop: 2 },
  flex: { flex: 1 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', flex: 1 },
  chipOnText: { color: '#fff' },
  noMargin: { marginRight: 0, marginBottom: 0 },
  sheetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingBottom: spacing.xs },
  starCell: {
    width: '31%',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segmentBar: {
    flexDirection: 'row',
    gap: 4,
    width: '100%',
    paddingHorizontal: spacing.sm,
  },
  segmentTick: { flex: 1, height: 7, borderRadius: 4 },
});
