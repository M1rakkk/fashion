// src/api/cart.api.ts
import http from "./http";

export interface ICartItemRequest {
  productId: string;
  shopId: string;
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

export interface ICartItemResponse {
  productId: string;
  shopId: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
  imageUrl?: string;
}

export interface ICartResponse {
  userId: string;
  items: ICartItemResponse[];
  totalPrice: number;
  totalItems: number;
  lastUpdated: string;
}

export const cartApi = {
  // Get current user's cart
  get: () => http.get<ICartResponse>("/api/cart"),

  // Add item to cart
  addItem: (payload: ICartItemRequest) => http.post<ICartResponse>("/api/cart/add", payload),

  // Update item quantity
  updateQuantity: (productId: string, quantity: number) => 
    http.patch<ICartResponse>(`/api/cart/items/${productId}`, { quantity }),

  // Remove item from cart
  removeItem: (productId: string) => http.delete<ICartResponse>(`/api/cart/items/${productId}`),

  // Clear entire cart
  clear: () => http.delete("/api/cart"),
};
