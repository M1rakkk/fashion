// src/api/products.api.ts
import http from "./http";

export interface ICreateProductRequest {
  shopId: string;
  name: string;
  description?: string;
  price: number;
  categoryId?: string;
  brandId?: string;
  imageUrls?: string[];
  isActive?: boolean;
}

export interface ICategoryResponse {
  id: string;
  shopId?: string;
  title: string;
  parentId?: string;
}

export interface IBrandResponse {
  id: string;
  shopId?: string;
  name: string;
  logoUrl?: string;
}

export interface IProductResponse {
  id: string;
  shopId: string;
  name: string;
  description?: string;
  price: number;
  category?: ICategoryResponse;
  brand?: IBrandResponse;
  imageUrls?: string[];
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export const productsApi = {
  // Get all products
  getAll: () => http.get<IProductResponse[]>("/api/products"),

  // Get products by shop ID
  getByShopId: (shopId: string) => http.get<IProductResponse[]>(`/api/products?shopId=${shopId}`),

  // Get active products by shop ID
  getActiveByShopId: (shopId: string) => http.get<IProductResponse[]>(`/api/products/shop/${shopId}/active`),

  // Get product by ID
  getById: (id: string) => http.get<IProductResponse>(`/api/products/${id}`),

  // Search products
  search: (params: {
    categoryId?: string;
    brandId?: string;
    minPrice?: number;
    maxPrice?: number;
    searchText?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params.categoryId) queryParams.append("categoryId", params.categoryId);
    if (params.brandId) queryParams.append("brandId", params.brandId);
    if (params.minPrice) queryParams.append("minPrice", params.minPrice.toString());
    if (params.maxPrice) queryParams.append("maxPrice", params.maxPrice.toString());
    if (params.searchText) queryParams.append("searchText", params.searchText);
    return http.get<IProductResponse[]>(`/api/products/search?${queryParams.toString()}`);
  },

  // Create product (owner)
  create: (payload: ICreateProductRequest) => http.post<IProductResponse>("/api/products", payload),

  // Update product (owner)
  update: (id: string, payload: Partial<ICreateProductRequest>) => 
    http.put<IProductResponse>(`/api/products/${id}`, payload),

  // Delete product (owner)
  delete: (id: string) => http.delete(`/api/products/${id}`),
};

export const categoriesApi = {
  // Get all categories
  getAll: () => http.get<ICategoryResponse[]>("/api/categories"),

  // Get categories by shop ID
  getByShopId: (shopId: string) => http.get<ICategoryResponse[]>(`/api/categories/shop/${shopId}`),
  
  // Get root categories
  getRoot: () => http.get<ICategoryResponse[]>("/api/categories/root"),
  
  // Get subcategories
  getSubcategories: (parentId: string) => http.get<ICategoryResponse[]>(`/api/categories/parent/${parentId}`),
  
  // Get category by ID
  getById: (id: string) => http.get<ICategoryResponse>(`/api/categories/${id}`),
  
  // Create category (backend expects 'title' and 'shopId' fields)
  create: (payload: { title: string; shopId?: string; parentId?: string }) => 
    http.post<ICategoryResponse>("/api/categories", payload),
    
  // Update category
  update: (id: string, payload: { title?: string; parentId?: string }) =>
    http.put<ICategoryResponse>(`/api/categories/${id}`, payload),
    
  // Delete category
  delete: (id: string) => http.delete(`/api/categories/${id}`),
};

export const brandsApi = {
  // Get all brands
  getAll: () => http.get<IBrandResponse[]>("/api/brands"),

  // Get brands by shop ID
  getByShopId: (shopId: string) => http.get<IBrandResponse[]>(`/api/brands/shop/${shopId}`),
  
  // Get brand by ID
  getById: (id: string) => http.get<IBrandResponse>(`/api/brands/${id}`),
  
  // Create brand (with shopId)
  create: (payload: { name: string; shopId?: string; logoUrl?: string }) => 
    http.post<IBrandResponse>("/api/brands", payload),
    
  // Update brand
  update: (id: string, payload: { name?: string; logoUrl?: string }) =>
    http.put<IBrandResponse>(`/api/brands/${id}`, payload),
    
  // Delete brand
  delete: (id: string) => http.delete(`/api/brands/${id}`),
};
