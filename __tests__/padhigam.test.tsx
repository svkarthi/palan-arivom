import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Provider } from 'react-redux';

import '../src/core/i18n';
import i18n from '../src/core/i18n';
import { chandrashtamaRashi } from '../src/core/astro/dayExtras';
import { resetAll } from '../src/core/store/actions';
import profile from '../src/core/store/profileSlice';
import settings, { setLanguage } from '../src/core/store/settingsSlice';
import {
  activeTraditions,
  filterPadhigams,
  PADHIGAM_BY_ID,
  PADHIGAMS,
  todayPadhigamRecommendation,
  type PadhigamDayContext,
} from '../src/features/padhigam/data';
import { CATEGORY_BY_ID } from '../src/features/padhigam/data/categories';
import { AMMAN_HYMNS } from '../src/features/padhigam/data/hymns/amman';
import { MURUGAN_HYMNS } from '../src/features/padhigam/data/hymns/murugan';
import { PERUMAL_HYMNS } from '../src/features/padhigam/data/hymns/perumal';
import { VINAYAGAR_HYMNS } from '../src/features/padhigam/data/hymns/vinayagar';
import type { PadhigamStackParamList } from '../src/features/padhigam/navigation/types';
import PadhigamLibraryScreen from '../src/features/padhigam/screens/PadhigamLibraryScreen';
import PadhigamReaderScreen from '../src/features/padhigam/screens/PadhigamReaderScreen';
import padhigam, {
  DEFAULT_PADHIGAM_FONT,
  MAX_PADHIGAM_FONT,
  MIN_PADHIGAM_FONT,
  setFontSize,
  stepFontSize,
  toggleCompletedOnDate,
  toggleFavorite,
  toggleShowMeaning,
} from '../src/features/padhigam/store/padhigamSlice';
import compass from '../src/features/vastu/store/compassSlice';
import plan from '../src/features/vastu/store/planSlice';

const makeStore = () => configureStore({ reducer: { settings, profile, plan, compass, padhigam } });

const sampleDay = (overrides: Partial<PadhigamDayContext> = {}): PadhigamDayContext => ({
  weekday: 2, // Tuesday
  panchang: { tamil: { month: 0, day: 10 } },
  specials: [],
  moonRashi: [{ index: 0, end: new Date(86_400_000) }],
  ...overrides,
});

describe('Padhigam catalogue & data integrity', () => {
  it('contains 12 curated Phase 1 Thevaram & Thiruvasagam Padhigams with clean Tamil text', () => {
    expect(PADHIGAMS).toHaveLength(12);
    const ids = new Set(PADHIGAMS.map((p) => p.id));
    expect(ids.size).toBe(12);

    // Every non-Tamil/non-punctuation character in verse lines should be absent (no OCR garbage or digits).
    const allowedLineChars = /^[\u0B80-\u0BFF\s.,;:\-–—‘’“”!?]+$/;

    for (const p of PADHIGAMS) {
      expect(['thevaram', 'thiruvasagam']).toContain(p.tradition);
      expect(p.reliefTitle.ta.trim().length).toBeGreaterThan(5);
      expect(p.reliefTitle.en.trim().length).toBeGreaterThan(5);
      expect(p.title.ta.trim().length).toBeGreaterThan(3);
      expect(p.title.en.trim().length).toBeGreaterThan(3);
      expect(p.howToRecite.ta.trim().length).toBeGreaterThan(5);
      expect(p.howToRecite.en.trim().length).toBeGreaterThan(5);
      expect(p.categories.length).toBeGreaterThan(0);
      for (const cat of p.categories) {
        expect(CATEGORY_BY_ID[cat]).toBeDefined();
      }
      expect(p.verses.length).toBeGreaterThan(0);
      for (const v of p.verses) {
        expect(v.linesTa.length).toBeGreaterThan(0);
        for (const line of v.linesTa) {
          expect(line.trim().length).toBeGreaterThan(0);
          expect(allowedLineChars.test(line)).toBe(true);
        }
        expect(v.meaning?.ta.trim().length).toBeGreaterThan(10);
        expect(v.meaning?.en.trim().length).toBeGreaterThan(10);
      }
    }
  });

  it('includes all 95 classical lines of Sivapuranam across 8 sections', () => {
    const siva = PADHIGAM_BY_ID['sivapuranam'];
    expect(siva).toBeDefined();
    expect(siva.verses).toHaveLength(8);
    const totalLines = siva.verses.reduce((sum, v) => sum + v.linesTa.length, 0);
    expect(totalLines).toBe(95);
  });

  it('keeps Phase 2 deity slots empty and hidden from activeTraditions()', () => {
    expect(MURUGAN_HYMNS).toEqual([]);
    expect(VINAYAGAR_HYMNS).toEqual([]);
    expect(AMMAN_HYMNS).toEqual([]);
    expect(PERUMAL_HYMNS).toEqual([]);
    expect(activeTraditions().map((t) => t.id)).toEqual(['thevaram', 'thiruvasagam']);
  });
});

describe('todayPadhigamRecommendation (Phase 1: Thevaram & Thiruvasagam only)', () => {
  it('prioritizes Kolaru Padhigam on personal Chandrashtamam', () => {
    const day = sampleDay({
      specials: [{ id: 'pradosham' }],
      moonRashi: [{ index: 3, end: new Date(86_400_000) }],
    });
    const birthRashi = chandrashtamaRashi(3);
    const rec = todayPadhigamRecommendation(day, birthRashi, 7);
    expect(rec.padhigam.id).toBe('kolaru-padhigam');
  });

  it('suggests Kolaru Padhigam on Karinaal', () => {
    const rec = todayPadhigamRecommendation(sampleDay({ specials: [{ id: 'karinaal' }] }), null, 11);
    expect(rec.padhigam.id).toBe('kolaru-padhigam');
  });

  it('suggests Sivapuranam on Maha Shivaratri and Pradosham', () => {
    expect(
      todayPadhigamRecommendation(sampleDay({ specials: [{ id: 'mahaShivaratri' }] }), null, 18).padhigam.id,
    ).toBe('sivapuranam');
    expect(
      todayPadhigamRecommendation(sampleDay({ specials: [{ id: 'pradosham' }] }), null, 18).padhigam.id,
    ).toBe('sivapuranam');
  });

  it('suggests Thiruppalliezhuchi on Margazhi mornings', () => {
    const margazhiMorning = sampleDay({ panchang: { tamil: { month: 8, day: 5 } }, weekday: 3 });
    expect(todayPadhigamRecommendation(margazhiMorning, null, 6).padhigam.id).toBe('thiruppalliezhuchi');
  });

  it('suggests Somavaram Shiva Padhigams on Monday and valid Saiva hymns on all weekdays', () => {
    const monEven = todayPadhigamRecommendation(sampleDay({ weekday: 1, panchang: { tamil: { month: 1, day: 4 } } }), null, 12);
    expect(monEven.padhigam.id).toBe('thiruneetru-padhigam');
    const monOdd = todayPadhigamRecommendation(sampleDay({ weekday: 1, panchang: { tamil: { month: 1, day: 5 } } }), null, 12);
    expect(monOdd.padhigam.id).toBe('matru-patru');

    for (let wd = 0; wd < 7; wd++) {
      const rec = todayPadhigamRecommendation(sampleDay({ weekday: wd }), null, 14);
      expect(['thevaram', 'thiruvasagam']).toContain(rec.padhigam.tradition);
    }
  });
});

describe('filterPadhigams', () => {
  it('filters by Tamil & English relief keywords, category, saint, and favorites', () => {
    expect(
      filterPadhigams(PADHIGAMS, { query: 'கடன்', category: 'all', saint: 'all', favorites: [] }).map((p) => p.id),
    ).toContain('vaasi-theerave');
    expect(
      filterPadhigams(PADHIGAMS, { query: 'marriage', category: 'all', saint: 'all', favorites: [] }).map((p) => p.id),
    ).toContain('kallur-perumanam');
    expect(
      filterPadhigams(PADHIGAMS, { query: '', category: 'health', saint: 'appar', favorites: [] }).map((p) => p.id),
    ).toEqual(expect.arrayContaining(['kootrayinavaaru', 'thiru-angamaalai']));
    expect(
      filterPadhigams(PADHIGAMS, { query: '', category: 'favorites', saint: 'all', favorites: ['achappathu'] }).map(
        (p) => p.id,
      ),
    ).toEqual(['achappathu']);
  });
});

describe('padhigamSlice', () => {
  it('manages favorites, clamped font size, meaning toggle, daily check-in pruning, and resetAll', () => {
    const store = makeStore();
    expect(store.getState().padhigam.fontSize).toBe(DEFAULT_PADHIGAM_FONT);

    store.dispatch(toggleFavorite('kolaru-padhigam'));
    expect(store.getState().padhigam.favorites).toEqual(['kolaru-padhigam']);
    store.dispatch(toggleFavorite('kolaru-padhigam'));
    expect(store.getState().padhigam.favorites).toEqual([]);

    store.dispatch(setFontSize(99));
    expect(store.getState().padhigam.fontSize).toBe(MAX_PADHIGAM_FONT);
    store.dispatch(setFontSize(5));
    expect(store.getState().padhigam.fontSize).toBe(MIN_PADHIGAM_FONT);
    store.dispatch(stepFontSize(2));
    expect(store.getState().padhigam.fontSize).toBe(MIN_PADHIGAM_FONT + 2);

    store.dispatch(toggleShowMeaning());
    expect(store.getState().padhigam.showMeaning).toBe(true);

    // Record 32 days to verify 30-day cap
    for (let i = 1; i <= 32; i++) {
      const dd = String(i).padStart(2, '0');
      const key = i <= 31 ? `2026-01-${dd}` : '2026-02-01';
      store.dispatch(toggleCompletedOnDate({ dateKey: key, padhigamId: 'sivapuranam' }));
    }
    const keys = Object.keys(store.getState().padhigam.completedByDate);
    expect(keys).toHaveLength(30);
    expect(keys).not.toContain('2026-01-01');
    expect(keys).toContain('2026-02-01');

    store.dispatch(resetAll());
    expect(store.getState().padhigam).toEqual({
      favorites: [],
      fontSize: DEFAULT_PADHIGAM_FONT,
      showMeaning: false,
      completedByDate: {},
    });
  });
});

describe('Padhigam screens render & interact', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ta');
  });

  it('renders PadhigamLibraryScreen in Tamil, filters by search and saint, and has no raw keys', async () => {
    const Stack = createNativeStackNavigator<PadhigamStackParamList>();
    const store = makeStore();
    await render(
      <Provider store={store}>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="PadhigamLibrary" component={PadhigamLibraryScreen} />
            <Stack.Screen name="PadhigamReader" component={PadhigamReaderScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </Provider>,
    );

    expect(screen.getAllByText(/கோளறு திருப்பதிகம்/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/சிவபுராணம்/).length).toBeGreaterThan(0);
    expect(screen.getByText(/சம்பந்தர்/)).toBeTruthy();
    expect(screen.getByText(/மாணிக்கவாசகர்/)).toBeTruthy();
    expect(screen.queryByText(/^[a-zA-Z]+\.[a-zA-Z.]+$/)).toBeNull();

    // Filter via search box
    const input = screen.getByPlaceholderText(/பலன், நோய்/);
    await fireEvent.changeText(input, 'அச்சப்பத்து');
    expect(screen.getAllByText(/அச்சப்பத்து/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/வாசி தீரவே காசு நல்குவீர்/)).toBeNull();
  });

  it('renders PadhigamReaderScreen with verses, meaning toggle, font controls, and check-in', async () => {
    const Stack = createNativeStackNavigator<PadhigamStackParamList>();
    const store = makeStore();
    await render(
      <Provider store={store}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="PadhigamReader">
            <Stack.Screen
              name="PadhigamReader"
              component={PadhigamReaderScreen}
              initialParams={{ padhigamId: 'kolaru-padhigam' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </Provider>,
    );

    expect(screen.getByText(/வேயுறு தோளிபங்கன் விடமுண்டகண்டன்/)).toBeTruthy();
    expect(screen.getByText(/பாடல் 1 \/ 11/)).toBeTruthy();
    expect(screen.getByText(/பாடல் 11 \/ 11/)).toBeTruthy();
    expect(screen.queryByText(/பொழிப்புரை/)).toBeNull();

    // Toggle meaning on
    await fireEvent.press(screen.getByText('பொருள்'));
    expect(screen.getAllByText('பொழிப்புரை').length).toBe(11);

    // Increase font size
    const beforeSize = store.getState().padhigam.fontSize;
    await fireEvent.press(screen.getByText('A+'));
    expect(store.getState().padhigam.fontSize).toBe(beforeSize + 1);

    // Mark recited today
    await fireEvent.press(screen.getByText(/இன்று பாராயணம் முடிந்தது எனக் குறி/));
    expect(screen.getByText(/இன்று பாராயணம் முடிந்தது ✓/)).toBeTruthy();
    expect(screen.queryByText(/^[a-zA-Z]+\.[a-zA-Z.]+$/)).toBeNull();
  });

  it('renders PadhigamReaderScreen cleanly in English', async () => {
    const Stack = createNativeStackNavigator<PadhigamStackParamList>();
    const store = makeStore();
    store.dispatch(setLanguage('en'));
    store.dispatch(toggleShowMeaning());
    await i18n.changeLanguage('en');

    await render(
      <Provider store={store}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="PadhigamReader">
            <Stack.Screen
              name="PadhigamReader"
              component={PadhigamReaderScreen}
              initialParams={{ padhigamId: 'sivapuranam' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </Provider>,
    );

    expect(screen.getByText(/All-Round Blessings/)).toBeTruthy();
    expect(screen.getByText(/Section 1 \/ 8/)).toBeTruthy();
    expect(screen.getByText(/நமச்சிவாய வாஅழ்க நாதன்தாள் வாழ்க/)).toBeTruthy();
    expect(screen.getByText(/Hail to Namachivaya/)).toBeTruthy();
  });
});
