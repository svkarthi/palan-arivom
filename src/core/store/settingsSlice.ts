import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { DEFAULT_LANG, type Lang } from '../i18n';
import { resetAll } from './actions';

export type SettingsState = {
  language: Lang;
  voice: boolean;
};

const initialState: SettingsState = {
  language: DEFAULT_LANG,
  voice: false,
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
  },
  extraReducers: (builder) => {
    builder.addCase(resetAll, () => initialState);
  },
});

export const { setLanguage, setVoice } = settingsSlice.actions;
export default settingsSlice.reducer;
