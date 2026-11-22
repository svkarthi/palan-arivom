import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';

import padhigam from '../../features/padhigam/store/padhigamSlice';
import compass from '../../features/vastu/store/compassSlice';
import plan from '../../features/vastu/store/planSlice';
import profile from './profileSlice';
import settings from './settingsSlice';

const rootReducer = combineReducers({ settings, profile, plan, compass, padhigam });

const persistedReducer = persistReducer(
  { key: 'utility-root', version: 1, storage: AsyncStorage, whitelist: ['settings', 'profile', 'plan', 'compass', 'padhigam'] },
  rootReducer,
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefault) =>
    getDefault({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
