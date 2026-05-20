import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { financeService } from "../services/financeService";
import { CreateCategoryDTO, CreateTransactionDTO } from "../types";

interface UseTransactionsFilters {
  page: number;
  limit: number;
  month: number;
  year: number;
}

// --- Queries (Leitura) ---
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await financeService.getCategories();

      const categories = response.data;

      return Array.isArray(categories) ? categories : [];
    },
  });
}

export function useTransactions(filters: UseTransactionsFilters) {
  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: async () => {
      const response = await financeService.getTransactions({
        page: filters.page,
        limit: filters.limit,
        month: filters.month,
        year: filters.year,
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
      // Invalida o cache para refetch automático
      queryClient.invalidateQueries({ queryKey: ["categories"] });
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
