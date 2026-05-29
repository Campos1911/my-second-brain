// src/features/fitness/services/fitnessService.ts

import { api } from "@/services/api";
import {
  WorkoutPlan,
  WorkoutSession,
  SetLog,
  Exercise,
  ExerciseProgressResponse,
  CreateWorkoutPlanDTO,
  UpdateWorkoutPlanDTO,
  CreateExerciseDTO,
  UpdateExerciseDTO,
  StartSessionDTO,
  LogSetDTO,
  UpdateSetLogDTO,
} from "../types";
import { PaginatedResponse } from "@/types";

export const fitnessService = {
  // ==========================================
  // PLANOS DE TREINO (WORKOUT PLANS)
  // ==========================================

  async getPlans(params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<WorkoutPlan>> {
    const response = await api.get<PaginatedResponse<WorkoutPlan>>(
      "/workout-plans",
      { params },
    );
    return response.data;
  },

  async getPlanById(id: string): Promise<WorkoutPlan> {
    const response = await api.get<WorkoutPlan>(`/workout-plans/${id}`);
    return response.data;
  },

  async createPlan(data: CreateWorkoutPlanDTO): Promise<WorkoutPlan> {
    const response = await api.post<WorkoutPlan>("/workout-plans", data);
    return response.data;
  },

  async updatePlan(
    id: string,
    data: UpdateWorkoutPlanDTO,
  ): Promise<WorkoutPlan> {
    const response = await api.patch<WorkoutPlan>(`/workout-plans/${id}`, data);
    return response.data;
  },

  async deletePlan(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(
      `/workout-plans/${id}`,
    );
    return response.data;
  },

  // ==========================================
  // GERENCIAMENTO DIRETO DE EXERCÍCIOS (BIBLIOTECA)
  // ==========================================

  async getExercises(params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    workoutPlanId?: string; // Mantido para carregar exercícios de um plano via query
  }): Promise<PaginatedResponse<Exercise>> {
    const response = await api.get<PaginatedResponse<Exercise>>("/exercises", {
      params,
    });
    return response.data;
  },

  async getExerciseById(id: string): Promise<Exercise> {
    const response = await api.get<Exercise>(`/exercises/${id}`);
    return response.data;
  },

  async createExercise(data: CreateExerciseDTO): Promise<Exercise> {
    const response = await api.post<Exercise>("/exercises", data);
    return response.data;
  },

  async updateExercise(id: string, data: UpdateExerciseDTO): Promise<Exercise> {
    const response = await api.patch<Exercise>(`/exercises/${id}`, data);
    return response.data;
  },

  async deleteExercise(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/exercises/${id}`);
    return response.data;
  },

  // ==========================================
  // SESSÕES DE TREINO (WORKOUT SESSIONS)
  // ==========================================

  async startSession(data: StartSessionDTO): Promise<WorkoutSession> {
    const response = await api.post<WorkoutSession>(
      "/workout-sessions/start",
      data,
    );
    return response.data;
  },

  async logSet(sessionId: string, data: LogSetDTO): Promise<SetLog> {
    const response = await api.post<SetLog>(
      `/workout-sessions/${sessionId}/sets`,
      data,
    );
    return response.data;
  },

  async finishSession(sessionId: string): Promise<WorkoutSession> {
    const response = await api.post<WorkoutSession>(
      `/workout-sessions/${sessionId}/finish`,
    );
    return response.data;
  },

  async getSessionsHistory(params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<WorkoutSession>> {
    const response = await api.get<PaginatedResponse<WorkoutSession>>(
      "/workout-sessions",
      { params },
    );
    return response.data;
  },

  async getSessionById(id: string): Promise<WorkoutSession> {
    const response = await api.get<WorkoutSession>(`/workout-sessions/${id}`);
    return response.data;
  },

  async deleteSession(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(
      `/workout-sessions/${id}`,
    );
    return response.data;
  },

  // ==========================================
  // CONTROLE INDIVIDUAL DE SÉRIES (SETS)
  // ==========================================

  async updateSet(
    setId: string,
    data: UpdateSetLogDTO,
  ): Promise<Pick<SetLog, "id" | "reps" | "weight" | "toFailure">> {
    const response = await api.patch<
      Pick<SetLog, "id" | "reps" | "weight" | "toFailure">
    >(`/workout-sessions/sets/${setId}`, data);
    return response.data;
  },

  async removeSet(setId: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(
      `/workout-sessions/sets/${setId}`,
    );
    return response.data;
  },

  // ==========================================
  // MÉTRICAS E EVOLUÇÃO (PROGRESS)
  // ==========================================

  async getExerciseProgress(
    exerciseId: string,
  ): Promise<ExerciseProgressResponse> {
    const response = await api.get<ExerciseProgressResponse>(
      `/workout-sessions/exercises/${exerciseId}/progress`,
    );
    return response.data;
  },
};
