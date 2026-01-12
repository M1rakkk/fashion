// src/api/files.api.ts
import http from "./http";

export type FileCategory = "SHOP_AVATAR" | "SHOP_BANNER" | "PRODUCT_IMAGE" | "USER_AVATAR" | "NEWS_IMAGE";

export interface IFileUploadResponse {
  fileUrl: string;
  fileName: string;
  originalFileName: string;
  fileSize: number;
  contentType: string;
  uploadedAt: string;
  category?: string;
  thumbnailUrl?: string;
}

export const filesApi = {
  // Upload file (default category)
  upload: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return http.post<IFileUploadResponse>("/api/files/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Upload file to specific category (SHOP_AVATAR, SHOP_BANNER, PRODUCT_IMAGE, USER_AVATAR)
  uploadToCategory: (file: File, category: FileCategory) => {
    const formData = new FormData();
    formData.append("file", file);
    return http.post<IFileUploadResponse>(`/api/files/upload/${category}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Download file URL
  getDownloadUrl: (fileName: string) => `/api/files/download/${fileName}`,

  // Get full URL for displaying images
  getFileUrl: (fileName: string) => {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8081";
    return `${baseUrl}/api/files/download/${fileName}`;
  },

  // Delete file
  delete: (fileName: string) => http.delete(`/api/files/${fileName}`),
};
