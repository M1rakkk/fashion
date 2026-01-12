// src/features/auth/thunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import { authApi, ILoginBody, IRegisterBody } from "../../api/auth.api";

export const login = createAsyncThunk(
  "auth/login",
  async (payload: ILoginBody, { rejectWithValue }) => {
    try {
      const res = await authApi.login(payload);
      // Keycloak returns: { access_token, refresh_token, expires_in, ... }
      return {
        accessToken: res.data.access_token,
        refreshToken: res.data.refresh_token,
        expiresIn: res.data.expires_in,
      };
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || err.message);
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (payload: IRegisterBody, { rejectWithValue }) => {
    try {
      const res = await authApi.register(payload);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || err.message);
    }
  }
);

export const registerOwner = createAsyncThunk(
  "auth/registerOwner",
  async (payload: IRegisterBody, { rejectWithValue }) => {
    try {
      const res = await authApi.registerOwner({ ...payload, role: "owner" });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || err.message);
    }
  }
);
