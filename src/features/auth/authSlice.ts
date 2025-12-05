// src/features/auth/authSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import type { AuthState } from "./types";
import { sendLoginCode, confirmOtp } from "./thunks";

const initialState: AuthState = {
  email: null,
  accessToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.email = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem("ADMIN_ACCESS_TOKEN");
    },
    setAccessToken(state, action) {
      state.accessToken = action.payload;
      state.isAuthenticated = !!action.payload;
      if (action.payload) {
        localStorage.setItem("ADMIN_ACCESS_TOKEN", action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendLoginCode.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(sendLoginCode.fulfilled, (s, a) => { s.loading = false; s.email = a.payload.email; })
      .addCase(sendLoginCode.rejected, (s, a) => { s.loading = false; s.error = a.payload as any; })

      .addCase(confirmOtp.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(confirmOtp.fulfilled, (s, a) => {
  s.loading = false;

  
  // выдаём временный фейковый токен(бэкэнд не подкючен)
  const token =
    a.payload?.accessToken ||
    a.payload?.token ||
    "FAKE_TOKEN_FOR_DEV";

  s.accessToken = token;
  s.isAuthenticated = true;

  localStorage.setItem("ADMIN_ACCESS_TOKEN", token);
      })
      .addCase(confirmOtp.rejected, (s, a) => { s.loading = false; s.error = a.payload as any; });
  },
});

export const { logout, setAccessToken } = authSlice.actions;
export default authSlice.reducer;
