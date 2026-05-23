import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fitnessService } from "../services/fitnessService";
import { financeService } from "@/features/finance/services/financeService";
import {
  CreateWorkoutPlanDTO,
  UpdateWorkoutPlanDTO,
  CreateExerciseDTO,
} from "../types";

// ==========================================
// QUERIES (LEITURA)
// ==========================================

export function useWorkoutPlans(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["workout-plans", "list", params],
    queryFn: () => fitnessService.getPlans(params),
  });
}

export function useWorkoutPlan(id: string) {
  return useQuery({
    queryKey: ["workout-plans", "detail", id],
    queryFn: () => fitnessService.getPlanById(id),
    enabled: !!id,
  });
}

// Busca categorias e filtra apenas por FITNESS
export function useFitnessCategories() {
  return useQuery({
    queryKey: ["categories", "fitness-only"],
    queryFn: async () => {
      const response = await financeService.getCategories();
      const allCategories = response.data;
      return Array.isArray(allCategories)
        ? allCategories.filter((cat) => cat.type === "FITNESS")
        : [];
    },
  });
}

// ==========================================
// MUTATIONS (ESCRITA)
// ==========================================

export function useCreateWorkoutPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWorkoutPlanDTO) => fitnessService.createPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-plans"] });
    },
  });
}

export function useUpdateWorkoutPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWorkoutPlanDTO }) =>
      fitnessService.updatePlan(id, data),
    onSuccess: (updatedPlan) => {
      queryClient.invalidateQueries({ queryKey: ["workout-plans"] });
      queryClient.invalidateQueries({
        queryKey: ["workout-plans", "detail", updatedPlan.id],
      });
    },
  });
}

export function useDeleteWorkoutPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => fitnessService.deletePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-plans"] });
    },
  });
}

// Gerenciamento de Exercícios individuais dentro de um plano
export function useAddExerciseToPlan(planId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExerciseDTO) =>
      fitnessService.addExerciseToPlan(planId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-plans", "list"] });
      queryClient.invalidateQueries({
        queryKey: ["workout-plans", "detail", planId],
      });
    },
  });
}

export function useRemoveExerciseFromPlan(planId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (exerciseId: string) =>
      fitnessService.removeExerciseFromPlan(planId, exerciseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-plans", "list"] });
      queryClient.invalidateQueries({
        queryKey: ["workout-plans", "detail", planId],
      });
    },
  });
}

export function useStartWorkoutSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { workoutPlanId: string }) =>
      fitnessService.startSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-sessions"] });
    },
  });
}

export function useLogSet(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      exerciseId: string;
      reps: number;
      weight: number;
      toFailure: boolean;
    }) => fitnessService.logSet(sessionId, data),
    onSuccess: () => {
      // Atualiza os dados específicos desta sessão de treino
      queryClient.invalidateQueries({
        queryKey: ["workout-sessions", "detail", sessionId],
      });
    },
  });
}

export function useFinishWorkoutSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => fitnessService.finishSession(sessionId),
    onSuccess: (finishedSession) => {
      queryClient.invalidateQueries({ queryKey: ["workout-sessions"] });
      queryClient.invalidateQueries({
        queryKey: ["workout-sessions", "detail", finishedSession.id],
      });
    },
  });
}

export function useUpdateSet(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      setId,
      data,
    }: {
      setId: string;
      data: { reps?: number; weight?: number; toFailure?: boolean };
    }) => fitnessService.updateSet(setId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workout-sessions", "detail", sessionId],
      });
    },
  });
}

export function useRemoveSet(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (setId: string) => fitnessService.removeSet(setId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workout-sessions", "detail", sessionId],
      });
    },
  });
}

export function useActiveSessionDetail(sessionId: string | null) {
  return useQuery({
    queryKey: ["workout-sessions", "detail", sessionId],
    queryFn: () => fitnessService.getSessionById(sessionId!),
    enabled: !!sessionId,
  });
}
