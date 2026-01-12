// src/features/products/productsThunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import { productsApi, categoriesApi, brandsApi, ICreateProductRequest } from "../../api/products.api";

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      const res = await productsApi.getAll();
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || err.message);
    }
  }
);

export const fetchProductById = createAsyncThunk(
  "products/fetchProductById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await productsApi.getById(id);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || err.message);
    }
  }
);

export const searchProducts = createAsyncThunk(
  "products/searchProducts",
  async (query: string, { rejectWithValue }) => {
    try {
      const res = await productsApi.search(query);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || err.message);
    }
  }
);

export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (payload: ICreateProductRequest, { rejectWithValue }) => {
    try {
      const res = await productsApi.create(payload);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || err.message);
    }
  }
);

export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({ id, payload }: { id: string; payload: Partial<ICreateProductRequest> }, { rejectWithValue }) => {
    try {
      const res = await productsApi.update(id, payload);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || err.message);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (id: string, { rejectWithValue }) => {
    try {
      await productsApi.delete(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || err.message);
    }
  }
);

// Categories
export const fetchCategories = createAsyncThunk(
  "products/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const res = await categoriesApi.getAll();
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || err.message);
    }
  }
);

export const createCategory = createAsyncThunk(
  "products/createCategory",
  async (payload: { name: string; parentId?: string }, { rejectWithValue }) => {
    try {
      const res = await categoriesApi.create(payload);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || err.message);
    }
  }
);

// Brands
export const fetchBrands = createAsyncThunk(
  "products/fetchBrands",
  async (_, { rejectWithValue }) => {
    try {
      const res = await brandsApi.getAll();
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || err.message);
    }
  }
);

export const createBrand = createAsyncThunk(
  "products/createBrand",
  async (payload: { name: string }, { rejectWithValue }) => {
    try {
      const res = await brandsApi.create(payload);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || err.message);
    }
  }
);
