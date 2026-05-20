import { z } from "zod";

export interface User {
  id: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
}

// Schema do Login
export const loginSchema = z.object({
  email: z.string().email("Formato de e-mail inválido."),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
});

// Schema do Registro (com confirmação de senha)
export const registerSchema = z
  .object({
    email: z.string().email("Formato de e-mail inválido."),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
    confirmPassword: z.string().min(1, "Confirme sua senha."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"], // Atribui o erro ao campo confirmPassword
  });

export type LoginDTO = z.infer<typeof loginSchema>;

// Tipo extraído do formulário (inclui confirmPassword)
export type RegisterFormData = z.infer<typeof registerSchema>;

// DTO para a API (exclui confirmPassword)
export interface RegisterDTO {
  email: string;
  password: string;
}
