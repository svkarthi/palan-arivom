import { configureStore } from '@reduxjs/toolkit';

import { resetAll } from '../src/core/store/actions';
import compass, { lockReading, setDeclination } from '../src/features/vastu/store/compassSlice';
import plan, { placeRoom, setMode, setRotation } from '../src/features/vastu/store/planSlice';
import settings from '../src/core/store/settingsSlice';

const makeStore = () => configureStore({ reducer: { settings, plan, compass } });

describe('plan slice', () => {
  it('moves a room when placed again', () => {
    const store = makeStore();
    store.dispatch(placeRoom({ roomId: 'kitchen', zone: 'NE' }));
    store.dispatch(placeRoom({ roomId: 'kitchen', zone: 'SE' }));
    expect(store.getState().plan.placements).toEqual({ kitchen: 'SE' });
  });

  it('clears placements when the mode changes', () => {
    const store = makeStore();
    store.dispatch(placeRoom({ roomId: 'kitchen', zone: 'SE' }));
    store.dispatch(setMode('9'));
    expect(store.getState().plan.placements).toEqual({});
  });

  it('normalizes rotation', () => {
    const store = makeStore();
    store.dispatch(setRotation(-15));
    expect(store.getState().plan.rotation).toBe(345);
  });
});

describe('compass slice', () => {
  it('clamps declination', () => {
    const store = makeStore();
    store.dispatch(setDeclination(99));
    expect(store.getState().compass.declination).toBe(30);
  });

  it('keeps only the latest 20 readings', () => {
    const store = makeStore();
    for (let i = 0; i < 25; i++) {
      store.dispatch(lockReading({ id: String(i), heading: i, zone: 'N', at: i }));
    }
    const { history } = store.getState().compass;
    expect(history).toHaveLength(20);
    expect(history[0].id).toBe('24');
  });

  it('resets every slice', () => {
    const store = makeStore();
    store.dispatch(setDeclination(2));
    store.dispatch(placeRoom({ roomId: 'pooja', zone: 'NE' }));
    store.dispatch(resetAll());
    expect(store.getState().compass.declination).toBe(0);
    expect(store.getState().plan.placements).toEqual({});
  });
});
