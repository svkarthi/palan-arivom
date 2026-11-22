import { MaterialCommunityIcons } from '@expo/vector-icons';
import { toLocal } from '@core/astro/time';
import { AppText, Button, Card, Chip, useBottomInset } from '@core/components/ui';
import { useLang } from '@core/hooks/useLang';
import { useNow } from '@core/hooks/useNow';
import { usePlace } from '@core/hooks/usePlace';
import { useAppDispatch, useAppSelector } from '@core/store/hooks';
import { colors, fonts, spacing } from '@core/theme';
import { hapticSuccess, hapticTap } from '@core/utils/haptics';
import { speak, stopSpeaking } from '@core/utils/speech';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
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
  toggleShowMeaning,
} from '../store/padhigamSlice';

type Props = NativeStackScreenProps<PadhigamStackParamList, 'PadhigamReader'>;

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
  const completedByDate = useAppSelector((s) => s.padhigam.completedByDate);

  const todayKey = dateKeyOf(toLocal(now, place.utcOffsetMin).date);
  const isFav = padhigam ? favorites.includes(padhigam.id) : false;
  const isRecitedToday = padhigam ? (completedByDate[todayKey] ?? []).includes(padhigam.id) : false;

  /** Index of the verse currently being spoken (`-1` when silent). */
  const [speakingIndex, setSpeakingIndex] = useState<number>(-1);
  const speakTokenRef = useRef(0);

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
  const verseLineHeight = Math.round(fontSize * 1.78);
  const invocationText = tr(TRADITION_BY_ID[padhigam.tradition].invocation);

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

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingBottom: bottomInset }]}>
      {/* Relief & Scriptural Origin Header */}
      <Card variant="hero" style={styles.heroCard}>
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
      </Card>

      {/* How to Recite Guidance */}
      <Card variant="tinted" style={styles.guideCard}>
        <View style={styles.guideTitleRow}>
          <MaterialCommunityIcons name="book-open-variant" size={16} color={colors.primaryDark} />
          <AppText bold size={13} color={colors.primaryDark}>
            {t('reader.howToRecite')}
          </AppText>
        </View>
        <AppText size={13} color={colors.text}>
          {tr(padhigam.howToRecite)}
        </AppText>
        <View style={styles.chipWrap}>
          {padhigam.categories.map((catId) => {
            const meta = CATEGORY_BY_ID[catId];
            return <Chip key={catId} label={tr(meta.label)} color={meta.color} />;
          })}
        </View>
      </Card>

      {/* Reader Toolbar: Font size, Meaning, Listen, Bookmark, Share */}
      <Card style={styles.toolbar}>
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
              fontSize <= MIN_PADHIGAM_FONT && styles.toolDisabled,
              pressed && { opacity: 0.7 },
            ]}
          >
            <AppText bold size={13} color={colors.primaryDark}>
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
              fontSize >= MAX_PADHIGAM_FONT && styles.toolDisabled,
              pressed && { opacity: 0.7 },
            ]}
          >
            <AppText bold size={14} color={colors.primaryDark}>
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
            showMeaning && styles.toolBtnActive,
            pressed && { opacity: 0.75 },
          ]}
        >
          <MaterialCommunityIcons
            name="text-box-outline"
            size={15}
            color={showMeaning ? colors.heroText : colors.primaryDark}
          />
          <AppText bold size={12} color={showMeaning ? colors.heroText : colors.primaryDark}>
            {t('reader.meaningToggle')}
          </AppText>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={togglePlayAll}
          style={({ pressed }) => [
            styles.toolBtn,
            isSpeaking && styles.toolBtnActive,
            pressed && { opacity: 0.75 },
          ]}
        >
          <MaterialCommunityIcons
            name={isSpeaking ? 'stop-circle-outline' : 'volume-high'}
            size={16}
            color={isSpeaking ? colors.heroText : colors.primaryDark}
          />
          <AppText bold size={12} color={isSpeaking ? colors.heroText : colors.primaryDark}>
            {isSpeaking ? t('reader.stopListening') : t('reader.listenAll')}
          </AppText>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isFav ? t('reader.bookmarkRemove') : t('reader.bookmarkAdd')}
          onPress={() => {
            hapticTap();
            dispatch(toggleFavorite(padhigam.id));
          }}
          style={({ pressed }) => [styles.iconOnlyBtn, pressed && { opacity: 0.7 }]}
        >
          <MaterialCommunityIcons
            name={isFav ? 'heart' : 'heart-outline'}
            size={19}
            color={isFav ? '#AD1457' : colors.primaryDark}
          />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.share', { ns: 'translation' })}
          onPress={sharePadhigam}
          style={({ pressed }) => [styles.iconOnlyBtn, pressed && { opacity: 0.7 }]}
        >
          <MaterialCommunityIcons name="share-variant-outline" size={18} color={colors.primaryDark} />
        </Pressable>
      </Card>

      {/* Sacred Opening Invocation */}
      <AppText bold size={14} color={colors.primaryDark} center>
        {invocationText}
      </AppText>

      {/* Classical Tamil Verses */}
      {padhigam.verses.map((verse, idx) => {
        const activeAudio = speakingIndex === idx;
        const badgeText = hasSections
          ? t('reader.stanzaLabel', { number: verse.number, total: padhigam.verses.length })
          : t('reader.verseLabel', { number: verse.number, total: padhigam.verses.length });

        return (
          <Card key={verse.number} style={[styles.verseCard, activeAudio && styles.verseCardSpeaking]}>
            <View style={styles.verseHeader}>
              <View style={styles.verseBadge}>
                <AppText size={11} bold color={colors.primaryDark}>
                  {badgeText}
                </AppText>
              </View>
              {verse.label ? (
                <AppText size={12} bold color={colors.primary} style={styles.flex} numberOfLines={2}>
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
                  color={activeAudio ? colors.primary : colors.muted}
                />
              </Pressable>
            </View>

            <View style={styles.linesBlock}>
              {verse.linesTa.map((line, lIdx) => (
                <Text
                  key={lIdx}
                  style={[
                    styles.verseLine,
                    { fontSize, lineHeight: verseLineHeight },
                  ]}
                >
                  {line}
                </Text>
              ))}
            </View>

            {showMeaning && verse.meaning ? (
              <View style={styles.meaningBox}>
                <AppText size={11} bold color={colors.primaryDark}>
                  {t('reader.meaningHeading')}
                </AppText>
                <AppText size={13} color={colors.text}>
                  {tr(verse.meaning)}
                </AppText>
              </View>
            ) : null}
          </Card>
        );
      })}

      {/* Sacred Closing Invocation */}
      <AppText bold size={14} color={colors.primaryDark} center>
        {invocationText}
      </AppText>

      {/* Daily Parayanam Check-in */}
      <Card style={[styles.checkinCard, isRecitedToday && styles.checkinCardDone]}>
        <Button
          title={isRecitedToday ? t('reader.recitedDone') : t('reader.markRecited')}
          icon={isRecitedToday ? 'check-circle-outline' : 'check-circle'}
          variant={isRecitedToday ? 'outline' : 'primary'}
          onPress={onToggleRecited}
        />
        {isRecitedToday ? (
          <AppText size={11} color={colors.good} center>
            {t('reader.recitedHint')}
          </AppText>
        ) : null}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, gap: spacing.md, backgroundColor: colors.bg, flexGrow: 1 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, backgroundColor: colors.bg },
  flex: { flex: 1 },
  heroCard: { gap: 6 },
  heroSummary: {
    backgroundColor: colors.heroSurface,
    borderRadius: 10,
    padding: 10,
    marginTop: 4,
  },
  guideCard: { gap: 6 },
  guideTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 2 },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  toolGroup: { flexDirection: 'row', gap: 6 },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toolBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  toolDisabled: { opacity: 0.4 },
  iconOnlyBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verseCard: { gap: spacing.sm + 2 },
  verseCardSpeaking: { borderColor: colors.primary, borderWidth: 1.5, backgroundColor: '#FFFDF8' },
  verseHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  verseBadge: {
    backgroundColor: colors.primaryBg,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  verseAudioBtn: { padding: 4 },
  linesBlock: { gap: 4 },
  verseLine: {
    fontFamily: fonts.regular,
    color: colors.text,
  },
  meaningBox: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    gap: 4,
    backgroundColor: colors.bg,
    borderRadius: 10,
    padding: 10,
  },
  checkinCard: { gap: 6 },
  checkinCardDone: { borderColor: colors.good, backgroundColor: colors.goodBg },
});
