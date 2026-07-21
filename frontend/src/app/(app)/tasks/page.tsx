"use client";

import { useState } from "react";
import { useTasks } from "@/features/tasks/hooks/useTasks";
import { TaskCard } from "@/features/tasks/components/TaskCard";
import { TaskForm } from "@/features/tasks/components/TaskForm";
import { KanbanBoard } from "@/features/tasks/components/KanbanBoard";
import { Task, CreateTaskDTO, TaskPriority } from "@/features/tasks/types";
import {
  Plus,
  Search,
  Filter,
  Loader2,
  CheckSquare,
  X,
  LayoutGrid,
  List,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type ViewMode = "LIST" | "KANBAN";

export default function TasksPage() {
  const {
    tasks,
    isLoading,
    pages,
    filters,
    setFilters,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
  } = useTasks();

  const [viewMode, setViewMode] = useState<ViewMode>("KANBAN"); // Kanban definido como padrão
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleToggleViewMode = (mode: ViewMode) => {
    setViewMode(mode);

    // Altera o limite de tarefas dinamicamente de acordo com o modo escolhido
    if (mode === "KANBAN") {
      setFilters((prev) => ({ ...prev, limit: 100, page: 1 }));
    } else {
      setFilters((prev) => ({ ...prev, limit: 10, page: 1 }));
    }
  };

  const handleSubmit = async (data: CreateTaskDTO) => {
    try {
      setIsSubmitting(true);
      if (editingTask) {
        await updateTask(editingTask.id, data);
      } else {
        await createTask(data);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Erro ao salvar tarefa:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
      try {
        await deleteTask(id);
      } catch (error) {
        console.error("Erro ao excluir tarefa:", error);
      }
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-primary-500" />
            Minhas Tarefas
          </h1>
          <p className="text-sm text-zinc-400">
            Gerencie e organize suas atividades diárias e prazos.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Seletor Segmentado de Visualização */}
          <div className="flex bg-zinc-900 border border-zinc-800/80 p-1 rounded-xl">
            <button
              onClick={() => handleToggleViewMode("KANBAN")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "KANBAN"
                  ? "bg-primary-600 text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => handleToggleViewMode("LIST")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "LIST"
                  ? "bg-primary-600 text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Lista</span>
            </button>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-primary-600/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nova Tarefa
          </button>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar tarefas..."
            value={filters.search || ""}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                search: e.target.value,
                page: 1,
              }))
            }
            className="w-full bg-zinc-900 border border-zinc-800/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800/80 rounded-xl px-3 py-2.5 w-full md:w-auto">
            <Filter className="w-4 h-4 text-zinc-500" />
            <select
              value={filters.priority || ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  priority: (e.target.value || undefined) as
                    | TaskPriority
                    | undefined,
                  page: 1,
                }))
              }
              className="bg-transparent text-sm text-zinc-300 focus:outline-none cursor-pointer w-full"
            >
              <option value="" className="bg-zinc-900">
                Todas as prioridades
              </option>
              <option value="LOW" className="bg-zinc-900">
                Baixa
              </option>
              <option value="MEDIUM" className="bg-zinc-900">
                Média
              </option>
              <option value="HIGH" className="bg-zinc-900">
                Alta
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Renderização Condicional do Grid de Lista ou do Quadro Kanban */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          <p className="text-sm text-zinc-400">Carregando tarefas...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-800 rounded-2xl text-center p-6">
          <CheckSquare className="w-12 h-12 text-zinc-600 mb-4" />
          <h3 className="text-base font-semibold text-zinc-300">
            Nenhuma tarefa encontrada
          </h3>
          <p className="text-sm text-zinc-500 mt-1 max-w-xs">
            Crie uma nova tarefa para começar a organizar sua rotina.
          </p>
        </div>
      ) : viewMode === "KANBAN" ? (
        <KanbanBoard
          tasks={tasks}
          onEdit={handleOpenEditModal}
          onDelete={handleDelete}
          onMoveTask={updateTaskStatus}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleOpenEditModal}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Paginação visível apenas no Modo de Lista comum */}
      {!isLoading && viewMode === "LIST" && pages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <button
            disabled={filters.page === 1}
            onClick={() =>
              setFilters((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))
            }
            className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-400 hover:text-white disabled:opacity-50 transition-colors"
          >
            Anterior
          </button>
          <span className="text-sm text-zinc-500 flex items-center px-2">
            Página {filters.page} de {pages}
          </span>
          <button
            disabled={filters.page === pages}
            onClick={() =>
              setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))
            }
            className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-400 hover:text-white disabled:opacity-50 transition-colors"
          >
            Próxima
          </button>
        </div>
      )}

      {/* Modal de Criação/Edição comum */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-black"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-zinc-950 border border-zinc-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl z-10"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">
                  {editingTask ? "Editar Tarefa" : "Nova Tarefa"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-1.5 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <TaskForm
                initialData={editingTask || undefined}
                onSubmit={handleSubmit}
                onCancel={handleCloseModal}
                isSubmitting={isSubmitting}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
