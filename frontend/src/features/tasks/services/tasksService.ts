import { api } from "@/lib/api";
import { Task, CreateTaskDTO, UpdateTaskDTO, FindTasksQuery } from "../types";

export const tasksService = {
  async getAll(query?: FindTasksQuery): Promise<{ data: Task[]; total: number; pages: number }> {
    const response = await api.get("/tasks", { params: query });
    return response.data;
  },

  async create(dto: CreateTaskDTO): Promise<Task> {
    const response = await api.post("/tasks", dto);
    return response.data;
  },

  async update(id: string, dto: UpdateTaskDTO): Promise<Task> {
    const response = await api.patch(`/tasks/${id}`, dto);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },
};
