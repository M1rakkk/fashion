import http from "./http";
import type { ISizeResponse } from "./sizes.api";

export interface IProductSizeResponse {
  id: string;
  productId: string;
  size: ISizeResponse;
  quantityAvailable: number;
}

export interface ICreateProductSizeRequest {
  productId: string;
  sizeId: string;
  quantityAvailable: number;
}

export const productSizesApi = {
  create: (payload: ICreateProductSizeRequest) => http.post<IProductSizeResponse>("/api/product-sizes", payload),
  getById: (id: string) => http.get<IProductSizeResponse>(`/api/product-sizes/${id}`),
  getByProductId: (productId: string) => http.get<IProductSizeResponse[]>(`/api/product-sizes/product/${productId}`),
  update: (id: string, payload: ICreateProductSizeRequest) => http.put<IProductSizeResponse>(`/api/product-sizes/${id}`, payload),
  delete: (id: string) => http.delete(`/api/product-sizes/${id}`),
};
