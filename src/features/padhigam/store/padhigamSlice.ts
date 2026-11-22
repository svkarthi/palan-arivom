import { resetAll } from '@core/store/actions';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export const MIN_PADHIGAM_FONT = 15;
export const MAX_PADHIGAM_FONT = 26;
export const DEFAULT_PADHIGAM_FONT = 18;
const MAX_HISTORY_DAYS = 30;

export type PadhigamState = {
  /** Bookmarked Padhigam IDs. */
  favorites: string[];
  /** Verse font size in logical pixels (15–26). */
  fontSize: number;
  /** Whether verse-by-verse meaning (பொழிப்புரை) is expanded by default. */
  showMeaning: boolean;
  /** Padhigam IDs marked as recited per civil date (`YYYY-MM-DD`). */
  completedByDate: Record<string, string[]>;
};

const initialState: PadhigamState = {
  favorites: [],
  fontSize: DEFAULT_PADHIGAM_FONT,
  showMeaning: false,
  completedByDate: {},
};

const clampFont = (n: number) => Math.max(MIN_PADHIGAM_FONT, Math.min(MAX_PADHIGAM_FONT, Math.round(n)));

const padhigamSlice = createSlice({
  name: 'padhigam',
  initialState,
  reducers: {
    toggleFavorite(state, action: PayloadAction<string>) {
      const id = action.payload;
      const idx = state.favorites.indexOf(id);
      if (idx >= 0) state.favorites.splice(idx, 1);
      else state.favorites.push(id);
    },
    setFontSize(state, action: PayloadAction<number>) {
      state.fontSize = clampFont(action.payload);
    },
    stepFontSize(state, action: PayloadAction<number>) {
      state.fontSize = clampFont(state.fontSize + action.payload);
    },
    toggleShowMeaning(state) {
      state.showMeaning = !state.showMeaning;
    },
    toggleCompletedOnDate(state, action: PayloadAction<{ dateKey: string; padhigamId: string }>) {
      const { dateKey, padhigamId } = action.payload;
      const list = state.completedByDate[dateKey] ?? [];
      const idx = list.indexOf(padhigamId);
      if (idx >= 0) {
        const next = list.filter((x) => x !== padhigamId);
        if (next.length === 0) delete state.completedByDate[dateKey];
        else state.completedByDate[dateKey] = next;
      } else {
        state.completedByDate[dateKey] = [...list, padhigamId];
      }
      // Keep only the most recent 30 recorded days so AsyncStorage stays compact.
      const keys = Object.keys(state.completedByDate).sort();
      while (keys.length > MAX_HISTORY_DAYS) {
        const oldest = keys.shift();
        if (oldest) delete state.completedByDate[oldest];
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(resetAll, () => initialState);
  },
});

export const {
  toggleFavorite,
  setFontSize,
  stepFontSize,
  toggleShowMeaning,
  toggleCompletedOnDate,
} = padhigamSlice.actions;

export default padhigamSlice.reducer;
