// src/features/fitness/components/EditPlanModal.tsx

"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { X, Loader2, Search, Check, Plus, Trash2 } from "lucide-react";
import { WorkoutPlan, Exercise, UpdateWorkoutPlanDTO } from "../types";
import { useUpdateWorkoutPlan, useExercises } from "../hooks/useFitness";
import { CreateExerciseModal } from "./CreateExerciseModal";
import { motion, AnimatePresence } from "framer-motion";

interface EditPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: WorkoutPlan | null;
}

interface DraftExerciseItem {
  id: string;
  name: string;
  targetSets: number;
  targetMinReps: number;
  targetMaxReps: number;
}

export function EditPlanModal({ isOpen, onClose, plan }: EditPlanModalProps) {
  const { mutate: updatePlan, isPending } = useUpdateWorkoutPlan();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<
    DraftExerciseItem[]
  >([]);
  const [isCreateExerciseOpen, setIsCreateExerciseOpen] = useState(false);

  const { data: exercisesData, isLoading: isLoadingExercises } = useExercises({
    search: searchQuery || undefined,
    limit: 100,
  });

  const libraryExercises = exercisesData?.data || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ name: string }>({
    defaultValues: { name: "" },
  });

  // Alimenta os estados do formulário com base nos dados que vêm da API
  useEffect(() => {
    if (plan) {
      reset({ name: plan.name });
      const initialExercises = (plan.exercises || []).map((ex) => ({
        id: ex.id,
        name: ex.name,
        targetSets: ex.targetSets || 3,
        targetMinReps: ex.targetMinReps || 8,
        targetMaxReps: ex.targetMaxReps || 12,
      }));
      setSelectedExercises(initialExercises);
    }
  }, [plan, reset]);

  const handleToggleExercise = (exercise: Exercise) => {
    setSelectedExercises((prev) => {
      const exists = prev.some((item) => item.id === exercise.id);
      if (exists) {
        return prev.filter((item) => item.id !== exercise.id);
      } else {
        return [
          ...prev,
          {
            id: exercise.id,
            name: exercise.name,
            targetSets: 3,
            targetMinReps: 8,
            targetMaxReps: 12,
          },
        ];
      }
    });
  };

  const updateExerciseMeta = (
    id: string,
    field: "targetSets" | "targetMinReps" | "targetMaxReps",
    value: number,
  ) => {
    setSelectedExercises((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const handleExerciseCreated = (newExercise: Exercise) => {
    setSelectedExercises((prev) => [
      ...prev,
      {
        id: newExercise.id,
        name: newExercise.name,
        targetSets: 3,
        targetMinReps: 8,
        targetMaxReps: 12,
      },
    ]);
  };

  const onSubmit = (data: { name: string }) => {
    if (!plan) return;
    if (selectedExercises.length === 0) {
      alert("A ficha de treino precisa conter ao menos um exercício.");
      return;
    }

    const payload: UpdateWorkoutPlanDTO = {
      name: data.name,
      exercises: selectedExercises.map((ex) => ({
        exerciseId: ex.id,
        targetSets: Number(ex.targetSets),
        targetMinReps: Number(ex.targetMinReps),
        targetMaxReps: Number(ex.targetMaxReps),
      })),
    };

    updatePlan(
      { id: plan.id, data: payload },
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
        {isOpen && plan && (
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
              className="relative bg-zinc-900 border border-zinc-800 w-full max-w-lg p-6 rounded-2xl shadow-2xl text-zinc-100 z-50 flex flex-col max-h-[85vh] overflow-hidden"
            >
              <div className="flex justify-between items-center mb-4 shrink-0">
                <h2 className="text-xl font-bold">Editar Ficha de Treino</h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4 flex-1 overflow-y-auto pr-1"
              >
                {/* Nome do Treino */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    Identificação do Treino
                  </label>
                  <input
                    {...register("name", { required: "O nome é obrigatório" })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/50 focus:border-purple-500 outline-none transition-all text-zinc-100"
                    placeholder="Ex: Treino A - Peito & Tríceps"
                  />
                  {errors.name && (
                    <span className="text-rose-500 text-xs font-medium">
                      {errors.name.message}
                    </span>
                  )}
                </div>

                {/* Catálogo de Exercícios */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-zinc-350">
                      Adicionar Exercícios ({selectedExercises.length})
                    </label>
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
                      placeholder="Filtrar catálogo..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-200 placeholder:text-zinc-650 outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <div className="border border-zinc-850 bg-zinc-950/40 rounded-xl max-h-40 overflow-y-auto p-1 divide-y divide-zinc-850/50">
                    {isLoadingExercises ? (
                      <div className="p-4 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
                        <Loader2 className="w-4.5 h-4.5 animate-spin text-purple-500" />
                        Carregando catálogo...
                      </div>
                    ) : (
                      libraryExercises.map((exercise) => {
                        const isSelected = selectedExercises.some(
                          (item) => item.id === exercise.id,
                        );
                        return (
                          <button
                            key={exercise.id}
                            type="button"
                            onClick={() => handleToggleExercise(exercise)}
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

                {/* Metas Ativas da Ficha */}
                {selectedExercises.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">
                      Configuração de Metas Físicas
                    </h4>
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                      {selectedExercises.map((item) => (
                        <div
                          key={item.id}
                          className="bg-zinc-950 border border-zinc-850 p-3.5 rounded-xl space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-zinc-200 truncate pr-3">
                              {item.name}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedExercises((prev) =>
                                  prev.filter((ex) => ex.id !== item.id),
                                )
                              }
                              className="text-rose-500 hover:text-rose-400 text-xs cursor-pointer flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-3 gap-2.5">
                            <div>
                              <label className="text-[9px] text-zinc-500 font-bold block mb-1">
                                Séries (Sets)
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={item.targetSets}
                                onChange={(e) =>
                                  updateExerciseMeta(
                                    item.id,
                                    "targetSets",
                                    Math.max(1, parseInt(e.target.value) || 1),
                                  )
                                }
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 text-xs text-center text-zinc-100 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                                required
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-zinc-500 font-bold block mb-1">
                                Reps Mínimas
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={item.targetMinReps}
                                onChange={(e) =>
                                  updateExerciseMeta(
                                    item.id,
                                    "targetMinReps",
                                    Math.max(1, parseInt(e.target.value) || 1),
                                  )
                                }
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 text-xs text-center text-zinc-100 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                                required
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-zinc-500 font-bold block mb-1">
                                Reps Máximas
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={item.targetMaxReps}
                                onChange={(e) =>
                                  updateExerciseMeta(
                                    item.id,
                                    "targetMaxReps",
                                    Math.max(1, parseInt(e.target.value) || 1),
                                  )
                                }
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 text-xs text-center text-zinc-100 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 justify-end pt-3 border-t border-zinc-800/50">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold rounded-xl cursor-pointer text-zinc-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isPending || selectedExercises.length === 0}
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center min-w-24 cursor-pointer"
                  >
                    {isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Salvar Alterações"
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
