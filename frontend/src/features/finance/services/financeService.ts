import { api } from "@/services/api";
import {
  Category,
  Transaction,
  CreateCategoryDTO,
  CreateTransactionDTO,
  ApiResponse,
  PaginatedResponse,
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
  }): Promise<PaginatedResponse<Transaction>> {
    const response = await api.get<PaginatedResponse<Transaction>>(
      "/transactions",
      {
        params,
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
