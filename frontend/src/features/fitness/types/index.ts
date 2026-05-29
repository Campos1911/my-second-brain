// src/features/fitness/types/index.ts

import { z } from "zod";
import { Category } from "@/types";

// ==========================================
// TIPOS E ENUMS DE DOMÍNIO EXCLUSIVOS DO FITNESS
// ==========================================

export interface Exercise {
  id: string;
  name: string;
  categoryId: string;
  userId: string | null; // null = Exercício Global do Sistema, string = Customizado
  associationId?: string | null; // ID opcional do vínculo intermediário Many-to-Many
  category?: Partial<Category>;
  workoutPlan?: {
    id: string;
    name: string;
  };
  deletedAt?: string | null;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  userId: string;
  exercises?: Exercise[];
  deletedAt?: string | null;
}

export interface SetLog {
  id: string;
  workoutSessionId: string;
  exerciseId: string;
  reps: number;
  weight: number;
  toFailure: boolean;
  createdAt: string;
  deletedAt?: string | null;
  exercise?: Partial<Exercise>;
}

export interface WorkoutSession {
  id: string;
  workoutPlanId: string;
  userId: string;
  startedAt: string;
  finishedAt?: string | null;
  deletedAt?: string | null;
  workoutPlan?: {
    name: string;
  };
  setLogs?: SetLog[];
  _count?: {
    setLogs: number;
  };
}

// ==========================================
// MODELO DE PROGRESSÃO DE CARGAS (MÉTRICAS)
// ==========================================

export interface ExerciseProgressItem {
  setId: string;
  date: string;
  reps: number;
  weight: number;
  toFailure: boolean;
  volume: number;
}

export interface ExerciseProgressResponse {
  exercise: {
    id: string;
    name: string;
  };
  history: ExerciseProgressItem[];
}

// ==========================================
// SCHEMAS ZOD PARA VALIDAÇÃO DE ENTRADAS
// ==========================================

export const createExerciseSchema = z.object({
  name: z.string().min(1, "O nome do exercício é obrigatório."),
  categoryId: z.string().uuid("Selecione uma categoria válida."),
});

export const updateExerciseSchema = z.object({
  name: z.string().min(1, "O nome do exercício não pode ser vazio.").optional(),
  categoryId: z.string().uuid("Selecione uma categoria válida.").optional(),
});

export const createWorkoutPlanSchema = z.object({
  name: z
    .string()
    .min(2, "O nome do plano de treino deve ter pelo menos 2 caracteres."),
  exerciseIds: z.array(z.string().uuid()), // Removido .optional() para alinhar 100% com o Form
});

export const updateWorkoutPlanSchema = z.object({
  name: z
    .string()
    .min(2, "O nome do plano de treino deve ter pelo menos 2 caracteres.")
    .optional(), // Tornou-se opcional para permitir atualizações parciais (PATCH)
  exerciseIds: z.array(z.string().uuid()).optional(),
});

export const startSessionSchema = z.object({
  workoutPlanId: z.string().uuid("Selecione uma ficha de treino válida."),
});

export const logSetSchema = z.object({
  exerciseId: z.string().uuid("ID do exercício inválido."),
  reps: z
    .number({ error: "As repetições devem ser um número." })
    .int("As repetições devem ser um valor inteiro.")
    .min(1, "Insira no mínimo 1 repetição."),
  weight: z
    .number({ error: "O peso deve ser um número." })
    .min(0, "O peso não pode ser negativo."),
  toFailure: z.boolean().optional().default(false),
});

export const updateSetLogSchema = logSetSchema.partial();

// ==========================================
// DTOS INFERIDOS DOS SCHEMAS ZOD
// ==========================================

export type CreateExerciseDTO = z.infer<typeof createExerciseSchema>;
export type UpdateExerciseDTO = z.infer<typeof updateExerciseSchema>;
export type CreateWorkoutPlanDTO = z.infer<typeof createWorkoutPlanSchema>;
export type UpdateWorkoutPlanDTO = z.infer<typeof updateWorkoutPlanSchema>;
export type StartSessionDTO = z.infer<typeof startSessionSchema>;
export type LogSetDTO = z.infer<typeof logSetSchema>;
export type UpdateSetLogDTO = z.infer<typeof updateSetLogSchema>;
