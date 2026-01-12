// src/features/files/filesThunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import { filesApi } from "../../api/files.api";

export const uploadFile = createAsyncThunk(
  "files/uploadFile",
  async ({ file, category }: { file: File; category?: string }, { rejectWithValue }) => {
    try {
      const res = await filesApi.upload(file, category);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || err.message);
    }
  }
);

export const deleteFile = createAsyncThunk(
  "files/deleteFile",
  async (fileName: string, { rejectWithValue }) => {
    try {
      await filesApi.delete(fileName);
      return fileName;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || err.message);
    }
  }
);
