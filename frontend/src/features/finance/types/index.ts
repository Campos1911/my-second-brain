import { z } from "zod";

// Tipos do Prisma
export type CategoryType = "INCOME" | "EXPENSE" | "FITNESS";

export interface ApiResponse<T> {
  data: T;
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  userId: string;
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string; // ISO string
  categoryId: string;
  userId: string;
  category?: Category; // Relação incluída opcionalmente
}

// Schemas Zod para Criação
export const createCategorySchema = z.object({
  name: z.string().min(2, "O nome deve ter no mínimo 2 caracteres."),
  type: z.enum(["INCOME", "EXPENSE", "FITNESS"]),
});

export const createTransactionSchema = z.object({
  amount: z.number().positive("O valor deve ser positivo."),
  description: z.string().min(2, "A descrição é obrigatória."),
  date: z.string(),
  categoryId: z.string().uuid("Categoria inválida."),
});

export type CreateCategoryDTO = z.infer<typeof createCategorySchema>;
export type CreateTransactionDTO = z.infer<typeof createTransactionSchema>;
