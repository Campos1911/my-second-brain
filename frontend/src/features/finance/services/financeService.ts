// src/features/finance/services/financeService.ts

import { api } from "@/services/api";
import {
  Category,
  Transaction,
  TransactionSummary,
  PaymentMethod,
  CreateTransactionDTO,
  CreateCategoryDTO,
  RecurringTransaction,
  CreateRecurringTransactionDTO,
} from "../types";
import { PaginatedResponse, ApiResponse } from "@/types";

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

  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  },

  // Transações Comuns
  async getTransactions(params?: {
    page?: number;
    limit?: number;
    month?: number;
    year?: number;
    categoryIds?: string[];
    paymentMethod?: PaymentMethod;
  }): Promise<PaginatedResponse<Transaction>> {
    const queryParams = params
      ? {
          ...params,
          categoryIds:
            params.categoryIds && params.categoryIds.length > 0
              ? params.categoryIds.join(",")
              : undefined,
          paymentMethod: params.paymentMethod || undefined,
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
    paymentMethod?: PaymentMethod;
  }): Promise<TransactionSummary> {
    const queryParams = params
      ? {
          ...params,
          categoryIds:
            params.categoryIds && params.categoryIds.length > 0
              ? params.categoryIds.join(",")
              : undefined,
          paymentMethod: params.paymentMethod || undefined,
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

  // Transações Recorrentes (Novo Módulo)
  async getRecurringTransactions(params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<RecurringTransaction>> {
    const response = await api.get<PaginatedResponse<RecurringTransaction>>(
      "/recurring-transactions",
      { params },
    );
    return response.data;
  },

  async createRecurringTransaction(
    data: CreateRecurringTransactionDTO,
  ): Promise<RecurringTransaction> {
    const response = await api.post<RecurringTransaction>(
      "/recurring-transactions",
      data,
    );
    return response.data;
  },

  async updateRecurringTransaction(
    id: string,
    data: Partial<CreateRecurringTransactionDTO> & { isActive?: boolean },
  ): Promise<RecurringTransaction> {
    const response = await api.patch<RecurringTransaction>(
      `/recurring-transactions/${id}`,
      data,
    );
    return response.data;
  },

  async deleteRecurringTransaction(id: string): Promise<void> {
    await api.delete(`/recurring-transactions/${id}`);
  },
};
