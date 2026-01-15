import http from "./http";

export interface ISizeResponse {
  id: string;
  value: string;
}

export interface ICreateSizeRequest {
  value: string;
}

export const sizesApi = {
  getAll: () => http.get<ISizeResponse[]>("/api/sizes"),
  create: (payload: ICreateSizeRequest) => http.post<ISizeResponse>("/api/sizes", payload),
  getById: (id: string) => http.get<ISizeResponse>(`/api/sizes/${id}`),
  update: (id: string, payload: ICreateSizeRequest) => http.put<ISizeResponse>(`/api/sizes/${id}`, payload),
  delete: (id: string) => http.delete(`/api/sizes/${id}`),
};
