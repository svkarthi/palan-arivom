import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { DEFAULT_PLACE_ID } from '../astro/places';
import { resetAll } from './actions';

export type ProfileState = {
  placeId: string;
  /** Birth nakshatra 0-26, used for Tarabalam; `null` when not set. */
  birthNakshatra: number | null;
  /** Birth rashi 0-11, used for Chandrabalam; `null` when not set. */
  birthRashi: number | null;
  /** How Rahu Kalam, Yamagandam and Kuligai are measured. */
  dayPartBasis: 'sun' | 'fixed';
};

const initialState: ProfileState = { placeId: DEFAULT_PLACE_ID, birthNakshatra: null, birthRashi: null, dayPartBasis: 'sun' };

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setPlace(state, action: PayloadAction<string>) {
      state.placeId = action.payload;
    },
    setBirthNakshatra(state, action: PayloadAction<number | null>) {
      state.birthNakshatra = action.payload;
    },
    setBirthRashi(state, action: PayloadAction<number | null>) {
      state.birthRashi = action.payload;
    },
    setDayPartBasis(state, action: PayloadAction<'sun' | 'fixed'>) {
      state.dayPartBasis = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(resetAll, () => initialState);
  },
});

export const { setPlace, setBirthNakshatra, setBirthRashi, setDayPartBasis } = profileSlice.actions;
export default profileSlice.reducer;
