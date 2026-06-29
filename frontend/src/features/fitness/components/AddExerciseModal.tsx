// src/features/fitness/components/AddExerciseModal.tsx

"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  X,
  Loader2,
  Dumbbell,
  Search,
  Check,
  Plus,
  ArrowLeft,
} from "lucide-react";
import { Exercise } from "../types";
import {
  useCreateExercise,
  useFitnessCategories,
  useExercises,
  useWorkoutPlan,
  useLinkExerciseToPlan,
} from "../hooks/useFitness";
import { motion, AnimatePresence } from "framer-motion";

interface AddExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
}

type TabType = "LIBRARY" | "NEW";

// Substituído z.coerce.number() por z.number() para evitar incompatibilidade entre Input e Output no Resolver
const addExerciseFormSchema = z
  .object({
    name: z.string().min(1, "O nome do exercício é obrigatório."),
    categoryId: z.string().uuid("Selecione uma categoria válida."),
    targetSets: z
      .number({ error: "As séries são obrigatórias" })
      .int()
      .positive("As séries devem ser maiores que zero."),
    targetMinReps: z
      .number({ error: "Repetições mínimas obrigatórias" })
      .int()
      .positive("Quantidade mínima deve ser maior que zero."),
    targetMaxReps: z
      .number({ error: "Repetições máximas obrigatórias" })
      .int()
      .positive("Quantidade máxima deve ser maior que zero."),
  })
  .refine((data) => data.targetMaxReps >= data.targetMinReps, {
    message: "As repetições máximas não podem ser menores que as mínimas.",
    path: ["targetMaxReps"],
  });

type AddExerciseFormValues = z.infer<typeof addExerciseFormSchema>;

export function AddExerciseModal({
  isOpen,
  onClose,
  planId,
}: AddExerciseModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("LIBRARY");
  const [searchQuery, setSearchQuery] = useState("");

  // Controle do exercício selecionado para inserção de metas físicas
  const [configuringExercise, setConfiguringExercise] =
    useState<Exercise | null>(null);
  const [targetSets, setTargetSets] = useState(3);
  const [targetMinReps, setTargetMinReps] = useState(8);
  const [targetMaxReps, setTargetMaxReps] = useState(12);

  // Queries e Mutations
  const { data: plan, isLoading: isLoadingPlan } = useWorkoutPlan(planId);
  const { data: categories = [], isLoading: isLoadingCategories } =
    useFitnessCategories();

  const { mutate: createExercise, isPending: isPendingFormSubmit } =
    useCreateExercise();
  const { mutate: linkExercise, isPending: isLinking } =
    useLinkExerciseToPlan();
  const { data: exercisesData, isLoading: isLoadingExercises } = useExercises({
    search: searchQuery || undefined,
    limit: 100,
  });

  const libraryExercises = exercisesData?.data || [];
  const currentPlanExercises = plan?.exercises || [];

  const existingNames = useMemo(() => {
    return new Set(
      currentPlanExercises.map((e) => e.name.toLowerCase().trim()),
    );
  }, [currentPlanExercises]);

  const filteredUniqueExercises = useMemo(() => {
    return libraryExercises.reduce<Exercise[]>((acc, current) => {
      const isDuplicate = acc.some(
        (item) =>
          item.name.toLowerCase().trim() === current.name.toLowerCase().trim(),
      );
      if (!isDuplicate) {
        acc.push(current);
      }
      return acc;
    }, []);
  }, [libraryExercises]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddExerciseFormValues>({
    resolver: zodResolver(addExerciseFormSchema),
    defaultValues: {
      name: "",
      categoryId: "",
      targetSets: 3,
      targetMinReps: 8,
      targetMaxReps: 12,
    },
  });

  const handleStartConfiguring = (exercise: Exercise) => {
    setConfiguringExercise(exercise);
    setTargetSets(3);
    setTargetMinReps(8);
    setTargetMaxReps(12);
  };

  const handleLinkExecutionSubmit = () => {
    if (!configuringExercise || !plan) return;

    linkExercise(
      {
        planId,
        exerciseId: configuringExercise.id,
        currentExercises: currentPlanExercises.map((ex) => ({
          exerciseId: ex.id,
          targetSets: ex.targetSets || 3,
          targetMinReps: ex.targetMinReps || 8,
          targetMaxReps: ex.targetMaxReps || 12,
        })),
        targetSets,
        targetMinReps,
        targetMaxReps,
      },
      {
        onSuccess: () => {
          setConfiguringExercise(null);
        },
      },
    );
  };

  const handleManualSubmit = (data: AddExerciseFormValues) => {
    createExercise(
      { name: data.name, categoryId: data.categoryId },
      {
        onSuccess: (newExercise) => {
          linkExercise(
            {
              planId,
              exerciseId: newExercise.id,
              currentExercises: currentPlanExercises.map((ex) => ({
                exerciseId: ex.id,
                targetSets: ex.targetSets || 3,
                targetMinReps: ex.targetMinReps || 8,
                targetMaxReps: ex.targetMaxReps || 12,
              })),
              targetSets: Number(data.targetSets),
              targetMinReps: Number(data.targetMinReps),
              targetMaxReps: Number(data.targetMaxReps),
            },
            {
              onSuccess: () => {
                reset();
                onClose();
              },
            },
          );
        },
      },
    );
  };

  const handleClose = () => {
    setSearchQuery("");
    setConfiguringExercise(null);
    reset();
    onClose();
  };

  return (
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
            className="relative bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl text-zinc-100 z-50 flex flex-col max-h-[85vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-purple-500" />
                Adicionar Exercício
              </h2>
              <button
                onClick={handleClose}
                className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Alternância de Abas */}
            {!configuringExercise && (
              <div className="p-3 bg-zinc-950/40 border-b border-zinc-800/60 flex gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("LIBRARY")}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    activeTab === "LIBRARY"
                      ? "bg-zinc-800 text-purple-400 shadow-sm border border-zinc-700/50"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Escolher da Biblioteca
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("NEW")}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    activeTab === "NEW"
                      ? "bg-zinc-800 text-purple-400 shadow-sm border border-zinc-700/50"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Criar Novo
                </button>
              </div>
            )}

            {/* Conteúdo Principal do Modal */}
            <div className="p-6 overflow-y-auto flex-1">
              {configuringExercise ? (
                /* Subformulário Inline de configuração de metas obrigatórias */
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setConfiguringExercise(null)}
                      className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-100"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wide">
                      Voltar para listagem
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-zinc-200">
                      Definir Metas Físicas para:
                    </h3>
                    <p className="text-purple-400 font-bold text-base mt-0.5">
                      {configuringExercise.name}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 pt-2">
                    <div>
                      <label className="text-[10px] text-zinc-500 font-bold block mb-1">
                        Séries (Sets)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={targetSets}
                        onChange={(e) =>
                          setTargetSets(
                            Math.max(1, parseInt(e.target.value) || 1),
                          )
                        }
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-1.5 text-xs text-center text-zinc-100 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-500 font-bold block mb-1">
                        Reps Mínimas
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={targetMinReps}
                        onChange={(e) =>
                          setTargetMinReps(
                            Math.max(1, parseInt(e.target.value) || 1),
                          )
                        }
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-1.5 text-xs text-center text-zinc-100 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-500 font-bold block mb-1">
                        Reps Máximas
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={targetMaxReps}
                        onChange={(e) =>
                          setTargetMaxReps(
                            Math.max(1, parseInt(e.target.value) || 1),
                          )
                        }
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-1.5 text-xs text-center text-zinc-100 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-4 border-t border-zinc-800/60">
                    <button
                      type="button"
                      onClick={() => setConfiguringExercise(null)}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-750 text-xs font-semibold rounded-xl text-zinc-300"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleLinkExecutionSubmit}
                      disabled={isLinking}
                      className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center min-w-24"
                    >
                      {isLinking ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Adicionar"
                      )}
                    </button>
                  </div>
                </div>
              ) : activeTab === "LIBRARY" ? (
                /* Busca do catálogo */
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4.5 h-4.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar exercício cadastrado..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-purple-600/50 text-zinc-100 placeholder:text-zinc-650 transition-all"
                    />
                  </div>

                  {isLoadingExercises || isLoadingPlan ? (
                    <div className="space-y-2 py-4">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-14 bg-zinc-950/40 border border-zinc-800/40 rounded-xl animate-pulse"
                        />
                      ))}
                    </div>
                  ) : filteredUniqueExercises.length === 0 ? (
                    <div className="py-12 text-center border border-dashed border-zinc-800/80 rounded-xl bg-zinc-950/10">
                      <Search className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                      <p className="text-xs font-medium text-zinc-400">
                        Nenhum exercício encontrado
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[35vh] overflow-y-auto pr-1">
                      {filteredUniqueExercises.map((exercise) => {
                        const added = existingNames.has(
                          exercise.name.toLowerCase().trim(),
                        );
                        return (
                          <div
                            key={exercise.id}
                            className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                              added
                                ? "bg-purple-500/5 border-purple-500/20 text-zinc-300"
                                : "bg-zinc-950/30 border-zinc-800/80 text-zinc-200 hover:border-zinc-700/80"
                            }`}
                          >
                            <div className="min-w-0 flex-1 pr-3">
                              <p className="text-sm font-bold truncate">
                                {exercise.name}
                              </p>
                              {exercise.category && (
                                <span className="text-[9px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/15 px-1.5 py-0.5 rounded mt-1 inline-block">
                                  {exercise.category.name}
                                </span>
                              )}
                            </div>

                            <div className="shrink-0">
                              {added ? (
                                <span className="flex items-center gap-1 text-[11px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1.5 rounded-lg">
                                  <Check className="w-3.5 h-3.5" />
                                  No Plano
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleStartConfiguring(exercise)
                                  }
                                  className="p-2 bg-zinc-800 hover:bg-purple-600 text-zinc-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                                  title="Definir metas para adicionar"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* Formulário de Criação Direta com campos de metas embutidos */
                <form
                  onSubmit={handleSubmit(handleManualSubmit)}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">
                      Nome do Exercício
                    </label>
                    <input
                      {...register("name")}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/50 focus:border-purple-500 outline-none transition-all placeholder:text-zinc-650 text-zinc-100"
                      placeholder="Ex: Supino Inclinado com Halteres"
                      autoFocus
                    />
                    {errors.name && (
                      <span className="text-rose-500 text-xs font-medium">
                        {errors.name.message}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">
                      Grupamento Muscular / Categoria
                    </label>
                    <select
                      {...register("categoryId")}
                      disabled={isLoadingCategories}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/50 focus:border-purple-500 outline-none transition-all text-zinc-200"
                    >
                      <option value="" disabled className="text-zinc-650">
                        {isLoadingCategories
                          ? "Carregando grupamentos..."
                          : "Selecione o grupamento..."}
                      </option>
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

                  {/* Campos de meta obrigatórios inline com valueAsNumber para o novo exercício */}
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div>
                      <label className="text-[10px] text-zinc-400 font-semibold block mb-1">
                        Séries (Sets)
                      </label>
                      <input
                        type="number"
                        {...register("targetSets", { valueAsNumber: true })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-1.5 text-xs text-center focus:ring-1 focus:ring-purple-500 text-zinc-100"
                      />
                      {errors.targetSets && (
                        <span className="text-rose-500 text-[9px] font-medium">
                          {errors.targetSets.message}
                        </span>
                      )}
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400 font-semibold block mb-1">
                        Reps Mínimas
                      </label>
                      <input
                        type="number"
                        {...register("targetMinReps", { valueAsNumber: true })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-1.5 text-xs text-center focus:ring-1 focus:ring-purple-500 text-zinc-100"
                      />
                      {errors.targetMinReps && (
                        <span className="text-rose-500 text-[9px] font-medium">
                          {errors.targetMinReps.message}
                        </span>
                      )}
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400 font-semibold block mb-1">
                        Reps Máximas
                      </label>
                      <input
                        type="number"
                        {...register("targetMaxReps", { valueAsNumber: true })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-1.5 text-xs text-center focus:ring-1 focus:ring-purple-500 text-zinc-100"
                      />
                      {errors.targetMaxReps && (
                        <span className="text-rose-500 text-[9px] font-medium">
                          {errors.targetMaxReps.message}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-4 border-t border-zinc-800/60">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700/80 text-xs font-bold rounded-xl transition-colors cursor-pointer text-zinc-300"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={
                        isPendingFormSubmit || isLinking || isLoadingCategories
                      }
                      className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center min-w-24 cursor-pointer"
                    >
                      {isPendingFormSubmit || isLinking ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Criar e Adicionar"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {activeTab === "LIBRARY" && !configuringExercise && (
              <div className="p-4 border-t border-zinc-800 bg-zinc-950/20 flex justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700/80 text-xs font-bold rounded-xl transition-colors text-zinc-300 cursor-pointer"
                >
                  Concluir
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
