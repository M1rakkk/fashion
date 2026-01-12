// src/features/auth/authSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import type { AuthState } from "./types";
import { login, register, registerOwner } from "./thunks";

const initialState: AuthState = {
  email: null,
  accessToken: localStorage.getItem("ADMIN_ACCESS_TOKEN"),
  refreshToken: localStorage.getItem("ADMIN_REFRESH_TOKEN"),
  isAuthenticated: !!localStorage.getItem("ADMIN_ACCESS_TOKEN"),
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
      state.refreshToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem("ADMIN_ACCESS_TOKEN");
      localStorage.removeItem("ADMIN_REFRESH_TOKEN");
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
      // Login
      .addCase(login.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(login.fulfilled, (s, a) => {
        s.loading = false;
        s.accessToken = a.payload.accessToken;
        s.refreshToken = a.payload.refreshToken;
        s.isAuthenticated = true;
        localStorage.setItem("ADMIN_ACCESS_TOKEN", a.payload.accessToken);
        if (a.payload.refreshToken) {
          localStorage.setItem("ADMIN_REFRESH_TOKEN", a.payload.refreshToken);
        }
      })
      .addCase(login.rejected, (s, a) => { s.loading = false; s.error = a.payload as any; })

      // Register
      .addCase(register.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(register.fulfilled, (s) => { s.loading = false; })
      .addCase(register.rejected, (s, a) => { s.loading = false; s.error = a.payload as any; })

      // Register Owner
      .addCase(registerOwner.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(registerOwner.fulfilled, (s) => { s.loading = false; })
      .addCase(registerOwner.rejected, (s, a) => { s.loading = false; s.error = a.payload as any; });
  },
});

export const { logout, setAccessToken } = authSlice.actions;
export default authSlice.reducer;
