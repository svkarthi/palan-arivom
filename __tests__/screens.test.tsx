import { NavigationContainer } from '@react-navigation/native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import '../src/core/i18n';
import i18n from '../src/core/i18n';
import { chandrashtamaRashi } from '../src/core/astro/dayExtras';
import { placeById } from '../src/core/astro/places';
import { toLocal } from '../src/core/astro/time';
import HomeScreen from '../src/core/screens/HomeScreen';
import profile, { setBirthRashi } from '../src/core/store/profileSlice';
import settings from '../src/core/store/settingsSlice';
import { setLanguage } from '../src/core/store/settingsSlice';
import compass from '../src/features/vastu/store/compassSlice';
import plan from '../src/features/vastu/store/planSlice';
import NallaNaalScreen from '../src/features/nalla-naal/screens/NallaNaalScreen';
import { nallaNeramDay } from '../src/features/nalla-neram/logic';
import NallaNeramScreen from '../src/features/nalla-neram/screens/NallaNeramScreen';

const makeStore = () => configureStore({ reducer: { settings, profile, plan, compass } });

describe('feature screens render', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ta');
  });

  it('shows Nalla Neram sections in Tamil', async () => {
    await render(
      <Provider store={makeStore()}>
        <NallaNeramScreen />
      </Provider>,
    );
    expect(screen.getByText(/நல்ல நேரங்கள்/)).toBeTruthy();
    expect(screen.getAllByText(/ராகு காலம்/).length).toBeGreaterThan(0);
    expect(screen.getByText(/பஞ்சாங்கம்/)).toBeTruthy();
    expect(screen.getByText(/சென்னை/)).toBeTruthy();
    // New sections must show text, not raw translation keys such as "basis.label".
    expect(screen.getAllByText(/சந்திராஷ்டமம்/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/லக்னம்/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/சூலம்/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/கௌரி நல்ல நேரம்/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/முகூர்த்த நேரம்/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/^[a-zA-Z]+\.[a-zA-Z.]+$/)).toBeNull();
  });

  it('shows Nalla Neram in English after switching language', async () => {
    const store = makeStore();
    store.dispatch(setLanguage('en'));
    await i18n.changeLanguage('en');
    await render(
      <Provider store={store}>
        <NallaNeramScreen />
      </Provider>,
    );
    expect(screen.getByText(/Good times/)).toBeTruthy();
    expect(screen.getAllByText(/Gowri Nalla Neram/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Muhurtha Neram/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Rahu Kalam/).length).toBeGreaterThan(0);
  });

  it("lists days for the month in Nalla Naal and expands one", async () => {
    await render(
      <Provider store={makeStore()}>
        <NallaNaalScreen />
      </Provider>,
    );
    expect(screen.getByText(/எதற்காக நாள் பார்க்கிறீர்கள்/)).toBeTruthy();
    expect((await screen.findAllByText(/விவரம் பார்க்க தொடவும்/, {}, { timeout: 5000 })).length).toBeGreaterThan(20);
    await fireEvent.press(screen.getAllByText(/விவரம் பார்க்க தொடவும்/)[0]);
    expect(screen.getAllByText(/விவரம் பார்க்க தொடவும்/).length).toBeGreaterThan(20);
    expect(screen.getByText(/இந்த நாளின் நல்ல நேரம்/)).toBeTruthy();
    expect(screen.getAllByText(/ராகு காலம்/).length).toBeGreaterThan(0);
  });

  it('shows personal Chandrashtamam alert when birthRashi matches today', async () => {
    const place = placeById('chennai');
    const today = toLocal(new Date(), place.utcOffsetMin).date;
    const day = nallaNeramDay(today, place, 'sun');
    const matchingRashi = chandrashtamaRashi(day.moonRashi[0].index);

    const store = makeStore();
    store.dispatch(setBirthRashi(matchingRashi));

    await render(
      <Provider store={store}>
        <NallaNeramScreen />
      </Provider>,
    );
    expect(screen.getByText(/உங்கள் ராசிக்கு/)).toBeTruthy();
    expect(screen.getByText(/உங்கள் ராசி$/)).toBeTruthy();
  });

  it('shows Today at a Glance card on HomeScreen', async () => {
    await render(
      <Provider store={makeStore()}>
        <NavigationContainer>
          <HomeScreen />
        </NavigationContainer>
      </Provider>,
    );
    expect(screen.getByText(/முழு விவரம் பார்க்க/)).toBeTruthy();
    expect(screen.getAllByText(/நல்ல நேரம்/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/ராகு காலம்/).length).toBeGreaterThan(0);
  });
});
