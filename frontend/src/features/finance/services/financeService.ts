import { api } from "@/services/api";
import {
  Category,
  Transaction,
  CreateCategoryDTO,
  CreateTransactionDTO,
  ApiResponse,
  PaginatedResponse,
  TransactionSummary, // Certifique-se de exportar esta interface no seu types.ts
} from "../types";

export const financeService = {
  // Categorias
  async getCategories(): Promise<ApiResponse<Category[]>> {
    const response = await api.get<ApiResponse<Category[]>>("/categories");
    return response.data;
  },

  async createCategory(data: CreateCategoryDTO): Promise<Category> {
    const response = await api.post<Category>("/categories", data);
    return response.data;
  },

  // Transações
  async getTransactions(params?: {
    page?: number;
    limit?: number;
    month?: number;
    year?: number;
    categoryIds?: string[];
  }): Promise<PaginatedResponse<Transaction>> {
    // Normaliza os parâmetros para o formato esperado pelo backend
    const queryParams = params
      ? {
          ...params,
          categoryIds:
            params.categoryIds && params.categoryIds.length > 0
              ? params.categoryIds.join(",")
              : undefined,
        }
      : undefined;

    const response = await api.get<PaginatedResponse<Transaction>>(
      "/transactions",
      {
        params: queryParams,
      },
    );
    return response.data;
  },

  async getTransactionSummary(params?: {
    month?: number;
    year?: number;
    categoryIds?: string[];
  }): Promise<TransactionSummary> {
    const queryParams = params
      ? {
          ...params,
          categoryIds:
            params.categoryIds && params.categoryIds.length > 0
              ? params.categoryIds.join(",")
              : undefined,
        }
      : undefined;

    const response = await api.get<TransactionSummary>(
      "/transactions/summary",
      {
        params: queryParams,
      },
    );
    return response.data;
  },

  async createTransaction(data: CreateTransactionDTO): Promise<Transaction> {
    const response = await api.post<Transaction>("/transactions", data);
    return response.data;
  },

  async deleteTransaction(id: string): Promise<void> {
    await api.delete(`/transactions/${id}`);
  },
};
