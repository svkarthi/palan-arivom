import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { resetAll } from '@core/store/actions';

import type { RoomId } from '../data/rooms';
import type { ZoneId } from '../data/zones';
import type { Placements } from '../utils/scoring';
import { normalizeDegrees } from '../utils/heading';

export type PlanMode = '16' | '9';

export type PlanState = {
  imageUri: string | null;
  mode: PlanMode;
  /** Clockwise degrees from the top of the plan to north. */
  rotation: number;
  placements: Placements;
};

const initialState: PlanState = {
  imageUri: null,
  mode: '16',
  rotation: 0,
  placements: {},
};

const planSlice = createSlice({
  name: 'plan',
  initialState,
  reducers: {
    setImage(state, action: PayloadAction<string | null>) {
      state.imageUri = action.payload;
    },
    setMode(state, action: PayloadAction<PlanMode>) {
      if (state.mode === action.payload) return;
      state.mode = action.payload;
      // Zones differ between modes, so earlier placements no longer apply.
      state.placements = {};
    },
    setRotation(state, action: PayloadAction<number>) {
      state.rotation = Math.round(normalizeDegrees(action.payload) * 10) / 10;
    },
    placeRoom(state, action: PayloadAction<{ roomId: RoomId; zone: ZoneId }>) {
      const { roomId, zone } = action.payload;
      state.placements[roomId] = zone;
    },
    removeRoom(state, action: PayloadAction<RoomId>) {
      delete state.placements[action.payload];
    },
    clearZone(state, action: PayloadAction<ZoneId>) {
      for (const [roomId, zone] of Object.entries(state.placements)) {
        if (zone === action.payload) delete state.placements[roomId as RoomId];
      }
    },
    clearPlacements(state) {
      state.placements = {};
    },
  },
  extraReducers: (builder) => {
    builder.addCase(resetAll, () => initialState);
  },
});

export const {
  setImage,
  setMode,
  setRotation,
  placeRoom,
  removeRoom,
  clearZone,
  clearPlacements,
} = planSlice.actions;
export default planSlice.reducer;
