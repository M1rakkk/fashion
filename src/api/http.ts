// src/api/http.ts
import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "/api";

const http = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, 
});

// interceptor для добавления access token из localStorage
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("ADMIN_ACCESS_TOKEN");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default http;
