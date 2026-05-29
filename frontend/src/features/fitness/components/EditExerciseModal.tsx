// src/features/fitness/components/EditExerciseModal.tsx

"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2, Pencil } from "lucide-react";
import { updateExerciseSchema, UpdateExerciseDTO, Exercise } from "../types";
import { useUpdateExercise, useFitnessCategories } from "../hooks/useFitness";
import { motion, AnimatePresence } from "framer-motion";

interface EditExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: Exercise | null;
}

export function EditExerciseModal({
  isOpen,
  onClose,
  exercise,
}: EditExerciseModalProps) {
  const { mutate: updateExercise, isPending } = useUpdateExercise();
  const { data: categories = [], isLoading: isLoadingCategories } =
    useFitnessCategories();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateExerciseDTO>({
    resolver: zodResolver(updateExerciseSchema),
  });

  useEffect(() => {
    if (exercise) {
      reset({
        name: exercise.name,
        categoryId: exercise.categoryId,
      });
    }
  }, [exercise, reset]);

  const onSubmit = (data: UpdateExerciseDTO) => {
    if (!exercise) return;

    updateExercise(
      { id: exercise.id, data },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  return (
    <AnimatePresence>
      {isOpen && exercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative bg-zinc-900 border border-zinc-800 w-full max-w-md p-6 rounded-2xl shadow-2xl text-zinc-100 z-50"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Pencil className="w-5 h-5 text-purple-500" />
                Editar Exercício
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Nome */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-zinc-300">
                  Nome do Exercício
                </label>
                <input
                  {...register("name")}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/50 focus:border-purple-500 outline-none transition-all placeholder:text-zinc-650 text-zinc-100"
                  placeholder="Ex: Supino Inclinado"
                />
                {errors.name && (
                  <span className="text-rose-500 text-xs font-medium">
                    {errors.name.message}
                  </span>
                )}
              </div>

              {/* Seletor de Grupamento Muscular */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-zinc-300">
                  Grupamento / Categoria
                </label>
                <select
                  {...register("categoryId")}
                  disabled={isLoadingCategories}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/50 focus:border-purple-500 outline-none transition-all text-zinc-200"
                >
                  {categories.map((cat) => (
                    <option
                      key={cat.id}
                      value={cat.id}
                      className="bg-zinc-900 text-zinc-100"
                    >
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <span className="text-rose-500 text-xs font-medium">
                    {errors.categoryId.message}
                  </span>
                )}
              </div>

              {/* Botões */}
              <div className="flex gap-3 justify-end pt-4 border-t border-zinc-800/50">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700/80 text-sm font-semibold rounded-xl transition-colors cursor-pointer text-zinc-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center min-w-25 cursor-pointer"
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Atualizar"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
