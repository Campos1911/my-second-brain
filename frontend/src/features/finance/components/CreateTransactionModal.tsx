"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2, Plus, Wallet, CreditCard } from "lucide-react";
import { useState } from "react";
import { createTransactionSchema, CreateTransactionDTO } from "../types";
import { useCreateTransaction, useCategories } from "../hooks/useFinance";
import { motion, AnimatePresence } from "framer-motion";
import { CreateCategoryModal } from "./CreateCategoryModal";

export function CreateTransactionModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  const { mutate: createTx, isPending } = useCreateTransaction();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateTransactionDTO>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0], // Data de hoje como padrão
      paymentMethod: "DEBIT",
    },
  });

  const selectedMethod = watch("paymentMethod");

  const onSubmit = (data: CreateTransactionDTO) => {
    createTx(
      { ...data, amount: Number(data.amount) },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      },
    );
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
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
                <h2 className="text-xl font-semibold">Nova Transação</h2>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-muted rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Descrição */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Descrição
                  </label>
                  <input
                    {...register("description")}
                    className="w-full bg-background border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-600/50"
                    placeholder="Ex: Aluguel, Compra mercado..."
                  />
                  {errors.description && (
                    <span className="text-red-500 text-xs">
                      {errors.description.message}
                    </span>
                  )}
                </div>

                {/* Valor e Data */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      Valor (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("amount", { valueAsNumber: true })}
                      className="w-full bg-background border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-600/50"
                      placeholder="0,00"
                    />
                    {errors.amount && (
                      <span className="text-red-500 text-xs">
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
                      className="w-full bg-background border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-600/50"
                    />
                  </div>
                </div>

                {/* Seletor Visual de Método de Pagamento */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
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

                {/* Categorias */}
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
                  <select
                    {...register("categoryId")}
                    disabled={isLoadingCategories}
                    className="w-full bg-background border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-600/50"
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories?.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <span className="text-red-500 text-xs">
                      {errors.categoryId.message}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2.5 rounded-lg font-medium transition-colors flex justify-center mt-2"
                >
                  {isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Salvar Transação"
                  )}
                </button>
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
