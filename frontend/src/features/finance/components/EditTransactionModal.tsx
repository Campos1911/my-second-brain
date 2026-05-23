// src/features/finance/components/EditTransactionModal.tsx

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2, Plus, Wallet, CreditCard } from "lucide-react";
import { useState, useEffect } from "react";
import { useUpdateTransaction, useCategories } from "../hooks/useFinance";
import { motion, AnimatePresence } from "framer-motion";
import { CreateCategoryModal } from "./CreateCategoryModal";
import { CategorySelect } from "./CategorySelect";
import {
  createTransactionSchema,
  CreateTransactionDTO,
  Transaction,
  PaymentMethod,
} from "../types";

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export function EditTransactionModal({
  isOpen,
  onClose,
  transaction,
}: EditTransactionModalProps) {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const { data: categories = [], isLoading: isLoadingCategories } =
    useCategories();
  const { mutate: updateTx, isPending } = useUpdateTransaction();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateTransactionDTO>({
    resolver: zodResolver(createTransactionSchema),
  });

  // Alimenta os campos do formulário tratando o retorno aninhado do backend
  useEffect(() => {
    if (transaction) {
      const formattedDate = transaction.date
        ? new Date(transaction.date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];

      reset({
        amount: Number(transaction.amount),
        description: transaction.description,
        date: formattedDate,
        // CORREÇÃO AQUI: Busca o ID diretamente do objeto aninhado 'category' retornado pelo select do backend
        categoryId: transaction.categoryId || transaction.category?.id || "",
        paymentMethod: transaction.paymentMethod || "DEBIT",
      });
    }
  }, [transaction, reset]);

  const selectedMethod = watch("paymentMethod");
  const selectedCategoryId = watch("categoryId");

  const onSubmit = (data: CreateTransactionDTO) => {
    if (!transaction) return;

    updateTx(
      {
        id: transaction.id,
        data: {
          amount: Number(data.amount),
          description: data.description,
          date: new Date(data.date).toISOString(),
          categoryId: data.categoryId,
          paymentMethod: data.paymentMethod as PaymentMethod,
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && transaction && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="relative bg-card border border-border w-full max-w-md p-6 rounded-2xl shadow-2xl z-50 text-foreground"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Editar Transação</h2>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-muted rounded-full"
                  type="button"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Descrição */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-left">
                    Descrição
                  </label>
                  <input
                    {...register("description")}
                    className="w-full bg-background border border-border/80 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-600/50"
                    placeholder="Ex: Compra mercado..."
                  />
                  {errors.description && (
                    <span className="text-red-500 text-xs mt-1 block text-left">
                      {errors.description.message}
                    </span>
                  )}
                </div>

                {/* Valor e Data */}
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      Valor (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("amount", { valueAsNumber: true })}
                      className="w-full bg-background border border-border/80 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-600/50"
                      placeholder="0,00"
                    />
                    {errors.amount && (
                      <span className="text-red-500 text-xs mt-1 block">
                        {errors.amount.message}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      Data
                    </label>
                    <input
                      type="date"
                      {...register("date")}
                      className="w-full bg-background border border-border/80 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-600/50"
                    />
                    {errors.date && (
                      <span className="text-red-500 text-xs mt-1 block">
                        {errors.date.message}
                      </span>
                    )}
                  </div>
                </div>

                {/* Método de Pagamento */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-left">
                    Método de Pagamento
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-background border border-border/80 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setValue("paymentMethod", "DEBIT")}
                      className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedMethod === "DEBIT"
                          ? "bg-purple-600 text-white shadow-lg shadow-purple-500/10"
                          : "hover:bg-muted/50 text-muted-foreground"
                      }`}
                    >
                      <Wallet className="w-4 h-4" />
                      Débito
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue("paymentMethod", "CREDIT")}
                      className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedMethod === "CREDIT"
                          ? "bg-purple-600 text-white shadow-lg shadow-purple-500/10"
                          : "hover:bg-muted/50 text-muted-foreground"
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      Crédito
                    </button>
                  </div>
                </div>

                {/* Categoria */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-sm font-medium block">
                      Categoria
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCategoryModalOpen(true)}
                      className="text-purple-400 text-xs flex items-center gap-1 hover:underline"
                    >
                      <Plus className="w-3 h-3" /> Nova Categoria
                    </button>
                  </div>

                  <CategorySelect
                    value={selectedCategoryId}
                    onChange={(id) =>
                      setValue("categoryId", id, { shouldValidate: true })
                    }
                    categories={categories}
                    isLoading={isLoadingCategories}
                    error={errors.categoryId?.message}
                  />
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 bg-muted hover:bg-muted/80 text-foreground py-2.5 rounded-lg font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 bg-purple-600 hover:bg-purple-500 text-white py-2.5 rounded-lg font-medium transition-colors flex justify-center"
                  >
                    {isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Salvar"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <CreateCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />
    </>
  );
}
