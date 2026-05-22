import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { financeService } from "../services/financeService";
import {
  CreateTransactionDTO,
  TransactionSummary,
  PaymentMethod,
  CreateCategoryDTO,
} from "../types";

interface UseTransactionsFilters {
  page: number;
  limit: number;
  month: number;
  year: number;
  categoryIds?: string[];
  paymentMethod?: PaymentMethod;
}

interface UseTransactionSummaryFilters {
  month: number;
  year: number;
  categoryIds?: string[];
  paymentMethod?: PaymentMethod;
}

// --- Queries (Leitura) ---
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await financeService.getCategories();
      // O backend envelopa a resposta em { data: Category[] }
      const categories = response.data;
      return Array.isArray(categories) ? categories : [];
    },
  });
}

export function useTransactions(filters: UseTransactionsFilters) {
  return useQuery({
    queryKey: ["transactions", "list", filters],
    queryFn: async () => {
      const response = await financeService.getTransactions({
        page: filters.page,
        limit: filters.limit,
        month: filters.month,
        year: filters.year,
        categoryIds: filters.categoryIds,
        paymentMethod: filters.paymentMethod,
      });
      return response;
    },
  });
}

export function useTransactionSummary(filters: UseTransactionSummaryFilters) {
  return useQuery<TransactionSummary>({
    queryKey: ["transactions", "summary", filters],
    queryFn: async () => {
      const response = await financeService.getTransactionSummary({
        month: filters.month,
        year: filters.year,
        categoryIds: filters.categoryIds,
        paymentMethod: filters.paymentMethod,
      });
      return response;
    },
  });
}

// --- Mutations (Escrita) ---
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryDTO) =>
      financeService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => financeService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTransactionDTO) =>
      financeService.createTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => financeService.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
