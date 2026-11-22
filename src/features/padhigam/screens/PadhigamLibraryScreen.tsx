import { MaterialCommunityIcons } from '@expo/vector-icons';
import { toLocal } from '@core/astro/time';
import { AppText, Button, Card, Chip, useBottomInset } from '@core/components/ui';
import { useLang } from '@core/hooks/useLang';
import { useNow } from '@core/hooks/useNow';
import { usePlace } from '@core/hooks/usePlace';
import { useAppDispatch, useAppSelector } from '@core/store/hooks';
import { colors, fonts, spacing } from '@core/theme';
import { hapticTap } from '@core/utils/haptics';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { nallaNeramDay } from '../../nalla-neram/logic';
import { CATEGORY_BY_ID, RELIEF_CATEGORIES, SAINTS, TRADITION_BY_ID } from '../data/categories';
import {
  activeTraditions,
  dateKeyOf,
  filterPadhigams,
  PADHIGAMS,
  todayPadhigamRecommendation,
  type FilterCategory,
  type FilterSaint,
  type FilterTradition,
} from '../data';
import type { PadhigamStackParamList } from '../navigation/types';
import { toggleFavorite } from '../store/padhigamSlice';

export default function PadhigamLibraryScreen() {
  const { t } = useTranslation('padhigam');
  const { tr } = useLang();
  const navigation = useNavigation<NativeStackNavigationProp<PadhigamStackParamList>>();
  const dispatch = useAppDispatch();
  const place = usePlace();
  const now = useNow();
  const bottomInset = useBottomInset();

  const basis = useAppSelector((s) => s.profile.dayPartBasis) ?? 'sun';
  const birthRashi = useAppSelector((s) => s.profile.birthRashi);
  const favorites = useAppSelector((s) => s.padhigam.favorites);
  const completedByDate = useAppSelector((s) => s.padhigam.completedByDate);

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<FilterCategory>('all');
  const [tradition, setTradition] = useState<FilterTradition>('all');
  const [saint, setSaint] = useState<FilterSaint>('all');

  const localNow = useMemo(() => toLocal(now, place.utcOffsetMin), [now, place.utcOffsetMin]);
  const { y, m, d } = localNow.date;
  const localHour = Math.floor(localNow.minutes / 60);
  const todayKey = dateKeyOf(localNow.date);

  const day = useMemo(() => nallaNeramDay({ y, m, d }, place, basis), [y, m, d, place, basis]);
  const recommendation = useMemo(
    () => todayPadhigamRecommendation(day, birthRashi, localHour),
    [day, birthRashi, localHour],
  );

  const traditions = useMemo(() => activeTraditions(), []);
  const showSaintFilter = tradition === 'thevaram' || tradition === 'thiruvasagam';
  const visibleSaints = useMemo(
    () => (tradition === 'all' ? SAINTS : SAINTS.filter((s) => s.tradition === tradition)),
    [tradition],
  );

  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);
  const completedTodaySet = useMemo(() => new Set(completedByDate[todayKey] ?? []), [completedByDate, todayKey]);

  const filtered = useMemo(
    () => filterPadhigams(PADHIGAMS, { query, category, tradition, saint, favorites }),
    [query, category, tradition, saint, favorites],
  );

  const openReader = (padhigamId: string) => {
    hapticTap();
    navigation.navigate('PadhigamReader', { padhigamId });
  };

  const selectTradition = (next: FilterTradition) => {
    hapticTap();
    setTradition(next);
    setSaint('all');
  };

  const resetFilters = () => {
    hapticTap();
    setQuery('');
    setCategory('all');
    setTradition('all');
    setSaint('all');
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { paddingBottom: bottomInset }]}
      keyboardShouldPersistTaps="handled"
    >
      {/* Contextual Today's Padhigam Hero Card */}
      <Pressable
        accessibilityRole="button"
        onPress={() => openReader(recommendation.padhigam.id)}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <Card variant="hero" style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.heroBadge}>
              <MaterialCommunityIcons name="fire" size={14} color={colors.heroAccent} />
              <AppText size={11} bold color={colors.heroAccent}>
                {tr(recommendation.badge)}
              </AppText>
            </View>
            <View style={styles.heroCta}>
              <AppText size={11} bold color={colors.heroAccent}>
                {t('todayBanner.readNow')}
              </AppText>
            </View>
          </View>

          <AppText bold size={17} color={colors.heroText}>
            {tr(recommendation.padhigam.reliefTitle)}
          </AppText>

          <AppText size={13} bold color={colors.heroAccent}>
            {tr(recommendation.padhigam.title)} · {tr(recommendation.padhigam.author)}
          </AppText>

          <View style={styles.heroReasonBox}>
            <MaterialCommunityIcons name="star-four-points" size={14} color={colors.heroAccent} />
            <AppText size={12} color={colors.heroMuted} style={styles.flex}>
              {tr(recommendation.reason)}
            </AppText>
          </View>
        </Card>
      </Pressable>

      {/* Bilingual Search Bar */}
      <View style={styles.searchBox}>
        <MaterialCommunityIcons name="magnify" size={20} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('search.placeholder')}
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
          returnKeyType="search"
          accessibilityLabel={t('search.placeholder')}
        />
        {query.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('search.clear')}
            onPress={() => setQuery('')}
            hitSlop={10}
          >
            <MaterialCommunityIcons name="close-circle" size={18} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>

      {/* Deity / Tradition Filter */}
      <View style={styles.filterBlock}>
        <AppText size={12} bold color={colors.muted}>
          {t('filter.byTradition')}
        </AppText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          <FilterPill
            label={t('filter.allTraditions')}
            icon="view-grid-outline"
            active={tradition === 'all'}
            onPress={() => selectTradition('all')}
          />
          {traditions.map((trd) => (
            <FilterPill
              key={trd.id}
              label={tr(trd.shortLabel)}
              icon={trd.icon}
              active={tradition === trd.id}
              onPress={() => selectTradition(trd.id)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Naalvar Saint Sub-Filter (shown when browsing Thevaram / Thiruvasagam) */}
      {showSaintFilter && visibleSaints.length > 1 ? (
        <View style={styles.filterBlock}>
          <AppText size={12} bold color={colors.muted}>
            {t('filter.bySaint')}
          </AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            <FilterPill
              label={t('filter.allSaints')}
              active={saint === 'all'}
              compact
              onPress={() => {
                hapticTap();
                setSaint('all');
              }}
            />
            {visibleSaints.map((s) => (
              <FilterPill
                key={s.id}
                label={tr(s.shortLabel)}
                active={saint === s.id}
                compact
                onPress={() => {
                  hapticTap();
                  setSaint(s.id);
                }}
              />
            ))}
          </ScrollView>
        </View>
      ) : null}

      {/* Relief / Blessing Category Filter */}
      <View style={styles.filterBlock}>
        <AppText size={12} bold color={colors.muted}>
          {t('filter.byRelief')}
        </AppText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          <FilterPill
            label={t('filter.all')}
            icon="apps"
            active={category === 'all'}
            compact
            onPress={() => {
              hapticTap();
              setCategory('all');
            }}
          />
          <FilterPill
            label={favorites.length > 0 ? `${t('filter.favorites')} (${favorites.length})` : t('filter.favorites')}
            icon="heart-outline"
            active={category === 'favorites'}
            compact
            onPress={() => {
              hapticTap();
              setCategory('favorites');
            }}
          />
          {RELIEF_CATEGORIES.map((c) => (
            <FilterPill
              key={c.id}
              label={tr(c.label)}
              icon={c.icon}
              active={category === c.id}
              compact
              onPress={() => {
                hapticTap();
                setCategory(c.id);
              }}
            />
          ))}
        </ScrollView>
      </View>

      {/* Filtered Padhigam List */}
      {filtered.length === 0 ? (
        <Card style={styles.emptyCard}>
          <MaterialCommunityIcons name="book-open-page-variant-outline" size={34} color={colors.muted} />
          <AppText size={14} color={colors.muted} center>
            {category === 'favorites' && query.trim() === '' ? t('list.emptyFavorites') : t('list.empty')}
          </AppText>
          <Button title={t('list.resetFilters')} variant="outline" onPress={resetFilters} />
        </Card>
      ) : (
        <View style={styles.listGap}>
          {filtered.map((p) => {
            const isFav = favoriteSet.has(p.id);
            const recitedToday = completedTodaySet.has(p.id);
            const hasSections = p.verses.some((v) => Boolean(v.label));
            const countText = hasSections
              ? t('list.stanzasCount', { count: p.verses.length })
              : t('list.versesCount', { count: p.verses.length });
            const trdMeta = TRADITION_BY_ID[p.tradition];

            return (
              <Pressable
                key={p.id}
                accessibilityRole="button"
                onPress={() => openReader(p.id)}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <Card style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <AppText bold size={15} color={colors.primaryDark} style={styles.flex}>
                      {tr(p.reliefTitle)}
                    </AppText>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={isFav ? t('reader.bookmarkRemove') : t('reader.bookmarkAdd')}
                      onPress={() => {
                        hapticTap();
                        dispatch(toggleFavorite(p.id));
                      }}
                      hitSlop={10}
                      style={styles.heartBtn}
                    >
                      <MaterialCommunityIcons
                        name={isFav ? 'heart' : 'heart-outline'}
                        size={20}
                        color={isFav ? '#AD1457' : colors.muted}
                      />
                    </Pressable>
                  </View>

                  <View style={styles.titleRow}>
                    <AppText bold size={13} color={colors.primary}>
                      {tr(p.title)}
                    </AppText>
                    <AppText size={12} color={colors.muted} numberOfLines={1}>
                      {p.openingLineTa}…
                    </AppText>
                  </View>

                  <View style={styles.chipWrap}>
                    <Chip label={tr(trdMeta.shortLabel)} color={trdMeta.color} />
                    {p.categories.map((catId) => {
                      const meta = CATEGORY_BY_ID[catId];
                      return <Chip key={catId} label={tr(meta.label)} color={meta.color} />;
                    })}
                    {recitedToday ? <Chip label={t('list.recitedToday')} color={colors.good} /> : null}
                  </View>

                  <View style={styles.itemFooter}>
                    <AppText size={11} color={colors.muted} style={styles.flex} numberOfLines={1}>
                      {tr(p.author)} · {tr(p.source)}
                    </AppText>
                    <AppText size={11} bold color={colors.primaryDark}>
                      {countText}
                    </AppText>
                    <MaterialCommunityIcons name="chevron-right" size={18} color={colors.primary} />
                  </View>
                </Card>
              </Pressable>
            );
          })}
        </View>
      )}

      <AppText size={12} color={colors.muted} center style={styles.footerNote}>
        {t('list.catalogueNote', { count: PADHIGAMS.length })}
      </AppText>
    </ScrollView>
  );
}

type FilterPillProps = {
  label: string;
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  active: boolean;
  compact?: boolean;
  onPress: () => void;
};

function FilterPill({ label, icon, active, compact, onPress }: FilterPillProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        compact && styles.pillCompact,
        active && styles.pillActive,
        pressed && !active && { opacity: 0.72 },
      ]}
    >
      {icon ? (
        <MaterialCommunityIcons
          name={icon}
          size={15}
          color={active ? colors.heroText : colors.primaryDark}
        />
      ) : null}
      <AppText size={12} bold={active} color={active ? colors.heroText : colors.primaryDark}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, gap: spacing.md, backgroundColor: colors.bg, flexGrow: 1 },
  flex: { flex: 1 },
  pressed: { opacity: 0.86, transform: [{ scale: 0.985 }] },
  heroCard: { gap: spacing.sm },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.heroSurface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  heroCta: {
    backgroundColor: colors.heroSurface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  heroReasonBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.heroSurface,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
    paddingVertical: 2,
  },
  filterBlock: { gap: 6 },
  chipRow: { gap: 8, paddingRight: spacing.sm },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillCompact: { paddingVertical: 5, paddingHorizontal: 11 },
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  listGap: { gap: spacing.sm + 2 },
  itemCard: { gap: spacing.sm },
  itemHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  heartBtn: { paddingTop: 2 },
  titleRow: { gap: 2 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.surface,
  },
  emptyCard: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
  footerNote: { paddingHorizontal: spacing.sm, marginTop: spacing.xs },
});
