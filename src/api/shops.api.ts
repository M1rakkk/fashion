// src/api/shops.api.ts
import http from "./http";

export interface ICreateShopRequest {
  shopName: string;
  shopUrl: string;
  description?: string;
  designCode?: string;
  pfpUrl?: string;
}

export interface IUpdateShopRequest {
  shopName?: string;
  description?: string;
  pfpUrl?: string;
  designCode?: string;
}

export interface IShopResponse {
  id: string;
  shopName: string;
  shopUrl: string;
  description?: string;
  pfpUrl?: string;
  designCode?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

// Unified shop type for frontend use
export interface IShopDisplay {
  id: string;
  name: string;
  domain: string;
  coverImage?: string;
  description?: string;
  theme?: string;
  ownerId?: string;
  createdAt: string;
  updatedAt?: string;
}

// Helper to convert API response to display format
export const toShopDisplay = (shop: IShopResponse): IShopDisplay => ({
  id: shop.id,
  name: shop.shopName,
  domain: shop.shopUrl,
  coverImage: shop.pfpUrl,
  description: shop.description,
  theme: shop.designCode,
  ownerId: shop.ownerId,
  createdAt: shop.createdAt,
  updatedAt: shop.updatedAt,
});

export const shopsApi = {
  // Get all shops (public)
  getAll: () => http.get<IShopResponse[]>("/api/shops"),

  // Get shop by ID (public)
  getById: (shopId: string) => http.get<IShopResponse>(`/api/shops/${shopId}`),

  // Get shop by URL (public)
  getByUrl: (shopUrl: string) => http.get<IShopResponse>(`/api/shops/url/${shopUrl}`),

  // Get current user's shops (authenticated, owner role)
  getMyShops: () => http.get<IShopResponse[]>("/api/shops/my-shops"),

  // Create a new shop (authenticated, owner role)
  create: (payload: ICreateShopRequest) => http.post<IShopResponse>("/api/shops", payload),

  // Update shop (authenticated, owner role)
  update: (shopId: string, payload: IUpdateShopRequest) => 
    http.put<IShopResponse>(`/api/shops/${shopId}`, payload),

  // Delete shop (authenticated, owner role)
  delete: (shopId: string) => http.delete(`/api/shops/${shopId}`),
};
