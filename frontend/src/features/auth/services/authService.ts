import { api } from "@/services/api";
import { AuthResponse, LoginDTO, RegisterDTO } from "../types";

export const authService = {
  async login(data: LoginDTO): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/login", data);
    console.log(response.data);
    return response.data;
  },

  async register(data: RegisterDTO): Promise<AuthResponse> {
    // Assumindo que o endpoint /users retorna a auth completa (usuário logado após criar)
    // Se o backend pedir outro formato, ajustamos aqui.
    const response = await api.post<AuthResponse>("/users", data);
    return response.data;
  },
};
