// src/services/api.ts

import axios from "axios";
import Cookies from "js-cookie";
import { useAuthStore } from "@/features/auth/store/authStore";
import { env } from "@/config/env"; // <-- Importe o módulo validado

export const api = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL, // <-- Use a variável de forma tipada e validada
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de Request: Injeta o Token
api.interceptors.request.use((config) => {
  const token = Cookies.get("sb_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de Response: Trata 401 (Não autorizado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = "/login"; // Redirecionamento imperativo de segurança
    }
    return Promise.reject(error);
  },
);
