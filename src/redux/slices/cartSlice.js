import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

// Async thunk to fetch cart items
export const fetchCartItems = createAsyncThunk(
  'cart/fetchCartItems',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth?.user?.token || state.auth?.token;
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const response = await api.get('/cart', config);
      if (response.data.success) {
        return response.data.data; // Should return { items, subtotal, cart_count }
      }
      return rejectWithValue('Failed to fetch cart');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Something went wrong');
    }
  }
);

// Async thunk to remove an item from the cart
export const removeCartItem = createAsyncThunk(
  'cart/removeCartItem',
  async (cartItemId, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth?.user?.token || state.auth?.token;
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const response = await api.post('/cart/remove', { cart_item_id: cartItemId }, config);
      if (response.data.success) {
        return cartItemId;
      }
      return rejectWithValue(response.data.message || 'Failed to remove item');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Something went wrong');
    }
  }
);

// Async thunk to add an item to the cart
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (cartData, { getState, rejectWithValue, dispatch }) => {
    try {
      const state = getState();
      const token = state.auth?.user?.token || state.auth?.token;
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const response = await api.post('/cart/add', cartData, config);
      if (response.data.success) {
        dispatch(fetchCartItems());
        return response.data;
      }
      return rejectWithValue(response.data.message || 'Failed to add item');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Something went wrong');
    }
  }
);

// Async thunk to update quantity of a cart item
export const updateCartQuantity = createAsyncThunk(
  'cart/updateCartQuantity',
  async (updateData, { getState, rejectWithValue, dispatch }) => {
    try {
      const state = getState();
      const token = state.auth?.user?.token || state.auth?.token;
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const response = await api.post('/cart/update-quantity', updateData, config);
      if (response.data.success) {
        dispatch(fetchCartItems());
        return response.data;
      }
      return rejectWithValue(response.data.message || 'Failed to update quantity');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Something went wrong');
    }
  }
);

const initialState = {
  items: [],
  subtotal: 0,
  cartCount: 0,
  isLoading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart: (state) => {
      state.items = [];
      state.subtotal = 0;
      state.cartCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart Items
      .addCase(fetchCartItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.subtotal = action.payload.subtotal;
        state.cartCount = action.payload.cart_count;
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Remove Cart Item
      .addCase(removeCartItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        const removedItemId = action.payload;
        const removedItem = state.items.find(item => item.cart_item_id === removedItemId);
        if (removedItem) {
            state.subtotal -= Number(removedItem.price);
        }
        state.items = state.items.filter((item) => item.cart_item_id !== removedItemId);
        state.cartCount = state.items.length;
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add To Cart
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addToCart.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Cart Quantity
      .addCase(updateCartQuantity.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCartQuantity.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateCartQuantity.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCart } = cartSlice.actions;

export default cartSlice.reducer;
