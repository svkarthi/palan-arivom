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
  activeDeities,
  activeTraditions,
  filterPadhigams,
  PADHIGAM_BY_ID,
  PADHIGAMS,
  todayPadhigamRecommendation,
  type PadhigamDayContext,
} from '../src/features/padhigam/data';
import { CATEGORY_BY_ID, TRADITION_BY_ID } from '../src/features/padhigam/data/categories';
import { AMMAN_HYMNS } from '../src/features/padhigam/data/hymns/amman';
import { MURUGAN_HYMNS } from '../src/features/padhigam/data/hymns/murugan';
import { PERUMAL_HYMNS } from '../src/features/padhigam/data/hymns/perumal';
import { THEVARAM_HYMNS } from '../src/features/padhigam/data/hymns/thevaram';
import { THIRUVASAGAM_HYMNS } from '../src/features/padhigam/data/hymns/thiruvasagam';
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

describe('Padhigam catalogue & data integrity across all 6 traditions', () => {
  it('contains 26 curated Padhigams across Thevaram, Thiruvasagam, Vinayagar, Murugan, Amman & Perumal with clean Tamil text', () => {
    expect(THEVARAM_HYMNS).toHaveLength(9);
    expect(THIRUVASAGAM_HYMNS).toHaveLength(3);
    expect(VINAYAGAR_HYMNS).toHaveLength(3);
    expect(MURUGAN_HYMNS).toHaveLength(4);
    expect(AMMAN_HYMNS).toHaveLength(4);
    expect(PERUMAL_HYMNS).toHaveLength(3);
    expect(PADHIGAMS).toHaveLength(26);

    const ids = new Set(PADHIGAMS.map((p) => p.id));
    expect(ids.size).toBe(26);

    const allowedLineChars = /^[\u0B80-\u0BFF\s.,;:\-–—‘’“”!?]+$/;

    for (const p of PADHIGAMS) {
      expect(TRADITION_BY_ID[p.tradition]).toBeDefined();
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
        expect(v.meaning?.ta).not.toContain('…');
        expect(v.meaning?.en.trim().length).toBeGreaterThan(10);
      }
    }
  });

  it('preserves full authentic verse/line counts for major classical works', () => {
    const lineCount = (id: string) => PADHIGAM_BY_ID[id].verses.reduce((sum, v) => sum + v.linesTa.length, 0);

    expect(lineCount('sivapuranam')).toBe(95);
    expect(lineCount('vinayagar-agaval')).toBe(76); // 4-line kappu + 72 lines
    expect(PADHIGAM_BY_ID['mootha-nayanar-manimaalai'].verses).toHaveLength(20);
    expect(lineCount('kanda-sashti-kavasam')).toBe(245);
    expect(lineCount('kandar-anubhuti')).toBe(208); // 4-line kappu + 51 x 4 lines
    expect(PADHIGAM_BY_ID['abirami-andhadhi-prosperity'].verses).toHaveLength(10);
    expect(PADHIGAM_BY_ID['abirami-andhadhi-protection'].verses).toHaveLength(10);
    expect(PADHIGAM_BY_ID['abirami-andhadhi-family'].verses).toHaveLength(8);
    expect(PADHIGAM_BY_ID['abirami-padhigam'].verses).toHaveLength(12); // kappu + 11 verses
    expect(PADHIGAM_BY_ID['thiruppallandu'].verses).toHaveLength(12);
    expect(PADHIGAM_BY_ID['thiruppavai'].verses).toHaveLength(30);
    expect(PADHIGAM_BY_ID['amalanadhipiran'].verses).toHaveLength(10);
  });

  it('activates all 6 traditions and 5 deity groups (grouping Thevaram & Thiruvasagam under Lord Shiva)', () => {
    expect(activeTraditions().map((t) => t.id)).toEqual([
      'thevaram',
      'thiruvasagam',
      'vinayagar',
      'murugan',
      'amman',
      'perumal',
    ]);
    expect(activeDeities().map((d) => d.id)).toEqual([
      'shiva',
      'vinayagar',
      'murugan',
      'amman',
      'perumal',
    ]);
    expect(
      filterPadhigams(PADHIGAMS, { query: '', category: 'all', deity: 'shiva', saint: 'all', favorites: [] }),
    ).toHaveLength(12);
  });
});

describe('todayPadhigamRecommendation across all deities & observances', () => {
  it('prioritizes Kolaru Padhigam on personal Chandrashtamam and Karinaal', () => {
    const day = sampleDay({
      specials: [{ id: 'pradosham' }],
      moonRashi: [{ index: 3, end: new Date(86_400_000) }],
    });
    const birthRashi = chandrashtamaRashi(3);
    expect(todayPadhigamRecommendation(day, birthRashi, 7).padhigam.id).toBe('kolaru-padhigam');
    expect(todayPadhigamRecommendation(sampleDay({ specials: [{ id: 'karinaal' }] }), null, 11).padhigam.id).toBe(
      'kolaru-padhigam',
    );
  });

  it('maps Shiva, Murugan, Vinayagar, Amman and Perumal observances to their matching hymns', () => {
    expect(
      todayPadhigamRecommendation(sampleDay({ specials: [{ id: 'mahaShivaratri' }] }), null, 18).padhigam.id,
    ).toBe('sivapuranam');
    expect(
      todayPadhigamRecommendation(sampleDay({ specials: [{ id: 'pradosham' }] }), null, 18).padhigam.id,
    ).toBe('sivapuranam');
    expect(
      todayPadhigamRecommendation(sampleDay({ specials: [{ id: 'shashti' }] }), null, 9).padhigam.id,
    ).toBe('kanda-sashti-kavasam');
    expect(
      todayPadhigamRecommendation(sampleDay({ specials: [{ id: 'thaiPoosam' }] }), null, 9).padhigam.id,
    ).toBe('kanda-sashti-kavasam');
    expect(
      todayPadhigamRecommendation(sampleDay({ specials: [{ id: 'karthigai' }] }), null, 18).padhigam.id,
    ).toBe('kandar-alangaram-relief');
    expect(
      todayPadhigamRecommendation(sampleDay({ specials: [{ id: 'vinayakaChaturthi' }] }), null, 9).padhigam.id,
    ).toBe('vinayagar-agaval');
    expect(
      todayPadhigamRecommendation(sampleDay({ specials: [{ id: 'sankashti' }] }), null, 18).padhigam.id,
    ).toBe('mootha-nayanar-manimaalai');
    expect(
      todayPadhigamRecommendation(sampleDay({ specials: [{ id: 'navarathri' }] }), null, 10).padhigam.id,
    ).toBe('abirami-andhadhi-prosperity');
    expect(
      todayPadhigamRecommendation(sampleDay({ specials: [{ id: 'pournami' }] }), null, 18).padhigam.id,
    ).toBe('abirami-padhigam');
    expect(
      todayPadhigamRecommendation(
        sampleDay({ specials: [{ id: 'ekadashi' }], panchang: { tamil: { month: 2, day: 10 } } }),
        null,
        10,
      ).padhigam.id,
    ).toBe('thiruppallandu');
    expect(
      todayPadhigamRecommendation(
        sampleDay({ specials: [{ id: 'ekadashi' }], panchang: { tamil: { month: 2, day: 11 } } }),
        null,
        10,
      ).padhigam.id,
    ).toBe('amalanadhipiran');
  });

  it('alternates Thiruppalliezhuchi and Thiruppavai on Margazhi mornings', () => {
    const oddDay = sampleDay({ panchang: { tamil: { month: 8, day: 5 } }, weekday: 3 });
    const evenDay = sampleDay({ panchang: { tamil: { month: 8, day: 6 } }, weekday: 3 });
    expect(todayPadhigamRecommendation(oddDay, null, 6).padhigam.id).toBe('thiruppalliezhuchi');
    expect(todayPadhigamRecommendation(evenDay, null, 6).padhigam.id).toBe('thiruppavai');
  });

  it('maps traditional Tamil weekdays cleanly across all 7 days', () => {
    expect(todayPadhigamRecommendation(sampleDay({ weekday: 0 }), null, 14).padhigam.id).toBe('kolaru-padhigam');
    expect(
      todayPadhigamRecommendation(sampleDay({ weekday: 1, panchang: { tamil: { month: 1, day: 4 } } }), null, 12)
        .padhigam.id,
    ).toBe('thiruneetru-padhigam');
    expect(todayPadhigamRecommendation(sampleDay({ weekday: 2 }), null, 14).padhigam.id).toBe('kanda-sashti-kavasam');
    expect(todayPadhigamRecommendation(sampleDay({ weekday: 3 }), null, 14).padhigam.id).toBe('vinayagar-agaval');
    expect(todayPadhigamRecommendation(sampleDay({ weekday: 4 }), null, 14).padhigam.id).toBe('thiru-angamaalai');
    expect(todayPadhigamRecommendation(sampleDay({ weekday: 5 }), null, 14).padhigam.id).toBe(
      'abirami-andhadhi-prosperity',
    );
    expect(todayPadhigamRecommendation(sampleDay({ weekday: 6 }), null, 14).padhigam.id).toBe('thiruppallandu');
  });
});

describe('filterPadhigams', () => {
  it('filters by deity/tradition, Tamil & English relief keywords, category, saint, and favorites', () => {
    expect(
      filterPadhigams(PADHIGAMS, { query: '', category: 'all', tradition: 'amman', saint: 'all', favorites: [] }).map(
        (p) => p.id,
      ),
    ).toEqual([
      'abirami-andhadhi-prosperity',
      'abirami-andhadhi-protection',
      'abirami-andhadhi-family',
      'abirami-padhigam',
    ]);
    expect(
      filterPadhigams(PADHIGAMS, { query: 'அபிராமி', category: 'all', saint: 'all', favorites: [] }).length,
    ).toBe(4);
    expect(
      filterPadhigams(PADHIGAMS, { query: 'கடன்', category: 'all', saint: 'all', favorites: [] }).map((p) => p.id),
    ).toContain('vaasi-theerave');
    expect(
      filterPadhigams(PADHIGAMS, { query: 'marriage', category: 'all', saint: 'all', favorites: [] }).map((p) => p.id),
    ).toEqual(expect.arrayContaining(['kallur-perumanam', 'abirami-andhadhi-family', 'thiruppavai']));
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

  it('renders PadhigamLibraryScreen in Tamil with all deity chips and filters by Amman / search', async () => {
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
    expect(screen.getAllByText(/விநாயகர் அகவல்/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/கந்த சஷ்டி கவசம்/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/அபிராமி அந்தாதி — ஐஸ்வர்ய/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/திருப்பாவை/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/^[a-zA-Z]+\.[a-zA-Z.]+$/)).toBeNull();

    // Deity filter shows சிவபெருமான் (both as filter chip & grouped SectionHeader)
    expect(screen.getAllByText('சிவபெருமான்').length).toBeGreaterThan(0);
    await fireEvent.press(screen.getAllByText('சிவபெருமான்')[0]);
    expect(screen.getByText('மாணிக்கவாசகர்')).toBeTruthy();
    expect(screen.getAllByText(/சிவபுராணம்/).length).toBeGreaterThan(0);

    // Tap Amman deity chip -> shows Abirami Andhadhi & hides Kanda Sashti Kavasam
    await fireEvent.press(screen.getAllByText('அம்மன்')[0]);
    expect(screen.getAllByText(/அபிராமி அந்தாதி — பாதுகாப்பு/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/வாசி தீரவே காசு நல்குவீர்/)).toBeNull();
  });

  it('renders PadhigamReaderScreen for Abirami Andhadhi with Amman invocation & meaning toggle', async () => {
    const Stack = createNativeStackNavigator<PadhigamStackParamList>();
    const store = makeStore();
    await render(
      <Provider store={store}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="PadhigamReader">
            <Stack.Screen
              name="PadhigamReader"
              component={PadhigamReaderScreen}
              initialParams={{ padhigamId: 'abirami-andhadhi-prosperity' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </Provider>,
    );

    expect(screen.getAllByText('ஸ்ரீ அபிராமி அன்னை துணை')).toHaveLength(2);
    expect(screen.getAllByText(/தனம்தரும் கல்வி தரும்/).length).toBeGreaterThan(0);
    expect(screen.getByText(/பாடல் 69/)).toBeTruthy();
    expect(screen.queryByText(/பொழிப்புரை/)).toBeNull();

    await fireEvent.press(screen.getByText('பொருள்'));
    expect(screen.getAllByText('பொழிப்புரை').length).toBe(10);

    const beforeSize = store.getState().padhigam.fontSize;
    await fireEvent.press(screen.getByText('A+'));
    expect(store.getState().padhigam.fontSize).toBe(beforeSize + 1);

    await fireEvent.press(screen.getByText(/இன்று பாராயணம் முடிந்தது எனக் குறி/));
    expect(screen.getByText(/இன்று பாராயணம் முடிந்தது ✓/)).toBeTruthy();
    expect(screen.queryByText(/^[a-zA-Z]+\.[a-zA-Z.]+$/)).toBeNull();
  });

  it('renders PadhigamReaderScreen cleanly in English for Perumal hymn', async () => {
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
              initialParams={{ padhigamId: 'thiruppallandu' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </Provider>,
    );

    expect(screen.getAllByText('Sriman Narayanaya Namaha')).toHaveLength(2);
    expect(screen.getByText(/Auspiciousness, Longevity/)).toBeTruthy();
    expect(screen.getByText(/Verse 1 \/ 12/)).toBeTruthy();
    expect(screen.getByText(/பல்லாண்டு பல்லாண்டு பல்லாயிரத்தாண்டு/)).toBeTruthy();
    expect(screen.getAllByText('Summary Meaning').length).toBe(12);
    expect(screen.getByText(/Pallaandu, Pallaandu/)).toBeTruthy();
  });
});
