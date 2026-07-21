"use client";

import { Task, TaskStatus } from "../types";
import { KanbanColumn } from "./KanbanColumn";

interface KanbanBoardProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onMoveTask: (id: string, status: TaskStatus) => void;
}

export function KanbanBoard({
  tasks,
  onEdit,
  onDelete,
  onMoveTask,
}: KanbanBoardProps) {
  // Divisão das tarefas com base no novo atributo status
  const todoTasks = tasks.filter((t) => t.status === "TODO" || !t.status);
  const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS");
  const doneTasks = tasks.filter((t) => t.status === "DONE");

  return (
    <div className="flex flex-col lg:flex-row gap-4 overflow-x-auto pb-4 items-stretch select-none snap-x scroll-smooth">
      <KanbanColumn
        title="A Fazer"
        status="TODO"
        tasks={todoTasks}
        onEdit={onEdit}
        onDelete={onDelete}
        onMoveTask={onMoveTask}
      />
      <KanbanColumn
        title="Em Execução"
        status="IN_PROGRESS"
        tasks={inProgressTasks}
        onEdit={onEdit}
        onDelete={onDelete}
        onMoveTask={onMoveTask}
      />
      <KanbanColumn
        title="Concluído"
        status="DONE"
        tasks={doneTasks}
        onEdit={onEdit}
        onDelete={onDelete}
        onMoveTask={onMoveTask}
      />
    </div>
  );
}
