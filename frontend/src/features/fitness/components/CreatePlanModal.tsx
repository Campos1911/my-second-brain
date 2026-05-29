// src/features/fitness/components/CreatePlanModal.tsx

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2, Search, Check, Plus } from "lucide-react";
import {
  createWorkoutPlanSchema,
  CreateWorkoutPlanDTO,
  Exercise,
} from "../types";
import { useCreateWorkoutPlan, useExercises } from "../hooks/useFitness";
import { CreateExerciseModal } from "./CreateExerciseModal"; // Importado
import { motion, AnimatePresence } from "framer-motion";

interface CreatePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreatePlanModal({ isOpen, onClose }: CreatePlanModalProps) {
  const { mutate: createPlan, isPending } = useCreateWorkoutPlan();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([]);
  const [isCreateExerciseOpen, setIsCreateExerciseOpen] = useState(false); // Controle inline

  const { data: exercisesData, isLoading: isLoadingExercises } = useExercises({
    search: searchQuery || undefined,
    limit: 100, // Limite estendido para escolha
  });

  const libraryExercises = exercisesData?.data || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateWorkoutPlanDTO>({
    resolver: zodResolver(createWorkoutPlanSchema),
    defaultValues: { name: "", exerciseIds: [] },
  });

  const handleToggleExercise = (id: string) => {
    setSelectedExerciseIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // Trata o cadastro inline: auto-seleciona o novo exercício
  const handleExerciseCreated = (newExercise: Exercise) => {
    setSelectedExerciseIds((prev) => [...prev, newExercise.id]);
  };

  const onSubmit = (data: CreateWorkoutPlanDTO) => {
    createPlan(
      {
        name: data.name,
        exerciseIds: selectedExerciseIds,
      },
      {
        onSuccess: () => {
          reset();
          setSelectedExerciseIds([]);
          setSearchQuery("");
          onClose();
        },
      },
    );
  };

  const handleClose = () => {
    reset();
    setSelectedExerciseIds([]);
    setSearchQuery("");
    onClose();
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-zinc-900 border border-zinc-800 w-full max-w-md p-6 rounded-2xl shadow-2xl text-zinc-100 z-50 flex flex-col max-h-[85vh] overflow-hidden"
            >
              <div className="flex justify-between items-center mb-4 shrink-0">
                <h2 className="text-xl font-bold">Nova Ficha de Treino</h2>
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4 flex-1 overflow-y-auto pr-1"
              >
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    Identificação do Treino
                  </label>
                  <input
                    {...register("name")}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/50 focus:border-purple-500 outline-none transition-all placeholder:text-zinc-650"
                    placeholder="Ex: Treino A - Peito & Tríceps"
                    autoFocus
                  />
                  {errors.name && (
                    <span className="text-rose-500 text-xs mt-1 block font-medium">
                      {errors.name.message}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-zinc-350">
                      Vincular Exercícios ({selectedExerciseIds.length})
                    </label>
                    {/* Botão para cadastro inline */}
                    <button
                      type="button"
                      onClick={() => setIsCreateExerciseOpen(true)}
                      className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Criar Exercício
                    </button>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filtrar exercícios..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-200 placeholder:text-zinc-650 outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <div className="border border-zinc-850 bg-zinc-950/40 rounded-xl max-h-48 overflow-y-auto p-1 divide-y divide-zinc-850/50">
                    {isLoadingExercises ? (
                      <div className="p-4 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
                        <Loader2 className="w-4.5 h-4.5 animate-spin text-purple-500" />
                        Carregando catálogo...
                      </div>
                    ) : libraryExercises.length === 0 ? (
                      <div className="p-6 text-center text-xs text-zinc-500">
                        Nenhum exercício cadastrado.
                      </div>
                    ) : (
                      libraryExercises.map((exercise) => {
                        const isSelected = selectedExerciseIds.includes(
                          exercise.id,
                        );
                        return (
                          <button
                            key={exercise.id}
                            type="button"
                            onClick={() => handleToggleExercise(exercise.id)}
                            className="w-full flex items-center justify-between p-2.5 text-left rounded-lg hover:bg-zinc-800/40 text-xs text-zinc-305 transition-colors cursor-pointer"
                          >
                            <div className="min-w-0 flex-1">
                              <span className="font-bold block truncate text-zinc-200">
                                {exercise.name}
                              </span>
                              {exercise.category && (
                                <span className="text-[10px] text-purple-400 font-semibold">
                                  {exercise.category.name}
                                </span>
                              )}
                            </div>
                            <div
                              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                                isSelected
                                  ? "bg-purple-600 border-purple-500 text-white"
                                  : "border-zinc-700 bg-zinc-950"
                              }`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5" />}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-3 border-t border-zinc-800/50">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold rounded-xl cursor-pointer text-zinc-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center min-w-24 cursor-pointer"
                  >
                    {isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Criar Ficha"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <CreateExerciseModal
        isOpen={isCreateExerciseOpen}
        onClose={() => setIsCreateExerciseOpen(false)}
        onSuccess={handleExerciseCreated}
      />
    </>
  );
}
