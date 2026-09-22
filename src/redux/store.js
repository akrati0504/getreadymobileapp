import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import brandReducer from './slices/brandSlice';
import categoryReducer from './slices/categorySlice';
import dropdownReducer from './slices/dropdownSlice';
import outfitReducer from './slices/outfitSlice';
import clothesReducer from './slices/clothesSlice';
import cartReducer from './slices/cartSlice';
import orderReducer from './slices/orderSlice';
import notificationReducer from './slices/notificationSlice';
import rejectionReducer from './slices/rejectionSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    brand: brandReducer,
    category: categoryReducer,
    dropdown: dropdownReducer,
    outfit: outfitReducer,
    clothes: clothesReducer,
    cart: cartReducer,
    order: orderReducer,
    notifications: notificationReducer,
    rejections: rejectionReducer,
  },
});
