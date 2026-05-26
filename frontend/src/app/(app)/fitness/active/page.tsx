// src/app/(app)/fitness/active/page.tsx

"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useActiveWorkoutStore } from "@/features/fitness/store/activeWorkoutStore";
import {
  useActiveSessionDetail,
  useLogSet,
  useFinishWorkoutSession,
  useUpdateSet,
  useRemoveSet,
  useWorkoutPlan,
} from "@/features/fitness/hooks/useFitness";
import { ActiveWorkoutTimer } from "@/features/fitness/components/ActiveWorkoutTimer";
import { SetLogRow } from "@/features/fitness/components/SetLogRow";
import { SetLog } from "@/features/fitness/types";
import {
  Dumbbell,
  Flame,
  Check,
  Loader2,
  ArrowLeft,
  Plus,
  Minus,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ActiveWorkoutPage() {
  const router = useRouter();
  const [, startTransition] = useTransition();

  // Zustand
  const { activeSessionId, workoutPlanId, startedAt, clearSession } =
    useActiveWorkoutStore();

  // Estados de Digitação (Formulário Rápido por Exercício)
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(
    null,
  );
  const [weight, setWeight] = useState(20);
  const [reps, setReps] = useState(10);
  const [toFailure, setToFailure] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Queries e Mutations
  const { data: session, isLoading: isLoadingSession } =
    useActiveSessionDetail(activeSessionId);
  const { data: plan, isLoading: isLoadingPlan } = useWorkoutPlan(
    workoutPlanId || "",
  );

  const { mutate: logSet, isPending: isLoggingSet } = useLogSet(
    activeSessionId || "",
  );
  const { mutate: finishSession, isPending: isFinishing } =
    useFinishWorkoutSession();
  const { mutate: updateSet, isPending: isUpdatingSet } = useUpdateSet(
    activeSessionId || "",
  );
  const { mutate: removeSet, isPending: isRemovingSet } = useRemoveSet(
    activeSessionId || "",
  );

  // Redireciona de volta se nenhuma sessão estiver ativa localmente
  useEffect(() => {
    if (!activeSessionId) {
      startTransition(() => {
        router.push("/fitness");
      });
    }
  }, [activeSessionId, router]);

  if (isLoadingSession || isLoadingPlan || !session || !plan) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        <p className="text-sm text-zinc-500">
          Recuperando sessão ativa de treino...
        </p>
      </div>
    );
  }

  const exercises = plan.exercises || [];

  // Mapeia logs criados para exibição agrupada por exercício
  const logsByExercise = (session.setLogs || []).reduce<
    Record<string, SetLog[]>
  >((acc, log) => {
    const exerciseId = log.exerciseId;
    if (!acc[exerciseId]) {
      acc[exerciseId] = [];
    }

    const currentList = acc[exerciseId];
    if (currentList) {
      currentList.push(log);
    }

    return acc;
  }, {});

  const handleLogSetSubmit = (exerciseId: string) => {
    logSet(
      {
        exerciseId,
        reps,
        weight,
        toFailure,
      },
      {
        onSuccess: () => {
          setToFailure(false);
        },
      },
    );
  };

  const handleFinishWorkout = () => {
    if (!activeSessionId) return;
    finishSession(activeSessionId, {
      onSuccess: () => {
        clearSession();
        startTransition(() => {
          router.push("/fitness");
        });
      },
    });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-24 px-4 sm:px-0">
      {/* CORRIGIDO: Removido backdrop-blur-md e usado bg-zinc-950 sólido para poupar o processamento gráfico do mobile */}
      <div className="flex items-center justify-between gap-4 bg-zinc-950 py-4 border-b border-zinc-900 sticky top-16 z-30">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setShowExitConfirm(true)}
            className="p-2 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100 rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-zinc-100 truncate">
              {plan.name}
            </h1>
            <p className="text-xs text-zinc-500">Treino em andamento</p>
          </div>
        </div>

        {startedAt && <ActiveWorkoutTimer startedAt={startedAt} />}
      </div>

      {/* Lista de Exercícios Executáveis */}
      <div className="space-y-6">
        {exercises.map((exercise) => {
          const loggedSets = logsByExercise[exercise.id] || [];
          const isSelected = selectedExerciseId === exercise.id;

          return (
            /* CORRIGIDO: Removido transition-all que conflitava com a renderização interna */
            <div
              key={exercise.id}
              className={`border rounded-2xl p-4 transition-colors duration-200 ${
                isSelected
                  ? "bg-zinc-900/60 border-purple-500/40"
                  : "bg-zinc-900/20 border-zinc-800 hover:border-zinc-700/80"
              }`}
            >
              <button
                type="button"
                onClick={() =>
                  setSelectedExerciseId(isSelected ? null : exercise.id)
                }
                className="w-full flex items-center justify-between gap-4 cursor-pointer text-left outline-none"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-2 rounded-xl border ${isSelected ? "bg-purple-600/10 text-purple-400 border-purple-500/20" : "bg-zinc-800 text-zinc-500 border-zinc-700"}`}
                  >
                    <Dumbbell className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-zinc-100">
                    {exercise.name}
                  </span>
                </div>
                <span className="text-xs font-semibold text-zinc-500 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-lg">
                  {loggedSets.length}{" "}
                  {loggedSets.length === 1 ? "série" : "séries"}
                </span>
              </button>

              {/* Lista de Séries Já Realizadas */}
              {loggedSets.length > 0 && (
                <div className="space-y-1.5 mt-4">
                  {loggedSets.map((set, idx) => (
                    <SetLogRow
                      key={set.id}
                      setLog={set}
                      index={idx}
                      onUpdate={(setId, data) => updateSet({ setId, data })}
                      onDelete={(setId) => removeSet(setId)}
                      isMutating={isUpdatingSet || isRemovingSet}
                    />
                  ))}
                </div>
              )}

              {/* Painel de Registro Rápido */}
              <AnimatePresence initial={false}>
                {isSelected && (
                  /* CORRIGIDO: Removida a alteração de posição (y: -8), mantendo apenas opacidade. 
                     Isso remove completamente a necessidade do navegador recalcular e redesenhar as camadas sobrepostas ao rolar. */
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="mt-4 pt-4 border-t border-zinc-800/80 space-y-4">
                      {/* Seletores Digitais */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Seletor Carga */}
                        <div className="bg-zinc-950/60 border border-zinc-800/60 p-3 rounded-xl flex flex-col items-center justify-center">
                          <span className="text-xs text-zinc-500 font-semibold mb-1">
                            Carga (kg)
                          </span>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                setWeight((prev) => Math.max(0, prev - 2.5))
                              }
                              className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-lg font-bold text-zinc-200">
                              {weight}
                            </span>
                            <button
                              type="button"
                              onClick={() => setWeight((prev) => prev + 2.5)}
                              className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Seletor Repetições */}
                        <div className="bg-zinc-950/60 border border-zinc-800/60 p-3 rounded-xl flex flex-col items-center justify-center">
                          <span className="text-xs text-zinc-500 font-semibold mb-1">
                            Repetições
                          </span>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                setReps((prev) => Math.max(1, prev - 1))
                              }
                              className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-lg font-bold text-zinc-200">
                              {reps}
                            </span>
                            <button
                              type="button"
                              onClick={() => setReps((prev) => prev + 1)}
                              className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Botão Falha e Registrar */}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setToFailure(!toFailure)}
                          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-semibold text-sm transition-all cursor-pointer ${
                            toFailure
                              ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                              : "bg-zinc-950/60 border-zinc-800 text-zinc-500 hover:text-zinc-400"
                          }`}
                        >
                          <Flame className="w-4 h-4 fill-current" />
                          <span>Falha</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleLogSetSubmit(exercise.id)}
                          disabled={isLoggingSet}
                          className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-sm py-3 rounded-xl transition-all shadow-md shadow-purple-500/10 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {isLoggingSet ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Check className="w-4 h-4" />
                              <span>Registrar Série</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Botão Flutuante de Finalização */}
      <div className="fixed bottom-0 left-0 right-0 bg-linear-to-t from-zinc-950 via-zinc-950/90 to-transparent p-4 border-t border-zinc-900/40 z-20">
        <div className="max-w-2xl mx-auto">
          <button
            type="button"
            onClick={handleFinishWorkout}
            disabled={isFinishing || (session.setLogs || []).length === 0}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer"
          >
            {isFinishing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Check className="w-5 h-5" />
                <span>Finalizar Treino</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modais de Confirmação de Saída */}
      <AnimatePresence>
        {showExitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExitConfirm(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-zinc-900 border border-zinc-800 w-full max-w-sm p-6 rounded-2xl shadow-2xl text-zinc-100 z-50 text-center space-y-4"
            >
              <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Sair do Treino?</h3>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                  O cronômetro continuará rodando em segundo plano. Você pode
                  voltar a esta tela a qualquer momento para continuar
                  registrando suas séries.
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-sm font-semibold rounded-xl text-zinc-300 cursor-pointer"
                >
                  Voltar ao Treino
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowExitConfirm(false);
                    startTransition(() => {
                      router.push("/fitness");
                    });
                  }}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-sm font-semibold rounded-xl text-white cursor-pointer"
                >
                  Sim, Sair
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
