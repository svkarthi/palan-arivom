import { render, screen } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import '../src/core/i18n';
import i18n from '../src/core/i18n';
import { dayYoga } from '../src/core/astro/dayExtras';
import { daySummary } from '../src/core/astro/panchang';
import { nearestPlace, placeById } from '../src/core/astro/places';
import { specialDays, type SpecialId } from '../src/core/astro/specialDays';
import ObservanceIcon, { primaryObservance } from '../src/core/components/ObservanceIcon';
import profile from '../src/core/store/profileSlice';
import settings from '../src/core/store/settingsSlice';
import compass from '../src/features/vastu/store/compassSlice';
import plan from '../src/features/vastu/store/planSlice';
import { computeBirthStar } from '../src/features/birth-star/logic';
import BirthStarScreen from '../src/features/birth-star/screens/BirthStarScreen';
import { evaluatePorutham } from '../src/features/porutham/logic';
import PoruthamScreen from '../src/features/porutham/screens/PoruthamScreen';

const makeStore = () => configureStore({ reducer: { settings, profile, plan, compass } });

describe('new features logic', () => {
  it('evaluates 10 Porutham and flags Rajju mismatch', () => {
    const good = evaluatePorutham(3, 1, 20, 9); // Rohini (Rishabha) + Uthiradam (Makara)
    expect(good.items).toHaveLength(10);
    expect(good.score).toBeGreaterThanOrEqual(7);
    expect(['good', 'excellent']).toContain(good.verdict);

    const sameRajju = evaluatePorutham(0, 0, 8, 3); // Ashwini + Ayilyam (both Paada rajju)
    expect(sameRajju.items.find((i) => i.id === 'rajju')?.status).toBe('bad');
    expect(sameRajju.verdict).toBe('avoid');
  });

  it('computes valid Birth Star, Pada, Rashi and Lagna', () => {
    const res = computeBirthStar({ y: 1995, m: 1, d: 15 }, 9, 30, placeById('chennai'));
    expect(res.nakshatra).toBeGreaterThanOrEqual(0);
    expect(res.nakshatra).toBeLessThan(27);
    expect(res.pada).toBeGreaterThanOrEqual(1);
    expect(res.pada).toBeLessThanOrEqual(4);
    expect(res.rashi).toBeGreaterThanOrEqual(0);
    expect(res.rashi).toBeLessThan(12);
    expect(res.lagna).toBeGreaterThanOrEqual(0);
    expect(res.lagna).toBeLessThan(12);
  });

  it('finds nearest city from GPS coordinates including diaspora hubs', () => {
    expect(nearestPlace(13.08, 80.27).id).toBe('chennai');
    expect(nearestPlace(51.5, -0.12).id).toBe('london');
    expect(nearestPlace(43.65, -79.38).id).toBe('toronto');
    expect(nearestPlace(-33.86, 151.2).id).toBe('sydney');
  });

  it('computes Amirtha / Siddha / Marana Yogam and detects Ekadashi', () => {
    expect(dayYoga(0, 0)).toBe('amirtha'); // Sunday + Ashwini
    expect(dayYoga(0, 1)).toBe('marana'); // Sunday + Bharani
    // Verify Ekadashi occurs at least twice in a 31-day month
    const chennai = placeById('chennai');
    let ekadashiCount = 0;
    for (let d = 1; d <= 31; d++) {
      if (specialDays(daySummary({ y: 2026, m: 1, d }, chennai)).some((s) => s.id === 'ekadashi')) {
        ekadashiCount++;
      }
    }
    expect(ekadashiCount).toBeGreaterThanOrEqual(2);
  });
});

describe('new feature screens', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ta');
  });

  it('renders PoruthamScreen in Tamil', async () => {
    await render(
      <Provider store={makeStore()}>
        <PoruthamScreen />
      </Provider>,
    );
    expect(screen.getByText(/10 பொருத்த விவரம்/)).toBeTruthy();
    expect(screen.getByText(/ரஜ்ஜுப் பொருத்தம்/)).toBeTruthy();
  });

  it('renders BirthStarScreen in Tamil', async () => {
    await render(
      <Provider store={makeStore()}>
        <BirthStarScreen />
      </Provider>,
    );
    expect(screen.getByText(/உங்கள் பிறப்பு விவரம்/)).toBeTruthy();
    expect(screen.getByText(/என் சுயவிவரத்தில் சேமி/)).toBeTruthy();
  });

  it('renders custom devotional ObservanceIcon for every special day and prioritises correctly', async () => {
    const ids: SpecialId[] = [
      'pradosham', 'ekadashi', 'vinayakaChaturthi', 'sankashti',
      'shashti', 'karthigai', 'karthigaiDeepam', 'pournami', 'amavasai', 'karinaal',
    ];
    for (const id of ids) {
      await render(<ObservanceIcon id={id} size={16} />);
    }
    expect(primaryObservance([{ id: 'karinaal' }, { id: 'pradosham' }])).toBe('pradosham');
    expect(primaryObservance([{ id: 'karinaal' }])).toBeNull();
  });
});
