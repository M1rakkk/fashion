// src/api/auth.api.ts
import http from "./http";

export interface ILoginBody {
  email: string;
}

export interface ILoginConfirmBody {
  email: string;
  otp: string;
}

export const authApi = {
  login: (payload: ILoginBody) => http.post("/api/v1/auth/login/", payload),
  confirm: (payload: ILoginConfirmBody) => http.post("/api/v1/auth/confirm/", payload),
};
