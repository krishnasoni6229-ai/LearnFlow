import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { storage } from '../../utils/storage';

const PREFERENCES_KEY = 'lf_preferences';

export interface PreferencesState {
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  preferencesLoaded: boolean;
}

const initialState: PreferencesState = {
  theme: 'dark',
  notificationsEnabled: true,
  preferencesLoaded: false,
};

export const loadPreferences = createAsyncThunk(
  'preferences/load',
  async () => {
    const data = await storage.getData(PREFERENCES_KEY);
    return (data as Partial<PreferencesState>) ?? {};
  }
);

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
      storage.setData(PREFERENCES_KEY, {
        theme: state.theme,
        notificationsEnabled: state.notificationsEnabled,
      });
    },
    toggleNotifications: (state) => {
      state.notificationsEnabled = !state.notificationsEnabled;
      storage.setData(PREFERENCES_KEY, {
        theme: state.theme,
        notificationsEnabled: state.notificationsEnabled,
      });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadPreferences.fulfilled, (state, action) => {
      state.theme = action.payload.theme ?? 'dark';
      if (action.payload.notificationsEnabled !== undefined) {
        state.notificationsEnabled = action.payload.notificationsEnabled;
      }
      state.preferencesLoaded = true;
    });
  },
});

export const { setTheme, toggleNotifications } = preferencesSlice.actions;
export default preferencesSlice.reducer;
