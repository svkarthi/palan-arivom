import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { toLocal } from '@core/astro/time';
import { AppText, Button, Card, Chip, useBottomInset } from '@core/components/ui';
import { useLang } from '@core/hooks/useLang';
import { useNow } from '@core/hooks/useNow';
import { usePlace } from '@core/hooks/usePlace';
import { useAppDispatch, useAppSelector } from '@core/store/hooks';
import { colors, fonts, shadows, spacing } from '@core/theme';
import { hapticSuccess, hapticTap } from '@core/utils/haptics';
import { speak, stopSpeaking } from '@core/utils/speech';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { type ComponentRef, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { CATEGORY_BY_ID, TRADITION_BY_ID } from '../data/categories';
import { dateKeyOf, PADHIGAM_BY_ID } from '../data';
import type { PadhigamStackParamList } from '../navigation/types';
import {
  MAX_PADHIGAM_FONT,
  MIN_PADHIGAM_FONT,
  stepFontSize,
  toggleCompletedOnDate,
  toggleFavorite,
  toggleNightMode,
  toggleShowMeaning,
} from '../store/padhigamSlice';

type Props = NativeStackScreenProps<PadhigamStackParamList, 'PadhigamReader'>;

const NIGHT = {
  bg: '#1A1410',
  surface: '#241C16',
  card: '#261E18',
  border: '#3D3026',
  text: '#F5E9D6',
  muted: '#B8A692',
  accent: '#F5C469',
  accentBg: '#3A2A1E',
  speakingBg: '#2F241B',
  doneBg: '#1D3320',
};

export default function PadhigamReaderScreen({ route, navigation }: Props) {
  const { t } = useTranslation('padhigam');
  const { tr } = useLang();
  const dispatch = useAppDispatch();
  const place = usePlace();
  const now = useNow();
  const bottomInset = useBottomInset();

  const padhigam = PADHIGAM_BY_ID[route.params.padhigamId];
  const favorites = useAppSelector((s) => s.padhigam.favorites);
  const fontSize = useAppSelector((s) => s.padhigam.fontSize);
  const showMeaning = useAppSelector((s) => s.padhigam.showMeaning);
  const nightMode = useAppSelector((s) => s.padhigam.nightMode) ?? false;
  const completedByDate = useAppSelector((s) => s.padhigam.completedByDate);

  const todayKey = dateKeyOf(toLocal(now, place.utcOffsetMin).date);
  const isFav = padhigam ? favorites.includes(padhigam.id) : false;
  const isRecitedToday = padhigam ? (completedByDate[todayKey] ?? []).includes(padhigam.id) : false;

  /** Index of the verse currently being spoken (`-1` when silent). */
  const [speakingIndex, setSpeakingIndex] = useState<number>(-1);
  const speakTokenRef = useRef(0);
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const verseOffsetsRef = useRef<Record<number, number>>({});

  useLayoutEffect(() => {
    if (padhigam) {
      navigation.setOptions({ title: tr(padhigam.title) });
    }
  }, [navigation, padhigam, tr]);

  const stopAudio = useCallback(() => {
    speakTokenRef.current += 1;
    stopSpeaking();
    setSpeakingIndex(-1);
  }, []);

  useEffect(() => stopAudio, [stopAudio]);

  // Smoothly auto-scroll to the active spoken verse when TTS advances.
  useEffect(() => {
    if (speakingIndex < 0) return;
    const y = verseOffsetsRef.current[speakingIndex];
    if (typeof y === 'number') {
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 16), animated: true });
    }
  }, [speakingIndex]);

  const speakVerseAt = useCallback(
    (index: number, continueChain: boolean) => {
      if (!padhigam || index < 0 || index >= padhigam.verses.length) {
        setSpeakingIndex(-1);
        return;
      }
      const token = ++speakTokenRef.current;
      setSpeakingIndex(index);
      const verseText = padhigam.verses[index].linesTa.join('. ');
      speak(verseText, 'ta', () => {
        if (speakTokenRef.current !== token) return;
        if (continueChain && index + 1 < padhigam.verses.length) {
          speakVerseAt(index + 1, true);
        } else {
          setSpeakingIndex(-1);
        }
      });
    },
    [padhigam],
  );

  if (!padhigam) {
    return (
      <View style={styles.emptyWrap}>
        <AppText size={15} color={colors.muted} center>
          {t('reader.notFound')}
        </AppText>
      </View>
    );
  }

  const hasSections = padhigam.verses.some((v) => Boolean(v.label));
  const isSpeaking = speakingIndex >= 0;
  const verseLineHeight = Math.round(fontSize * 1.82);
  const trdMeta = TRADITION_BY_ID[padhigam.tradition];
  const invocationText = tr(trdMeta.invocation);
  const meaningHeading =
    padhigam.meaningKind === 'summary' ? t('reader.meaningSummaryHeading') : t('reader.meaningHeading');

  const theme = nightMode
    ? {
        bg: NIGHT.bg,
        surface: NIGHT.surface,
        card: NIGHT.card,
        border: NIGHT.border,
        text: NIGHT.text,
        muted: NIGHT.muted,
        accent: NIGHT.accent,
        badgeBg: NIGHT.accentBg,
        speakingBg: NIGHT.speakingBg,
        doneBg: NIGHT.doneBg,
      }
    : {
        bg: colors.bg,
        surface: colors.surface,
        card: colors.card,
        border: colors.border,
        text: colors.text,
        muted: colors.muted,
        accent: trdMeta.color,
        badgeBg: trdMeta.bg,
        speakingBg: '#FFFDF8',
        doneBg: colors.goodBg,
      };

  const togglePlayAll = () => {
    hapticTap();
    if (isSpeaking) stopAudio();
    else speakVerseAt(0, true);
  };

  const togglePlaySingle = (idx: number) => {
    hapticTap();
    if (speakingIndex === idx) stopAudio();
    else speakVerseAt(idx, false);
  };

  const sharePadhigam = () => {
    hapticTap();
    const lines = [
      `🪔 ${tr(padhigam.reliefTitle)}`,
      `${tr(padhigam.title)} — ${tr(padhigam.author)} (${tr(padhigam.source)})`,
      '',
      invocationText,
      '',
      ...padhigam.verses.flatMap((v) => [
        v.label ? `【${tr(v.label)}】` : `${v.number}.`,
        ...v.linesTa,
        '',
      ]),
      invocationText,
    ];
    void Share.share({ message: lines.join('\n') });
  };

  const onToggleRecited = () => {
    if (!isRecitedToday) hapticSuccess();
    else hapticTap();
    dispatch(toggleCompletedOnDate({ dateKey: todayKey, padhigamId: padhigam.id }));
  };

  const activeBadgeLabel =
    speakingIndex >= 0
      ? hasSections
        ? t('reader.stanzaLabel', { number: padhigam.verses[speakingIndex].number, total: padhigam.verses.length })
        : t('reader.verseLabel', { number: padhigam.verses[speakingIndex].number, total: padhigam.verses.length })
      : '';

  return (
    <View style={[styles.screen, { backgroundColor: theme.bg }]}>
      {/* Sticky Top Reading Toolbar — always accessible while scrolling long hymns */}
      <View style={[styles.stickyBar, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <View style={styles.toolGroup}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('reader.fontSmaller')}
            disabled={fontSize <= MIN_PADHIGAM_FONT}
            onPress={() => {
              hapticTap();
              dispatch(stepFontSize(-1));
            }}
            style={({ pressed }) => [
              styles.toolBtn,
              { backgroundColor: theme.surface, borderColor: theme.border },
              fontSize <= MIN_PADHIGAM_FONT && styles.toolDisabled,
              pressed && { opacity: 0.7 },
            ]}
          >
            <AppText bold size={13} color={nightMode ? NIGHT.text : colors.primaryDark}>
              A−
            </AppText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('reader.fontLarger')}
            disabled={fontSize >= MAX_PADHIGAM_FONT}
            onPress={() => {
              hapticTap();
              dispatch(stepFontSize(1));
            }}
            style={({ pressed }) => [
              styles.toolBtn,
              { backgroundColor: theme.surface, borderColor: theme.border },
              fontSize >= MAX_PADHIGAM_FONT && styles.toolDisabled,
              pressed && { opacity: 0.7 },
            ]}
          >
            <AppText bold size={14} color={nightMode ? NIGHT.text : colors.primaryDark}>
              A+
            </AppText>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: showMeaning }}
          onPress={() => {
            hapticTap();
            dispatch(toggleShowMeaning());
          }}
          style={({ pressed }) => [
            styles.toolBtn,
            { backgroundColor: theme.surface, borderColor: theme.border },
            showMeaning && styles.toolBtnActive,
            pressed && { opacity: 0.75 },
          ]}
        >
          <MaterialCommunityIcons
            name="text-box-outline"
            size={15}
            color={showMeaning ? colors.heroText : nightMode ? NIGHT.text : colors.primaryDark}
          />
          <AppText bold size={12} color={showMeaning ? colors.heroText : nightMode ? NIGHT.text : colors.primaryDark}>
            {t('reader.meaningToggle')}
          </AppText>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={togglePlayAll}
          style={({ pressed }) => [
            styles.toolBtn,
            { backgroundColor: theme.surface, borderColor: theme.border },
            isSpeaking && styles.toolBtnActive,
            pressed && { opacity: 0.75 },
          ]}
        >
          <MaterialCommunityIcons
            name={isSpeaking ? 'stop-circle-outline' : 'volume-high'}
            size={16}
            color={isSpeaking ? colors.heroText : nightMode ? NIGHT.text : colors.primaryDark}
          />
          <AppText bold size={12} color={isSpeaking ? colors.heroText : nightMode ? NIGHT.text : colors.primaryDark}>
            {isSpeaking ? t('reader.stopListening') : t('reader.listenAll')}
          </AppText>
        </Pressable>

        <View style={styles.toolGroup}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={nightMode ? t('reader.dayMode') : t('reader.nightMode')}
            accessibilityState={{ selected: nightMode }}
            onPress={() => {
              hapticTap();
              dispatch(toggleNightMode());
            }}
            style={({ pressed }) => [
              styles.iconOnlyBtn,
              { backgroundColor: theme.surface, borderColor: theme.border },
              nightMode && styles.nightBtnActive,
              pressed && { opacity: 0.7 },
            ]}
          >
            <MaterialCommunityIcons
              name={nightMode ? 'white-balance-sunny' : 'weather-night'}
              size={18}
              color={nightMode ? NIGHT.accent : colors.primaryDark}
            />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isFav ? t('reader.bookmarkRemove') : t('reader.bookmarkAdd')}
            onPress={() => {
              hapticTap();
              dispatch(toggleFavorite(padhigam.id));
            }}
            style={({ pressed }) => [
              styles.iconOnlyBtn,
              { backgroundColor: theme.surface, borderColor: theme.border },
              pressed && { opacity: 0.7 },
            ]}
          >
            <MaterialCommunityIcons
              name={isFav ? 'heart' : 'heart-outline'}
              size={18}
              color={isFav ? '#E91E63' : nightMode ? NIGHT.text : colors.primaryDark}
            />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.share', { ns: 'translation' })}
            onPress={sharePadhigam}
            style={({ pressed }) => [
              styles.iconOnlyBtn,
              { backgroundColor: theme.surface, borderColor: theme.border },
              pressed && { opacity: 0.7 },
            ]}
          >
            <MaterialCommunityIcons
              name="share-variant-outline"
              size={17}
              color={nightMode ? NIGHT.text : colors.primaryDark}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.container,
          { backgroundColor: theme.bg, paddingBottom: bottomInset + (isSpeaking ? 72 : 0) },
        ]}
      >
        {/* Relief & Scriptural Origin Header with Deity Accent */}
        <LinearGradient
          colors={trdMeta.heroGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <AppText bold size={17} color={colors.heroText}>
            {tr(padhigam.reliefTitle)}
          </AppText>
          <AppText size={13} bold color={colors.heroAccent}>
            {tr(padhigam.title)} · {tr(padhigam.source)}
          </AppText>
          <AppText size={12} color={colors.heroMuted}>
            {tr(padhigam.author)}
            {padhigam.shrine ? ` · ${t('reader.shrineLabel')}: ${tr(padhigam.shrine)}` : ''}
          </AppText>
          <View style={styles.heroSummary}>
            <AppText size={13} color={colors.heroText}>
              {tr(padhigam.blessingSummary)}
            </AppText>
          </View>
        </LinearGradient>

        {/* How to Recite Guidance */}
        <Card
          variant="tinted"
          style={[styles.guideCard, nightMode && { backgroundColor: theme.surface, borderColor: theme.border }]}
        >
          <View style={styles.guideTitleRow}>
            <MaterialCommunityIcons name="book-open-variant" size={16} color={theme.accent} />
            <AppText bold size={13} color={theme.accent}>
              {t('reader.howToRecite')}
            </AppText>
          </View>
          <AppText size={13} color={theme.text}>
            {tr(padhigam.howToRecite)}
          </AppText>
          <View style={styles.chipWrap}>
            {padhigam.categories.map((catId) => {
              const meta = CATEGORY_BY_ID[catId];
              return <Chip key={catId} label={tr(meta.label)} color={nightMode ? NIGHT.accent : meta.color} />;
            })}
          </View>
        </Card>

        {/* Sacred Opening Invocation */}
        <AppText bold size={14} color={theme.accent} center>
          {invocationText}
        </AppText>

        {/* Classical Tamil Verses */}
        {padhigam.verses.map((verse, idx) => {
          const activeAudio = speakingIndex === idx;
          const badgeText = hasSections
            ? t('reader.stanzaLabel', { number: verse.number, total: padhigam.verses.length })
            : t('reader.verseLabel', { number: verse.number, total: padhigam.verses.length });

          return (
            <View
              key={verse.number}
              onLayout={(e) => {
                verseOffsetsRef.current[idx] = e.nativeEvent.layout.y;
              }}
            >
              <Card
                style={[
                  styles.verseCard,
                  { backgroundColor: theme.card, borderColor: theme.border },
                  activeAudio && { borderColor: theme.accent, borderWidth: 1.5, backgroundColor: theme.speakingBg },
                ]}
              >
                <View style={styles.verseHeader}>
                  <View style={[styles.verseBadge, { backgroundColor: theme.badgeBg }]}>
                    <AppText size={11} bold color={theme.accent}>
                      {badgeText}
                    </AppText>
                  </View>
                  {verse.label ? (
                    <AppText size={12} bold color={theme.accent} style={styles.flex} numberOfLines={2}>
                      {tr(verse.label)}
                    </AppText>
                  ) : (
                    <View style={styles.flex} />
                  )}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('reader.listenVerse')}
                    onPress={() => togglePlaySingle(idx)}
                    hitSlop={10}
                    style={({ pressed }) => [styles.verseAudioBtn, pressed && { opacity: 0.65 }]}
                  >
                    <MaterialCommunityIcons
                      name={activeAudio ? 'stop-circle' : 'volume-high'}
                      size={18}
                      color={activeAudio ? theme.accent : theme.muted}
                    />
                  </Pressable>
                </View>

                <View style={styles.linesBlock}>
                  {verse.linesTa.map((line, lIdx) => (
                    <Text
                      key={lIdx}
                      style={[
                        styles.verseLine,
                        { fontSize, lineHeight: verseLineHeight, color: theme.text },
                      ]}
                    >
                      {line}
                    </Text>
                  ))}
                </View>

                {showMeaning && verse.meaning ? (
                  <View
                    style={[
                      styles.meaningBox,
                      { backgroundColor: theme.surface, borderTopColor: theme.border },
                    ]}
                  >
                    <AppText size={11} bold color={theme.accent}>
                      {meaningHeading}
                    </AppText>
                    <AppText size={13} color={theme.text}>
                      {tr(verse.meaning)}
                    </AppText>
                  </View>
                ) : null}
              </Card>
            </View>
          );
        })}

        {/* Sacred Closing Invocation */}
        <AppText bold size={14} color={theme.accent} center>
          {invocationText}
        </AppText>

        {/* Daily Parayanam Check-in */}
        <Card
          style={[
            styles.checkinCard,
            { backgroundColor: theme.card, borderColor: theme.border },
            isRecitedToday && { borderColor: colors.good, backgroundColor: theme.doneBg },
          ]}
        >
          <Button
            title={isRecitedToday ? t('reader.recitedDone') : t('reader.markRecited')}
            icon={isRecitedToday ? 'check-circle-outline' : 'check-circle'}
            variant={isRecitedToday ? 'outline' : 'primary'}
            onPress={onToggleRecited}
          />
          {isRecitedToday ? (
            <AppText size={11} color={nightMode ? '#A5F3AC' : colors.good} center>
              {t('reader.recitedHint')}
            </AppText>
          ) : null}
        </Card>
      </ScrollView>

      {/* Floating Compact Audio Bar when TTS is speaking */}
      {isSpeaking ? (
        <View style={[styles.audioBar, { bottom: Math.max(bottomInset - 4, 12) }]}>
          <MaterialCommunityIcons name="volume-high" size={18} color={colors.heroAccent} />
          <AppText size={12} bold color={colors.heroText} style={styles.flex} numberOfLines={1}>
            {t('reader.nowPlaying', { label: activeBadgeLabel })}
          </AppText>
          <Pressable
            accessibilityRole="button"
            disabled={speakingIndex <= 0}
            onPress={() => speakVerseAt(speakingIndex - 1, true)}
            hitSlop={8}
            style={[styles.audioCtrl, speakingIndex <= 0 && styles.toolDisabled]}
          >
            <MaterialCommunityIcons name="skip-previous" size={20} color={colors.heroText} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={speakingIndex >= padhigam.verses.length - 1}
            onPress={() => speakVerseAt(speakingIndex + 1, true)}
            hitSlop={8}
            style={[styles.audioCtrl, speakingIndex >= padhigam.verses.length - 1 && styles.toolDisabled]}
          >
            <MaterialCommunityIcons name="skip-next" size={20} color={colors.heroText} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('reader.stopListening')}
            onPress={stopAudio}
            hitSlop={8}
            style={styles.audioStop}
          >
            <MaterialCommunityIcons name="stop" size={18} color={colors.heroBg} />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  stickyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
  },
  container: { padding: spacing.md, gap: spacing.md, flexGrow: 1 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, backgroundColor: colors.bg },
  flex: { flex: 1 },
  heroCard: {
    gap: 6,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(245, 196, 105, 0.35)',
    ...shadows.hero,
  },
  heroSummary: {
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    borderRadius: 10,
    padding: 10,
    marginTop: 4,
  },
  guideCard: { gap: 6 },
  guideTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 2 },
  toolGroup: { flexDirection: 'row', gap: 5 },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  toolBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  nightBtnActive: { backgroundColor: NIGHT.accentBg, borderColor: NIGHT.accent },
  toolDisabled: { opacity: 0.4 },
  iconOnlyBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verseCard: { gap: spacing.sm + 2 },
  verseHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  verseBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  verseAudioBtn: { padding: 4 },
  linesBlock: { gap: 7 },
  verseLine: { fontFamily: fonts.regular },
  meaningBox: {
    borderTopWidth: 1,
    paddingTop: spacing.sm,
    gap: 4,
    borderRadius: 10,
    padding: 10,
  },
  checkinCard: { gap: 6 },
  audioBar: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.heroBg,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(245, 196, 105, 0.4)',
    ...shadows.hero,
  },
  audioCtrl: { padding: 4 },
  audioStop: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.heroAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
