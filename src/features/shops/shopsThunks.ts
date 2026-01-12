// src/features/shops/shopsThunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import { shopsApi, ICreateShopRequest, IUpdateShopRequest, IShopResponse } from "../../api/shops.api";

export const fetchMyShops = createAsyncThunk(
  "shops/fetchMyShops",
  async (_, { rejectWithValue }) => {
    try {
      const res = await shopsApi.getMyShops();
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || err.message);
    }
  }
);

export const fetchShopById = createAsyncThunk(
  "shops/fetchShopById",
  async (shopId: string, { rejectWithValue }) => {
    try {
      const res = await shopsApi.getById(shopId);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || err.message);
    }
  }
);

export const createShop = createAsyncThunk(
  "shops/createShop",
  async (payload: ICreateShopRequest, { rejectWithValue }) => {
    try {
      const res = await shopsApi.create(payload);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || err.message);
    }
  }
);

export const updateShop = createAsyncThunk(
  "shops/updateShop",
  async ({ shopId, payload }: { shopId: string; payload: IUpdateShopRequest }, { rejectWithValue }) => {
    try {
      const res = await shopsApi.update(shopId, payload);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || err.message);
    }
  }
);

export const deleteShop = createAsyncThunk(
  "shops/deleteShop",
  async (shopId: string, { rejectWithValue }) => {
    try {
      await shopsApi.delete(shopId);
      return shopId;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || err.message);
    }
  }
);
