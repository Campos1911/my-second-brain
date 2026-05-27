import { z } from "zod";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  priority: TaskPriority;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export const createTaskSchema = z.object({
  title: z.string().min(1, "O título é obrigatório"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"] as const, {
    required_error: "Selecione uma prioridade",
  }),
  startDate: z.string().min(1, "Data de início é obrigatória"),
  endDate: z.string().min(1, "Data de término é obrigatória"),
}).refine((data) => {
  if (!data.startDate || !data.endDate) return true;
  return new Date(data.endDate) >= new Date(data.startDate);
}, {
  message: "A data de término não pode ser anterior à data de início",
  path: ["endDate"],
});

export type CreateTaskDTO = z.infer<typeof createTaskSchema>;
export type UpdateTaskDTO = Partial<CreateTaskDTO>;

export interface FindTasksQuery {
  page?: number;
  limit?: number;
  priority?: TaskPriority;
  search?: string;
}
