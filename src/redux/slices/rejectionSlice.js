import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

// Fetch Rejections (index)
export const fetchRejections = createAsyncThunk(
  'rejections/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth?.user?.token || state.auth?.token;
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const response = await api.get('/rejections', config);
      if (response.data.success) {
        return response.data.data.rejectedItems;
      }
      return rejectWithValue('Failed to fetch rejections');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Something went wrong');
    }
  }
);

// Fetch Form Data for editing a rejection
export const fetchFormData = createAsyncThunk(
  'rejections/fetchFormData',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth?.user?.token || state.auth?.token;
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const response = await api.get('/rejections/form-data', config);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue('Failed to fetch form data');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Something went wrong');
    }
  }
);

// Fetch specific Rejection Details (show)
export const fetchRejectionDetails = createAsyncThunk(
  'rejections/fetchDetails',
  async (id, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth?.user?.token || state.auth?.token;
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const response = await api.get(`/rejections/${id}`, config);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue('Failed to fetch rejection details');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Something went wrong');
    }
  }
);

// Submit Fix for a rejection
export const submitRejectionFix = createAsyncThunk(
  'rejections/submitFix',
  async ({ id, formData }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth?.user?.token || state.auth?.token;
      
      const config = {
        headers: { 
          'Content-Type': 'multipart/form-data',
        }
      };
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      const response = await api.post(`/rejections/${id}`, formData, config);
      if (response.data.success) {
        return response.data;
      }
      return rejectWithValue(response.data.message || 'Failed to submit fix');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Something went wrong');
    }
  }
);

const initialState = {
  items: [],
  formData: null,
  currentDetails: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
};

const rejectionSlice = createSlice({
  name: 'rejections',
  initialState,
  reducers: {
    clearCurrentDetails: (state) => {
      state.currentDetails = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Rejections
      .addCase(fetchRejections.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRejections.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchRejections.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Form Data
      .addCase(fetchFormData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFormData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.formData = action.payload;
      })
      .addCase(fetchFormData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Details
      .addCase(fetchRejectionDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRejectionDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentDetails = action.payload;
      })
      .addCase(fetchRejectionDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Submit Fix
      .addCase(submitRejectionFix.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(submitRejectionFix.fulfilled, (state) => {
        state.isSubmitting = false;
      })
      .addCase(submitRejectionFix.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentDetails } = rejectionSlice.actions;

export default rejectionSlice.reducer;
