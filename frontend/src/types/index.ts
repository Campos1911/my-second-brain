// src/types/index.ts

export type CategoryType = "INCOME" | "EXPENSE" | "FITNESS";
export type PaymentMethod = "DEBIT" | "CREDIT";

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  userId: string | null;
  deletedAt?: string | null;
}

// Contratos de Resposta da API
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
