// src/features/finance/components/CreateTransactionModal.tsx

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2, Plus, Wallet, CreditCard, RefreshCw } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import {
  useCreateTransaction,
  useCreateRecurringTransaction,
  useCategories,
} from "../hooks/useFinance";
import { motion, AnimatePresence } from "framer-motion";
import { CreateCategoryModal } from "./CreateCategoryModal";
import { CategorySelect } from "./CategorySelect";
import { PaymentMethod, RecurrenceFrequency } from "../types";

// Schema de validação Zod sem defaults para evitar incompatibilidade de entrada/saída
const unifiedFormSchema = z
  .object({
    amount: z
      .number({ error: "O valor deve ser um número." })
      .positive("O valor deve ser positivo."),
    description: z.string().min(2, "A descrição é obrigatória."),
    categoryId: z.string().uuid("Categoria inválida."),
    paymentMethod: z.enum(["DEBIT", "CREDIT"]),
    isRecurring: z.boolean(),
    // Campos opcionais que serão validados condicionalmente no superRefine
    date: z.string().optional(),
    frequency: z
      .enum(["DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY", "YEARLY"])
      .optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.isRecurring) {
      if (!data.frequency) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Selecione a frequência de repetição.",
          path: ["frequency"],
        });
      }
      if (!data.startDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Defina uma data de início.",
          path: ["startDate"],
        });
      }
    } else {
      if (!data.date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Defina a data da transação.",
          path: ["date"],
        });
      }
    }
  });

// Inferência de tipo estrita gerada a partir do Zod
type UnifiedFormValues = z.infer<typeof unifiedFormSchema>;

export function CreateTransactionModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const { data: categories = [], isLoading: isLoadingCategories } =
    useCategories();

  const { mutate: createTx, isPending: isPendingTx } = useCreateTransaction();
  const { mutate: createRecurringTx, isPending: isPendingRecurring } =
    useCreateRecurringTransaction();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UnifiedFormValues>({
    resolver: zodResolver(unifiedFormSchema),
    defaultValues: {
      isRecurring: false,
      amount: undefined,
      description: "",
      categoryId: "",
      paymentMethod: "DEBIT",
      date: new Date().toISOString().split("T")[0],
      startDate: new Date().toISOString().split("T")[0],
      frequency: "MONTHLY",
      endDate: null,
    },
  });

  const isRecurring = watch("isRecurring");
  const selectedMethod = watch("paymentMethod");
  const selectedCategoryId = watch("categoryId");

  const onSubmit = (data: UnifiedFormValues) => {
    if (data.isRecurring) {
      createRecurringTx(
        {
          amount: Number(data.amount),
          description: data.description,
          frequency: data.frequency as RecurrenceFrequency,
          startDate: new Date(data.startDate!).toISOString(),
          endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
          categoryId: data.categoryId,
          paymentMethod: data.paymentMethod as PaymentMethod,
        },
        {
          onSuccess: () => {
            reset();
            onClose();
          },
        },
      );
    } else {
      createTx(
        {
          amount: Number(data.amount),
          description: data.description,
          date: new Date(data.date!).toISOString(),
          categoryId: data.categoryId,
          paymentMethod: data.paymentMethod as PaymentMethod,
        },
        {
          onSuccess: () => {
            reset();
            onClose();
          },
        },
      );
    }
  };

  const isPending = isPendingTx || isPendingRecurring;

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
                <h2 className="text-xl font-semibold">
                  {isRecurring ? "Nova Recorrência" : "Nova Transação"}
                </h2>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-muted rounded-full animate-none"
                  type="button"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Switch Visual para Recorrência */}
                <div className="flex items-center justify-between bg-muted/20 border border-border/80 p-3.5 rounded-xl">
                  <div className="flex items-center gap-2.5 text-left">
                    <RefreshCw
                      className={`w-4 h-4 ${isRecurring ? "text-purple-500" : "text-muted-foreground"}`}
                    />
                    <div>
                      <p className="text-xs font-semibold text-foreground">
                        Repetir Transação
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Repetir em uma frequência fixa
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    {...register("isRecurring")}
                    className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                  />
                </div>

                {/* Descrição */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-left">
                    Descrição
                  </label>
                  <input
                    {...register("description")}
                    className="w-full bg-background border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-600/50"
                    placeholder={
                      isRecurring
                        ? "Ex: Assinatura Netflix, Aluguel..."
                        : "Ex: Compra mercado..."
                    }
                  />
                  {errors.description && (
                    <span className="text-red-500 text-xs mt-1 block text-left">
                      {errors.description.message}
                    </span>
                  )}
                </div>

                {/* Valor e Frequência/Data */}
                <div className="grid grid-cols-2 gap-4 text-left">
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
                      <span className="text-red-500 text-xs mt-1 block">
                        {errors.amount.message}
                      </span>
                    )}
                  </div>

                  {!isRecurring ? (
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">
                        Data
                      </label>
                      <input
                        type="date"
                        {...register("date")}
                        className="w-full bg-background border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-600/50"
                      />
                      {errors.date && (
                        <span className="text-red-500 text-xs mt-1 block">
                          {errors.date.message}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">
                        Frequência
                      </label>
                      <select
                        {...register("frequency")}
                        className="w-full bg-background border border-border/80 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-600/50"
                      >
                        <option value="DAILY">Diário</option>
                        <option value="WEEKLY">Semanal</option>
                        <option value="BIWEEKLY">Quinzenal</option>
                        <option value="MONTHLY">Mensal</option>
                        <option value="YEARLY">Anual</option>
                      </select>
                      {errors.frequency && (
                        <span className="text-red-500 text-xs mt-1 block">
                          {errors.frequency.message}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Datas para Caso Recorrente */}
                {isRecurring && (
                  <div className="grid grid-cols-2 gap-4 text-left">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">
                        Data de Início
                      </label>
                      <input
                        type="date"
                        {...register("startDate")}
                        className="w-full bg-background border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-600/50"
                      />
                      {errors.startDate && (
                        <span className="text-red-500 text-xs mt-1 block">
                          {errors.startDate.message}
                        </span>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">
                        Fim (Opcional)
                      </label>
                      <input
                        type="date"
                        {...register("endDate")}
                        className="w-full bg-background border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-600/50"
                      />
                    </div>
                  </div>
                )}

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

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2.5 rounded-lg font-medium transition-colors flex justify-center mt-2"
                >
                  {isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Salvar"
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
