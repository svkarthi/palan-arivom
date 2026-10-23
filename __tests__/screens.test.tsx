import { render, screen, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import '../src/core/i18n';
import i18n from '../src/core/i18n';
import profile from '../src/core/store/profileSlice';
import settings from '../src/core/store/settingsSlice';
import { setLanguage } from '../src/core/store/settingsSlice';
import compass from '../src/features/vastu/store/compassSlice';
import plan from '../src/features/vastu/store/planSlice';
import NallaNaalScreen from '../src/features/nalla-naal/screens/NallaNaalScreen';
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
});
