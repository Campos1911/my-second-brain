import { create } from "zustand";
import Cookies from "js-cookie";
import { User } from "../types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null, // Idealmente, você pode persistir o `user` no localStorage se desejar manter os dados visuais na recarga
  isAuthenticated: !!Cookies.get("sb_token"), // 'sb_token' = Second Brain Token

  setAuth: (user, token) => {
    Cookies.set("sb_token", token, { expires: 7 }); // Expira em 7 dias
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    Cookies.remove("sb_token");
    set({ user: null, isAuthenticated: false });
    // Forçar redirecionamento via window na camada de serviço/interceptor ou component
  },
}));
