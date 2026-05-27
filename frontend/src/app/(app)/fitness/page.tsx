// src/app/(app)/fitness/page.tsx

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  useWorkoutPlans,
  useExercises,
  useDeleteExercise,
  useStartWorkoutSession,
} from "@/features/fitness/hooks/useFitness";
import { useActiveWorkoutStore } from "@/features/fitness/store/activeWorkoutStore";
import { useQuery } from "@tanstack/react-query";
import { fitnessService } from "@/features/fitness/services/fitnessService";
import { WorkoutPlanCard } from "@/features/fitness/components/WorkoutPlanCard";
import { CreatePlanModal } from "@/features/fitness/components/CreatePlanModal";
import { EditExerciseModal } from "@/features/fitness/components/EditExerciseModal";
import { SessionDetailModal } from "@/features/fitness/components/SessionDetailModal";
import { ExerciseProgressChart } from "@/features/fitness/components/ExerciseProgressChart";
import { Pagination } from "@/components/Pagination";
import { Exercise } from "@/features/fitness/types";
import {
  Dumbbell,
  Plus,
  Calendar,
  TrendingUp,
  ArrowRight,
  Library,
  Search,
  Trash2,
  Pencil,
} from "lucide-react";
import { parseUTCToLocalDate } from "@/lib/utils";

export default function FitnessDashboardPage() {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useState<
    "PLANS" | "HISTORY" | "ANALYTICS" | "LIBRARY"
  >("PLANS");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
  const [exerciseToEdit, setExerciseToEdit] = useState<Exercise | null>(null);

  // Estado para controle de qual ficha está expandida (Apenas uma por vez)
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  // Estados locais para a Biblioteca (Library)
  const [libraryPage, setLibraryPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  // Paginação Geral
  const [currentPage, setCurrentPage] = useState(1);
  const LIMIT = 10;

  // Zustand: Estado de treino ativo local
  const { activeSessionId, startSession } = useActiveWorkoutStore();

  // Queries
  const { data: plansData, isLoading: isLoadingPlans } = useWorkoutPlans();

  const { data: historyData, isLoading: isLoadingHistory } = useQuery({
    queryKey: ["workout-sessions", "history-list", currentPage],
    queryFn: () =>
      fitnessService.getSessionsHistory({ page: currentPage, limit: LIMIT }),
    enabled: activeTab === "HISTORY",
  });

  const { data: libraryData, isLoading: isLoadingLibrary } = useExercises({
    page: libraryPage,
    limit: LIMIT,
    search: searchQuery || undefined,
  });

  const { data: exercisesPlanData } = useWorkoutPlans({ page: 1, limit: 100 });

  // Mutations
  const { mutate: startBackendSession, isPending: isStartingSession } =
    useStartWorkoutSession();
  const { mutate: deleteExercise } = useDeleteExercise();

  const plans = plansData?.data || [];
  const history = historyData?.data || [];
  const historyMeta = historyData?.meta || { total: 0, page: 1, lastPage: 1 };

  const libraryExercises = libraryData?.data || [];
  const libraryMeta = libraryData?.meta || { total: 0, page: 1, lastPage: 1 };

  // Junta todos os exercícios de todas as fichas para preencher o seletor evolutivo
  const allExercises = (exercisesPlanData?.data || []).flatMap(
    (p) => p.exercises || [],
  );

  const handleStartSession = (workoutPlanId: string) => {
    startBackendSession(
      { workoutPlanId },
      {
        onSuccess: (newSession) => {
          startSession(newSession.id, workoutPlanId, newSession.startedAt);
          startTransition(() => {
            router.push("/fitness/active");
          });
        },
      },
    );
  };

  const handleTogglePlan = (planId: string) => {
    setExpandedPlanId((prevId) => (prevId === planId ? null : planId));
  };

  return (
    <div className="space-y-6 sm:space-y-8 px-4 sm:px-0 py-4 sm:py-0 text-zinc-100">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Academia</h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Monte suas rotinas, registre cargas e acompanhe sua evolução física.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors shadow-lg shadow-purple-500/10 cursor-pointer text-sm"
        >
          <Plus className="w-4 h-4" />
          Nova Ficha
        </button>
      </div>

      {/* Banner de Sincronização de Sessão Ativa */}
      {activeSessionId && (
        <div className="bg-purple-600/10 border border-purple-500/20 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-600/10 text-purple-400 rounded-xl">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-zinc-200">
                Você tem um treino em andamento!
              </h4>
              <p className="text-xs text-zinc-500 mt-0.5">
                O cronômetro está rodando. Registre suas séries para não perder
                o foco.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              startTransition(() => {
                router.push("/fitness/active");
              });
            }}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Continuar Treino</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Abas Superiores de Controle */}
      <div className="flex flex-wrap bg-zinc-950/40 border border-zinc-900/60 p-1.5 rounded-2xl gap-1">
        <button
          onClick={() => setActiveTab("PLANS")}
          className={`flex-1 min-w-20 flex items-center justify-center gap-2 py-3 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === "PLANS"
              ? "bg-zinc-900 text-purple-400 shadow-sm border border-zinc-800/80"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          Fichas
        </button>
        <button
          onClick={() => setActiveTab("LIBRARY")}
          className={`flex-1 min-w-20 flex items-center justify-center gap-2 py-3 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === "LIBRARY"
              ? "bg-zinc-900 text-purple-400 shadow-sm border border-zinc-800/80"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Library className="w-4 h-4" />
          Biblioteca
        </button>
        <button
          onClick={() => setActiveTab("HISTORY")}
          className={`flex-1 min-w-20 flex items-center justify-center gap-2 py-3 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === "HISTORY"
              ? "bg-zinc-900 text-purple-400 shadow-sm border border-zinc-800/80"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Calendar className="w-4 h-4" />
          Histórico
        </button>
        <button
          onClick={() => setActiveTab("ANALYTICS")}
          className={`flex-1 min-w-20 flex items-center justify-center gap-2 py-3 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === "ANALYTICS"
              ? "bg-zinc-900 text-purple-400 shadow-sm border border-zinc-800/80"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Evolução
        </button>
      </div>

      {/* Conteúdo Mutável */}
      <div className="space-y-4">
        {/* TAB 1: Minhas Fichas */}
        {activeTab === "PLANS" && (
          <div className="space-y-4">
            {isLoadingPlans ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-20 bg-zinc-900/40 border border-zinc-800/60 rounded-2xl animate-pulse"
                  />
                ))}
              </div>
            ) : plans.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/10">
                <Dumbbell className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-zinc-400">
                  Nenhuma ficha criada
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  Cadastre seus planos de musculação clicando em "Nova Ficha"
                  acima.
                </p>
              </div>
            ) : (
              /* ADICIONADO: "items-start" para evitar o alongamento vertical automático do CSS Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                {plans.map((p) => (
                  <WorkoutPlanCard
                    key={p.id}
                    plan={p}
                    isExpanded={expandedPlanId === p.id}
                    onToggle={() => handleTogglePlan(p.id)}
                    onStartWorkout={handleStartSession}
                    isStartingWorkout={isStartingSession}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Biblioteca Unificada de Exercícios */}
        {activeTab === "LIBRARY" && (
          <div className="space-y-5">
            {/* Filtros de Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4.5 h-4.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setLibraryPage(1);
                }}
                placeholder="Buscar exercício pelo nome..."
                className="w-full bg-zinc-950/60 border border-zinc-800 pl-10 pr-4 py-3 rounded-xl text-base outline-none focus:ring-2 focus:ring-purple-600/50 text-zinc-100 placeholder:text-zinc-600 transition-all"
              />
            </div>

            {isLoadingLibrary ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-14 bg-zinc-900/40 border border-zinc-800/60 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : libraryExercises.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/10">
                <Library className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-zinc-400">
                  Nenhum exercício encontrado
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  Crie exercícios inserindo-os diretamente em suas fichas de
                  treino.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {libraryExercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="flex items-center justify-between p-4 bg-zinc-900/40 border border-zinc-800 rounded-xl group hover:border-purple-500/30 transition-colors"
                  >
                    <div className="min-w-0 flex-1 pr-4">
                      <h4 className="font-bold