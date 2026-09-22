import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

const getAuthHeaders = (getState) => {
  const state = getState();
  const token = state.auth?.token || state.auth?.user?.token;
  return { 'Authorization': `Bearer ${token}` };
};

export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (orderData, { getState, rejectWithValue }) => {
    try {
      const response = await api.post('/orders/create', orderData, {
        headers: getAuthHeaders(getState),
      });
      if (!response.data.success) return rejectWithValue(response.data.message);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const verifyPayment = createAsyncThunk(
  'order/verifyPayment',
  async (verifyData, { getState, rejectWithValue }) => {
    try {
      const response = await api.post('/orders/verify', verifyData, {
        headers: getAuthHeaders(getState),
      });
      if (!response.data.success) return rejectWithValue(response.data.message);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchOrders = createAsyncThunk(
  'order/fetchOrders',
  async (_, { getState, rejectWithValue }) => {
    try {
      const response = await api.get('/orders', {
        headers: getAuthHeaders(getState),
      });
      if (!response.data.success) return rejectWithValue(response.data.message);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchSales = createAsyncThunk(
  'order/fetchSales',
  async (_, { getState, rejectWithValue }) => {
    try {
      const response = await api.get('/sales', {
        headers: getAuthHeaders(getState),
      });
      if (!response.data.success) return rejectWithValue(response.data.message);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// New Actions to match Web App Flow

export const cancelOrder = createAsyncThunk(
  'order/cancelOrder',
  async ({ orderId }, { getState, rejectWithValue }) => {
    try {
      const response = await api.post(`/orders/${orderId}/cancel`, {}, {
        headers: getAuthHeaders(getState),
      });
      if (!response.data.success) return rejectWithValue(response.data.message);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const returnOrder = createAsyncThunk(
  'order/returnOrder',
  async ({ orderId, type, return_date }, { getState, rejectWithValue }) => {
    try {
      const response = await api.post(`/orders/${orderId}/return`, { type, return_date }, {
        headers: getAuthHeaders(getState),
      });
      if (!response.data.success) return rejectWithValue(response.data.message);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getExtendQuote = createAsyncThunk(
  'order/getExtendQuote',
  async ({ orderId, clothId, newDate }, { getState, rejectWithValue }) => {
    try {
      const response = await api.get(`/orders/${orderId}/extension-quote?cloth_id=${clothId}&new_date=${newDate}`, {
        headers: getAuthHeaders(getState),
      });
      if (!response.data.success) return rejectWithValue(response.data.message);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const extendOrder = createAsyncThunk(
  'order/extendOrder',
  async ({ orderId, clothId, newDate }, { getState, rejectWithValue }) => {
    try {
      const response = await api.post(`/orders/${orderId}/extend`, { cloth_id: clothId, new_date: newDate }, {
        headers: getAuthHeaders(getState),
      });
      if (!response.data.success) return rejectWithValue(response.data.message);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getBuyQuote = createAsyncThunk(
  'order/getBuyQuote',
  async ({ orderId, clothId }, { getState, rejectWithValue }) => {
    try {
      const response = await api.get(`/orders/${orderId}/purchase-eligibility?cloth_id=${clothId}`, {
        headers: getAuthHeaders(getState),
      });
      if (!response.data.success) return rejectWithValue(response.data.message);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const buyOrder = createAsyncThunk(
  'order/buyOrder',
  async ({ orderId, clothId }, { getState, rejectWithValue }) => {
    try {
      const response = await api.post(`/orders/${orderId}/convert-to-purchase`, { cloth_id: clothId }, {
        headers: getAuthHeaders(getState),
      });
      if (!response.data.success) return rejectWithValue(response.data.message);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const rateOrder = createAsyncThunk(
  'order/rateOrder',
  async ({ orderId, rating, review }, { getState, rejectWithValue }) => {
    try {
      const response = await api.post(`/orders/${orderId}/rate`, { rating, review }, {
        headers: getAuthHeaders(getState),
      });
      if (!response.data.success) return rejectWithValue(response.data.message);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);


const initialState = {
  currentOrder: null,
  orders: { data: [], current_page: 1, last_page: 1, total: 0 },
  sales: { data: [], current_page: 1, last_page: 1, total: 0 },
  isLoading: false,
  error: null,
};

const handlePending = (state) => {
  state.isLoading = true;
  state.error = null;
};

const handleRejected = (state, action) => {
  state.isLoading = false;
  state.error = action.payload;
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearOrderError: (state) => {
      state.error = null;
    },
    resetOrderState: (state) => {
      state.currentOrder = null;
      state.isLoading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Order
      .addCase(createOrder.pending, handlePending)
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
      })
      .addCase(createOrder.rejected, handleRejected)
      // Verify Payment
      .addCase(verifyPayment.pending, handlePending)
      .addCase(verifyPayment.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(verifyPayment.rejected, handleRejected)
      // Fetch Orders
      .addCase(fetchOrders.pending, handlePending)
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.orders; 
      })
      .addCase(fetchOrders.rejected, handleRejected)
      // Fetch Sales
      .addCase(fetchSales.pending, handlePending)
      .addCase(fetchSales.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sales = action.payload.orders; // The backend returns 'orders' in the payload
      })
      .addCase(fetchSales.rejected, handleRejected)
      // Generic loading states for mutations
      .addCase(cancelOrder.pending, handlePending)
      .addCase(cancelOrder.fulfilled, (state) => { state.isLoading = false; })
      .addCase(cancelOrder.rejected, handleRejected)
      
      .addCase(returnOrder.pending, handlePending)
      .addCase(returnOrder.fulfilled, (state) => { state.isLoading = false; })
      .addCase(returnOrder.rejected, handleRejected)
      
      .addCase(extendOrder.pending, handlePending)
      .addCase(extendOrder.fulfilled, (state) => { state.isLoading = false; })
      .addCase(extendOrder.rejected, handleRejected)

      .addCase(buyOrder.pending, handlePending)
      .addCase(buyOrder.fulfilled, (state) => { state.isLoading = false; })
      .addCase(buyOrder.rejected, handleRejected)

      .addCase(rateOrder.pending, handlePending)
      .addCase(rateOrder.fulfilled, (state) => { state.isLoading = false; })
      .addCase(rateOrder.rejected, handleRejected);
  },
});

export const { clearOrderError, resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;
