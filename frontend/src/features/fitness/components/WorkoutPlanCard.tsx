// src/features/fitness/components/WorkoutPlanCard.tsx

"use client";

import { useState } from "react";
import { WorkoutPlan, Exercise } from "../types";
import {
  useDeleteWorkoutPlan,
  useUnlinkExerciseFromPlan,
} from "../hooks/useFitness";
import {
  Trash2,
  Plus,
  Dumbbell,
  ChevronDown,
  Play,
  Loader2,
  AlertTriangle,
  Pencil,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AddExerciseModal } from "./AddExerciseModal";
import { EditExerciseModal } from "./EditExerciseModal";

interface WorkoutPlanCardProps {
  plan: WorkoutPlan;
  isExpanded: boolean;
  onToggle: () => void;
  onStartWorkout: (planId: string) => void;
  isStartingWorkout?: boolean;
  onEditPlan: (plan: WorkoutPlan) => void; // Callback inserido
}

export function WorkoutPlanCard({
  plan,
  isExpanded,
  onToggle,
  onStartWorkout,
  isStartingWorkout = false,
  onEditPlan,
}: WorkoutPlanCardProps) {
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);
  const [exerciseToEdit, setExerciseToEdit] = useState<Exercise | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { mutate: deletePlan, isPending: isDeletingPlan } =
    useDeleteWorkoutPlan();
  const { mutate: unlinkExercise, isPending: isUnlinking } =
    useUnlinkExerciseFromPlan();

  const exercises = plan.exercises || [];

  const handleDeletePlan = () => {
    deletePlan(plan.id, {
      onSuccess: () => setDeleteConfirmId(null),
    });
  };

  const handleUnlinkExercise = (exerciseId: string) => {
    // Reconstrói a lista mapeando as metas físicas atuais para desvincular o exercício unitário via mutation
    unlinkExercise({
      planId: plan.id,
      exerciseId,
      currentExercises: exercises.map((e) => ({
        exerciseId: e.id,
        targetSets: e.targetSets || 3,
        targetMinReps: e.targetMinReps || 8,
        targetMaxReps: e.targetMaxReps || 12,
      })),
    });
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 transition-all hover:border-purple-500/30">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-lg text-zinc-100 truncate">
            {plan.name}
          </h3>
          <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
            <Dumbbell className="w-3.5 h-3.5 text-purple-400" />
            {exercises.length === 0
              ? "Nenhum exercício cadastrado"
              : `${exercises.length} ${exercises.length === 1 ? "exercício" : "exercícios"}`}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onStartWorkout(plan.id)}
            disabled={isStartingWorkout}
            className="p-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl transition-all active:scale-[0.97] flex items-center justify-center gap-1 text-xs font-semibold shadow-md shadow-purple-500/15 cursor-pointer"
            title="Iniciar Sessão de Treino"
          >
            {isStartingWorkout ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Play className="w-3.5 h-3.5" fill="currentColor" />
                <span>Iniciar</span>
              </>
            )}
          </button>

          <button
            onClick={onToggle}
            className={`p-2.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-xl transition-transform duration-200 ${isExpanded ? "rotate-180" : "rotate-0"}`}
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-zinc-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Lista de Exercícios
                </span>
                <button
                  onClick={() => setIsAddExerciseOpen(true)}
                  className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1.5 transition-colors font-medium cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Exercício
                </button>
              </div>

              {exercises.length === 0 ? (
                <div className="py-6 text-center border border-dashed border-zinc-800 rounded-xl">
                  <p className="text-xs text-zinc-500">
                    Esta ficha ainda está vazia.
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {exercises.map((ex) => {
                    const isGlobal = !ex.userId;
                    return (
                      <li
                        key={ex.id}
                        className="flex items-center justify-between p-3 bg-zinc-950/40 rounded-xl border border-zinc-800/50 group"
                      >
                        <div className="min-w-0 flex-1 pr-3">
                          <span className="text-sm text-zinc-250 font-bold block">
                            {ex.name}
                          </span>
                          {ex.targetSets &&
                            ex.targetMinReps &&
                            ex.targetMaxReps && (
                              /* Exibição limpa das metas cadastradas conforme especificação */
                              <span className="text-xs text-purple-400 mt-0.5 block font-semibold">
                                {ex.targetSets} séries de {ex.targetMinReps} a{" "}
                                {ex.targetMaxReps} repetições
                              </span>
                            )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {!isGlobal && (
                            <button
                              onClick={() => setExerciseToEdit(ex)}
                              className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1.5 text-zinc-500 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all"
                              title="Editar detalhes do exercício"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => handleUnlinkExercise(ex.id)}
                            disabled={isUnlinking}
                            className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                            title="Remover exercício da ficha"
                          >
                            {isUnlinking ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-zinc-800/40">
                {/* Botão de Edição da Ficha Completa */}
                <button
                  onClick={() => onEditPlan(plan)}
                  className="text-xs text-zinc-500 hover:text-purple-400 flex items-center gap-1 py-1.5 px-2.5 hover:bg-purple-500/5 rounded-lg transition-all cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Editar Ficha
                </button>

                {/* Exclusão do Plano */}
                {deleteConfirmId === plan.id ? (
                  <div className="flex items-center gap-2 bg-rose-500/5 border border-rose-500/20 px-3 py-1.5 rounded-xl">
                    <span className="text-xs text-rose-400 font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Excluir ficha?
                    </span>
                    <button
                      onClick={handleDeletePlan}
                      disabled={isDeletingPlan}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      {isDeletingPlan ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        "Sim"
                      )}
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="text-xs text-zinc-400 hover:text-zinc-200 px-2 py-1 font-medium"
                    >
                      Não
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirmId(plan.id)}
                    className="text-xs text-zinc-500 hover:text-rose-400 flex items-center gap-1 py-1.5 px-2.5 hover:bg-rose-500/5 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Excluir Ficha
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AddExerciseModal
        isOpen={isAddExerciseOpen}
        onClose={() => setIsAddExerciseOpen(false)}
        planId={plan.id}
      />

      <EditExerciseModal
        isOpen={!!exerciseToEdit}
        onClose={() => setExerciseToEdit(null)}
        exercise={exerciseToEdit}
      />
    </div>
  );
}
