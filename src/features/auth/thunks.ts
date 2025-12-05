// src/features/auth/thunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import { authApi } from "../../api/auth.api";

export const sendLoginCode = createAsyncThunk(
  "auth/sendLoginCode",
  async (email: string, { rejectWithValue }) => {
    try {
      const res = await authApi.login({ email });
      return { email, data: res.data };
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || err.message);
    }
  }
);

export const confirmOtp = createAsyncThunk(
  "auth/confirmOtp",
  async ({ email, otp }: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const res = await authApi.confirm({ email, otp });
      // Ожидаем что сервер вернёт access token в body: { accessToken: '...' }
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || err.message);
    }
  }
);
