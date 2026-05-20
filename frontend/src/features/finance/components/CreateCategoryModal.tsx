"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2 } from "lucide-react";
import { createCategorySchema, CreateCategoryDTO } from "../types";
import { useCreateCategory } from "../hooks/useFinance";
import { motion, AnimatePresence } from "framer-motion";

export function CreateCategoryModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { mutate: createCategory, isPending } = useCreateCategory();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCategoryDTO>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: { type: "EXPENSE" },
  });

  const onSubmit = (data: CreateCategoryDTO) => {
    createCategory(data, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative bg-card border border-border w-full max-w-md p-6 rounded-2xl shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Nova Categoria</h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-muted rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Nome</label>
                <input
                  {...register("name")}
                  className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Ex: Alimentação, Lazer..."
                />
                {errors.name && (
                  <span className="text-red-500 text-xs">
                    {errors.name.message}
                  </span>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Tipo</label>
                <select
                  {...register("type")}
                  className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="INCOME">Receita (Entrada)</option>
                  <option value="EXPENSE">Despesa (Saída)</option>
                  <option value="FITNESS">Fitness / Saúde</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-primary-600 hover:bg-primary-500 py-2 rounded-lg font-medium transition-colors flex justify-center"
              >
                {isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Criar Categoria"
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
