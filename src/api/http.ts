// src/api/http.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const baseURL = import.meta.env.VITE_API_URL || "/api";

const http = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false, 
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Function to refresh the token
const refreshToken = async (): Promise<string> => {
  const refreshTokenValue = localStorage.getItem("ADMIN_REFRESH_TOKEN");
  if (!refreshTokenValue) {
    throw new Error("No refresh token available");
  }

  const formData = new URLSearchParams();
  formData.append("grant_type", "refresh_token");
  formData.append("client_id", "auth");
  formData.append("refresh_token", refreshTokenValue);

  const response = await axios.post(
    `${baseURL}/auth/refresh`,
    formData.toString(),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );

  const { access_token, refresh_token } = response.data;
  
  localStorage.setItem("ADMIN_ACCESS_TOKEN", access_token);
  if (refresh_token) {
    localStorage.setItem("ADMIN_REFRESH_TOKEN", refresh_token);
  }

  return access_token;
};

// Request interceptor - add access token
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("ADMIN_ACCESS_TOKEN");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401 and refresh token
http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Skip refresh for auth endpoints
      if (originalRequest.url?.includes("/auth/")) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Wait for the refresh to complete
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return http(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshToken();
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return http(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        // Clear tokens and redirect to login
        localStorage.removeItem("ADMIN_ACCESS_TOKEN");
        localStorage.removeItem("ADMIN_REFRESH_TOKEN");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default http;
