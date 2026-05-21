import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { storage } from '../../utils/storage';
import { apiClient } from '../../api/client';
import { User } from '../../types/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true, // Start loading for auto-login
  error: null,
};

// Check if user is logged in
export const loadUser = createAsyncThunk('auth/loadUser', async (_, { rejectWithValue }) => {
  try {
    const token = await storage.getToken('accessToken');
    if (!token) {
      return rejectWithValue('No token found');
    }
    const cachedUser = await storage.getData('user');
    try {
      const response = await apiClient.get('/api/v1/users/current-user');
      const freshUser = response.data.data;
      await storage.setData('user', freshUser);
      return { user: freshUser, token };
    } catch (apiError: any) {
      const status = apiError.response?.status;
      const isAuthError = status === 401 || status === 403;
      if (cachedUser && !isAuthError) {
        console.log('API call failed during loadUser, falling back to cached user:', cachedUser.username);
        return { user: cachedUser, token };
      }
      throw apiError;
    }
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to load user');
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await apiClient.post('/api/v1/users/logout');
  } catch (e) {
    console.warn('API logout failed, performing local logout:', e);
  } finally {
    await storage.deleteToken('accessToken');
    await storage.deleteToken('refreshToken');
    await storage.deleteData('user');
  }
  return true;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ user: User; accessToken: string; refreshToken: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.accessToken;
      state.isAuthenticated = true;
      storage.setToken('accessToken', action.payload.accessToken);
      storage.setToken('refreshToken', action.payload.refreshToken);
      storage.setData('user', action.payload.user);
    },
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        storage.setData('user', state.user);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
  },
});

export const { setAuth, updateProfile } = authSlice.actions;
export default authSlice.reducer;
