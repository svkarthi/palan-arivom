import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { DEFAULT_LANG, type Lang } from '../i18n';
import { resetAll } from './actions';

export type SettingsState = {
  language: Lang;
  voice: boolean;
  reminders: boolean;
};

const initialState: SettingsState = {
  language: DEFAULT_LANG,
  voice: false,
  reminders: false,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLanguage(state, action: PayloadAction<Lang>) {
      state.language = action.payload;
    },
    setVoice(state, action: PayloadAction<boolean>) {
      state.voice = action.payload;
    },
    setReminders(state, action: PayloadAction<boolean>) {
      state.reminders = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(resetAll, () => initialState);
  },
});

export const { setLanguage, setVoice, setReminders } = settingsSlice.actions;
export default settingsSlice.reducer;
