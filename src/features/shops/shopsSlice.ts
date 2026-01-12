// src/features/shops/shopsSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IShopDisplay, toShopDisplay } from "../../api/shops.api";
import { fetchMyShops, fetchShopById, createShop, updateShop, deleteShop } from "./shopsThunks";

export interface Product {
  id: string;
  name: string;
  price: string;
  image?: string;
  sizes?: string[];
}

export interface Shop {
  id: string;
  name: string;
  domain: string;
  coverImage?: string;
  theme?: string;
  categories: string[];
  brands: string[];
  products: Product[];  
  news: any[];
  deliverySettings?: {
      methods: string[];
      price?: number;
      paymentMethods: string[];
      returnPolicy?: string;
    };
  createdAt: number;
}

interface ShopsState {
  items: IShopDisplay[];
  currentShop: IShopDisplay | null;
  loading: boolean;
  error: string | null;
  // Keep local items for backward compatibility during transition
  localItems: Shop[];
}

const initialState: ShopsState = {
  items: [],
  currentShop: null,
  loading: false,
  error: null,
  localItems: JSON.parse(localStorage.getItem("DEV_SHOPS") || "[]"),
};

const shopSlice = createSlice({
  name: "shops",
  initialState,
  reducers: {
    clearCurrentShop(state) {
      state.currentShop = null;
    },
    clearError(state) {
      state.error = null;
    },
    // Legacy actions for local storage (backward compatibility)
    addShop: (state, action: PayloadAction<Shop>) => {
      state.localItems.push(action.payload);
      localStorage.setItem("DEV_SHOPS", JSON.stringify(state.localItems));
    },
    removeShop: (state, action: PayloadAction<string>) => {
      state.localItems = state.localItems.filter(s => s.id !== action.payload);
      localStorage.setItem("DEV_SHOPS", JSON.stringify(state.localItems));
    },
    addProductToShop: (
      state,
      action: PayloadAction<{ shopId: string; product: Product }>
    ) => {
      const { shopId, product } = action.payload;
      const shop = state.localItems.find(s => s.id === shopId);
      if (shop) {
        shop.products.push(product);
        localStorage.setItem("DEV_SHOPS", JSON.stringify(state.localItems));
      }
    },
    removeProductFromShop: (
      state,
      action: PayloadAction<{ shopId: string; productId: string }>
    ) => {
      const { shopId, productId } = action.payload;
      const shop = state.localItems.find(s => s.id === shopId);
      if (shop) {
        shop.products = shop.products.filter(p => p.id !== productId);
        localStorage.setItem("DEV_SHOPS", JSON.stringify(state.localItems));
      }
    },
    updateProductInShop: (
      state,
      action: PayloadAction<{ shopId: string; productId: string; updates: Partial<Product> }>
    ) => {
      const { shopId, productId, updates } = action.payload;
      const shop = state.localItems.find(s => s.id === shopId);
      if (shop) {
        const product = shop.products.find(p => p.id === productId);
        if (product) {
          Object.assign(product, updates);
          localStorage.setItem("DEV_SHOPS", JSON.stringify(state.localItems));
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch my shops
      .addCase(fetchMyShops.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyShops.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.map(toShopDisplay);
      })
      .addCase(fetchMyShops.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch shop by ID
      .addCase(fetchShopById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShopById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentShop = toShopDisplay(action.payload);
      })
      .addCase(fetchShopById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create shop
      .addCase(createShop.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createShop.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(toShopDisplay(action.payload));
      })
      .addCase(createShop.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update shop
      .addCase(updateShop.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateShop.fulfilled, (state, action) => {
        state.loading = false;
        const updated = toShopDisplay(action.payload);
        const index = state.items.findIndex((s: IShopDisplay) => s.id === updated.id);
        if (index !== -1) {
          state.items[index] = updated;
        }
        if (state.currentShop?.id === updated.id) {
          state.currentShop = updated;
        }
      })
      .addCase(updateShop.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete shop
      .addCase(deleteShop.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteShop.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((s: IShopDisplay) => s.id !== action.payload);
      })
      .addCase(deleteShop.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearCurrentShop,
  clearError,
  addShop,
  removeShop,
  addProductToShop,
  removeProductFromShop,
  updateProductInShop,
} = shopSlice.actions;

export default shopSlice.reducer;