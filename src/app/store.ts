// src/app/store.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";

import shopsReducer from "../features/shops/shopsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    shops: shopsReducer,  
  },
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
