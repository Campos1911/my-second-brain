// src/features/fitness/types/index.ts

import { z } from "zod";
import { Category } from "@/types";

// Exportando tipos base reexportados para conveniência se necessário,
// ou importados diretamente onde forem usados.

// ==========================================
// TIPOS E ENUMS DE DOMÍNIO EXCLUSIVOS DO FITNESS
// ==========================================

export interface Exercise {
  id: string;
  name: string;
  categoryId: string;
  workoutPlanId: string;
  category?: Partial<Category>;
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
  volume: number; // Volume estimado: reps * weight
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

export const createWorkoutPlanSchema = z.object({
  name: z
    .string()
    .min(2, "O nome do plano de treino deve ter pelo menos 2 caracteres."),
  exercises: z.array(createExerciseSchema).optional(),
});

export const updateWorkoutPlanSchema = z.object({
  name: z
    .string()
    .min(2, "O nome do plano de treino deve ter pelo menos 2 caracteres."),
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
export type CreateWorkoutPlanDTO = z.infer<typeof createWorkoutPlanSchema>;
export type UpdateWorkoutPlanDTO = z.infer<typeof updateWorkoutPlanSchema>;
export type StartSessionDTO = z.infer<typeof startSessionSchema>;
export type LogSetDTO = z.infer<typeof logSetSchema>;
export type UpdateSetLogDTO = z.infer<typeof updateSetLogSchema>;
