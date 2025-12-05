// src/features/shops/shopSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Product {
  id: string;
  name: string;
  price: string;
  image?: string;
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
  createdAt: number;
}

interface ShopsState {
  items: Shop[];
}

const initialState: ShopsState = {
  items: JSON.parse(localStorage.getItem("DEV_SHOPS") || "[]"),
};

const shopSlice = createSlice({
  name: "shops",
  initialState,
  reducers: {
    addShop: (state, action: PayloadAction<Shop>) => {
      state.items.push(action.payload);
      localStorage.setItem("DEV_SHOPS", JSON.stringify(state.items));
    },

    removeShop: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(s => s.id !== action.payload);
      localStorage.setItem("DEV_SHOPS", JSON.stringify(state.items));
    },

    // Добавление товара в конкретный магазин
    addProductToShop: (
      state,
      action: PayloadAction<{ shopId: string; product: Product }>
    ) => {
      const { shopId, product } = action.payload;
      const shop = state.items.find(s => s.id === shopId);
      if (shop) {
        shop.products.push(product);
        localStorage.setItem("DEV_SHOPS", JSON.stringify(state.items));
      }
    },

    // Удаление товара
    removeProductFromShop: (
      state,
      action: PayloadAction<{ shopId: string; productId: string }>
    ) => {
      const { shopId, productId } = action.payload;
      const shop = state.items.find(s => s.id === shopId);
      if (shop) {
        shop.products = shop.products.filter(p => p.id !== productId);
        localStorage.setItem("DEV_SHOPS", JSON.stringify(state.items));
      }
    },

    // Редактирование товара (по желанию — можно потом добавить модалку редактирования)
    updateProductInShop: (
      state,
      action: PayloadAction<{ shopId: string; productId: string; updates: Partial<Product> }>
    ) => {
      const { shopId, productId, updates } = action.payload;
      const shop = state.items.find(s => s.id === shopId);
      if (shop) {
        const product = shop.products.find(p => p.id === productId);
        if (product) {
          Object.assign(product, updates);
          localStorage.setItem("DEV_SHOPS", JSON.stringify(state.items));
        }
      }
    },
  },
});

export const {
  addShop,
  removeShop,
  addProductToShop,
  removeProductFromShop,
  updateProductInShop,
} = shopSlice.actions;

export default shopSlice.reducer;