import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import cartReducer from './slices/cartSlice';
import userReducer from './slices/userSlice';
import uiReducer from './slices/uiSlice';
import { productsApi } from './api/productsApi';
import { ordersApi } from './api/ordersApi';
import { usersApi } from './api/usersApi';

import { cartApi } from './api/cartApi';

export const makeStore = () => {
  return configureStore({
    reducer: {
      cart: cartReducer,
      user: userReducer,
      ui: uiReducer,
      [productsApi.reducerPath]: productsApi.reducer,
      [ordersApi.reducerPath]: ordersApi.reducer,
      [usersApi.reducerPath]: usersApi.reducer,
      [cartApi.reducerPath]: cartApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
          productsApi.middleware, 
          ordersApi.middleware, 
          usersApi.middleware,
          cartApi.middleware
      ),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
