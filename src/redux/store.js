import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

const rootReducer = combineReducers({
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
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'], // Only persist the auth slice
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
