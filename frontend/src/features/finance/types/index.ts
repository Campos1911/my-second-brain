import { z } from "zod";

// Tipos do Prisma
export type CategoryType = "INCOME" | "EXPENSE" | "FITNESS";
export type PaymentMethod = "DEBIT" | "CREDIT";

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
  paymentMethod?: PaymentMethod; // Opcional para manter retrocompatibilidade com dados antigos
  category?: Category; // Relação incluída opcionalmente
}

export interface TransactionSummary {
  income: number;
  expense: number;
  balance: number;
}

// Schemas Zod para Validação
export const createCategorySchema = z.object({
  name: z.string().min(2, "O nome deve ter no mínimo 2 caracteres."),
  type: z.enum(["INCOME", "EXPENSE", "FITNESS"]),
});

export const createTransactionSchema = z.object({
  amount: z.number().positive("O valor deve ser positivo."),
  description: z.string().min(2, "A descrição é obrigatória."),
  date: z.string(),
  categoryId: z.string().uuid("Categoria inválida."),
  paymentMethod: z.enum(["DEBIT", "CREDIT"]),
});

// DTOs inferidos a partir dos Schemas Zod
export type CreateCategoryDTO = z.infer<typeof createCategorySchema>;
export type CreateTransactionDTO = z.infer<typeof createTransactionSchema>;
