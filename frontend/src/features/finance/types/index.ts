// src/features/finance/types/index.ts

import { z } from "zod";

// Tipos do Prisma
export type CategoryType = "INCOME" | "EXPENSE" | "FITNESS";
export type PaymentMethod = "DEBIT" | "CREDIT";
export type RecurrenceFrequency =
  | "DAILY"
  | "WEEKLY"
  | "BIWEEKLY"
  | "MONTHLY"
  | "YEARLY";

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
  paymentMethod?: PaymentMethod;
  category?: Category;
}

export interface RecurringTransaction {
  id: string;
  amount: number;
  description: string;
  frequency: RecurrenceFrequency;
  startDate: string; // ISO string
  endDate?: string | null; // ISO string
  nextDate: string; // ISO string
  isActive: boolean;
  paymentMethod: PaymentMethod;
  categoryId: string;
  category?: Category;
  userId: string;
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

// Schema Zod para criação de Transações Recorrentes
export const createRecurringTransactionSchema = z.object({
  amount: z.number().positive("O valor deve ser positivo."),
  description: z.string().min(2, "A descrição é obrigatória."),
  frequency: z.enum(["DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY", "YEARLY"]),
  startDate: z.string().min(1, "A data de início é obrigatória."),
  endDate: z.string().optional().nullable(),
  categoryId: z.string().uuid("Categoria inválida."),
  paymentMethod: z.enum(["DEBIT", "CREDIT"]),
});

// DTOs inferidos a partir dos Schemas Zod
export type CreateCategoryDTO = z.infer<typeof createCategorySchema>;
export type CreateTransactionDTO = z.infer<typeof createTransactionSchema>;
export type CreateRecurringTransactionDTO = z.infer<
  typeof createRecurringTransactionSchema
>;
