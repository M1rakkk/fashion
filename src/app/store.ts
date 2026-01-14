// src/app/store.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import shopsReducer from "../features/shops/shopsSlice";
import productsReducer from "../features/products/productsSlice";
import notificationsReducer from "../features/notifications/notificationsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    shops: shopsReducer,
    products: productsReducer,
    notifications: notificationsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => store.dispatch;
