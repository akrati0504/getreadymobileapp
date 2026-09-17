import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

export const sendOtp = createAsyncThunk(
  'auth/sendOtp',
  async (mobileData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login/send-otp', mobileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send OTP');
    }
  }
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async (verificationData, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login/verify-otp', verificationData);
      if (response.data.success && response.data.data) {
          // Keep backwards compatibility with the existing manual reducer call
          dispatch(loginSuccess(response.data.data));
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to verify OTP');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { dispatch, rejectWithValue, getState }) => {
    try {
      const state = getState();
      const token = state.auth?.user?.token || state.auth?.token;
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      
      await api.post('/auth/logout', {}, config);
      dispatch(logout());
      return true;
    } catch (error) {
      // Even if API fails, log them out locally
      dispatch(logout());
      return rejectWithValue(error.response?.data?.message || 'Failed to logout');
    }
  }
);

export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { getState, rejectWithValue, dispatch }) => {
    try {
      const state = getState();
      const token = state.auth?.user?.token || state.auth?.token;
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      
      const response = await api.get('/profile', config);
      if (response.data.success) {
          dispatch(loginSuccess(response.data.data)); // Re-use loginSuccess to update user object
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { getState, rejectWithValue, dispatch }) => {
    try {
      const state = getState();
      const token = state.auth?.user?.token || state.auth?.token;
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      
      const response = await api.post('/profile/update', profileData, config);
      if (response.data.success) {
          dispatch(fetchProfile()); // Re-fetch profile to get updated details
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOtp.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state) => {
        state.loading = false;
        // The actual user setting is handled by the dispatched loginSuccess
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProfile.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProfile.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;
