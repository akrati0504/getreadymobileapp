import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth?.user?.token || state.auth?.token;
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const response = await api.get('/notifications', config);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth?.user?.token || state.auth?.token;
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const response = await api.get('/notifications/unread-count', config);
      return response.data.data.unreadCount;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch unread count');
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth?.user?.token || state.auth?.token;
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const response = await api.post('/notifications/read', { notification_id: notificationId }, config);
      return { id: notificationId, unreadCount: response.data.data.unreadCount };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark as read');
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth?.user?.token || state.auth?.token;
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const response = await api.post('/notifications/read-all', {}, config);
      return response.data.data.unreadCount;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark all as read');
    }
  }
);

const initialState = {
  data: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Unread Count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const item = state.data.find(n => n.id === action.payload.id);
        if (item) {
          item.read = true;
        }
        state.unreadCount = action.payload.unreadCount;
      })
      // Mark all as read
      .addCase(markAllAsRead.fulfilled, (state, action) => {
        state.data = [];
        state.unreadCount = action.payload;
      });
  },
});

export default notificationSlice.reducer;
