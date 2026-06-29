// src/features/fitness/hooks/useFitness.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fitnessService } from "../services/fitnessService";
import { financeService } from "@/features/finance/services/financeService";
import {
  CreateWorkoutPlanDTO,
  UpdateWorkoutPlanDTO,
  CreateExerciseDTO,
  UpdateExerciseDTO,
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

export function useExercises(params?: {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  workoutPlanId?: string;
}) {
  return useQuery({
    queryKey: ["exercises", "list", params],
    queryFn: () => fitnessService.getExercises(params),
  });
}

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
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
    },
  });
}

// ==========================================
// CRUD DESACOPLADO DE EXERCÍCIOS INDIVIDUAIS
// ==========================================

export function useCreateExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExerciseDTO) =>
      fitnessService.createExercise(data),
    onSuccess: () => {
      // Invalida a árvore de planos e exercícios unificados
      queryClient.invalidateQueries({ queryKey: ["workout-plans"] });
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
    },
  });
}

export function useUpdateExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExerciseDTO }) =>
      fitnessService.updateExercise(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-plans"] });
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
    },
  });
}

export function useDeleteExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => fitnessService.deleteExercise(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-plans"] });
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
    },
  });
}

// ==========================================
// CONTROLE DE SESSÕES (WORKOUT SESSIONS)
// ==========================================

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

export function useLinkExerciseToPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      planId,
      exerciseId,
      currentExercises,
      targetSets,
      targetMinReps,
      targetMaxReps,
    }: {
      planId: string;
      exerciseId: string;
      currentExercises: {
        exerciseId: string;
        targetSets: number;
        targetMinReps: number;
        targetMaxReps: number;
      }[];
      targetSets: number;
      targetMinReps: number;
      targetMaxReps: number;
    }) => {
      // Evita duplicidades na lista de envio
      const filteredCurrent = currentExercises.filter(
        (ex) => ex.exerciseId !== exerciseId,
      );
      const updatedExercises = [
        ...filteredCurrent,
        { exerciseId, targetSets, targetMinReps, targetMaxReps },
      ];

      return fitnessService.updatePlan(planId, {
        exercises: updatedExercises,
      });
    },
    onSuccess: (updatedPlan) => {
      queryClient.invalidateQueries({ queryKey: ["workout-plans"] });
      queryClient.invalidateQueries({
        queryKey: ["workout-plans", "detail", updatedPlan.id],
      });
    },
  });
}

export function useUnlinkExerciseFromPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      planId,
      exerciseId,
      currentExercises,
    }: {
      planId: string;
      exerciseId: string;
      currentExercises: {
        exerciseId: string;
        targetSets: number;
        targetMinReps: number;
        targetMaxReps: number;
      }[];
    }) => {
      // Remove o exercício correspondente e reconstrói o array com o formato esperado pelo backend
      const updatedExercises = currentExercises.filter(
        (ex) => ex.exerciseId !== exerciseId,
      );

      return fitnessService.updatePlan(planId, {
        exercises: updatedExercises,
      });
    },
    onSuccess: (updatedPlan) => {
      queryClient.invalidateQueries({ queryKey: ["workout-plans"] });
      queryClient.invalidateQueries({
        queryKey: ["workout-plans", "detail", updatedPlan.id],
      });
    },
  });
}
