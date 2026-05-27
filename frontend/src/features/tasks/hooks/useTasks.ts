import { useState, useEffect, useCallback } from "react";
import { tasksService } from "../services/tasksService";
import { Task, CreateTaskDTO, UpdateTaskDTO, FindTasksQuery } from "../types";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [filters, setFilters] = useState<FindTasksQuery>({
    page: 1,
    limit: 10,
    search: "",
    priority: undefined,
  });

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await tasksService.getAll(filters);
      setTasks(response.data);
      setTotal(response.total);
      setPages(response.pages);
    } catch (error) {
      console.error("Erro ao carregar tarefas:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (dto: CreateTaskDTO) => {
    const newTask = await tasksService.create(dto);
    setTasks((prev) => [newTask, ...prev]);
    fetchTasks();
  };

  const updateTask = async (id: string, dto: UpdateTaskDTO) => {
    const updated = await tasksService.update(id, dto);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    fetchTasks();
  };

  const deleteTask = async (id: string) => {
    await tasksService.delete(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    fetchTasks();
  };

  return {
    tasks,
    isLoading,
    total,
    pages,
    filters,
    setFilters,
    createTask,
    updateTask,
    deleteTask,
    refresh: fetchTasks,
  };
}
