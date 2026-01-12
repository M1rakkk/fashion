// src/api/news.api.ts
import http from "./http";

export interface INewsRequest {
  title: string;
  content: string;
  slug?: string;
  previewImageUrl?: string;
  isPublished?: boolean;
}

export interface INewsResponse {
  id: string;
  title: string;
  slug: string;
  previewImageUrl?: string;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface INewsDetailResponse extends INewsResponse {
  content: string;
  createdBy: string;
}

export interface IPageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const newsApi = {
  // Get published news (public)
  getPublished: (page = 0, size = 10) => 
    http.get<IPageResponse<INewsResponse>>(`/api/news?page=${page}&size=${size}`),

  // Get news by slug (public)
  getBySlug: (slug: string) => 
    http.get<INewsDetailResponse>(`/api/news/${slug}`),

  // Get all news including unpublished (admin/owner)
  getAll: (page = 0, size = 10) => 
    http.get<IPageResponse<INewsResponse>>(`/api/news/admin/all?page=${page}&size=${size}`),

  // Create news (admin/owner)
  create: (payload: INewsRequest) => 
    http.post<INewsDetailResponse>("/api/news", payload),

  // Update news (admin/owner)
  update: (id: string, payload: INewsRequest) => 
    http.put<INewsDetailResponse>(`/api/news/${id}`, payload),

  // Delete news (admin/owner)
  delete: (id: string) => 
    http.delete(`/api/news/${id}`),
};
