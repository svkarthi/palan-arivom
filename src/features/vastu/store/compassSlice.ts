import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { resetAll } from '@core/store/actions';
import type { ZoneId } from '../data/zones';

export type LockedReading = {
  id: string;
  heading: number;
  zone: ZoneId;
  at: number;
};

export type CompassState = {
  /** Degrees added to the magnetic heading to get true heading. */
  declination: number;
  history: LockedReading[];
};

const MAX_HISTORY = 20;

const initialState: CompassState = { declination: 0, history: [] };

const compassSlice = createSlice({
  name: 'compass',
  initialState,
  reducers: {
    lockReading(state, action: PayloadAction<LockedReading>) {
      state.history.unshift(action.payload);
      state.history.length = Math.min(state.history.length, MAX_HISTORY);
    },
    setDeclination(state, action: PayloadAction<number>) {
      state.declination = Math.max(-30, Math.min(30, action.payload));
    },
    clearReadings(state) {
      state.history = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(resetAll, () => initialState);
  },
});

export const { lockReading, setDeclination, clearReadings } = compassSlice.actions;
export default compassSlice.reducer;
